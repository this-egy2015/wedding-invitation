import Link from "next/link";
import { notFound } from "next/navigation";
import { getOwnedInvitation } from "@/features/invitations/queries";
import { getTemplate } from "@/templates";

export default async function PreviewPage({ params }: { params: Promise<{ invitationId: string }> }) {
  const { invitationId } = await params;
  const invitation = await getOwnedInvitation(invitationId);
  const template = getTemplate(invitation.templateId);
  if (!template) notFound();

  if (!invitation.draftContent) {
    return (
      <p className="rounded-lg border border-dashed bg-white p-8 text-center text-neutral-600">
        Konten belum diisi.{" "}
        <Link href={`/dashboard/invitations/${invitation.id}/edit`} className="underline">
          Isi konten
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-600">Preview draft (belum tentu sama dengan versi publik).</p>
      <div className="overflow-hidden rounded-xl border">
        <template.Component
          slug={invitation.slug}
          content={invitation.draftContent}
          guest={null}
          token={null}
          preview
        />
      </div>
    </div>
  );
}
