export type DirectFormSlug =
  | "cuenta-anual-partners-ghl"
  | "cuenta-multimarca-anual-ghl"
  | "cuenta-partner-ghl-lifetime"
  | "cuenta-ghl-premium-clientes";

export interface DirectFormConfig {
  slug: DirectFormSlug;
  title: string;
  description: string;
  accountLabel: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  snapshotId: string;
  requiresPartnerEmail: boolean;
}

export const DIRECT_FORM_CONFIGS: DirectFormConfig[] = [
  {
    slug: "cuenta-anual-partners-ghl",
    title: "Cuenta Anual Partners GHL",
    description: "Completa la informacion para crear tu cuenta anual de Partners GHL.",
    accountLabel: "Nombre de la cuenta / empresa",
    submitLabel: "Crear cuenta anual Partners GHL",
    successTitle: "Cuenta Anual Partners GHL creada",
    successMessage: "Tu subcuenta fue creada con su configuracion y usuario administrador.",
    snapshotId: "XYvYKvT2RqitSJFAseuS",
    requiresPartnerEmail: false,
  },
  {
    slug: "cuenta-multimarca-anual-ghl",
    title: "Cuenta Multimarca Anual GHL",
    description: "Crea la cuenta anual del cliente y agrega al partner existente como administrador.",
    accountLabel: "Nombre de la cuenta del cliente",
    submitLabel: "Crear cuenta Multimarca Anual GHL",
    successTitle: "Cuenta Multimarca Anual GHL creada",
    successMessage: "La subcuenta fue creada y el partner quedo agregado como administrador.",
    snapshotId: "XYvYKvT2RqitSJFAseuS",
    requiresPartnerEmail: true,
  },
  {
    slug: "cuenta-partner-ghl-lifetime",
    title: "Cuenta Partner GHL Lifetime",
    description: "Completa la informacion para crear tu cuenta Partner GHL Lifetime.",
    accountLabel: "Nombre de la cuenta / empresa",
    submitLabel: "Crear cuenta Partner GHL Lifetime",
    successTitle: "Cuenta Partner GHL Lifetime creada",
    successMessage: "Tu subcuenta fue creada con su configuracion y usuario administrador.",
    snapshotId: "XYvYKvT2RqitSJFAseuS",
    requiresPartnerEmail: false,
  },
  {
    slug: "cuenta-ghl-premium-clientes",
    title: "Cuenta GHL Premium para clientes",
    description: "Completa la informacion para crear la cuenta GHL Premium de tu empresa.",
    accountLabel: "Nombre de la cuenta / empresa",
    submitLabel: "Crear cuenta GHL Premium",
    successTitle: "Cuenta GHL Premium creada",
    successMessage: "Tu subcuenta fue creada con su configuracion y usuario administrador.",
    snapshotId: "XYvYKvT2RqitSJFAseuS",
    requiresPartnerEmail: false,
  },
];

export function getDirectFormConfig(slug: string | null | undefined) {
  return DIRECT_FORM_CONFIGS.find((config) => config.slug === slug) ?? null;
}

export function validatePasswordPolicy(password: string) {
  if (password.length < 10) {
    return "La contraseña debe tener mínimo 10 caracteres";
  }

  // Use Unicode property escapes to allow letters like 'ñ', accented characters, etc.
  // Requires the 'u' flag which is supported in modern Node.js and browsers used by Next.js.
  if (!/\p{Lu}/u.test(password)) {
    return "La contraseña debe incluir al menos una mayúscula";
  }

  if (!/\p{Ll}/u.test(password)) {
    return "La contraseña debe incluir al menos una minúscula";
  }

  if (!/\d/.test(password)) {
    return "La contraseña debe incluir al menos un número";
  }

  if (!/[^\p{L}\p{N}]/u.test(password)) {
    return "La contraseña debe incluir al menos un carácter especial";
  }

  return null;
}
