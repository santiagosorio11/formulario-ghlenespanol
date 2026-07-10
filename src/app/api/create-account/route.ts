import { NextResponse } from "next/server";
import { getDirectFormConfig, getSaasPriceIdForBillingInterval, validatePasswordPolicy } from "./directForms";
import { GhlClient } from "./ghlClient";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const formSlug = getString(formData, "form_slug");
    const formConfig = getDirectFormConfig(formSlug);

    if (!formConfig) {
      return NextResponse.json({ error: "Formulario no valido" }, { status: 400 });
    }

    const nombre = getString(formData, "nombre");
    const apellidos = getString(formData, "apellidos");
    const email = getString(formData, "email");
    const telefono = getString(formData, "telefono");
    const nombreCuenta = getString(formData, "nombre_cuenta");
    const dominio = getString(formData, "dominio");
    const pais = getString(formData, "pais");
    const billingInterval = getString(formData, "billing_interval");
    const partnerEmail = getString(formData, "partner_email");
    const password = getString(formData, "password");
    const logoEntry = formData.get("logo");
    const logoFile = logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;

    if (!nombre || !email || !nombreCuenta || !telefono || !pais || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const passwordError = validatePasswordPolicy(password);

    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    if (formConfig.requiresPartnerEmail && !partnerEmail) {
      return NextResponse.json({ error: "El email del partner es obligatorio" }, { status: 400 });
    }

    const {
      GHL_BEARER_TOKEN,
      GHL_COMPANY_ID,
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_UPLOAD_PRESET,
      STRIPE_ACCOUNT_ID,
      GHL_REQUEST_SPACING_MS,
    } = process.env;

    if (!GHL_BEARER_TOKEN || !GHL_COMPANY_ID) {
      return NextResponse.json({ error: "Configuracion de GHL faltante en el servidor" }, { status: 500 });
    }

    const logoUrl = await uploadLogoIfPresent({
      logoFile,
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
    });
    const ghlClient = new GhlClient({
      token: GHL_BEARER_TOKEN,
      companyId: GHL_COMPANY_ID,
      stripeAccountId: STRIPE_ACCOUNT_ID,
      requestSpacingMs: parseOptionalNumber(GHL_REQUEST_SPACING_MS),
    });
    const locationId = await ghlClient.createLocation({
      name: nombreCuenta,
      phone: telefono,
      email,
      website: dominio,
      country: pais,
      logoUrl,
      snapshotId: formConfig.snapshotId,
    });

    await ghlClient.upsertAdminUser({
      firstName: nombre,
      lastName: apellidos,
      email,
      phone: telefono,
      password,
      locationIds: [locationId],
    });

    if (formConfig.requiresPartnerEmail) {
      const partnerUser = await ghlClient.findUserByEmail(partnerEmail);

      if (!partnerUser) {
        return NextResponse.json({ error: "No se encontro un partner existente con ese email" }, { status: 400 });
      }

      await ghlClient.addAdminLocationToExistingUser(partnerUser, locationId);
    }

    await ghlClient.updateRebilling(locationId);

    if (formConfig.saasPlanId) {
      const priceId = getSaasPriceIdForBillingInterval(formConfig, billingInterval);

      if (!priceId) {
        return NextResponse.json({ error: "No se encontro el precio SaaS para este formulario" }, { status: 400 });
      }

      await ghlClient.enableSaas({
        locationId,
        name: `${nombre} ${apellidos}`.trim(),
        email,
        saasPlanId: formConfig.saasPlanId,
        priceId,
        isSaaSV2: false,
      });
    }

    return NextResponse.json({ success: true, locationId, logoUrl });
  } catch (error: unknown) {
    console.error("API Error /create-account:", error);
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

async function uploadLogoIfPresent({
  logoFile,
  cloudName,
  uploadPreset,
}: {
  logoFile: File | null;
  cloudName?: string;
  uploadPreset?: string;
}) {
  if (!logoFile) {
    return "";
  }

  if (!cloudName || !uploadPreset) {
    throw new Error("Configuracion de Cloudinary faltante en el servidor");
  }

  const cloudFormData = new FormData();
  cloudFormData.append("file", logoFile);
  cloudFormData.append("upload_preset", uploadPreset);

  const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: cloudFormData,
  });

  if (!cloudRes.ok) {
    const errText = await cloudRes.text();
    throw new Error(`Error al cargar la imagen: ${errText}`);
  }

  const cloudData = await cloudRes.json();
  return typeof cloudData.secure_url === "string" ? cloudData.secure_url : "";
}
