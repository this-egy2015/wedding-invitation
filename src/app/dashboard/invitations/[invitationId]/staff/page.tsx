import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invitationStaff } from "@/db/schema";
import { getOwnedInvitation } from "@/features/invitations/queries";
import { removeStaffAction } from "@/features/invitations/staff-actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { CopyButton } from "@/components/CopyButton";
import { env } from "@/env";
import { StaffForm } from "./StaffForm";

export default async function StaffPage({ params }: { params: Promise<{ invitationId: string }> }) {
  const invitation = await getOwnedInvitation((await params).invitationId);
  const staff = await db.select({ email: invitationStaff.email }).from(invitationStaff)
    .where(eq(invitationStaff.invitationId, invitation.id)).orderBy(asc(invitationStaff.email));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Akses Petugas</h1><p className="text-sm text-neutral-600">/{invitation.slug}</p></div>
        <Link href={`/dashboard/invitations/${invitation.id}/guests`} className="btn-secondary">Kembali ke Tamu</Link>
      </div>
      <StaffForm invitationId={invitation.id} />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>Bagikan halaman login kepada petugas:</span><CopyButton value={`${env.SITE_URL}/login`} label="Salin Link Login" />
      </div>
      <ul className="divide-y rounded-lg border bg-white">
        {staff.length === 0 && <li className="p-4 text-neutral-600">Belum ada petugas yang diberi akses.</li>}
        {staff.map(({ email }) => (
          <li key={email} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <span className="break-all">{email}</span>
            <form action={removeStaffAction.bind(null, invitation.id, email)}>
              <ConfirmButton message="Cabut akses petugas untuk undangan ini?" className="btn-danger">Cabut Akses</ConfirmButton>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
