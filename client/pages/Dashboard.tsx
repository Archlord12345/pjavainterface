import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherDashboard from "@/components/TeacherDashboard";
import JuryDashboard from "@/components/JuryDashboard";
import AdminDashboard from "@/components/AdminDashboard";

type UserRole = "enseignant" | "jury" | "admin";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole") as UserRole | null;
    const user = localStorage.getItem("username") || "";

    if (!role) {
      navigate("/");
      return;
    }

    setUserRole(role);
    setUsername(user);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    navigate("/");
  };

  if (!userRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="font-bold text-lg">📚 GESTION DES NOTES</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{username}</p>
              <p className="text-primary-foreground/80 text-xs capitalize">
                {userRole === "enseignant" ? "Enseignant" : userRole === "jury" ? "Jury" : "Administrateur"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {userRole === "enseignant" && <TeacherDashboard />}
        {userRole === "jury" && <JuryDashboard />}
        {userRole === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}
