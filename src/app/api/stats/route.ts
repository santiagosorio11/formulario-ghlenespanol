import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Para que no se guarde en cache y siempre esté actualizado

export async function GET() {
  try {
    const total = await kv.get("contador_registros") || 0;
    
    return NextResponse.json({ 
      success: true,
      mensaje: "Contador de registros interno de Multimarca GHL",
      total_registrados: total,
      ultima_actualizacion: new Date().toLocaleString("es-CO")
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al leer el contador" }, { status: 500 });
  }
}
