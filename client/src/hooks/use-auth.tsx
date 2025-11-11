import { useMutation } from "@tanstack/react-query";
import { useDebug } from "@/components/Debug/debugContext";

export interface AuthUser {
  id: string;
  name: string;
  role: string;
  permissions: string[];
  email?: string;
}

/**
 * useAuth (Debug-context-backed version)
 * -------------------------------------
 * - Reads `user.fields` and `user.selects.role` from DebugContext.
 * - Provides same API shape: { user, logoutMutation }.
 * - Ready to be replaced with production data source later.
 */
export function useAuth() {
  const { schema, mergeSchema } = useDebug();

  const userSection = schema?.user ?? {};
  const fields = userSection.fields ?? {};
  const selects = userSection.selects ?? {};
  const toggles = userSection.toggles ?? {};
  const permissions = Object.entries(toggles)
    .filter(([key, value]) => key.endsWith("Permission") && value === true)
    .map(([key]) => key.replace(/Permission$/, ""));

  // Derived user object from DebugContext
  const user: AuthUser = {
    id: "1",
    name: fields.name || "System Admin",
    role: selects.role?.value || "superAdmin",
    permissions: permissions || [],
    email: fields.email || "admin@example.com",
  };
  
  console.log(user);

  // Dummy logout mutation (just clears debug user fields)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300)); // simulate delay
      console.log("🔒 Logged out (debug mode)");

      mergeSchema({
        user: {
          fields: {
            ...fields,
            name: "Guest User",
            email: "",
            availableFunds: "0.00",
          },
          selects: {
            ...selects,
            role: { value: "guest", options: selects.role?.options ?? [] },
          },
        },
      });

      return true;
    },
  });

  return { user, logoutMutation };
}
