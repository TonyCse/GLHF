import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("POST /api/admin/users/[id]/toggle-role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("forbids an admin from promoting USER to ADMIN", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "10", role: "ADMIN" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "USER",
    });

    const req = new Request("http://localhost/api/admin/users/12/toggle-role", {
      method: "POST",
      headers: { referer: "http://localhost/admin/users" },
    });

    const res = await POST(req, { params: Promise.resolve({ id: "12" }) });

    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toContain("/admin/users?err=admin_role_restricted");
    expect(res.status).toBe(307);
  });

  it("promotes ADMIN to SUPER_ADMIN for a super admin", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "10", role: "SUPER_ADMIN" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "ADMIN",
    });

    const req = new Request("http://localhost/api/admin/users/12/toggle-role", {
      method: "POST",
      headers: { referer: "http://localhost/admin/users" },
    });

    await POST(req, { params: Promise.resolve({ id: "12" }) });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: { role: "SUPER_ADMIN" },
    });
  });

  it("demotes SUPER_ADMIN to ADMIN for a super admin", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "10", role: "SUPER_ADMIN" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "SUPER_ADMIN",
    });

    const req = new Request("http://localhost/api/admin/users/12/toggle-role", {
      method: "POST",
      headers: { referer: "http://localhost/admin/users" },
    });

    await POST(req, { params: Promise.resolve({ id: "12" }) });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: { role: "ADMIN" },
    });
  });

  it("forbids an admin from changing a super admin", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "10", role: "ADMIN" },
    });
    (prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      role: "SUPER_ADMIN",
    });

    const req = new Request("http://localhost/api/admin/users/12/toggle-role", {
      method: "POST",
    });

    const res = await POST(req, { params: Promise.resolve({ id: "12" }) });

    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(res.headers.get("location")).toContain("/admin/users?err=admin_role_restricted");
  });
});
