import { useState, useEffect } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
} from "../components/ActionButtons";

import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MapPin,
  X,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import ModalChantier from "../components/ModalChantier";

const statutConfig = {
  "en-cours": {
    label: "En cours",
    cls: "text-amber-700",
  },
  planifie: {
    label: "Planifié",
    cls: "text-blue-700",
  },
  termine: {
    label: "Terminé",
    cls: "text-green-700",
  },
};

function getStatut(dateDebut, dateFin) {
  const now = new Date();
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  if (now < debut) return "planifie";
  if (now > fin) return "termine";

  return "en-cours";
}

function StatutBadge({ statut }) {
  const { label, cls } = statutConfig[statut];

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

export default function Chantiers() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();

  const role = utilisateur?.role;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [sortKey, setSortKey] = useState("nom");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(false);

  const perPage = 6;

  useEffect(() => {
    if (!utilisateur) return;

    fetchChantiers();
  }, [utilisateur]);

  const fetchChantiers = async () => {
    setLoading(true);
    setError("");

    try {
      if (role === "admin") {
        const res = await api.get("/chantiers");

        setRows(res.data.chantiers ?? []);
      } else if (role === "chef_chantier") {
        const res = await api.get("/mon-affectation");

        setRows(res.data.chantier ? [res.data.chantier] : []);
      } else {
        setRows([]);
        setError("Vous n'avez pas accès aux chantiers.");
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les chantiers.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }

    setPage(1);
  };

  const withStatut = rows.map(c => ({
    ...c,
    statut: getStatut(c.date_debut, c.date_fin),
  }));

  const filtered = withStatut
    .filter(c => {
      const searchValue = search.toLowerCase();

      const matchSearch =
        (c.nom ?? "").toLowerCase().includes(searchValue) ||
        (c.adresse ?? "").toLowerCase().includes(searchValue);

      const matchStatut =
        !statutFilter || c.statut === statutFilter;

      return matchSearch && matchStatut;
    })
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      return sortDir === "asc"
        ? String(av ?? "").localeCompare(String(bv ?? ""))
        : String(bv ?? "").localeCompare(String(av ?? ""));
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / perPage)
  );

  const currentPage = Math.min(page, totalPages);

  const paged = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const SortIcon = ({ k }) => {
    if (sortKey !== k) {
      return (
        <ChevronsUpDown
          size={12}
          className="text-[#94a3b8]"
        />
      );
    }

    return sortDir === "asc" ? (
      <ChevronUp
        size={12}
        className="text-[#1E3A5F]"
      />
    ) : (
      <ChevronDown
        size={12}
        className="text-[#1E3A5F]"
      />
    );
  };

  const hasFilters = !!(search || statutFilter);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/chantiers/${id}`);

      setRows(r =>
        r.filter(c => c.id !== id)
      );
    } 
    // catch (err) {
    //   console.error(err);
    //   alert("Erreur lors de la suppression.");
    catch (err) {
  console.error(err);

  alert(
    err.response?.data?.message ||
    "Erreur lors de la suppression."
  );
    
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSaved = (saved) => {
    setRows(r => {
      const exists = r.some(
        c => c.id === saved.id
      );

      return exists
        ? r.map(c =>
            c.id === saved.id ? saved : c
          )
        : [...r, saved];
    });

    setEditTarget(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#E5EEF2]">
      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-5">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#64748B] mb-1">
              Accueil / Chantiers
            </p>

            <h1 className="text-[22px] font-bold text-[#0F172A]">
              Chantiers
            </h1>
          </div>
        </div>

        {/* SEARCH + FILTER + NOUVEAU CHANTIER */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">

            {/* RECHERCHE */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />

              <input
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Nom, adresse..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-[#F6F8FA] focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
              />
            </div>

            {/* FILTRE STATUT */}
            <select
              value={statutFilter}
              onChange={e => {
                setStatutFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#475569] focus:outline-none focus:border-[#1E3A5F] cursor-pointer"
            >
              <option value="">
                Tous les statuts
              </option>

              <option value="en-cours">
                En cours
              </option>

              <option value="planifie">
                Planifié
              </option>

              <option value="termine">
                Terminé
              </option>
            </select>

            {/* NOUVEAU CHANTIER */}
            {role === "admin" && (
              <button
                onClick={() => setEditTarget({})}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F5A623] hover:bg-[#D98B00] text-[#16304D] text-sm font-medium rounded-[8px] transition-colors"
              >
                <Plus size={14} />
                Nouveau chantier
              </button>
            )}

          </div>
        </div>

        {/* ACTIVE FILTERS */}
        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#64748B]">
              Filtres actifs :
            </span>

            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569]">
                "{search}"

                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="hover:text-[#DC2626] ml-0.5"
                >
                  ×
                </button>
              </span>
            )}

            {statutFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569]">
                {statutConfig[statutFilter].label}

                <button
                  onClick={() => {
                    setStatutFilter("");
                    setPage(1);
                  }}
                  className="hover:text-[#DC2626] ml-0.5"
                >
                  ×
                </button>
              </span>
            )}

            <button
              onClick={() => {
                setSearch("");
                setStatutFilter("");
                setPage(1);
              }}
              className="text-xs text-[#DC2626] hover:underline"
            >
              Effacer tout
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-[12px] border border-[#E2E8F0]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">

              <thead>
                <tr className="bg-[#16304D]">

                  {[
                    {
                      key: "nom",
                      label: "Chantier",
                    },
                    {
                      key: "statut",
                      label: "Statut",
                    },
                    {
                      key: "date_debut",
                      label: "Début",
                    },
                    {
                      key: "date_fin",
                      label: "Fin prévue",
                    },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() =>
                        toggleSort(key)
                      }
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
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-[#64748B]"
                    >
                      Chargement des chantiers...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle
                          size={24}
                          className="text-[#DC2626]"
                        />

                        <p className="text-sm text-[#DC2626]">
                          {error}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center"
                    >
                      <p className="text-sm text-[#64748B]">
                        Aucun chantier trouvé.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paged.map(c => (
                    <tr
                      key={c.id}
                      className="hover:bg-[#F6F8FA] transition-colors group"
                    >

                      {/* CHANTIER */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-[#0F172A] group-hover:text-[#1E3A5F] transition-colors">
                          {c.nom}
                        </p>

                        {c.adresse && (
                          <span className="inline-flex items-center gap-1 text-xs text-[#64748B] mt-0.5">
                            <MapPin size={11} />

                            {c.adresse}
                          </span>
                        )}
                      </td>

                      {/* STATUT */}
                      <td className="px-5 py-3.5">
                        <StatutBadge
                          statut={c.statut}
                        />
                      </td>

                      {/* DATE DEBUT */}
                      <td className="px-5 py-3.5 text-sm text-[#475569] font-mono">
                        {new Date(
                          c.date_debut
                        ).toLocaleDateString("fr-FR")}
                      </td>

                      {/* DATE FIN */}
                      <td className="px-5 py-3.5 text-sm text-[#475569] font-mono">
                        {new Date(
                          c.date_fin
                        ).toLocaleDateString("fr-FR")}
                      </td>

                      {/* ACTIONS */}
                      <td className="pl-3 pr-5 py-3.5 border-l-2 border-[#CBD5E1]">
                        <div className="flex items-center justify-end gap-1">

                          <ViewButton
                            onClick={() =>
                              navigate(
                                `/chantiers/${c.id}`
                              )
                            }
                          />

                          {role === "admin" && (
                            <>
                              <EditButton
                                onClick={() =>
                                  setEditTarget(c)
                                }
                              />

                              <DeleteButton
                                onClick={() =>
                                  setDeleteTarget(c)
                                }
                              />
                            </>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-5 py-3 border-t border-[#E2E8F0] flex items-center justify-between gap-3 flex-wrap">

            <span className="text-xs text-[#64748B]">
              Affichage{" "}
              {filtered.length === 0
                ? 0
                : (currentPage - 1) *
                    perPage +
                  1}
              –
              {Math.min(
                currentPage * perPage,
                filtered.length
              )}{" "}
              sur {filtered.length} chantiers
            </span>

            <div className="flex items-center gap-1">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setPage(p =>
                    Math.max(1, p - 1)
                  )
                }
                className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#475569] hover:bg-[#F6F8FA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Précédent
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-xs rounded-[6px] ${
                    currentPage === p
                      ? "bg-[#16304D] text-white"
                      : "border border-[#E2E8F0] text-[#475569] hover:bg-[#F6F8FA]"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setPage(p =>
                    Math.min(
                      totalPages,
                      p + 1
                    )
                  )
                }
                className="px-3 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#475569] hover:bg-[#F6F8FA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHANTIER */}
      {editTarget !== false && (
        <ModalChantier
          chantier={editTarget}
          onClose={() =>
            setEditTarget(false)
          }
          onSaved={handleSaved}
        />
      )}

      {/* CONFIRMATION SUPPRESSION */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="bg-white rounded-[12px] shadow-xl w-full max-w-md p-6">

            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle
                  size={20}
                  className="text-[#DC2626]"
                />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">
                  Supprimer le chantier ?
                </h2>

                <p className="text-sm text-[#64748B] mt-1">
                  Voulez-vous vraiment supprimer{" "}
                  <span className="font-medium text-[#0F172A]">
                    {deleteTarget.nom}
                  </span>{" "}
                  ?
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="px-4 py-2 text-sm border border-[#E2E8F0] rounded-[8px] text-[#475569] hover:bg-[#F6F8FA]"
              >
                Annuler
              </button>

              <button
                onClick={() =>
                  handleDelete(
                    deleteTarget.id
                  )
                }
                className="px-4 py-2 text-sm bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-[8px]"
              >
                Supprimer
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}