"use client";

import type { DirectFormConfig } from "@/app/api/create-account/directForms";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import AccountFormStep from "./AccountFormStep";

interface DirectAccountPageProps {
  formConfig: DirectFormConfig;
}

export default function DirectAccountPage({ formConfig }: DirectAccountPageProps) {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <main style={{ minHeight: "100vh", padding: "3rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem", maxWidth: "640px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1d4ed8", marginBottom: "1rem" }}>
          {formConfig.title}
        </h1>
        <p style={{ color: "#475569", fontSize: "1.1rem" }}>
          {formConfig.description}
        </p>
      </header>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "3rem", width: "100%", maxWidth: "300px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: step >= 1 ? 1 : 0.5 }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: step >= 1 ? "var(--primary)" : "var(--card-bg)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>1</div>
          <span style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Cuenta</span>
        </div>
        <div style={{ flex: 1, height: "2px", background: step >= 2 ? "var(--success)" : "var(--card-border)" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: step >= 2 ? 1 : 0.5 }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: step >= 2 ? "var(--success)" : "var(--card-bg)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>2</div>
          <span style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Listo</span>
        </div>
      </div>

      <div style={{ width: "100%" }}>
        {step === 1 && <AccountFormStep formConfig={formConfig} onSuccess={() => setStep(2)} />}
        {step === 2 && (
          <div className="glass-panel animate-in" style={{ padding: "3rem", textAlign: "center", maxWidth: "500px", margin: "0 auto", backgroundColor: "#fff" }}>
            <CheckCircle2 size={64} color="var(--success)" style={{ margin: "0 auto 1.5rem" }} />
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem", color: "#333" }}>{formConfig.successTitle}</h2>
            <p style={{ color: "#64748b", marginBottom: "2rem" }}>{formConfig.successMessage}</p>
            <button className="glass-button" style={{ backgroundColor: "#1d4ed8" }} onClick={() => window.location.href = "https://app.ghlenespanol.site"}>Ir a mi Cuenta GHL</button>
          </div>
        )}
      </div>
    </main>
  );
}
