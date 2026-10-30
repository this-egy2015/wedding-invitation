export const RSVP_LABEL = {
  attending: "Hadir",
  not_attending: "Tidak Hadir",
  pending: "Belum dikonfirmasi",
} as const;

export const rsvpLabel = (status: "attending" | "not_attending" | null) => RSVP_LABEL[status ?? "pending"];
