import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PermissionGuard } from "./permission-guard";

vi.mock("@/providers/auth-provider", () => ({
  useAuthContext: vi.fn(),
}));

import { useAuthContext } from "@/providers/auth-provider";

const mockAuth = (perms: string[]) => {
  vi.mocked(useAuthContext).mockReturnValue({
    hasPermission: (p: string) => perms.includes(p),
    hasAnyPermission: (ps: string[]) => ps.some((p) => perms.includes(p)),
    // unused-but-typed-so-the-cast-stays-tight
  } as ReturnType<typeof useAuthContext>);
};

describe("<PermissionGuard>", () => {
  it("renders children when single permission matches", () => {
    mockAuth(["manage_clients"]);
    render(
      <PermissionGuard permission="manage_clients">
        <span>OK</span>
      </PermissionGuard>,
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders fallback when permission missing", () => {
    mockAuth([]);
    render(
      <PermissionGuard permission="manage_clients" fallback={<span>NOPE</span>}>
        <span>OK</span>
      </PermissionGuard>,
    );
    expect(screen.queryByText("OK")).not.toBeInTheDocument();
    expect(screen.getByText("NOPE")).toBeInTheDocument();
  });

  it("uses any-of by default when given a list", () => {
    mockAuth(["b"]);
    render(
      <PermissionGuard permissions={["a", "b"]}>
        <span>OK</span>
      </PermissionGuard>,
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("requireAll demands every permission", () => {
    mockAuth(["a"]);
    render(
      <PermissionGuard permissions={["a", "b"]} requireAll>
        <span>OK</span>
      </PermissionGuard>,
    );
    expect(screen.queryByText("OK")).not.toBeInTheDocument();
  });

  it("renders children when neither permission nor permissions given (open gate)", () => {
    mockAuth([]);
    render(
      <PermissionGuard>
        <span>OK</span>
      </PermissionGuard>,
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
  });
});
