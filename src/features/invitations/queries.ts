import { and, desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { isPublicInvitationSlug } from "@/lib/invitation-url";

export const invitationTag = (slug: string) => `invitation:${slug}`;

/** Ownership boundary for every dashboard read and mutation on an invitation. */
export const getOwnedInvitation = cache(async (invitationId: string) => {
  const user = await requireUser();
  if (!z.uuid().safeParse(invitationId).success) notFound();

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, invitationId), eq(invitations.ownerId, user.id)));
  if (!invitation) notFound();
  return invitation;
});

export async function listOwnedInvitations() {
  const user = await requireUser();
  return db
    .select()
    .from(invitations)
    .where(eq(invitations.ownerId, user.id))
    .orderBy(desc(invitations.createdAt));
}

/** Public, cached by slug. Invalidated via updateTag(invitationTag(slug)) on publish/unpublish. */
export function getPublishedInvitation(slug: string) {
  if (!isPublicInvitationSlug(slug)) return Promise.resolve(null);
  return unstable_cache(
    async () => {
      const [row] = await db
        .select({
          id: invitations.id,
          slug: invitations.slug,
          templateId: invitations.templateId,
          content: invitations.publishedContent,
        })
        .from(invitations)
        .where(and(eq(invitations.slug, slug), eq(invitations.status, "published")));
      return row?.content ? { ...row, content: row.content } : null;
    },
    ["published-invitation", slug],
    { tags: [invitationTag(slug)] },
  )();
}
