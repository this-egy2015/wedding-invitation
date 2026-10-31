import Link from "next/link";
import { listOwnedInvitations } from "@/features/invitations/queries";
import { env } from "@/env";

const STATUS_LABEL = { draft: "Draft", published: "Published", unpublished: "Unpublished" } as const;

export default async function InvitationsPage() {
  const invitations = await listOwnedInvitations();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Undangan Saya</h1>
        <Link href="/dashboard/invitations/new" className="btn-primary">
          Buat Undangan
        </Link>
      </div>

      {invitations.length === 0 ? (
        <p className="rounded-lg border border-dashed bg-white p-8 text-center text-neutral-600">
          Belum ada undangan.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border bg-white">
          {invitations.map((inv) => {
            const couple = inv.draftContent
              ? `${inv.draftContent.groom.nickname} & ${inv.draftContent.bride.nickname}`
              : "Konten belum diisi";
            return (
              <li key={inv.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{couple}</p>
                  <p className="text-sm text-neutral-600">
                    /{inv.slug} · {STATUS_LABEL[inv.status]}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/invitations/${inv.id}/edit`} className="btn-secondary">
                    Edit
                  </Link>
                  <Link href={`/dashboard/invitations/${inv.id}/preview`} className="btn-secondary">
                    Preview
                  </Link>
                  <Link href={`/dashboard/invitations/${inv.id}/guests`} className="btn-secondary">
                    Tamu
                  </Link>
                  {inv.status === "published" && (
                    <a href={`${env.SITE_URL}/${inv.slug}`} target="_blank" rel="noreferrer" className="btn-secondary">
                      Lihat
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
