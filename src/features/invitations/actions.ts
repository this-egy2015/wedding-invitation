"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { isPublicInvitationSlug } from "@/lib/invitation-url";
import { templates, type TemplateId } from "@/templates";
import { contentFromFormData, contentSchema, formatIssues } from "./content";
import { getOwnedInvitation, invitationTag } from "./queries";

export type FormState = { ok: boolean; errors: string[] };

const createSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug minimal 3 karakter")
    .max(60, "Slug maksimal 60 karakter")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung")
    .refine(isPublicInvitationSlug, "Slug ini dicadangkan untuk halaman aplikasi, pilih slug lain"),
  templateId: z.enum(Object.keys(templates) as [TemplateId, ...TemplateId[]]),
});

export async function createInvitationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };

  const { slug, templateId } = parsed.data;
  // Pre-check for a friendly message; the unique constraint still guards concurrent inserts.
  const [taken] = await db.select({ id: invitations.id }).from(invitations).where(eq(invitations.slug, slug));
  if (taken) return { ok: false, errors: ["Slug sudah dipakai, pilih slug lain"] };

  const [created] = await db
    .insert(invitations)
    .values({ ownerId: user.id, slug, templateId, templateVersion: templates[templateId].version })
    .returning({ id: invitations.id });

  redirect(`/dashboard/invitations/${created.id}/edit`);
}

export async function saveDraftAction(invitationId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const invitation = await getOwnedInvitation(invitationId);
  const parsed = contentSchema.safeParse(contentFromFormData(formData));
  if (!parsed.success) return { ok: false, errors: formatIssues(parsed.error) };

  await db.update(invitations).set({ draftContent: parsed.data }).where(eq(invitations.id, invitation.id));
  revalidatePath(`/dashboard/invitations/${invitation.id}`, "layout");
  return { ok: true, errors: [] };
}

export async function publishAction(invitationId: string) {
  const invitation = await getOwnedInvitation(invitationId);
  // Re-validate: the schema may have tightened since the draft was saved.
  const content = contentSchema.parse(invitation.draftContent);

  await db
    .update(invitations)
    .set({ status: "published", publishedContent: content, publishedAt: new Date() })
    .where(eq(invitations.id, invitation.id));

  updateTag(invitationTag(invitation.slug));
  revalidatePath("/dashboard/invitations", "layout");
}

export async function unpublishAction(invitationId: string) {
  const invitation = await getOwnedInvitation(invitationId);
  await db.update(invitations).set({ status: "unpublished" }).where(eq(invitations.id, invitation.id));

  updateTag(invitationTag(invitation.slug));
  revalidatePath("/dashboard/invitations", "layout");
}

export async function deleteInvitationAction(invitationId: string) {
  const invitation = await getOwnedInvitation(invitationId);
  await db.delete(invitations).where(eq(invitations.id, invitation.id));

  updateTag(invitationTag(invitation.slug));
  redirect("/dashboard/invitations");
}
