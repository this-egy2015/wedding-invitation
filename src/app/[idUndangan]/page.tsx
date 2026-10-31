import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuestByToken, listVisibleWishes } from "@/features/guests/queries";
import { getPublishedInvitation } from "@/features/invitations/queries";
import { formatEventDate } from "@/lib/time";
import { getTemplate } from "@/templates";

type Props = {
  params: Promise<{ idUndangan: string }>;
  searchParams: Promise<{ to?: string | string[] }>;
};

// idUndangan is the public slug, not the internal UUID or a template/asset identifier.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { idUndangan } = await params;
  const invitation = await getPublishedInvitation(idUndangan);
  if (!invitation || !getTemplate(invitation.templateId)) notFound();
  const { bride, groom, resepsi, timezone, coverImageUrl } = invitation.content;
  const title = `The Wedding of ${bride.nickname} & ${groom.nickname}`;
  const description = formatEventDate(resepsi.startsAt, timezone);
  return {
    title, description, robots: { index: false },
    openGraph: { title, description, images: [coverImageUrl] },
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { idUndangan } = await params;
  const invitation = await getPublishedInvitation(idUndangan);
  const template = invitation && getTemplate(invitation.templateId);
  if (!invitation || !template) notFound();
  const { to } = await searchParams;
  const token = typeof to === "string" ? to : null;
  const [guest, wishes] = await Promise.all([
    token ? getGuestByToken(invitation.id, token) : null,
    listVisibleWishes(invitation.id),
  ]);
  return <main className="min-h-dvh bg-cocoa"><template.Component content={invitation.content} guest={guest} token={guest ? token : null} wishes={wishes} preview={false} /></main>;
}
