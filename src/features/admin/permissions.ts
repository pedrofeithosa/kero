/** Kero Mais — Funções e permissões do painel administrativo. */

export type StaffRole = "admin" | "manager" | "attendant" | "kitchen";
export type AppRole = StaffRole | "customer";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  manager: "Gerente",
  attendant: "Atendente",
  kitchen: "Cozinha",
  customer: "Cliente",
};

export const STAFF_ROLES: StaffRole[] = ["admin", "manager", "attendant", "kitchen"];

export type Permission =
  | "dashboard.view"
  | "orders.view"
  | "orders.status"
  | "orders.cancel"
  | "products.view"
  | "products.manage"
  | "categories.manage"
  | "promotions.manage"
  | "coupons.manage"
  | "customers.view"
  | "employees.manage"
  | "delivery.manage"
  | "reports.view"
  | "settings.manage"
  | "logs.view";

const ALL: Permission[] = [
  "dashboard.view",
  "orders.view",
  "orders.status",
  "orders.cancel",
  "products.view",
  "products.manage",
  "categories.manage",
  "promotions.manage",
  "coupons.manage",
  "customers.view",
  "employees.manage",
  "delivery.manage",
  "reports.view",
  "settings.manage",
  "logs.view",
];

/** Matriz de permissões por função. Novas funções podem ser adicionadas aqui. */
export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  admin: ALL,
  manager: ALL.filter((p) => p !== "employees.manage"),
  attendant: ["dashboard.view", "orders.view", "orders.status", "products.view", "customers.view"],
  kitchen: ["orders.view", "orders.status", "products.view"],
  customer: [],
};

export function permissionsFor(roles: AppRole[]): Set<Permission> {
  const set = new Set<Permission>();
  for (const role of roles) for (const p of ROLE_PERMISSIONS[role] ?? []) set.add(p);
  return set;
}

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as string[]).includes(role);
}
