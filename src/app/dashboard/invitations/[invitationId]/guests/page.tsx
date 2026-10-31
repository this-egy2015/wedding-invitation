import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";
import { addGuestAction } from "@/features/guests/actions";
import { GUEST_PAGE_SIZE, guestLink, listGuests } from "@/features/guests/queries";
import { getOwnedInvitation } from "@/features/invitations/queries";
import { rsvpLabel } from "@/features/rsvp/status";
import { GuestForm } from "./GuestForm";

type Props = {
  params: Promise<{ invitationId: string }>;
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
};

export default async function GuestsPage({ params, searchParams }: Props) {
  const { invitationId } = await params;
  const { q, page: pageParam } = await searchParams;
  const invitation = await getOwnedInvitation(invitationId);

  const search = typeof q === "string" ? q.trim().slice(0, 100) : "";
  const page = Math.max(1, Number.parseInt(typeof pageParam === "string" ? pageParam : "1", 10) || 1);
  const { rows, total } = await listGuests(invitation.id, search, page);
  const totalPages = Math.max(1, Math.ceil(total / GUEST_PAGE_SIZE));
  const base = `/dashboard/invitations/${invitation.id}/guests`;
  const pageHref = (p: number) => `${base}?${new URLSearchParams({ ...(search && { q: search }), page: String(p) })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Daftar Tamu</h1>
          <p className="text-sm text-neutral-600">/{invitation.slug}</p>
        </div>
        <Link href={`/dashboard/invitations/${invitation.id}/edit`} className="btn-secondary">
          Kembali ke Undangan
        </Link>
      </div>

      {invitation.status !== "published" && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Undangan belum dipublikasikan. Link tamu baru bisa dibuka setelah publish.
        </p>
      )}

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 font-medium">Tambah Tamu</h2>
        <GuestForm action={addGuestAction.bind(null, invitation.id)} submitLabel="Tambah" />
      </section>

      <form className="flex gap-2">
        <input name="q" defaultValue={search} placeholder="Cari nama tamu" className="input max-w-xs" />
        <button type="submit" className="btn-secondary">
          Cari
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nama Tamu & Pasangan</th>
              <th className="px-4 py-3 font-medium">Kehadiran</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-600">
                  {search ? "Tidak ada tamu yang cocok." : "Belum ada tamu."}
                </td>
              </tr>
            ) : (
              rows.map((g) => (
                <tr key={g.id}>
                  <td className="px-4 py-3">{[g.name, g.partnerName].filter(Boolean).join(" & ")}</td>
                  <td className="px-4 py-3">
                    {rsvpLabel(g.rsvpStatus)}
                    {g.rsvpStatus === "attending" && ` (${g.attendanceCount}/${g.allowedGuestCount})`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <CopyButton value={guestLink(invitation.slug, g.shareToken)} />
                      <Link href={`${base}/${g.id}`} className="btn-secondary">
                        Detail
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm">
          <span className="text-neutral-600">
            Halaman {page} dari {totalPages} · {total} tamu
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageHref(page - 1)} className="btn-secondary">
                Sebelumnya
              </Link>
            )}
            {page < totalPages && (
              <Link href={pageHref(page + 1)} className="btn-secondary">
                Berikutnya
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
