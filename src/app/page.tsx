"use client";

import { useState } from "react";
import AccountFormStep from "@/components/AccountFormStep";
import { CheckCircle2 } from "lucide-react";

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <main style={{ minHeight: "100vh", padding: "3rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      {/* Cabecera general */}
      <header style={{ textAlign: "center", marginBottom: "3rem", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1d4ed8", marginBottom: "1rem" }}>
          Bienvenido a Multimarca GHL
        </h1>
        <p style={{ color: "#475569", fontSize: "1.1rem" }}>
          Completa el proceso para configurar tu cuenta y obtener acceso a todas las herramientas de automatización.
        </p>
      </header>

      {/* Stepper Visual */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "3rem", width: "100%", maxWidth: "300px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: step >= 1 ? 1 : 0.5 }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: step >= 1 ? "var(--primary)" : "var(--card-bg)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>1</div>
          <span style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Cuenta</span>
        </div>
        <div style={{ flex: 1, height: "2px", background: step >= 2 ? "var(--success)" : "var(--card-border)" }}></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: step >= 2 ? 1 : 0.5 }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: step >= 2 ? "var(--success)" : "var(--card-bg)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>2</div>
          <span style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Listo</span>
        </div>
      </div>

      {/* Contenido Dinámico */}
      <div style={{ width: "100%" }}>
        {step === 1 && <AccountFormStep onSuccess={() => setStep(2)} />}
        {step === 2 && (
          <div className="glass-panel animate-in" style={{ padding: "3rem", textAlign: "center", maxWidth: "500px", margin: "0 auto", backgroundColor: "#fff" }}>
            <CheckCircle2 size={64} color="var(--success)" style={{ margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem", color: "#333" }}>¡Cuenta Creada!</h2>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>Tu subcuenta de GHL ha sido creada exitosamente. Recibirás un correo electrónico con tus credenciales de acceso en breves minutos.</p>
            <button className="glass-button" style={{ backgroundColor: "#1d4ed8" }} onClick={() => window.location.reload()}>Finalizar</button>
          </div>
        )}
      </div>

    </main>
  );
}
