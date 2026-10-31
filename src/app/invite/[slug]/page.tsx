import { notFound, redirect } from "next/navigation";
import { getPublishedInvitation } from "@/features/invitations/queries";
import { invitationPath } from "@/lib/invitation-url";

export default async function LegacyInvitationPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string | string[] }>;
}) {
  const { slug } = await params;
  if (!await getPublishedInvitation(slug)) notFound();
  const { to } = await searchParams;
  redirect(invitationPath(slug, typeof to === "string" ? to : null));
}
