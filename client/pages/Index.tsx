import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      let role: string | null = null;

      if (username === "prof1") role = "enseignant";
      else if (username === "jury1") role = "jury";
      else if (username === "admin") role = "admin";

      if (role && password === "1234") {
        localStorage.setItem("userRole", role);
        localStorage.setItem("username", username);
        navigate("/dashboard");
      } else {
        alert("Identifiants invalides");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", background: "linear-gradient(to bottom right, rgb(219, 234, 254), rgb(164, 243, 250))" }}>
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <div style={{ background: "rgb(51, 102, 204)", padding: "0.75rem", borderRadius: "0.5rem" }}>
            <span style={{ fontSize: "2rem", color: "white" }}>📚</span>
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "rgb(30, 41, 59)" }}>GESTION DES NOTES</h1>
            <p style={{ fontSize: "0.875rem", color: "rgb(100, 116, 139)" }}>Université de Yaoundé I</p>
          </div>
        </div>
        <p style={{ color: "rgb(100, 116, 139)", marginTop: "0.5rem" }}>Système de saisie et validation des notes académiques</p>
      </div>

      <div style={{ width: "100%", maxWidth: "28rem", background: "white", borderRadius: "0.5rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "1.5rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "rgb(15, 23, 42)" }}>Connexion</h2>
          <p style={{ fontSize: "0.875rem", color: "rgb(100, 116, 139)", marginTop: "0.5rem" }}>Entrez vos identifiants pour accéder au système</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "500", display: "block", marginBottom: "0.5rem", color: "rgb(15, 23, 42)" }}>
              Nom d'utilisateur
            </label>
            <input
              type="text"
              placeholder="Entrez votre identifiant"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid rgb(226, 232, 240)", borderRadius: "0.375rem", fontSize: "1rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: "500", display: "block", marginBottom: "0.5rem", color: "rgb(15, 23, 42)" }}>
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{ width: "100%", padding: "0.5rem 0.75rem", border: "1px solid rgb(226, 232, 240)", borderRadius: "0.375rem", fontSize: "1rem" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "0.75rem 1rem", background: "rgb(51, 102, 204)", color: "white", fontWeight: "600", borderRadius: "0.375rem", border: "none", cursor: "pointer", fontSize: "1rem" }}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgb(239, 246, 255)", borderRadius: "0.5rem", border: "1px solid rgb(191, 219, 254)" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "rgb(30, 58, 138)", marginBottom: "0.5rem" }}>Identifiants de test:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <p style={{ fontSize: "0.75rem", color: "rgb(37, 99, 235)" }}><span style={{ fontWeight: "500" }}>Enseignant:</span> prof1 / 1234</p>
            <p style={{ fontSize: "0.75rem", color: "rgb(37, 99, 235)" }}><span style={{ fontWeight: "500" }}>Jury:</span> jury1 / 1234</p>
            <p style={{ fontSize: "0.75rem", color: "rgb(37, 99, 235)" }}><span style={{ fontWeight: "500" }}>Admin:</span> admin / 1234</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "3rem", textAlign: "center", fontSize: "0.875rem", color: "rgb(100, 116, 139)" }}>
        <p>© 2026 Université de Yaoundé I - Tous droits réservés</p>
      </div>
    </div>
  );
}
