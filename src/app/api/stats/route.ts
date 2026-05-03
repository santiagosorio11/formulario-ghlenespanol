import { NextResponse } from "next/server";
import { createClient } from "redis";

// Cliente de Redis estándar según el Quickstart
const redis = await createClient({
  url: process.env.REDIS_URL
}).connect();

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Verificación de variable
    if (!process.env.REDIS_URL) {
      return NextResponse.json({ 
        error: "Falta la variable REDIS_URL", 
        ayuda: "Copia la URL de conexión (REDIS_URL) de tu panel de Upstash/Vercel y agrégala a las variables de entorno."
      }, { status: 500 });
    }

    const total = await redis.get("contador_registros") || 0;
    
    return NextResponse.json({ 
      success: true,
      mensaje: "Contador de registros interno de Multimarca GHL",
      total_registrados: total,
      ultima_actualizacion: new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" })
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Error al leer el contador", 
      mensaje_tecnico: error.message 
    }, { status: 500 });
  }
}
