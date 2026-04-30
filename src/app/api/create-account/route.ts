import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // 1. Extraer los datos del formulario
    const nombre = formData.get("nombre") as string;
    const apellidos = formData.get("apellidos") as string;
    const email = formData.get("email") as string;
    const telefono = formData.get("telefono") as string;
    const nombreCuenta = formData.get("nombre_cuenta") as string;
    const dominio = formData.get("dominio") as string;
    const pais = formData.get("pais") as string;
    const logoFile = formData.get("logo") as File;
    const planParam = formData.get("plan") as string; // Recibe el plan

    const saasPlanMap: Record<string, { planId: string; priceId: string }> = {
      "pro-monthly": { planId: "69ebd2ddce2b6c16ca2aae61", priceId: "price_1TPqMjRn4XfPkgW4Ol2g3iz0" },
      "pro-yearly": { planId: "69ebd2ddce2b6c16ca2aae61", priceId: "price_1TPqMjRn4XfPkgW4MUQ791Ja" },
      "premium-monthly": { planId: "69ebd5a0ca9286b32af91933", priceId: "price_1TPqY7Rn4XfPkgW4RLeyA6Dk" },
      "premium-yearly": { planId: "69ebd5a0ca9286b32af91933", priceId: "price_1TPqY7Rn4XfPkgW4at1O15ab" },
      "partners-monthly": { planId: "69ebd74e9a3f0e9063905d55", priceId: "price_1TPqf4Rn4XfPkgW4YGBruwXr" },
      "partners-yearly": { planId: "69ebd74e9a3f0e9063905d55", priceId: "price_1TPqf4Rn4XfPkgW4pEWGRTLU" },
      "promo-monthly": { planId: "69ebd8ba959a6fd1966b354a", priceId: "price_1TPqkvRn4XfPkgW4t44gMBQr" },
      "promo-yearly": { planId: "69ebd8ba959a6fd1966b354a", priceId: "price_1TPqkvRn4XfPkgW4dl9hBQq3" }
    };

    if (!nombre || !email || !nombreCuenta || !logoFile) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const {
      GHL_BEARER_TOKEN,
      GHL_COMPANY_ID,
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_UPLOAD_PRESET
    } = process.env;

    if (!GHL_BEARER_TOKEN || !GHL_COMPANY_ID) {
      return NextResponse.json({ error: "Configuración de GHL faltante en el servidor" }, { status: 500 });
    }

    let logoUrl = "";

    // 2. Subir imagen a Cloudinary (si existe el archivo y las variables)
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
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

    // Headers comunes para GHL
    const ghlHeaders = {
      "Authorization": `Bearer ${GHL_BEARER_TOKEN}`,
      "Version": "2021-07-28",
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    // 3. Crear Locación en GHL
    console.log("Creando Location en GHL...");
    const locationPayload = {
      companyId: GHL_COMPANY_ID,
      name: nombreCuenta,
      phone: telefono,
      email: email,
      website: dominio,
      country: pais,
    };

    const locRes = await fetch("https://services.leadconnectorhq.com/locations/", {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify(locationPayload)
    });

    if (!locRes.ok) {
      const errText = await locRes.text();
      console.error("GHL Location Error:", errText);
      return NextResponse.json({ error: "No se pudo crear la subcuenta en GHL" }, { status: 400 });
    }

    const locData = await locRes.json();
    const locationId = locData.location?.id || locData.id;

    if (!locationId) {
      return NextResponse.json({ error: "GHL no devolvió un ID de Location válido" }, { status: 500 });
    }

    // 4. Crear Usuario Administrador en GHL
    console.log(`Creando Usuario en la Location ${locationId}...`);
    const userPayload = {
      companyId: GHL_COMPANY_ID,
      firstName: nombre,
      lastName: apellidos,
      email: email,
      phone: telefono,
      type: "account",
      role: "admin",
      locationIds: [locationId]
    };

    const userRes = await fetch("https://services.leadconnectorhq.com/users/", {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify(userPayload)
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("GHL User Error:", errText);
      // No cortamos el flujo aquí, pero logueamos el error
    }

    // 5. Actualizar Location con el Logo de Cloudinary
    if (logoUrl) {
      console.log(`Actualizando logo en Location ${locationId}...`);
      const updatePayload = {
        logoUrl: logoUrl
      };

      const updateRes = await fetch(`https://services.leadconnectorhq.com/locations/${locationId}`, {
        method: "PUT",
        headers: ghlHeaders,
        body: JSON.stringify(updatePayload)
      });

      if (!updateRes.ok) {
        const errText = await updateRes.text();
        console.error("GHL Update Location Logo Error:", errText);
      }
    }

    // 6. Activar Modo SaaS si el parámetro de plan existe y es válido
    if (planParam && saasPlanMap[planParam]) {
      console.log(`Activando modo SaaS para Location ${locationId} con el plan ${planParam}...`);
      const saasConfig = saasPlanMap[planParam];
      const saasPayload = {
        stripeAccountId: "acct_1TNZ7KRn4XfPkgW4",
        name: `${nombre} ${apellidos}`,
        email: email,
        companyId: GHL_COMPANY_ID,
        isSaaSV2: true,
        providerLocationId: locationId,
        saasPlanId: saasConfig.planId,
        priceId: saasConfig.priceId
      };

      const saasRes = await fetch(`https://services.leadconnectorhq.com/saas/enable-saas/${locationId}`, {
        method: "POST",
        headers: ghlHeaders,
        body: JSON.stringify(saasPayload)
      });

      if (!saasRes.ok) {
        const errText = await saasRes.text();
        console.error("GHL SaaS Enable Error:", errText);
      } else {
        console.log(`SaaS activado exitosamente para la location ${locationId}`);
      }
    }

    return NextResponse.json({ success: true, locationId, logoUrl });

  } catch (error: any) {
    console.error("API Error /create-account:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
