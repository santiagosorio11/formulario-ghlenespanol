import { NextResponse } from "next/server";
import { createClient } from "@vercel/kv";

// Configuramos el cliente manualmente con las variables que te da el Quickstart de Upstash
const kv = createClient({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "",
});

export const dynamic = "force-dynamic"; // Para que no se guarde en cache y siempre esté actualizado

export async function GET() {
  try {
    // Verificación de variables con los nombres de tu Quickstart
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      return NextResponse.json({ 
        error: "Faltan variables de entorno de Upstash", 
        ayuda: "Verifica que en tu panel de Vercel aparezcan UPSTASH_REDIS_REST_URL y TOKEN."
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
