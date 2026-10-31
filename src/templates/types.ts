import type { InvitationContent } from "@/features/invitations/content";

export type TemplateGuest = {
  name: string;
  partnerName: string | null;
  allowedGuestCount: number;
  rsvpStatus: "attending" | "not_attending" | null;
  attendanceCount: number | null;
  wish: string | null;
};

export type TemplateProps = {
  slug: string;
  content: InvitationContent;
  /** Present when a personal URL or this browser's RSVP cookie matches. */
  guest: TemplateGuest | null;
  token: string | null;
  wishes: { id: string; name: string; partnerName: string | null; wish: string | null }[];
  /** Owner preview of a draft: RSVP is disabled. */
  preview: boolean;
};
