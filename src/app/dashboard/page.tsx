import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { listGuestInvitations } from "@/db/access";
import { requireUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/access-policy";

export default async function DashboardPage() {
  const user = await requireUser();
  const invitations = await listGuestInvitations(db, user);
  if (invitations.length === 1) redirect(`/dashboard/invitations/${invitations[0].id}/guests`);
  if (!invitations.length) redirect(isAdminEmail(user.email) ? "/dashboard/invitations" : "/login");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Kelola Tamu</h1>
      <p>Pilih undangan yang ingin dikelola.</p>
      <ul className="divide-y rounded-lg border bg-white">
        {invitations.map((invitation) => (
          <li key={invitation.id} className="p-4">
            <Link href={`/dashboard/invitations/${invitation.id}/guests`} className="btn-secondary">Kelola Tamu · /{invitation.slug}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
