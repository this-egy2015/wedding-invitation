import Link from "next/link";
import { ConfirmButton } from "@/components/ConfirmButton";
import {
  deleteInvitationAction,
  publishAction,
  saveDraftAction,
  unpublishAction,
} from "@/features/invitations/actions";
import { TIMEZONES } from "@/features/invitations/content";
import { getOwnedInvitation } from "@/features/invitations/queries";
import { ContentForm } from "./ContentForm";

export default async function EditInvitationPage({ params }: { params: Promise<{ invitationId: string }> }) {
  const { invitationId } = await params;
  const invitation = await getOwnedInvitation(invitationId);
  const hasUnpublishedChanges =
    JSON.stringify(invitation.draftContent) !== JSON.stringify(invitation.publishedContent);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Edit Undangan</h1>
          <p className="text-sm text-neutral-600">
            /{invitation.slug} · status: {invitation.status}
            {invitation.status === "published" && hasUnpublishedChanges && " · ada perubahan draft yang belum dipublikasikan"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/dashboard/invitations/${invitation.id}/preview`} className="btn-secondary">
            Preview
          </Link>
          <Link href={`/dashboard/invitations/${invitation.id}/guests`} className="btn-secondary">
            Tamu
          </Link>
          {invitation.draftContent && (
            <form action={publishAction.bind(null, invitation.id)}>
              <button type="submit" className="btn-primary">
                {invitation.status === "published" ? "Publikasikan Ulang" : "Publikasikan"}
              </button>
            </form>
          )}
          {invitation.status === "published" && (
            <form action={unpublishAction.bind(null, invitation.id)}>
              <ConfirmButton message="Batalkan publikasi? Link tamu tidak bisa dibuka sampai dipublikasikan lagi." className="btn-secondary">
                Batalkan Publikasi
              </ConfirmButton>
            </form>
          )}
        </div>
      </div>

      <ContentForm
        initial={invitation.draftContent}
        timezones={TIMEZONES}
        action={saveDraftAction.bind(null, invitation.id)}
      />

      <form action={deleteInvitationAction.bind(null, invitation.id)} className="border-t pt-6">
        <ConfirmButton message="Hapus undangan beserta semua tamu dan RSVP? Tindakan ini permanen." className="btn-danger">
          Hapus Undangan
        </ConfirmButton>
      </form>
    </div>
  );
}
