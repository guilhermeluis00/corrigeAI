import type { SessionUser } from "./auth";

export function canAccess(user: SessionUser, roles: SessionUser["tipo"][]) {
  return roles.includes(user.tipo);
}
