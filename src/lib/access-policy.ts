export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function isAdminEmail(email: string | undefined, adminEmail = process.env.ADMIN_EMAIL) {
  return !!email && !!adminEmail?.trim() && normalizeEmail(email) === normalizeEmail(adminEmail);
}
