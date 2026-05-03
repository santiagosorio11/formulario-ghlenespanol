import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Para que no se guarde en cache y siempre esté actualizado

export async function GET() {
  try {
    // Verificación de variables de entorno
    if (!process.env.KV_URL || !process.env.KV_REST_API_TOKEN) {
      return NextResponse.json({ 
        error: "Faltan variables de entorno", 
        detalles: {
          KV_URL: !!process.env.KV_URL,
          KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN
        },
        ayuda: "Debes conectar tu base de datos Redis en la pestaña Storage de Vercel y hacer un Redeploy."
      }, { status: 500 });
    }

    const total = await kv.get("contador_registros") || 0;
    
    return NextResponse.json({ 
      success: true,
      mensaje: "Contador de registros interno de Multimarca GHL",
      total_registrados: total,
      ultima_actualizacion: new Date().toLocaleString("es-CO")
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Error al leer el contador", 
      mensaje_tecnico: error.message 
    }, { status: 500 });
  }
}
