// Base URL for building absolute links in server-generated emails (deep
// links into the admin panel). Prefers the admin-configurable
// settings.site_url (Setting page → "Site URL") — pass it as `override` from
// getAdminNotificationSettings() — since that's editable without a redeploy,
// unlike NEXTAUTH_URL. Falls back to NEXTAUTH_URL, then localhost.
export function getSiteUrl(override?: string | null): string {
  const url = override || process.env.NEXTAUTH_URL || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
