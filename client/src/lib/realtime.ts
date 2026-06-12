/**
 * Helper untuk OpenAI Realtime API via WebRTC.
 *
 * Flow:
 *  1. Server kasih ephemeral token via /api/voice/session
 *  2. Browser create RTCPeerConnection
 *  3. Browser getUserMedia({audio}) → addTrack ke peer connection
 *  4. Buat data channel "oai-events" untuk control events (transcript, dll)
 *  5. createOffer → send SDP ke OpenAI realtime endpoint dgn header Auth: Bearer <ephemeral>
 *  6. setRemoteDescription dgn answer SDP
 *  7. Audio playback otomatis via <audio> element yang di-bind ke remote stream
 *
 * Docs: https://platform.openai.com/docs/guides/realtime-webrtc
 */

import { api } from "./api";

export interface RealtimeEvents {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onUserTranscript?: (text: string) => void;
  onAssistantTranscript?: (text: string, isFinal: boolean) => void;
  /** true saat AI mulai bicara (audio keluar), false saat selesai. */
  onSpeakingChange?: (speaking: boolean) => void;
  onError?: (err: string) => void;
}

export class RealtimeSession {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private audioEl: HTMLAudioElement;
  private events: RealtimeEvents;
  private currentAssistantText = "";

  constructor(audioEl: HTMLAudioElement, events: RealtimeEvents = {}) {
    this.audioEl = audioEl;
    this.events = events;
  }

  async start(languageCode: string, voice = "alloy"): Promise<void> {
    // 1. Get ephemeral token dari server
    const session = await api.createVoiceSession(languageCode, voice);
    const ephemeralKey = session.client_secret.value;

    // 2. Create peer connection
    this.pc = new RTCPeerConnection();

    // 3. Audio output: bind remote track ke <audio>
    this.pc.ontrack = (event) => {
      this.audioEl.srcObject = event.streams[0];
    };

    // 4. Audio input: getUserMedia → addTrack
    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.localStream.getTracks().forEach((track) => {
      this.pc!.addTrack(track, this.localStream!);
    });

    // 5. Data channel untuk realtime events
    this.dc = this.pc.createDataChannel("oai-events");
    this.dc.addEventListener("message", (e) => this.handleEvent(e));
    this.dc.addEventListener("open", () => {
      this.events.onConnected?.();
    });
    this.dc.addEventListener("close", () => {
      this.events.onDisconnected?.();
    });

    // 6. Create SDP offer
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    // 7. Send offer ke OpenAI realtime endpoint.
    // Model diambil dari session response server (ikut env OPENAI_REALTIME_MODEL),
    // jangan hardcode supaya client & server tidak mismatch.
    const model = session.model ?? "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(
      `https://api.openai.com/v1/realtime?model=${model}`,
      {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      }
    );

    if (!sdpResponse.ok) {
      const errText = await sdpResponse.text();
      this.events.onError?.(`Realtime handshake gagal: ${errText}`);
      throw new Error(errText);
    }

    const answerSdp = await sdpResponse.text();
    await this.pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
  }

  private handleEvent(e: MessageEvent) {
    try {
      const evt = JSON.parse(e.data);

      switch (evt.type) {
        case "conversation.item.input_audio_transcription.completed":
          // Transkrip suara user
          this.events.onUserTranscript?.(evt.transcript ?? "");
          break;

        case "response.audio_transcript.delta":
          // Transkrip respons assistant (streaming)
          this.currentAssistantText += evt.delta ?? "";
          this.events.onAssistantTranscript?.(this.currentAssistantText, false);
          break;

        case "response.audio_transcript.done":
          this.events.onAssistantTranscript?.(this.currentAssistantText, true);
          this.currentAssistantText = "";
          break;

        // Status bicara AI — event WebRTC output_audio_buffer.* paling akurat;
        // response.done sebagai fallback penutup.
        case "output_audio_buffer.started":
          this.events.onSpeakingChange?.(true);
          break;
        case "output_audio_buffer.stopped":
        case "output_audio_buffer.cleared":
        case "response.done":
          this.events.onSpeakingChange?.(false);
          break;

        case "error":
          this.events.onError?.(evt.error?.message ?? "Unknown realtime error");
          break;
      }
    } catch (err) {
      console.warn("Failed to parse realtime event:", err);
    }
  }

  /** Pause kirim audio (mute mic). */
  setMicEnabled(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }

  /** Akhiri sesi. */
  async stop() {
    this.dc?.close();
    this.pc?.close();
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.audioEl.srcObject = null;
    this.pc = null;
    this.dc = null;
    this.localStream = null;
    this.events.onDisconnected?.();
  }
}
