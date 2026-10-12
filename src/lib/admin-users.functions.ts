import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const roleSchema = z.enum(["admin", "manager", "attendant", "kitchen"]);

/**
 * Concede a função de Administrador ao usuário atual — apenas quando ainda
 * não existe nenhum administrador (primeiro acesso da operação).
 */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    if ((count ?? 0) > 0) throw new Error("Já existe um administrador cadastrado.");

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (roleError) throw new Error(roleError.message);

    await supabaseAdmin.from("staff_profiles").upsert({
      id: context.userId,
      name: (context.claims["email"] as string | undefined)?.split("@")[0] ?? "Administrador",
      email: (context.claims["email"] as string | undefined) ?? null,
    });
    return { ok: true };
  });

/** Indica se a operação ainda não possui administrador (bootstrap). */
export const adminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  return { exists: (count ?? 0) > 0 };
});

/** Cria um funcionário (conta + perfil + função). Somente administradores. */
export const createEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; email: string; password: string; phone?: string; role: string }) =>
    z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
        phone: z.string().optional(),
        role: roleSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleCheckError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleCheckError) throw new Error(roleCheckError.message);
    if (!isAdmin) throw new Error("Apenas administradores podem cadastrar funcionários.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { name: data.name },
    });
    if (error) throw new Error(error.message);
    const userId = created.user.id;

    const { error: profileError } = await supabaseAdmin.from("staff_profiles").upsert({
      id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone ?? null,
    });
    if (profileError) throw new Error(profileError.message);

    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    const { error: grantError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role as "admin" });
    if (grantError) throw new Error(grantError.message);

    return { id: userId };
  });
