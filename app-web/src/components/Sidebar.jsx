import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  HardHat,
  Link2,
  Clock3,
  FileBarChart2,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

const navItemsAdmin = [
  { path: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { path: "/utilisateurs", label: "Utilisateurs", icon: Users },
  { path: "/chantiers", label: "Chantiers", icon: HardHat },
  { path: "/affectations", label: "Affectations", icon: Link2 },
  { path: "/rapports", label: "Rapports", icon: FileBarChart2 },
  { path: "/pointages", label: "Pointages", icon: Clock3 },

];

const navItemsChef = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/pointages", label: "Pointages", icon: Clock3 },
    {

    path: "/mon-chantier",
    label: "Mon chantier",
    icon: HardHat,
  },
  { path: "/rapports", label: "Rapports", icon: FileBarChart2 },
  

];

export default function Sidebar({ isOpen, onClose }) {
  const { utilisateur, logout } = useAuth();
  const navigate = useNavigate();

  const role = utilisateur?.role;
  const userName = `${utilisateur?.prenom ?? ""} ${utilisateur?.nom ?? ""}`.trim();

  const navItems = role === "admin" ? navItemsAdmin : navItemsChef;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-30 flex flex-col
          bg-[#16304D]
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:flex
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="BatiPro" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
            <span className="text-white font-bold text-lg tracking-tight">BatiPro</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150 text-left
                ${isActive
                  ? "bg-[#F5A623]/20 text-[#F5A623]"
                  : "text-slate-300 hover:bg-white/8 hover:text-white"
                }
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F5A623]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#F5A623] text-xs font-bold">
                {userName.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userName}</p>
              <p className="text-slate-400 text-xs truncate">
                {role === "admin" ? "Administrateur" : "Chef de chantier"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}