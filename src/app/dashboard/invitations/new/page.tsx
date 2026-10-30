import { templates } from "@/templates";
import { NewInvitationForm } from "./NewInvitationForm";

export default function NewInvitationPage() {
  const templateOptions = Object.entries(templates).map(([id, t]) => ({ id, name: t.name }));
  return <NewInvitationForm templateOptions={templateOptions} />;
}
