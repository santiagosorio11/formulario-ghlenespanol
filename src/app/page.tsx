import { DIRECT_FORM_CONFIGS } from "@/app/api/create-account/directForms";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: "3rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <header style={{ textAlign: "center", marginBottom: "3rem", maxWidth: "680px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#1d4ed8", marginBottom: "1rem" }}>
          Formularios GHL en Espanol
        </h1>
        <p style={{ color: "#475569", fontSize: "1.1rem" }}>
          Selecciona el formulario directo para crear una subcuenta con la configuracion correspondiente.
        </p>
      </header>

      <section style={{ width: "100%", maxWidth: "760px", display: "grid", gap: "1rem" }}>
        {DIRECT_FORM_CONFIGS.map((config) => (
          <Link
            key={config.slug}
            href={`/${config.slug}`}
            className="glass-panel"
            style={{
              display: "block",
              padding: "1.25rem",
              backgroundColor: "#fff",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", color: "#1d4ed8", marginBottom: "0.5rem" }}>{config.title}</h2>
            <p style={{ color: "#64748b", marginBottom: 0 }}>{config.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
