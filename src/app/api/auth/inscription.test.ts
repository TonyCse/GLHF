import { describe, expect, it, vi } from "vitest";
import { POST } from "./inscription/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

vi.mock("@/lib/prisma", () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		plan: {
			findFirst: vi.fn(),
		},
	},
}));

vi.mock("bcryptjs", () => ({
	default: {
		hash: vi.fn(),
	},
}));

vi.mock("@/lib/email", () => ({
	sendVerificationEmail: vi.fn(),
}));

describe("POST /api/auth/inscription", () => {
	it("refuse un email invalide", async () => {
		const req = { json: async () => ({ email: "bad", password: "Abcdef12!@#$", pseudo: "user1", isOver16: true }) };
		const res = await POST(req as Request);
		expect(res.status).toBe(400);
	});

	it("cree un utilisateur valide", async () => {
		(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
		(prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
		(prisma.plan.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });
		(bcrypt.hash as unknown as ReturnType<typeof vi.fn>).mockResolvedValue("hashed");
		(prisma.user.create as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1 });

		const req = { json: async () => ({ email: "user@example.com", password: "Abcdef12!@#$", pseudo: "user1", isOver16: true }) };
		const res = await POST(req as Request);
		expect([200, 201]).toContain(res.status);
	});
});
