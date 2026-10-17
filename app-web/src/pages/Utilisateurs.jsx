import { useState, useEffect } from "react";
import { Search, ChevronDown, Plus, Eye, Pencil, Trash2, ChevronUp, ChevronsUpDown, X } from "lucide-react";
import api from "../api/axios";
import { ViewButton, EditButton, DeleteButton } from "../components/ActionButtons";


const roleBadge = (role) => {
  const map = {
    admin: "text-[#1E3A5F]",

chef_chantier: "text-[#1E3A5F]",

employe: "text-[#1E3A5F]",
  };
  const labels = { admin: "Admin", chef_chantier: "Chef chantier", employe: "Employé" };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${map[role] ?? ""}`}>{labels[role] ?? role}</span>;
};

const emptyForm = { nom: "", prenom: "", email: "", mot_de_passe: "", role: "employe" };

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortKey, setSortKey] = useState("nom");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const perPage = 7;

  // --- Modale ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = création, sinon id à éditer
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchUtilisateurs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/utilisateurs");
      setUtilisateurs(res.data.utilisateurs);
    } catch (err) {
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/utilisateurs/${id}`);
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = utilisateurs
    .filter(
      (u) =>
        (`${u.nom} ${u.prenom}`.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())) &&
        (!roleFilter || u.role === roleFilter)
    )
    .sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ k }) => {
  if (sortKey !== k) return <ChevronsUpDown size={13} className="text-white/50" />;
  return sortDir === "asc" ? (
    <ChevronUp size={13} className="text-[#F5A623]" />
  ) : (
    <ChevronDown size={13} className="text-[#F5A623]" />
  );
};

  // --- Ouverture de la modale ---
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingId(u.id);
    setForm({ nom: u.nom, prenom: u.prenom, email: u.email, mot_de_passe: "", role: u.role });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setFormErrors({});
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    try {
      if (editingId) {
        // Édition : ne pas envoyer mot_de_passe vide
        const { mot_de_passe, ...rest } = form;
        const payload = mot_de_passe ? form : rest;
        const res = await api.put(`/utilisateurs/${editingId}`, payload);
        setUtilisateurs((prev) =>
          prev.map((u) => (u.id === editingId ? res.data.utilisateur : u))
        );
      } else {
        const res = await api.post("/utilisateurs", form);
        setUtilisateurs((prev) => [...prev, res.data.utilisateur]);
      }
      closeModal();
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors ?? {});
      } else {
        alert("Erreur lors de l'enregistrement.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#E5EEF2]">
      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-5">
        <div>
          <p className="text-xs text-[#64748B] mb-1">Accueil / Utilisateurs</p>
          <h1 className="text-[22px] font-bold text-[#0F172A]">Utilisateurs</h1>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher un utilisateur..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-[#F6F8FA] focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#475569] focus:outline-none focus:border-[#1E3A5F] cursor-pointer"
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="chef_chantier">Chef chantier</option>
            <option value="employe">Employé</option>
          </select>

          <button
            onClick={openCreateModal}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 bg-[#F5A623] hover:bg-[#D98B00] text-[#16304D] text-sm font-medium rounded-[8px] transition-colors flex-shrink-0"
          >
            <Plus size={14} />
            Ajouter un utilisateur
          </button>
        </div>

        {(roleFilter || search) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#64748B]">Filtres actifs :</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569]">
                "{search}"
                <button onClick={() => setSearch("")} className="hover:text-[#DC2626] ml-0.5">×</button>
              </span>
            )}
            {roleFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569]">
                Rôle: {roleFilter}
                <button onClick={() => setRoleFilter("")} className="hover:text-[#DC2626] ml-0.5">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
              }}
              className="text-xs text-[#DC2626] hover:underline"
            >
              Effacer tout
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="bg-[#16304D]">
                  {["nom", "email", "role", "created_at"].map((k) => {
                    const labels = { nom: "Nom", email: "Email", role: "Rôle", created_at: "Créé le" };
                    return (
                      <th
                        key={k}
                        onClick={() => toggleSort(k)}
                        className="text-left text-xs font-medium text-white px-5 py-3 cursor-pointer select-none hover:text-[#F5A623]"
                      >
                        <span className="inline-flex items-center gap-1">
                          {labels[k]}
                          <SortIcon k={k} />
                        </span>
                      </th>
                    );
                  })}
<th className="pl-3 pr-5 py-3 text-right text-xs font-medium text-white border-l-2 border-white/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#64748B]">
                      Chargement...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#DC2626]">
                      {error}
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-[#64748B]">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  paged.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F6F8FA] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#1E3A5F]">
                              {u.prenom?.[0]}
                              {u.nom?.[0]}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-[#0F172A]">
                            {u.prenom} {u.nom}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#475569]">{u.email}</td>
                      <td className="px-5 py-3">{roleBadge(u.role)}</td>
                      <td className="px-5 py-3 text-sm text-[#475569]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="pl-3 pr-5 py-3 border-l-2 border-[#CBD5E1]">
    <div className="flex items-center justify-end gap-1">
        <ViewButton onClick={() => openEditModal(u)} />
        <EditButton onClick={() => openEditModal(u)} />
        <DeleteButton onClick={() => handleDelete(u.id)} />
    </div>
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs text-[#64748B]">
              Affichage {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–
              {Math.min(page * perPage, filtered.length)} sur {filtered.length} utilisateurs
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#475569] hover:bg-[#F6F8FA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹ Préc.
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-[6px] border transition-colors ${
                    p === page
                      ? "bg-[#1E3A5F] text-white border-[#1E3A5F]"
                      : "border-[#E2E8F0] text-[#475569] hover:bg-[#F6F8FA]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#475569] hover:bg-[#F6F8FA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suiv. ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modale Créer / Éditer --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* Panneau */}
          <div className="relative bg-white rounded-[12px] border border-[#E2E8F0] w-full max-w-[420px] shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                {editingId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </h2>
              <button onClick={closeModal} className="text-[#94a3b8] hover:text-[#0F172A] transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Nom</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => handleChange("nom", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                  required
                />
                {formErrors.nom && <p className="text-xs text-[#DC2626] mt-1">{formErrors.nom[0]}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Prénom</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => handleChange("prenom", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                  required
                />
                {formErrors.prenom && <p className="text-xs text-[#DC2626] mt-1">{formErrors.prenom[0]}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                  required
                />
                {formErrors.email && <p className="text-xs text-[#DC2626] mt-1">{formErrors.email[0]}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                  Mot de passe {editingId && <span className="text-[#94a3b8] font-normal">(laisser vide pour ne pas changer)</span>}
                </label>
                <input
                  type="password"
                  value={form.mot_de_passe}
                  onChange={(e) => handleChange("mot_de_passe", e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
                  required={!editingId}
                  minLength={8}
                />
                {formErrors.mot_de_passe && (
                  <p className="text-xs text-[#DC2626] mt-1">{formErrors.mot_de_passe[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#475569] focus:outline-none focus:border-[#1E3A5F] cursor-pointer"
                >
                  <option value="employe">Employé</option>
                  <option value="chef_chantier">Chef chantier</option>
                  <option value="admin">Admin</option>
                </select>
                {formErrors.role && <p className="text-xs text-[#DC2626] mt-1">{formErrors.role[0]}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-[#475569] border border-[#E2E8F0] rounded-[8px] hover:bg-[#F6F8FA] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#16304D] rounded-[8px] transition-colors disabled:opacity-60"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}