const reservedSlugs = new Set(["home", "login", "dashboard", "auth", "invite", "api", "assets", "templates", "berubah"]);

export function isPublicInvitationSlug(slug: string) {
  return slug.length >= 3 && slug.length <= 60 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && !reservedSlugs.has(slug);
}

export function invitationPath(slug: string, token?: string | null) {
  const path = `/${encodeURIComponent(slug)}`;
  return token ? `${path}?to=${encodeURIComponent(token)}` : path;
}
