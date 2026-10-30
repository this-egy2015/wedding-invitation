import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuestByToken, listVisibleWishes } from "@/features/guests/queries";
import { getPublishedInvitation } from "@/features/invitations/queries";
import { formatEventDate } from "@/lib/time";
import { getTemplate } from "@/templates";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string | string[] }>;
};

// Metadata depends only on the slug, never on the guest token, so link previews are shared-safe.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getPublishedInvitation(slug);
  if (!invitation) return {};

  const { groom, bride, akad, timezone, coverImageUrl } = invitation.content;
  const title = `The Wedding of ${groom.nickname} & ${bride.nickname}`;
  const description = formatEventDate(akad.startsAt, timezone);
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: [coverImageUrl] },
  };
}

export default async function InvitePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { to } = await searchParams;

  // Content comes from the slug-tagged cache; the guest and wishes are per-request reads.
  const invitation = await getPublishedInvitation(slug);
  const template = invitation && getTemplate(invitation.templateId);
  if (!invitation || !template) notFound();

  const token = typeof to === "string" ? to : null;
  const [guest, wishes] = await Promise.all([
    token ? getGuestByToken(invitation.id, token) : null,
    listVisibleWishes(invitation.id),
  ]);

  return (
    <template.Component
      content={invitation.content}
      guest={guest}
      token={guest ? token : null}
      wishes={wishes}
      preview={false}
    />
  );
}
