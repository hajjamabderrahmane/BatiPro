import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const utilisateur = await login(email, motDePasse);

      if (utilisateur.role === "admin" || utilisateur.role === "chef_chantier") {
        navigate("/dashboard");
      } else {
        setError("Ce compte n'a pas accès à l'application web.");
      }
    } catch (err) {
      setError("Identifiants incorrects. Vérifiez votre email et votre mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="BatiPro" className="w-12 h-12 rounded-xl object-contain mb-4" />
          <h1 className="text-2xl font-bold text-[#0F172A]">BatiPro</h1>
          <p className="text-sm text-[#64748B] mt-1">Gestion du pointage sur chantiers</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-8">
          <h2 className="text-lg font-semibold text-[#0F172A] mb-6">Connexion</h2>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-[8px] bg-red-50 border border-red-200 text-sm text-[#DC2626]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@batitrack.fr"
                required
                className="
                  w-full px-3 py-2 rounded-[8px] border border-[#E2E8F0] text-sm
                  bg-white text-[#0F172A] placeholder-[#94a3b8]
                  focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10
                  transition-colors
                "
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="
                    w-full px-3 py-2 pr-10 rounded-[8px] border border-[#E2E8F0] text-sm
                    bg-white text-[#0F172A] placeholder-[#94a3b8]
                    focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10
                    transition-colors
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-2.5 px-4 rounded-[8px] bg-[#1E3A5F] hover:bg-[#16304D]
                text-white text-sm font-medium transition-colors
                disabled:opacity-60 disabled:cursor-not-allowed
                mt-2
              "
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}