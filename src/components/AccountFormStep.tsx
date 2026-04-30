"use client";

import { UploadCloud, CheckCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import PhoneInput from "react-phone-number-input";

interface AccountFormStepProps {
  onSuccess: () => void;
}

export default function AccountFormStep({ onSuccess }: AccountFormStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | undefined>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        setErrorMsg("El logo excede el límite de 2.5 MB.");
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setErrorMsg("");
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const formData = new FormData(e.currentTarget);
      if (phone) formData.set("telefono", phone);
      
      const res = await fetch("/api/create-account", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al procesar la solicitud.");
      }

      onSuccess();
    } catch (err: any) {
      console.error("Form error:", err);
      setErrorMsg(err.message || "Error de red.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel animate-in" style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto", backgroundColor: "#fff" }}>
      {errorMsg && (
        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--error)", color: "var(--error)", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1.5rem" }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#333", fontWeight: 500 }}>Nombre de la Cuenta / Empresa *</label>
          <input type="text" name="nombre_cuenta" required className="glass-input" placeholder="Ej. Mi Agencia" />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#333", fontWeight: 500 }}>Nombre</label>
          <input type="text" name="nombre" required className="glass-input" placeholder="Introduzca su nombre del propietario de la Cuenta GHL" />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#333", fontWeight: 500 }}>Apellidos</label>
          <input type="text" name="apellidos" required className="glass-input" placeholder="Introduzca lo(s) apellido(s) del propietario de la cuenta GHL" />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#333", fontWeight: 500 }}>email *</label>
          <input type="email" name="email" required className="glass-input" placeholder="your@email.com" />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#333", fontWeight: 500 }}>Teléfono que reciba SMS *</label>
          <div className="glass-input" style={{ padding: "0.75rem 1rem" }}>
            <PhoneInput
              international
              defaultCountry="CO"
              value={phone}
              onChange={setPhone}
              className="PhoneInput"
              style={{ width: "100%" }}
            />
          </div>
          {/* Campo oculto para asegurar que se vaya en el formData en caso que no se use el estado modificado */}
          <input type="hidden" name="telefono" value={phone || ""} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#333", fontWeight: 500 }}>País *</label>
          <select name="pais" required className="glass-input" style={{ appearance: "auto" }} defaultValue="">
            <option value="" disabled>Introduzca su país</option>
            <option value="US">Estados Unidos</option>
            <option value="ES">España</option>
            <option value="MX">México</option>
            <option value="CO">Colombia</option>
            <option value="AR">Argentina</option>
            <option value="PE">Perú</option>
            <option value="CL">Chile</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#333", fontWeight: 500 }}>Tipo de Cuenta *</label>
          <select name="tipo_de_cuenta" required className="glass-input" style={{ appearance: "auto" }} defaultValue="">
            <option value="" disabled>Tipo de Cuenta GHL</option>
            <option value="GHL Pro x 30 dias">GHL Pro x 30 dias</option>
            <option value="GHL Premium x 12 meses">GHL Premium x 12 meses</option>
            <option value="GHL Partners x 12 meses">GHL Partners x 12 meses</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", color: "#333", fontWeight: 500 }}>¿Quieres administrar esta cuenta GHL Premium? *</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
              <input type="radio" name="quiere_administrar" value="Si" required style={{ width: "1rem", height: "1rem" }} />
              Si
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem" }}>
              <input type="radio" name="quiere_administrar" value="No" required style={{ width: "1rem", height: "1rem" }} />
              No
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#333", fontWeight: 500 }}>Dominio</label>
          <input type="url" name="dominio" className="glass-input" placeholder="app.tudominio.com" />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "#333", fontWeight: 500 }}>Logo</label>
          <div 
            style={{ 
              border: "1px solid #cbd5e1", 
              borderRadius: "0.375rem", 
              padding: "2rem", 
              textAlign: "center",
              cursor: logoPreview ? "default" : "pointer",
              transition: "border 0.2s"
            }}
            onClick={(e) => {
              if (!logoPreview) fileInputRef.current?.click();
            }}
            onMouseOver={(e) => { if (!logoPreview) e.currentTarget.style.borderColor = "var(--primary)" }}
            onMouseOut={(e) => { if (!logoPreview) e.currentTarget.style.borderColor = "#cbd5e1" }}
          >
            <input 
              type="file" 
              name="logo" 
              accept="image/*" 
              style={{ display: "none" }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {logoPreview ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: "100px", objectFit: "contain", marginBottom: "1rem", borderRadius: "0.25rem" }} />
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.875rem", cursor: "pointer", fontWeight: 500 }}
                  >
                    Cambiar imagen
                  </button>
                  <button 
                    type="button" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setLogoPreview(null); 
                      if(fileInputRef.current) fileInputRef.current.value = ""; 
                    }}
                    style={{ background: "none", border: "none", color: "var(--error)", fontSize: "0.875rem", cursor: "pointer", fontWeight: 500 }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#64748b" }}>
                <div style={{ background: "#f1f5f9", borderRadius: "50%", padding: "0.5rem", marginBottom: "0.5rem" }}>
                  <UploadCloud size={20} />
                </div>
                <p style={{ fontWeight: "500", marginBottom: "0.25rem", color: "#333" }}>Haga clic para subir</p>
                <p style={{ fontSize: "0.75rem" }}>Formato horizontal (350x180 px). JPG/PNG/SVG hasta 2.5MB.</p>
              </div>
            )}
          </div>
        </div>
        
        <button type="submit" className="glass-button" style={{ marginTop: "1rem", backgroundColor: "#1d4ed8" }} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              Creando Cuenta...
            </>
          ) : (
            "Crear Cuenta GHL"
          )}
        </button>
      </form>
    </div>
  );
}
