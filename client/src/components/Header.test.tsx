/**
 * Component test untuk Header.
 *
 * Memenuhi QA Master Plan §3 Level 2 (Component).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Header } from "./Header";

// Mock useAuth supaya tidak butuh real Supabase
const mockSignOut = vi.fn();
vi.mock("../lib/auth", () => ({
  useAuth: () => ({
    user: null as null | { email: string },
    signOut: mockSignOut,
    loading: false,
  }),
}));

function renderHeader(props: Parameters<typeof Header>[0] = {}) {
  return render(
    <MemoryRouter>
      <Header {...props} />
    </MemoryRouter>,
  );
}

describe("<Header />", () => {
  beforeEach(() => {
    mockSignOut.mockReset();
  });

  it("render logo NusaLingua", () => {
    renderHeader();
    expect(screen.getByText(/Nusa/)).toBeInTheDocument();
    expect(screen.getByText(/Lingua/)).toBeInTheDocument();
  });

  it("tampilkan CTA Daftar Gratis untuk anonymous user", () => {
    renderHeader();
    expect(screen.getByRole("button", { name: /daftar gratis/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /masuk/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bahasa/i })).toBeInTheDocument();
  });

  it("hidden CTA bila showCta=false", () => {
    renderHeader({ showCta: false });
    expect(screen.queryByRole("button", { name: /daftar gratis/i })).not.toBeInTheDocument();
  });

  it("render custom rightSlot", () => {
    renderHeader({ rightSlot: <span data-testid="custom-slot">X</span> });
    expect(screen.getByTestId("custom-slot")).toBeInTheDocument();
  });

  it("CTA Daftar dapat di-click tanpa crash", async () => {
    const user = userEvent.setup();
    renderHeader();
    const btn = screen.getByRole("button", { name: /daftar gratis/i });
    await user.click(btn);
    // Navigate dipanggil oleh react-router — test ini cuma pastikan tidak throw
    expect(btn).toBeEnabled();
  });
});
