/**
 * E2E Smoke 2 — Public bahasa explorer dapat diakses anonymous.
 *
 * Memenuhi QA Master Plan §3 Level 4, QC-CHECKLIST C5 (anonymous discovery).
 */
import { test, expect } from "@playwright/test";

test.describe("Bahasa Explorer (anonymous)", () => {
  test("anonymous user dapat melihat daftar bahasa tanpa login", async ({ page }) => {
    await page.goto("/explorer");
    await page.waitForLoadState("networkidle");

    // Halaman harus render meski tanpa session
    await expect(page.locator("body")).toBeVisible();
    // Tidak boleh redirect ke /login untuk explorer publik
    expect(page.url()).toContain("/explorer");
  });

  test("explorer menampilkan setidaknya 1 bahasa", async ({ page }) => {
    await page.goto("/explorer");

    // Tunggu data loaded (cari heading / chip bahasa)
    const body = page.locator("body");
    await expect(body).toContainText(/(indonesia|sunda|jawa|batak)/i, { timeout: 10_000 });
  });
});

test.describe("Auth boundary", () => {
  test("anonymous diblokir akses /chat", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    // RequireAuth wrapper harus redirect ke /login
    expect(page.url()).toMatch(/login/i);
  });

  test("anonymous diblokir akses /studio", async ({ page }) => {
    await page.goto("/studio");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/login/i);
  });

  test("anonymous diblokir akses /voice", async ({ page }) => {
    await page.goto("/voice");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toMatch(/login/i);
  });
});
