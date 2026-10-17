import { useState, useEffect } from "react";
import {
  Clock3,
  Users,
  UserX,
  ChevronDown,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function startOfMonth() {
  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-01`;
}

function today() {
  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  iconColor = "navy",
}) {
  const colors = {
    navy: "bg-[#1E3A5F]/10 text-[#1E3A5F]",
    success: "bg-green-100 text-green-600",
    danger: "bg-red-100 text-red-600",
  };

  return (
    <div className="rounded-[12px] border border-[#E2E8F0] bg-white px-5 py-5">
      <div
        className={`w-9 h-9 rounded-[8px] flex items-center justify-center ${colors[iconColor]}`}
      >
        <Icon size={17} />
      </div>

      <div className="mt-4">
        <p className="text-[28px] leading-none font-bold text-[#0F172A]">
          {value}
        </p>

        <p className="text-xs font-medium mt-2 text-[#64748B]">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function Rapports() {
  const { utilisateur } = useAuth();

  const isAdmin = utilisateur?.role === "admin";
  const isChef = utilisateur?.role === "chef_chantier";

  const [chantiers, setChantiers] = useState([]);
  const [rapport, setRapport] = useState([]);
  const [chantierNom, setChantierNom] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateDebut, setDateDebut] = useState(startOfMonth());
  const [dateFin, setDateFin] = useState(today());
  const [chantierFilter, setChantierFilter] = useState("");

  // =====================================================
  // CHARGER UN RAPPORT
  // =====================================================

  const fetchRapport = async (
    chantierId,
    debut,
    fin
  ) => {
    setLoading(true);
    setError("");

    try {
      const params = `?date_debut=${debut}&date_fin=${fin}`;

      const url = chantierId
        ? `/chantiers/${chantierId}/rapports${params}`
        : `/rapports${params}`;

      const res = await api.get(url);

      setRapport(res.data.rapport ?? []);

      const chantierValue = res.data.chantier;

      setChantierNom(
        typeof chantierValue === "string"
          ? chantierValue
          : chantierValue?.nom ?? ""
      );
    } catch (err) {
      console.error("Erreur chargement rapport :", err);

      setError(
        err.response?.data?.message ||
          "Impossible de charger le rapport."
      );

      setRapport([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIALISATION SELON LE RÔLE
  // =====================================================

  useEffect(() => {
    if (!utilisateur) return;

    const initialiser = async () => {
      setLoading(true);
      setError("");

      try {
        // =================================================
        // ADMIN
        // =================================================

        if (isAdmin) {
          const res = await api.get("/chantiers");

          const listeChantiers =
            res.data.chantiers ?? [];

          setChantiers(listeChantiers);
          setChantierFilter("");
          setChantierNom("");

          // Rapport global
          await fetchRapport(
            "",
            dateDebut,
            dateFin
          );

          return;
        }

        // =================================================
        // CHEF DE CHANTIER
        // =================================================

        if (isChef) {
          // Le chef récupère son affectation
          const affectationRes = await api.get(
            "/mon-affectation"
          );

          const chantier =
            affectationRes.data.chantier;

          // Aucun chantier affecté
          if (!chantier) {
            setChantiers([]);
            setRapport([]);
            setChantierFilter("");
            setChantierNom("");
            setError(
              "Vous n'êtes affecté à aucun chantier."
            );

            return;
          }

          // On garde uniquement SON chantier
          setChantiers([chantier]);
          setChantierFilter(String(chantier.id));
          setChantierNom(chantier.nom);

          // Rapport de son chantier
          await fetchRapport(
            chantier.id,
            dateDebut,
            dateFin
          );

          return;
        }

        // =================================================
        // AUTRE RÔLE
        // =================================================

        setChantiers([]);
        setRapport([]);
        setError(
          "Vous n'avez pas accès aux rapports."
        );
      } catch (err) {
        console.error(
          "Erreur initialisation rapports :",
          err
        );

        setError(
          err.response?.data?.message ||
            "Impossible de charger les données."
        );

        setChantiers([]);
        setRapport([]);
      } finally {
        setLoading(false);
      }
    };

    initialiser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilisateur?.role]);

  // =====================================================
  // CHANGEMENT DE CHANTIER
  // ADMIN UNIQUEMENT
  // =====================================================

  const handleChantierChange = (value) => {
    if (!isAdmin) return;

    setChantierFilter(value);

    fetchRapport(
      value,
      dateDebut,
      dateFin
    );
  };

  // =====================================================
  // CHANGEMENT DATE DÉBUT
  // =====================================================

  const handleDateDebutChange = (value) => {
    setDateDebut(value);

    if (isAdmin) {
      fetchRapport(
        chantierFilter,
        value,
        dateFin
      );

      return;
    }

    if (isChef && chantierFilter) {
      fetchRapport(
        chantierFilter,
        value,
        dateFin
      );
    }
  };

  // =====================================================
  // CHANGEMENT DATE FIN
  // =====================================================

  const handleDateFinChange = (value) => {
    setDateFin(value);

    if (isAdmin) {
      fetchRapport(
        chantierFilter,
        dateDebut,
        value
      );

      return;
    }

    if (isChef && chantierFilter) {
      fetchRapport(
        chantierFilter,
        dateDebut,
        value
      );
    }
  };

  // =====================================================
  // EXPORT EXCEL
  // =====================================================

  const handleExportExcel = () => {
    const rows = rapport.map((r) => ({
      Nom: r.nom,
      Prénom: r.prenom,
      "Jours présents": r.jours_presents,
      Absences: r.absences,
      "Heures travaillées": r.heures_travaillees,
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Rapport"
    );

    const nomFichier = chantierNom
      ? `rapport_${chantierNom.replace(
          /\s+/g,
          "_"
        )}_${dateDebut}_${dateFin}.xlsx`
      : `rapport_global_${dateDebut}_${dateFin}.xlsx`;

    XLSX.writeFile(
      workbook,
      nomFichier
    );
  };

  // =====================================================
  // KPI
  // =====================================================

  const totalEmployes = rapport.length;

  const totalJoursPresents =
    rapport.reduce(
      (sum, r) =>
        sum +
        Number(r.jours_presents || 0),
      0
    );

  const totalAbsences =
    rapport.reduce(
      (sum, r) =>
        sum +
        Number(r.absences || 0),
      0
    );

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <div className="flex-1 overflow-y-auto bg-[#E5EEF2]">
      <div className="max-w-[1320px] mx-auto px-6 py-6 space-y-6">

        <div>
          <p className="text-xs text-[#64748B] mb-1">
            Accueil / Rapports
          </p>

          <h1 className="text-[22px] font-bold text-[#0F172A]">
            Rapports
          </h1>

          <p className="text-sm text-[#64748B] mt-1">
            {chantierNom
              ? `Chantier : ${chantierNom}`
              : "Tous les chantiers"}
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-[8px] bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-4">
          <div className="flex flex-wrap items-end gap-3">

            {/* DATE DÉBUT */}

            <div>
              <label className="block text-[12px] font-medium text-[#475569] mb-1">
                Date début
              </label>

              <input
                type="date"
                value={dateDebut}
                onChange={(e) =>
                  handleDateDebutChange(
                    e.target.value
                  )
                }
                className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>

            {/* DATE FIN */}

            <div>
              <label className="block text-[12px] font-medium text-[#475569] mb-1">
                Date fin
              </label>

              <input
                type="date"
                value={dateFin}
                onChange={(e) =>
                  handleDateFinChange(
                    e.target.value
                  )
                }
                className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:border-[#1E3A5F]"
              />
            </div>

            {/* CHANTIER */}

            {/* CHANTIER — uniquement pour l'admin */}
{isAdmin && (
  <div className="relative">
    <label className="block text-[12px] font-medium text-[#475569] mb-1">
      Chantier
    </label>
    <select
      value={chantierFilter}
      onChange={(e) => handleChantierChange(e.target.value)}
      className="appearance-none pr-9 pl-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#475569] focus:outline-none focus:border-[#1E3A5F] cursor-pointer"
    >
      <option value="">Tous les chantiers</option>
      {chantiers.map((c) => (
        <option key={c.id} value={c.id}>{c.nom}</option>
      ))}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-[34px] pointer-events-none text-[#94A3B8]" />
  </div>
)}

            {/* EXPORT */}

            <button
              onClick={handleExportExcel}
              disabled={
                loading ||
                rapport.length === 0
              }
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-[#16A34A] hover:bg-green-700 text-white text-sm font-medium rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={15} />
              Exporter Excel
            </button>
          </div>
        </div>

        {/* KPI */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <KpiCard
            icon={Users}
            label="Employés"
            value={totalEmployes}
            iconColor="navy"
          />

          <KpiCard
            icon={Clock3}
            label="Jours présents"
            value={totalJoursPresents}
            iconColor="success"
          />

          <KpiCard
            icon={UserX}
            label="Absences"
            value={totalAbsences}
            iconColor="danger"
          />

        </div>

        {/* TABLEAU */}

        <div className="bg-white rounded-[12px] border border-[#E2E8F0]">

          <div className="px-5 py-4 border-b border-[#E2E8F0]">

            <h2 className="text-sm font-semibold text-[#0F172A]">
              Détail par employé
            </h2>

            <p className="text-xs text-[#94A3B8] mt-1">
              Période du{" "}
              {new Date(
                `${dateDebut}T00:00:00`
              ).toLocaleDateString(
                "fr-FR"
              )}{" "}
              au{" "}
              {new Date(
                `${dateFin}T00:00:00`
              ).toLocaleDateString(
                "fr-FR"
              )}
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[600px]">

              <thead>
                <tr className="bg-[#16304D]">

                  <th className="text-left text-xs font-medium text-white px-5 py-3">
                    Employé
                  </th>

                  <th className="text-left text-xs font-medium text-white px-5 py-3">
                    Jours présents
                  </th>

                  <th className="text-left text-xs font-medium text-white px-5 py-3">
                    Absences
                  </th>

                  <th className="text-left text-xs font-medium text-white px-5 py-3">
                    Heures travaillées
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">

                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm text-[#64748B]"
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : rapport.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-sm text-[#64748B]"
                    >
                      Aucune donnée pour cette période.
                    </td>
                  </tr>
                ) : (
                  rapport.map((r) => (
                    <tr
                      key={r.utilisateur_id}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">

                          <div className="w-7 h-7 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">

                            <span className="text-[10px] font-bold text-[#1E3A5F]">
                              {r.prenom?.[0] || ""}
                              {r.nom?.[0] || ""}
                            </span>

                          </div>

                          <span className="text-sm font-medium text-[#0F172A]">
                            {r.prenom} {r.nom}
                          </span>

                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-sm text-[#475569] font-mono tabular-nums">
                        {r.jours_presents}
                      </td>

                      <td className="px-5 py-3.5 text-sm text-[#DC2626] font-mono tabular-nums">
                        {r.absences}
                      </td>

                      <td className="px-5 py-3.5 text-sm text-[#475569] font-mono tabular-nums">
                        {r.heures_travaillees}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>

          </div>
        </div>

      </div>
    </div>
  );
}