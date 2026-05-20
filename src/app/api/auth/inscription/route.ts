import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validatePassword } from "@/lib/security/password";
import { inscriptionSchema } from "@/lib/signupValidation";
import { generateEmailVerificationToken } from "@/lib/emailVerification";
import { sendVerificationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

type MailError = Error & {
	code?: string;
	command?: string;
	responseCode?: number;
	response?: string;
};

function databaseUnavailableResponse(error: unknown) {
	const message = error instanceof Error ? error.message.split("\n")[0] : "Erreur inconnue";
	const code = (error as Record<string, unknown>)?.code;
	const meta = (error as Record<string, unknown>)?.meta;
	logger.error("inscription_base_indisponible", { message, code, meta });

	// Unique constraint violation → conflict rather than unavailable
	if (code === "P2002") {
		return NextResponse.json(
			{ success: false, message: "Identifiant déjà utilisé" },
			{ status: 409 },
		);
	}

	return NextResponse.json(
		{
			success: false,
			message: "Connexion à la base de données impossible. Vérifiez DATABASE_URL.",
		},
		{ status: 503 },
	);
}

function logMailError(context: string, error: unknown) {
	const err = error as MailError;
	logger.error("inscription_erreur_email", {
		contexte: context,
		message: err?.message,
		code: err?.code,
		command: err?.command,
		responseCode: err?.responseCode,
	});
}

export async function POST(req: Request) {
	let payload: unknown = null;
	try {
		payload = await req.json();
	} catch {
		return NextResponse.json({ success: false, message: "Payload invalide" }, { status: 400 });
	}

	const parsed = inscriptionSchema.safeParse(payload);
	if (!parsed.success) {
		const firstError = parsed.error.errors[0]?.message ?? "Champs invalides";
		return NextResponse.json({ success: false, message: firstError }, { status: 400 });
	}

	const { pseudo, email, password } = parsed.data;

	if (!pseudo || !email || !password) {
		return NextResponse.json({ success: false, message: "Champs requis" }, { status: 400 });
	}

	const passwordCheck = validatePassword(password);
	if (!passwordCheck.ok) {
		return NextResponse.json({ success: false, message: passwordCheck.message }, { status: 400 });
	}

	let existingEmail:
		| {
				id: number;
				pseudo: string;
				emailVerifiedAt: Date | null;
				emailVerificationTokenHash: string | null;
		  }
		| null;
	let existingPseudo: { id: number } | null;

	try {
		[existingEmail, existingPseudo] = await Promise.all([
			prisma.user.findUnique({
				where: { email },
				select: { id: true, pseudo: true, emailVerifiedAt: true, emailVerificationTokenHash: true },
			}),
			prisma.user.findUnique({ where: { pseudo }, select: { id: true } }),
		]);
	} catch (error) {
		return databaseUnavailableResponse(error);
	}
	if (existingEmail) {
		const alreadyVerified =
			!!existingEmail.emailVerifiedAt || !existingEmail.emailVerificationTokenHash;
		if (alreadyVerified) {
			return NextResponse.json({ success: false, message: "Identifiant déjà utilisé" }, { status: 409 });
		}

		const { token, tokenHash } = generateEmailVerificationToken();
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
		await prisma.user.update({
			where: { id: existingEmail.id },
			data: { emailVerificationTokenHash: tokenHash, emailVerificationTokenExpiresAt: expiresAt },
		});

		try {
			const appUrl =
				process.env.APP_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
			await sendVerificationEmail({
				to: email,
				pseudo: existingEmail.pseudo ?? pseudo,
				token,
				appUrl,
			});
		} catch (error) {
			logMailError("Verification email resend failed", error);
			return NextResponse.json(
				{ success: false, message: "Erreur lors de l'envoi de l'email de confirmation" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Email de confirmation renvoyé",
			verificationRequired: true,
		});
	}
	if (existingPseudo) {
		return NextResponse.json({ success: false, message: "Identifiant déjà utilisé" }, { status: 409 });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const { token, tokenHash } = generateEmailVerificationToken();
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

	let freePlan: { id: number } | null;
	let user: { id: number };
	try {
		freePlan = await prisma.plan.findFirst({ where: { priceCents: 0 }, select: { id: true } });
		user = await prisma.user.create({
			data: {
				pseudo,
				email,
				password: hashedPassword,
				avatarUrl: `https://api.dicebear.com/9.x/lorelei/png?seed=${encodeURIComponent(pseudo)}`,
				planId: freePlan?.id || null,
				emailVerificationTokenHash: tokenHash,
				emailVerificationTokenExpiresAt: expiresAt,
			},
		});
	} catch (error) {
		return databaseUnavailableResponse(error);
	}

	try {
		const appUrl =
			process.env.APP_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
		await sendVerificationEmail({ to: email, pseudo, token, appUrl });
	} catch (error) {
		const err = error as MailError;
		logMailError("Verification email sending failed", error);
		await prisma.user.delete({ where: { id: user.id } });
		const isDev = process.env.NODE_ENV !== "production";
		return NextResponse.json(
			{
				success: false,
				message: "Erreur lors de l'envoi de l'email de confirmation",
				error: isDev ? { message: err?.message, code: err?.code } : undefined,
			},
			{ status: 500 },
		);
	}

	return NextResponse.json({
		success: true,
		message: "Vérification requise",
		verificationRequired: true,
	});
}
