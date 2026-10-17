import { useState, useEffect } from "react";
import { Search, Plus, X, ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle } from "lucide-react";
import { ViewButton, DeleteButton } from "../components/ActionButtons";
import api from "../api/axios";

function ModalConfirmDelete({ label, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] w-full max-w-sm p-6 shadow-lg">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={16} className="text-[#DC2626]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#0F172A]">Retirer l'affectation</h3>
            <p className="text-sm text-[#475569] mt-1">
              Retirer <span className="font-medium text-[#0F172A]">{label}</span> de ce chantier ?
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-[#475569] border border-[#E2E8F0] rounded-[8px] hover:bg-[#F6F8FA] transition-colors">
            Annuler
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-[#DC2626] hover:bg-red-700 rounded-[8px] transition-colors">
            Retirer
          </button>
        </div>
      </div>
    </div>
  );
}

// function ModalAffectation({ utilisateurs, chantiers, onSave, onClose }) {
//   const [form, setForm] = useState({
//     user_id: "",
//     chantier_id: "",
//     date_affectation: new Date().toISOString().split("T")[0],
//   });
function ModalAffectation({
  utilisateurs,
  chantiers,
  affectations,
  onSave,
  onClose,
}) {
  const [form, setForm] = useState({
    user_id: "",
    chantier_id: "",
    date_affectation: new Date().toISOString().split("T")[0],
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#0F172A] focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition-colors";
  const labelCls = "block text-[13px] font-medium text-[#475569] mb-1.5";

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/affectations", form);
      onSave(res.data.affectation);
      onClose();
    } catch (err) {
  if (err.response?.data?.message) {
    setError(err.response.data.message);
  } else {
    setError("Erreur lors de l'enregistrement.");
  }
} finally {
  setSaving(false);
}
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] w-full max-w-md shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-base font-semibold text-[#0F172A]">Nouvelle affectation</h3>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#475569] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-3 py-2.5 rounded-[8px] bg-red-50 border border-red-200 text-sm text-[#DC2626]">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Utilisateur *</label>
            <select value={form.user_id} onChange={(e) => set("user_id", e.target.value)} className={inputCls}>
              <option value="">Sélectionner un utilisateur</option>
              {/* {utilisateurs.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.prenom} {u.nom} ({u.role === "chef_chantier" ? "Chef chantier" : "Employé"})
                </option>
              ))} */}
              {utilisateurs.filter(
    (u) => !affectations.some((a) => String(a.user_id) === String(u.id))
  )
  .map((u) => (
    <option key={u.id} value={u.id}>
      {u.prenom} {u.nom} (
      {u.role === "chef_chantier" ? "Chef chantier" : "Employé"})
    </option>
  ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Chantier *</label>
            <select value={form.chantier_id} onChange={(e) => set("chantier_id", e.target.value)} className={inputCls}>
              <option value="">Sélectionner un chantier</option>
              {chantiers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Date d'affectation *</label>
            <input
              type="date"
              value={form.date_affectation}
              onChange={(e) => set("date_affectation", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E2E8F0]">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#475569] border border-[#E2E8F0] rounded-[8px] hover:bg-[#F6F8FA] transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.user_id || !form.chantier_id || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#16304D] rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Enregistrement..." : "Affecter"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Affectations() {
  const [rows, setRows] = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [chantierFilter, setChantierFilter] = useState("");
  const [sortKey, setSortKey] = useState("date_affectation");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [resAffectations, resUtilisateurs, resChantiers] = await Promise.all([
        api.get("/affectations"),
        api.get("/utilisateurs"),
        api.get("/chantiers"),
      ]);
      setRows(resAffectations.data.affectations);
      setUtilisateurs(resUtilisateurs.data.utilisateurs.filter((u) => u.role !== "admin"));
      setChantiers(resChantiers.data.chantiers);
    } catch (err) {
      setError("Impossible de charger les affectations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = rows
    .filter((a) => {
      const nomComplet = `${a.utilisateur?.prenom} ${a.utilisateur?.nom}`.toLowerCase();
      const matchSearch = nomComplet.includes(search.toLowerCase()) || a.chantier?.nom.toLowerCase().includes(search.toLowerCase());
      const matchChantier = !chantierFilter || String(a.chantier_id) === chantierFilter;
      return matchSearch && matchChantier;
    })
    .sort((a, b) => {
      let av, bv;
      if (sortKey === "utilisateur") {
        av = `${a.utilisateur?.prenom} ${a.utilisateur?.nom}`;
        bv = `${b.utilisateur?.prenom} ${b.utilisateur?.nom}`;
      } else if (sortKey === "chantier") {
        av = a.chantier?.nom ?? "";
        bv = b.chantier?.nom ?? "";
      } else {
        av = a[sortKey] ?? "";
        bv = b[sortKey] ?? "";
      }
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <ChevronsUpDown size={13} className="text-[#94a3b8]" />;
    return sortDir === "asc" ? (
      <ChevronUp size={13} className="text-[#1E3A5F]" />
    ) : (
      <ChevronDown size={13} className="text-[#1E3A5F]" />
    );
  };

  const hasFilters = !!(search || chantierFilter);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/affectations/${id}`);
      setRows((r) => r.filter((a) => a.id !== id));
    } catch (err) {
      alert("Erreur lors de la suppression.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSaved = (saved) => {
    setRows((r) => [...r, saved]);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#E5EEF2]">
      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-5">
        <div>
          <p className="text-xs text-[#64748B] mb-1">Accueil / Affectations</p>
          <h1 className="text-[22px] font-bold text-[#0F172A]">Affectations</h1>
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
              placeholder="Utilisateur, chantier..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-[#F6F8FA] focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
            />
          </div>

          <select
            value={chantierFilter}
            onChange={(e) => {
              setChantierFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#475569] focus:outline-none focus:border-[#1E3A5F] cursor-pointer"
          >
            <option value="">Tous les chantiers</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 bg-[#F5A623] hover:bg-[#D98B00] text-[#16304D] text-sm font-medium rounded-[8px] transition-colors flex-shrink-0"
          >
            <Plus size={14} />
            Nouvelle affectation
          </button>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#64748B]">Filtres actifs :</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569]">
                "{search}"
                <button onClick={() => setSearch("")} className="hover:text-[#DC2626] ml-0.5">×</button>
              </span>
            )}
            {chantierFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569]">
                {chantiers.find((c) => String(c.id) === chantierFilter)?.nom}
                <button onClick={() => setChantierFilter("")} className="hover:text-[#DC2626] ml-0.5">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setChantierFilter("");
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
            <table className="w-full min-w-[600px]">
              <thead>
  <tr className="bg-[#16304D]">
    {[
      { key: "utilisateur", label: "Utilisateur" },
      { key: "chantier", label: "Chantier" },
      { key: "date_affectation", label: "Date d'affectation" },
    ].map(({ key, label }) => (
      <th
        key={key}
        onClick={() => toggleSort(key)}
        className="text-left text-xs font-medium text-white px-5 py-3 cursor-pointer select-none hover:text-[#F5A623]"
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <SortIcon k={key} />
        </span>
      </th>
    ))}
    <th className="pl-3 pr-5 py-3 text-right text-xs font-medium text-white border-l-2 border-white/40">
      Actions
    </th>
  </tr>
</thead>
              <tbody className="divide-y divide-[#E2E8F0]">
  {loading ? (
    <tr>
      <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#64748B]">Chargement...</td>
    </tr>
  ) : error ? (
    <tr>
      <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#DC2626]">{error}</td>
    </tr>
  ) : paged.length === 0 ? (
    <tr>
      <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#64748B]">Aucune affectation trouvée.</td>
    </tr>
  ) : (
    paged.map((a) => (
      <tr key={a.id} className="hover:bg-[#F6F8FA] transition-colors">
        <td className="px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-[#1E3A5F]">
                {a.utilisateur?.prenom?.[0]}
                {a.utilisateur?.nom?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[#0F172A]">
                {a.utilisateur?.prenom} {a.utilisateur?.nom}
              </p>
              <p className="text-xs text-[#64748B]">
                {a.utilisateur?.role === "chef_chantier" ? "Chef chantier" : "Employé"}
              </p>
            </div>
          </div>
        </td>
        <td className="px-5 py-3 text-sm text-[#475569]">{a.chantier?.nom}</td>
        <td className="px-5 py-3 text-sm text-[#475569] font-mono">
          {new Date(a.date_affectation).toLocaleDateString("fr-FR")}
        </td>
        <td className="pl-3 pr-5 py-3 border-l-2 border-[#CBD5E1]">
          <div className="flex items-center justify-end gap-1">
            <DeleteButton onClick={() => setDeleteTarget(a)} />
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
              {Math.min(page * perPage, filtered.length)} sur {filtered.length} affectations
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
                    p === page ? "bg-[#1E3A5F] text-white border-[#1E3A5F]" : "border-[#E2E8F0] text-[#475569] hover:bg-[#F6F8FA]"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#475569] hover:bg-[#F6F8FA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suiv. ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <ModalConfirmDelete
          label={`${deleteTarget.utilisateur?.prenom} ${deleteTarget.utilisateur?.nom} — ${deleteTarget.chantier?.nom}`}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {modalOpen && (
        // <ModalAffectation
        //   utilisateurs={utilisateurs}
        //   chantiers={chantiers}
        //   onSave={handleSaved}
        //   onClose={() => setModalOpen(false)}
        // />
        <ModalAffectation 
  utilisateurs={utilisateurs} 
  chantiers={chantiers} 
  affectations={rows}
  onSave={handleSaved} 
  onClose={() => setModalOpen(false)} 
/>
      )}
    </div>
  );
}