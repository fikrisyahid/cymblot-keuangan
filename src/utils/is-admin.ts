import { ADMIN_EMAIL } from "@/config";

export default function isAdmin(email: string) {
  return ADMIN_EMAIL.includes(email);
}
