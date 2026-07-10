"use client";

import type { DirectFormConfig } from "@/app/api/create-account/directForms";
import { Eye, EyeOff, Info, Loader2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";

interface AccountFormStepProps {
  formConfig: DirectFormConfig;
  onSuccess: () => void;
}

const labelStyle = {
  display: "block",
  fontSize: "0.875rem",
  marginBottom: "0.25rem",
  color: "#333",
  fontWeight: 500,
};

export default function AccountFormStep({ formConfig, onSuccess }: AccountFormStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | undefined>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordScore = getPasswordScore(password);
  const passwordStrength = getPasswordStrength(passwordScore, password.length > 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setErrorMsg("El logo excede el limite de 2.5 MB.");
      setLogoPreview(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setErrorMsg("");
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const formData = new FormData(e.currentTarget);

      if (phone) {
        formData.set("telefono", phone);
      }

      const res = await fetch("/api/create-account", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(`El servidor devolvio una respuesta no valida (${res.status}). Revisa la terminal de Next.js para ver el error real.`);
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrio un error al procesar la solicitud.");
      }

      onSuccess();
    } catch (err: unknown) {
      console.error("Form error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Error de red.");
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
        <input type="hidden" name="form_slug" value={formConfig.slug} />

        <div>
          <label style={labelStyle}>{formConfig.accountLabel} *</label>
          <input type="text" name="nombre_cuenta" required className="glass-input" placeholder="Ej. Mi Agencia" />
        </div>

        <div>
          <label style={labelStyle}>Nombre *</label>
          <input type="text" name="nombre" required className="glass-input" placeholder="Nombre del propietario" />
        </div>

        <div>
          <label style={labelStyle}>Apellidos *</label>
          <input type="text" name="apellidos" required className="glass-input" placeholder="Apellidos del propietario" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Email del usuario principal *</label>
            <input type="email" name="email" required className="glass-input" placeholder="cliente@email.com" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.25rem" }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Contraseña de acceso *</label>
              <span
                title="Mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
                aria-label="Requisitos de contraseña"
                style={{ color: "#64748b", display: "inline-flex", cursor: "help" }}
              >
                <Info size={15} />
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="glass-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={10}
                title="Mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                style={{
                  position: "absolute",
                  right: "0.625rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: "#475569",
                  display: "inline-flex",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div aria-live="polite" style={{ marginTop: "0.5rem" }}>
              <div style={{ height: "0.375rem", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                <div
                  style={{
                    width: passwordStrength.width,
                    height: "100%",
                    background: passwordStrength.color,
                    borderRadius: "999px",
                    transition: "width 0.2s ease, background 0.2s ease",
                  }}
                />
              </div>
              <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: passwordStrength.color, fontWeight: 500 }}>
                {passwordStrength.label}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Telefono que reciba SMS *</label>
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
          <input type="hidden" name="telefono" value={phone || ""} />
        </div>

        <div>
          <label style={labelStyle}>Pais *</label>
          <select name="pais" required className="glass-input" style={{ appearance: "auto" }} defaultValue="">
            <option value="" disabled>Selecciona el pais</option>
            <option value="US">Estados Unidos</option>
            <option value="ES">Espana</option>
            <option value="MX">Mexico</option>
            <option value="CO">Colombia</option>
            <option value="AR">Argentina</option>
            <option value="PE">Peru</option>
            <option value="CL">Chile</option>
          </select>
        </div>

        {formConfig.requiresBillingInterval && (
          <div>
            <label style={{ ...labelStyle, marginBottom: "0.5rem" }}>Tipo de cobro *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", padding: "0.875rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem" }}>
                <input type="radio" name="billing_interval" value="month" required style={{ width: "1rem", height: "1rem" }} />
                Mensual
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", padding: "0.875rem", border: "1px solid #cbd5e1", borderRadius: "0.375rem" }}>
                <input type="radio" name="billing_interval" value="year" required style={{ width: "1rem", height: "1rem" }} />
                Anual
              </label>
            </div>
          </div>
        )}

        {formConfig.requiresPartnerEmail && (
          <div>
            <label style={labelStyle}>Email del partner *</label>
            <input type="email" name="partner_email" required className="glass-input" placeholder="partner@email.com" />
          </div>
        )}

        <div>
          <label style={labelStyle}>Dominio</label>
          <input type="url" name="dominio" className="glass-input" placeholder="https://app.tudominio.com" />
        </div>

        <div>
          <label style={labelStyle}>Logo</label>
          <div
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "0.375rem",
              padding: "2rem",
              textAlign: "center",
              cursor: logoPreview ? "default" : "pointer",
              transition: "border 0.2s",
            }}
            onClick={() => {
              if (!logoPreview) fileInputRef.current?.click();
            }}
            onMouseOver={(event) => {
              if (!logoPreview) event.currentTarget.style.borderColor = "var(--primary)";
            }}
            onMouseOut={(event) => {
              if (!logoPreview) event.currentTarget.style.borderColor = "#cbd5e1";
            }}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.875rem", cursor: "pointer", fontWeight: 500 }}
                  >
                    Cambiar imagen
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setLogoPreview(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
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
                <p style={{ fontWeight: 500, marginBottom: "0.25rem", color: "#333" }}>Haz clic para subir</p>
                <p style={{ fontSize: "0.75rem" }}>Formato horizontal (350x180 px). JPG/PNG/SVG hasta 2.5MB.</p>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="glass-button" style={{ marginTop: "1rem", backgroundColor: "#1d4ed8" }} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="spin-loader" />
              Creando cuenta...
            </>
          ) : (
            formConfig.submitLabel
          )}
        </button>
      </form>
    </div>
  );
}

function getPasswordScore(password: string) {
  return [
    password.length >= 10,
    /\p{Ll}/u.test(password),
    /\p{Lu}/u.test(password),
    /\d/.test(password),
    /[^\p{L}\p{N}]/u.test(password),
  ].filter(Boolean).length;
}

function getPasswordStrength(score: number, hasPassword: boolean) {
  if (!hasPassword) {
    return { label: "Seguridad", color: "#64748b", width: "0%" };
  }

  if (score <= 2) {
    return { label: "Seguridad baja", color: "#dc2626", width: "35%" };
  }

  if (score <= 4) {
    return { label: "Seguridad media", color: "#d97706", width: "70%" };
  }

  return { label: "Seguridad alta", color: "#16a34a", width: "100%" };
}
