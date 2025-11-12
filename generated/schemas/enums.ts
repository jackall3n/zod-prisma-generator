import { z } from "zod";
export const RoleSchema = z.enum(["Role", "Role"]);
export type Role = z.infer<typeof RoleSchema>;
