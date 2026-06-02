/**
 * Unit tests untuk client/src/lib/utils.ts
 *
 * Memenuhi QA Master Plan §3 Level 1 (Unit).
 */
import { describe, it, expect } from "vitest";
import { cn, formatNumber } from "./utils";

describe("cn (className composer)", () => {
  it("menggabungkan multiple class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("skip falsy values", () => {
    expect(cn("a", null, undefined, false, "b")).toBe("a b");
  });

  it("evaluasi conditional via object form", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("empty input returns empty string", () => {
    expect(cn()).toBe("");
  });
});

describe("formatNumber (Indonesian abbreviation)", () => {
  it("angka < 1000 tanpa suffix", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(42)).toBe("42");
    expect(formatNumber(999)).toBe("999");
  });

  it("angka ribuan pakai suffix K", () => {
    expect(formatNumber(1000)).toBe("1K");
    expect(formatNumber(15_000)).toBe("15K");
    expect(formatNumber(999_999)).toBe("1000K");
  });

  it("angka jutaan pakai suffix jt", () => {
    expect(formatNumber(1_000_000)).toBe("1 jt");
    expect(formatNumber(40_000_000)).toBe("40 jt");
    expect(formatNumber(270_000_000)).toBe("270 jt");
  });

  it("handles edge case boundary 999 → 1000", () => {
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(1000)).toBe("1K");
  });
});
