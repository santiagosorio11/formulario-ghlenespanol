export type DirectFormSlug = "psicologos" | "impulso-digital-anual" | "partner-multimarca";

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
    slug: "psicologos",
    title: "Snapshot Psicologos",
    description: "Crea tu cuenta con el snapshot especializado para psicologos y deja tu marca lista desde el primer ingreso.",
    accountLabel: "Nombre del consultorio / marca",
    submitLabel: "Crear cuenta de psicologos",
    successTitle: "Cuenta de psicologos creada",
    successMessage: "Tu subcuenta fue creada con el snapshot de psicologos y su usuario administrador.",
    snapshotId: "XYvYKvT2RqitSJFAseuS",
    requiresPartnerEmail: false,
  },
  {
    slug: "impulso-digital-anual",
    title: "Impulso Digital",
    description: "Crea tu subcuenta con el snapshot de Impulso Digital, logo e informacion de la empresa.",
    accountLabel: "Nombre de la cuenta / empresa",
    submitLabel: "Crear cuenta Impulso Digital",
    successTitle: "Cuenta Impulso Digital creada",
    successMessage: "Tu subcuenta fue creada con el snapshot de Impulso Digital y su usuario administrador.",
    snapshotId: "XYvYKvT2RqitSJFAseuS",
    requiresPartnerEmail: false,
  },
  {
    slug: "partner-multimarca",
    title: "Cuenta GHL Partner Multimarca",
    description: "Crea la subcuenta del cliente final y agrega al partner existente como administrador.",
    accountLabel: "Nombre de la cuenta del cliente",
    submitLabel: "Crear cuenta Multimarca",
    successTitle: "Cuenta Multimarca creada",
    successMessage: "La subcuenta fue creada y el partner quedo agregado como administrador.",
    snapshotId: "XYvYKvT2RqitSJFAseuS",
    requiresPartnerEmail: true,
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
