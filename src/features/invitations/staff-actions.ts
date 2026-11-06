"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { invitationStaff } from "@/db/schema";
import { isAdminEmail, normalizeEmail } from "@/lib/access-policy";
import type { FormState } from "./actions";
import { getOwnedInvitation } from "./queries";

export async function addStaffAction(invitationId: string, _previous: FormState, form: FormData): Promise<FormState> {
  const invitation = await getOwnedInvitation(invitationId);
  const email = z.email().max(254).safeParse(normalizeEmail(String(form.get("email") ?? "")));
  if (!email.success) return { ok: false, errors: ["Email tidak valid."] };
  if (isAdminEmail(email.data)) return { ok: false, errors: ["Admin sudah memiliki akses undangan ini."] };
  await db.insert(invitationStaff).values({ invitationId: invitation.id, email: email.data }).onConflictDoNothing();
  revalidatePath(`/dashboard/invitations/${invitation.id}/staff`);
  return { ok: true, errors: [] };
}

export async function removeStaffAction(invitationId: string, email: string) {
  const invitation = await getOwnedInvitation(invitationId);
  const parsed = z.email().max(254).safeParse(normalizeEmail(String(email)));
  if (!parsed.success) return;
  await db.delete(invitationStaff).where(and(eq(invitationStaff.invitationId, invitation.id), eq(invitationStaff.email, parsed.data)));
  revalidatePath(`/dashboard/invitations/${invitation.id}/staff`);
}
