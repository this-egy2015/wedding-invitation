import Link from "next/link";
import { ConfirmButton } from "@/components/ConfirmButton";
import { CopyButton } from "@/components/CopyButton";
import { deleteGuestAction, setWishVisibilityAction, updateGuestAction } from "@/features/guests/actions";
import { getGuest, guestLink } from "@/features/guests/queries";
import { getOwnedInvitation } from "@/features/invitations/queries";
import { rsvpLabel } from "@/features/rsvp/status";
import { GuestForm } from "../GuestForm";

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(date);

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ invitationId: string; guestId: string }>;
}) {
  const { invitationId, guestId } = await params;
  const invitation = await getOwnedInvitation(invitationId);
  const guest = await getGuest(invitation.id, guestId);
  const link = guestLink(invitation.slug, guest.shareToken);

  const details: [string, React.ReactNode][] = [
    ["Nama tamu", guest.name],
    ["Nama pasangan", guest.partnerName ?? "-"],
    ["URL personal", <span key="link" className="break-all">{link}</span>],
    ["Kuota kehadiran", `${guest.allowedGuestCount} orang`],
    ["Status RSVP", rsvpLabel(guest.rsvpStatus)],
    ["Jumlah kehadiran", guest.rsvpStatus ? `${guest.attendanceCount} orang` : "-"],
    ["Ucapan", guest.wish ?? "-"],
    ["Waktu konfirmasi", guest.respondedAt ? formatDateTime(guest.respondedAt) : "-"],
    ["Dibuat", formatDateTime(guest.createdAt)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Detail Tamu</h1>
        <Link href={`/dashboard/invitations/${invitation.id}/guests`} className="btn-secondary">
          Kembali ke Daftar Tamu
        </Link>
      </div>

      <dl className="divide-y rounded-lg border bg-white">
        {details.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-neutral-600">{label}</dt>
            <dd className="text-sm whitespace-pre-line">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        <CopyButton value={link} />
        {guest.wish && (
          <form action={setWishVisibilityAction.bind(null, invitation.id, guest.id, !guest.isWishVisible)}>
            <button type="submit" className="btn-secondary">
              {guest.isWishVisible ? "Sembunyikan Ucapan" : "Tampilkan Ucapan"}
            </button>
          </form>
        )}
      </div>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium">Edit Tamu</h2>
        <GuestForm
          action={updateGuestAction.bind(null, invitation.id, guest.id)}
          initial={{ name: guest.name, partnerName: guest.partnerName, allowedGuestCount: guest.allowedGuestCount }}
          submitLabel="Simpan"
        />
      </section>

      <form action={deleteGuestAction.bind(null, invitation.id, guest.id)}>
        <ConfirmButton message="Hapus tamu ini beserta RSVP-nya?" className="btn-danger">
          Hapus Tamu
        </ConfirmButton>
      </form>
    </div>
  );
}
