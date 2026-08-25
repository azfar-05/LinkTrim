export function isAdminRole(role: string) {
  return role === "owner" || role === "admin";
}
