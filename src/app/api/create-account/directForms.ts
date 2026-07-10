export type DirectFormSlug = "psicologos" | "impulso-digital-anual" | "partner-multimarca";
export type BillingInterval = "month" | "year";

export interface DirectFormConfig {
  slug: DirectFormSlug;
  title: string;
  description: string;
  accountLabel: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  planReference: string;
  snapshotId: string;
  saasPlanId: string | null;
  requiresBillingInterval: boolean;
  requiresPartnerEmail: boolean;
  prices: Partial<Record<BillingInterval, string>>;
}

export const DIRECT_FORM_CONFIGS: DirectFormConfig[] = [
  {
    slug: "psicologos",
    title: "Snapshot Psicologos",
    description: "Crea tu cuenta con el snapshot especializado para psicologos y deja tu marca lista desde el primer ingreso.",
    accountLabel: "Nombre del consultorio / marca",
    submitLabel: "Crear cuenta de psicologos",
    successTitle: "Cuenta de psicologos creada",
    successMessage: "Tu subcuenta fue creada con el snapshot de psicologos y refacturacion activa.",
    planReference: "Snapshot Psicologos",
    snapshotId: "n4dhRqPryCmPDkmg85yo",
    saasPlanId: null,
    requiresBillingInterval: false,
    requiresPartnerEmail: false,
    prices: {},
  },
  {
    slug: "impulso-digital-anual",
    title: "Impulso Digital",
    description: "Registra tu cuenta y elige como se activara el cobro interno del plan Impulso Digital.",
    accountLabel: "Nombre de la cuenta / empresa",
    submitLabel: "Crear cuenta Impulso Digital",
    successTitle: "Cuenta Impulso Digital creada",
    successMessage: "Tu subcuenta fue creada con SaaS, snapshot y refacturacion activa.",
    planReference: "Impulso Digital Anual",
    snapshotId: "xhn8FG3tDluolwxSGrUT",
    saasPlanId: "6a4e7581e52f5816d8e1feb5",
    requiresBillingInterval: true,
    requiresPartnerEmail: false,
    prices: {
      month: "price_1TqxzRIGRrEnkipJMZ2ZiKRO",
      year: "price_1TqxzRIGRrEnkipJHddz6lMd",
    },
  },
  {
    slug: "partner-multimarca",
    title: "Cuenta GHL Partner Multimarca",
    description: "Crea la subcuenta del cliente final y agrega al partner existente como administrador.",
    accountLabel: "Nombre de la cuenta del cliente",
    submitLabel: "Crear cuenta Multimarca",
    successTitle: "Cuenta Multimarca creada",
    successMessage: "La subcuenta fue creada y el partner quedo agregado como administrador.",
    planReference: "Cuenta GHL Partner Multimarca",
    snapshotId: "xhn8FG3tDluolwxSGrUT",
    saasPlanId: "6a39774f492b1bc3ff96410e",
    requiresBillingInterval: true,
    requiresPartnerEmail: true,
    prices: {
      month: "price_1TlC5DIGRrEnkipJNsQE6h1M",
      year: "price_1TlC6DIGRrEnkipJDgY6yaE9",
    },
  },
];

export function getDirectFormConfig(slug: string | null | undefined) {
  return DIRECT_FORM_CONFIGS.find((config) => config.slug === slug) ?? null;
}

export function getSaasPriceIdForBillingInterval(
  config: DirectFormConfig | null | undefined,
  billingInterval: string | null | undefined,
) {
  if (!config?.saasPlanId) {
    return null;
  }

  if (billingInterval !== "month" && billingInterval !== "year") {
    throw new Error("Selecciona si el cobro sera mensual o anual");
  }

  const priceId = config.prices[billingInterval];

  if (!priceId) {
    throw new Error(`El formulario ${config.title} no tiene precio ${billingInterval} configurado`);
  }

  return priceId;
}

export function validatePasswordPolicy(password: string) {
  if (password.length < 10) {
    return "La contrasena debe tener minimo 10 caracteres";
  }

  if (!/[A-Z]/.test(password)) {
    return "La contrasena debe incluir al menos una mayuscula";
  }

  if (!/[a-z]/.test(password)) {
    return "La contrasena debe incluir al menos una minuscula";
  }

  if (!/[0-9]/.test(password)) {
    return "La contrasena debe incluir al menos un numero";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "La contrasena debe incluir al menos un caracter especial";
  }

  return null;
}
