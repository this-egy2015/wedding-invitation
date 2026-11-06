import { templates } from "@/templates";
import { requireAdmin } from "@/lib/auth";
import { NewInvitationForm } from "./NewInvitationForm";

export default async function NewInvitationPage() {
  await requireAdmin();
  const templateOptions = Object.entries(templates).map(([id, t]) => ({ id, name: t.name }));
  return <NewInvitationForm templateOptions={templateOptions} />;
}
