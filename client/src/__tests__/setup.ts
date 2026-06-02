/**
 * Vitest setup file — dijalankan sekali sebelum suite.
 * Extends Vitest's expect dengan jest-dom matchers (toBeInTheDocument, dll).
 */
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto-cleanup DOM antar test agar tidak bocor state.
afterEach(() => {
  cleanup();
});

// Polyfill: jsdom belum punya scrollTo
if (typeof window !== "undefined" && !window.scrollTo) {
  window.scrollTo = () => {};
}
