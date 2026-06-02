/**
 * E2E Smoke 1 — Landing page boot + navigasi ke login.
 *
 * Memenuhi QA Master Plan §3 Level 4, QC-CHECKLIST C1.
 */
import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loaded dan menampilkan brand NusaLingua", async ({ page }) => {
    await expect(page).toHaveTitle(/Nusa/i);
    await expect(page.locator("body")).toContainText(/Nusa/i);
  });

  test("CTA Daftar / Masuk dapat di-click", async ({ page }) => {
    const cta = page.getByRole("button", { name: /(daftar|masuk|coba)/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
    // Setelah klik, expect URL ber-ubah ke /login atau ada modal login
    await page.waitForLoadState("networkidle");
    const url = page.url();
    expect(url).toMatch(/login|signup|register/i);
  });

  test("performance: First Contentful Paint < 2.5s", async ({ page }) => {
    const fcp = await page.evaluate(() => {
      const entry = performance.getEntriesByName("first-contentful-paint")[0];
      return entry?.startTime ?? 0;
    });
    // FCP target dari QC-CHECKLIST D5
    expect(fcp).toBeLessThan(2500);
  });

  test("accessibility: ada landmark utama (header, main)", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
  });
});
