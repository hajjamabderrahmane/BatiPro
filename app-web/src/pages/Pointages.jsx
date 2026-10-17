import { useState, useEffect } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MapPin,
  Clock3,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const statutConfig = {
  present: {
    label: "Présent",
    cls: "text-green-600",
  },
  absent: {
    label: "Absent",
    cls: "text-red-600",
  },
};

function getStatut(p) {
  return p.heure_arrivee ? "present" : "absent";
}

function StatutBadge({ statut }) {
  const { label, cls } = statutConfig[statut];
  const Icon = statut === "present" ? CheckCircle2 : XCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${cls}`}
    >
      <Icon size={14} />
      {label}
    </span>
  );
}

export default function Pointages() {
  const { utilisateur } = useAuth();

  const isAdmin = utilisateur?.role === "admin";
  const isChef = utilisateur?.role === "chef_chantier";

  const [rows, setRows] = useState([]);
  const [chantiers, setChantiers] = useState([]);
  const [monChantier, setMonChantier] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [chantierFilter, setChantierFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [sortKey, setSortKey] = useState("date_pointage");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const perPage = 8;

  // =====================================================
  // CHARGEMENT DES DONNÉES
  // =====================================================

  const fetchData = async () => {
    setLoading(true);
    setError("");
    setPage(1);

    try {
      // =================================================
      // ADMIN
      // =================================================
      if (isAdmin) {
        const [pRes, cRes] = await Promise.all([
          api.get("/pointages"),
          api.get("/chantiers"),
        ]);

        setRows(pRes.data.pointages || []);
        setChantiers(cRes.data.chantiers || []);
        setMonChantier(null);

        return;
      }

      // =================================================
      // CHEF DE CHANTIER
      // =================================================
      if (isChef) {
        // On récupère uniquement l'affectation du chef
        const affectationRes = await api.get("/mon-affectation");

        const chantier = affectationRes.data.chantier;

        // Aucun chantier affecté
        if (!chantier) {
          setRows([]);
          setChantiers([]);
          setMonChantier(null);
          return;
        }

        // Récupération des pointages de SON chantier
        const pRes = await api.get(
          `/chantiers/${chantier.id}/pointages`
        );

        setRows(pRes.data.pointages || []);

        // On garde le chantier pour l'affichage
        setChantiers([chantier]);
        setMonChantier(chantier);

        return;
      }

      // =================================================
      // AUTRE RÔLE
      // =================================================

      setRows([]);
      setChantiers([]);
      setMonChantier(null);
      setError("Vous n'avez pas accès aux pointages.");
    } catch (err) {
      console.error("Erreur chargement pointages :", err);

      if (err.response?.status === 403) {
        setError(
          "Vous n'avez pas l'autorisation de voir ces pointages."
        );
      } else if (err.response?.status === 404) {
        setError("La ressource demandée est introuvable.");
      } else {
        setError("Impossible de charger les pointages.");
      }

      setRows([]);
      setChantiers([]);
      setMonChantier(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (utilisateur) {
      fetchData();
    }
  }, [utilisateur?.role]);

  // =====================================================
  // TRI
  // =====================================================

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((dir) =>
        dir === "asc" ? "desc" : "asc"
      );
    } else {
      setSortKey(key);
      setSortDir("asc");
    }

    setPage(1);
  };

  // =====================================================
  // STATUT
  // =====================================================

  const withStatut = rows.map((p) => ({
    ...p,
    statut: getStatut(p),
  }));

  // =====================================================
  // FILTRES + TRI
  // =====================================================

  const filtered = withStatut
    .filter((p) => {
      const nomComplet =
        `${p.utilisateur?.prenom ?? ""} ${
          p.utilisateur?.nom ?? ""
        }`.toLowerCase();

      const matchSearch = nomComplet.includes(
        search.toLowerCase()
      );

      // Le filtre chantier existe uniquement pour l'admin
      const matchChantier =
        !isAdmin ||
        !chantierFilter ||
        String(p.chantier?.id) ===
          String(chantierFilter);

      const matchDate =
        !dateFilter ||
        String(p.date_pointage).split("T")[0] ===
          dateFilter;

      return (
        matchSearch &&
        matchChantier &&
        matchDate
      );
    })
    .sort((a, b) => {
      let av;
      let bv;

      if (sortKey === "employe") {
        av = `${a.utilisateur?.prenom ?? ""} ${
          a.utilisateur?.nom ?? ""
        }`;

        bv = `${b.utilisateur?.prenom ?? ""} ${
          b.utilisateur?.nom ?? ""
        }`;
      } else if (sortKey === "chantier") {
        av = a.chantier?.nom ?? "";
        bv = b.chantier?.nom ?? "";
      } else if (sortKey === "statut") {
        av = a.statut ?? "";
        bv = b.statut ?? "";
      } else {
        av = a[sortKey] ?? "";
        bv = b[sortKey] ?? "";
      }

      if (sortKey === "date_pointage") {
        const dateA = new Date(av).getTime();
        const dateB = new Date(bv).getTime();

        return sortDir === "asc"
          ? dateA - dateB
          : dateB - dateA;
      }

      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / perPage)
  );

  const currentPage = Math.min(page, totalPages);

  const paged = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  // =====================================================
  // ICÔNE TRI
  // =====================================================

  const SortIcon = ({ k }) => {
    if (sortKey !== k) {
      return (
        <ChevronsUpDown
          size={12}
          className="text-white/50"
        />
      );
    }

    return sortDir === "asc" ? (
      <ChevronUp
        size={12}
        className="text-[#F5A623]"
      />
    ) : (
      <ChevronDown
        size={12}
        className="text-[#F5A623]"
      />
    );
  };

  // =====================================================
  // FILTRES ACTIFS
  // =====================================================

  const hasFilters = Boolean(
    search ||
      dateFilter ||
      (isAdmin && chantierFilter)
  );

  const clearFilters = () => {
    setSearch("");
    setChantierFilter("");
    setDateFilter("");
    setPage(1);
  };

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="flex-1 overflow-y-auto bg-[#E5EEF2]">
      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-5">

        {/* HEADER */}

        <div>
          <p className="text-xs text-[#64748B] mb-1">
            Accueil / Pointages
          </p>

          <h1 className="text-[22px] font-bold text-[#0F172A]">
            Pointages
          </h1>

          {isChef && monChantier && (
            <p className="text-sm text-[#64748B] mt-1">
              Chantier :{" "}
              <span className="font-medium text-[#1E3A5F]">
                {monChantier.nom}
              </span>
            </p>
          )}

          {isAdmin && (
            <p className="text-sm text-[#64748B] mt-1">
              Suivi des pointages de tous les chantiers
            </p>
          )}
        </div>

        {/* FILTRES */}

        <div className="bg-white rounded-[12px] border border-[#E2E8F0] px-4 py-3 flex flex-wrap items-center gap-3">

          {/* Recherche employé */}

          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Nom de l'employé..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-[#F6F8FA] focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10"
            />
          </div>

          {/* FILTRE CHANTIER UNIQUEMENT ADMIN */}

          {isAdmin && (
            <div className="relative">
              <MapPin
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
              />

              <select
                value={chantierFilter}
                onChange={(e) => {
                  setChantierFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-8 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#475569] focus:outline-none focus:border-[#1E3A5F] cursor-pointer appearance-none"
              >
                <option value="">
                  Tous les chantiers
                </option>

                {chantiers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
              />
            </div>
          )}

          {/* DATE */}

          <div className="relative">
            <CalendarDays
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
            />

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#475569] focus:outline-none focus:border-[#1E3A5F] cursor-pointer"
            />
          </div>
        </div>

        {/* FILTRES ACTIFS */}

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

            {isAdmin && chantierFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569]">
                {
                  chantiers.find(
                    (c) =>
                      String(c.id) ===
                      String(chantierFilter)
                  )?.nom
                }

                <button
                  onClick={() => {
                    setChantierFilter("");
                    setPage(1);
                  }}
                  className="hover:text-[#DC2626] ml-0.5"
                >
                  ×
                </button>
              </span>
            )}

            {dateFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#E2E8F0] rounded text-xs text-[#475569]">
                {new Date(
                  `${dateFilter}T00:00:00`
                ).toLocaleDateString("fr-FR")}

                <button
                  onClick={() => {
                    setDateFilter("");
                    setPage(1);
                  }}
                  className="hover:text-[#DC2626] ml-0.5"
                >
                  ×
                </button>
              </span>
            )}

            <button
              onClick={clearFilters}
              className="text-xs text-[#DC2626] hover:underline"
            >
              Effacer tout
            </button>
          </div>
        )}

        {/* TABLEAU */}

        <div className="bg-white rounded-[12px] border border-[#E2E8F0]">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead>
                <tr className="bg-[#16304D]">

                  {[
                    { key: "employe", label: "Employé" },
                    { key: "chantier", label: "Chantier" },
                    { key: "date_pointage", label: "Date" },
                    { key: "heure_arrivee", label: "Arrivée" },
                    { key: "heure_depart", label: "Départ" },
                    { key: "statut", label: "Statut" },
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

                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-[#64748B]"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-[#DC2626]"
                    >
                      {error}
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-[#64748B]"
                    >
                      Aucun pointage trouvé.
                    </td>
                  </tr>
                ) : (
                  paged.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F6F8FA] transition-colors"
                    >

                      {/* Employé */}

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">

                          <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#1E3A5F]">
                              {p.utilisateur?.prenom?.[0] || ""}
                              {p.utilisateur?.nom?.[0] || ""}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-[#0F172A]">
                            {p.utilisateur?.prenom || "—"}{" "}
                            {p.utilisateur?.nom || ""}
                          </p>

                        </div>
                      </td>

                      {/* Chantier */}

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-sm text-[#475569]">

                          <MapPin
                            size={12}
                            className="text-[#94a3b8]"
                          />

                          {p.chantier?.nom ?? "—"}

                        </span>
                      </td>

                      {/* Date */}

                      <td className="px-5 py-3.5 text-sm text-[#475569] font-mono tabular-nums">
                        {p.date_pointage
                          ? new Date(
                              `${
                                String(
                                  p.date_pointage
                                ).split("T")[0]
                              }T00:00:00`
                            ).toLocaleDateString("fr-FR")
                          : "—"}
                      </td>

                      {/* Arrivée */}

                      <td className="px-5 py-3.5 text-sm text-[#475569] font-mono tabular-nums">
                        {p.heure_arrivee ? (
                          <span className="inline-flex items-center gap-1">

                            <Clock3
                              size={12}
                              className="text-[#94a3b8]"
                            />

                            {p.heure_arrivee}

                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Départ */}

                      <td className="px-5 py-3.5 text-sm text-[#475569] font-mono tabular-nums">
                        {p.heure_depart ? (
                          <span className="inline-flex items-center gap-1">

                            <Clock3
                              size={12}
                              className="text-[#94a3b8]"
                            />

                            {p.heure_depart}

                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Statut */}

                      <td className="px-5 py-3.5">
                        <StatutBadge statut={p.statut} />
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
                : (currentPage - 1) * perPage + 1}
              –
              {Math.min(
                currentPage * perPage,
                filtered.length
              )}{" "}
              sur {filtered.length} pointages
            </span>

            <div className="flex items-center gap-1">

              <button
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#475569] hover:bg-[#F6F8FA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹ Préc.
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs rounded-[6px] border transition-colors ${
                    p === currentPage
                      ? "bg-[#1E3A5F] text-white border-[#1E3A5F]"
                      : "border-[#E2E8F0] text-[#475569] hover:bg-[#F6F8FA]"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(totalPages, p + 1)
                  )
                }
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1.5 text-xs border border-[#E2E8F0] rounded-[6px] text-[#475569] hover:bg-[#F6F8FA] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suiv. ›
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}