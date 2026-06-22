import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const nombre = formData.get("nombre") as string;
    const apellidos = formData.get("apellidos") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const nombreCuenta = formData.get("nombre_cuenta") as string;
    const dominio = formData.get("dominio") as string;
    const pais = formData.get("pais") as string;
    const logoEntry = formData.get("logo");
    const logoFile = logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;
    const planParam = formData.get("plan") as string;
    const password = formData.get("password") as string;

    const saasPlanMap: Record<string, { planId: string; priceId: string }> = {
      "multimarca-lifetime": {
        planId: "PONER_AQUI_EL_SAAS_PLAN_ID",
        priceId: "PONER_AQUI_EL_STRIPE_PRICE_ID",
      },
      "upgrade-multimarca": {
        planId: "PONER_AQUI_EL_SAAS_PLAN_ID",
        priceId: "PONER_AQUI_EL_STRIPE_PRICE_ID",
      },
      "promo-multimarca": {
        planId: "PONER_AQUI_EL_SAAS_PLAN_ID",
        priceId: "PONER_AQUI_EL_STRIPE_PRICE_ID",
      },
      multimarca: {
        planId: "PONER_AQUI_EL_SAAS_PLAN_ID",
        priceId: "PONER_AQUI_EL_STRIPE_PRICE_ID",
      },
    };

    if (!nombre || !email || !nombreCuenta) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const {
      GHL_BEARER_TOKEN,
      GHL_COMPANY_ID,
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_UPLOAD_PRESET,
      STRIPE_ACCOUNT_ID,
    } = process.env;

    if (!GHL_BEARER_TOKEN || !GHL_COMPANY_ID) {
      return NextResponse.json({ error: "Configuracion de GHL faltante en el servidor" }, { status: 500 });
    }

    let logoUrl = "";

    if (logoFile && CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
      try {
        const cloudFormData = new FormData();
        cloudFormData.append("file", logoFile);
        cloudFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        console.log("Subiendo logo a Cloudinary...");
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: cloudFormData,
        });

        if (!cloudRes.ok) {
          const errText = await cloudRes.text();
          console.error("Cloudinary Error:", errText);
          throw new Error("No se pudo subir la imagen a Cloudinary");
        }

        const cloudData = await cloudRes.json();
        logoUrl = cloudData.secure_url;
        console.log("Logo subido exitosamente:", logoUrl);
      } catch (err) {
        console.error("Error en Cloudinary:", err);
        return NextResponse.json({ error: "Error al cargar la imagen" }, { status: 500 });
      }
    }

    const ghlHeaders = {
      Authorization: `Bearer ${GHL_BEARER_TOKEN}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    console.log("Creando Location en GHL...");
    const locationPayload: {
      companyId: string;
      name: string;
      phone: string;
      email: string;
      website: string;
      country: string;
      logoUrl?: string;
    } = {
      companyId: GHL_COMPANY_ID,
      name: nombreCuenta,
      phone: telefono,
      email,
      website: dominio,
      country: pais,
    };

    if (logoUrl) {
      locationPayload.logoUrl = logoUrl;
    }

    const locRes = await fetch("https://services.leadconnectorhq.com/locations/", {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify(locationPayload),
    });

    if (!locRes.ok) {
      const errText = await locRes.text();
      console.error("GHL Location Error:", errText);
      return NextResponse.json({ error: "No se pudo crear la subcuenta en GHL" }, { status: 400 });
    }

    const locData = await locRes.json();
    const locationId = locData.location?.id || locData.id;

    if (!locationId) {
      return NextResponse.json({ error: "GHL no devolvio un ID de Location valido" }, { status: 500 });
    }

    console.log(`Creando Usuario en la Location ${locationId}...`);
    const userPayload = {
      companyId: GHL_COMPANY_ID,
      firstName: nombre,
      lastName: apellidos,
      email,
      phone: telefono,
      password: password || "Multimarca2026*",
      type: "account",
      role: "admin",
      locationIds: [locationId],
    };

    const userRes = await fetch("https://services.leadconnectorhq.com/users/", {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify(userPayload),
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("GHL User Error:", errText);
    }

    if (planParam && saasPlanMap[planParam]) {
      console.log(`Activando modo SaaS para Location ${locationId} con el plan ${planParam}...`);
      const saasConfig = saasPlanMap[planParam];
      const saasPayload = {
        stripeAccountId: STRIPE_ACCOUNT_ID,
        name: `${nombre} ${apellidos}`,
        email,
        companyId: GHL_COMPANY_ID,
        isSaaSV2: true,
        providerLocationId: locationId,
        saasPlanId: saasConfig.planId,
        priceId: saasConfig.priceId,
      };

      const saasRes = await fetch(`https://services.leadconnectorhq.com/saas/enable-saas/${locationId}`, {
        method: "POST",
        headers: ghlHeaders,
        body: JSON.stringify(saasPayload),
      });

      if (!saasRes.ok) {
        const errText = await saasRes.text();
        console.error("GHL SaaS Enable Error:", errText);
      } else {
        console.log(`SaaS activado exitosamente para la location ${locationId}`);
      }
    }

    return NextResponse.json({ success: true, locationId, logoUrl });
  } catch (error: unknown) {
    console.error("API Error /create-account:", error);
    const message = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
