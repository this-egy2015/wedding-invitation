import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getGuestByToken } from "@/features/guests/queries";
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
  const visitorToken = token ?? (await cookies()).get(`rsvp-${idUndangan}`)?.value;
  const guest = visitorToken ? await getGuestByToken(invitation.id, visitorToken) : null;
  return <main className="min-h-dvh bg-cocoa"><template.Component slug={idUndangan} content={invitation.content} guest={guest} token={guest ? token : null} preview={false} /></main>;
}
