export const ADMIN_EMAIL = "tecpointdistribucion2@gmail.com";

export function isAdminEmail(email?: string | null) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}
