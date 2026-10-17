import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  Users,
  HardHat,
  Clock3,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const COLORS = {
  navy: "#1E3A5F",
  green: "#16A34A",
  red: "#DC2626",
  amber: "#F59E0B",
};

function getToday() {
  const d = new Date();

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDateOnly(value) {
  if (!value) return null;

  return String(value).split("T")[0];
}

function getFullName(user) {
  if (!user) return "Employé";

  return (
    `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() ||
    "Employé"
  );
}

function calculateWorkedHours(pointage) {
  if (
    !pointage?.heure_arrivee ||
    !pointage?.heure_depart
  ) {
    return 0;
  }

  const [h1, m1] = String(
    pointage.heure_arrivee
  )
    .split(":")
    .map(Number);

  const [h2, m2] = String(
    pointage.heure_depart
  )
    .split(":")
    .map(Number);

  if (
    [h1, m1, h2, m2].some(Number.isNaN)
  ) {
    return 0;
  }

  const diff =
    h2 * 60 +
    m2 -
    (h1 * 60 + m1);

  return diff > 0 ? diff / 60 : 0;
}

function formatHours(decimalHours) {
  if (!decimalHours || decimalHours <= 0) {
    return "0h";
  }

  const h = Math.floor(decimalHours);

  const m = Math.round(
    (decimalHours - h) * 60
  );

  if (m === 60) {
    return `${h + 1}h`;
  }

  if (m === 0) {
    return `${h}h`;
  }

  return `${h}h${String(m).padStart(2, "0")}`;
}

function getStatutChantier(dateDebut, dateFin) {
  const now = new Date();

  if (now < new Date(dateDebut)) {
    return "planifie";
  }

  if (
    dateFin &&
    now > new Date(dateFin)
  ) {
    return "termine";
  }

  return "en-cours";
}

function KpiCard({
  icon: Icon,
  label,
  value,
  description,
  dark = false,
}) {
  return (
    <div
      className={`rounded-[12px] border px-5 py-5 ${
        dark
          ? "bg-[#1E3A5F] border-[#16304D]"
          : "bg-white border-[#E2E8F0]"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-[8px] flex items-center justify-center ${
          dark
            ? "bg-white/10"
            : "bg-[#F8FAFC] border border-[#E2E8F0]"
        }`}
      >
        <Icon
          size={17}
          className={
            dark
              ? "text-white"
              : "text-[#475569]"
          }
        />
      </div>

      <div className="mt-4">
        <p
          className={`text-[28px] leading-none font-bold ${
            dark
              ? "text-white"
              : "text-[#0F172A]"
          }`}
        >
          {value}
        </p>

        <p
          className={`text-xs font-medium mt-2 ${
            dark
              ? "text-white/70"
              : "text-[#64748B]"
          }`}
        >
          {label}
        </p>

        {description && (
          <p
            className={`text-[11px] mt-1 ${
              dark
                ? "text-white/50"
                : "text-[#94A3B8]"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  action,
  onAction,
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-[#0F172A]">
        {title}
      </h2>

      {action && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-0.5 text-xs text-[#1E3A5F] hover:underline font-medium"
        >
          {action}
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function PresenceTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[8px] px-3 py-2 shadow-sm text-xs">
      <p className="font-semibold text-[#0F172A] mb-1.5">
        {label}
      </p>

      {payload.map((item) => (
        <div
          key={item.dataKey}
          className="flex items-center gap-1.5 mb-0.5"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: item.color,
            }}
          />

          <span className="text-[#64748B]">
            {item.name} :
          </span>

          <span className="font-semibold text-[#0F172A]">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { utilisateur } = useAuth();
  const navigate = useNavigate();

  const isAdmin =
    utilisateur?.role === "admin";

  const isChef =
    utilisateur?.role === "chef_chantier";

  const [pointages, setPointages] =
    useState([]);

  const [chantiers, setChantiers] =
    useState([]);

  const [equipe, setEquipe] =
    useState([]);

  const [monChantier, setMonChantier] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const today = getToday();

  // =====================================================
  // CHARGEMENT DASHBOARD
  // =====================================================

  useEffect(() => {
    if (!utilisateur) {
      return;
    }

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        // =================================================
        // ADMIN
        // =================================================

        if (isAdmin) {
          const [
            resPointages,
            resChantiers,
            resUtilisateurs,
          ] = await Promise.all([
            api.get("/pointages"),
            api.get("/chantiers"),
            api.get("/utilisateurs"),
          ]);

          setPointages(
            resPointages.data.pointages || []
          );

          setChantiers(
            resChantiers.data.chantiers || []
          );

          setEquipe(
            (resUtilisateurs.data.utilisateurs || [])
              .filter(
                (u) => u.role !== "admin"
              )
          );

          setMonChantier(null);

          return;
        }

        // =================================================
        // CHEF DE CHANTIER
        // =================================================

        if (isChef) {
          // On récupère uniquement l'affectation
          // du chef connecté.
          const affectationRes =
            await api.get(
              "/mon-affectation"
            );

          const chantier =
            affectationRes.data.chantier;

          // Aucun chantier affecté
          if (!chantier) {
            setPointages([]);
            setChantiers([]);
            setEquipe([]);
            setMonChantier(null);

            return;
          }

          // Le chef travaille uniquement
          // sur son chantier affecté.
          const [
            resPointages,
            resEquipe,
          ] = await Promise.all([
            api.get(
              `/chantiers/${chantier.id}/pointages`
            ),
            api.get(
              `/chantiers/${chantier.id}/utilisateurs`
            ),
          ]);

          setPointages(
            resPointages.data.pointages || []
          );

          setChantiers([chantier]);

          setEquipe(
            resEquipe.data.utilisateurs || []
          );

          setMonChantier(chantier);

          return;
        }

        // =================================================
        // AUTRE RÔLE
        // =================================================

        setPointages([]);
        setChantiers([]);
        setEquipe([]);
        setMonChantier(null);

        setError(
          "Vous n'avez pas accès au dashboard."
        );
      } catch (err) {
        console.error(
          "Erreur dashboard :",
          err
        );

        if (
          err.response?.status === 403
        ) {
          setError(
            "Vous n'avez pas l'autorisation de consulter ces données."
          );
        } else if (
          err.response?.status === 404
        ) {
          setError(
            "La ressource demandée est introuvable."
          );
        } else {
          setError(
            "Impossible de charger les données du dashboard."
          );
        }

        setPointages([]);
        setChantiers([]);
        setEquipe([]);
        setMonChantier(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [utilisateur?.role, isAdmin, isChef]);

  // =====================================================
  // POINTAGES DU JOUR
  // =====================================================

  const todayPointages = useMemo(
    () =>
      pointages.filter(
        (p) =>
          getDateOnly(
            p.date_pointage
          ) === today
      ),
    [pointages, today]
  );

  const presentsToday = useMemo(
    () =>
      todayPointages.filter(
        (p) => p.heure_arrivee
      ).length,
    [todayPointages]
  );

  const enCoursToday = useMemo(
    () =>
      todayPointages.filter(
        (p) =>
          p.heure_arrivee &&
          !p.heure_depart
      ).length,
    [todayPointages]
  );

  const absentsToday = Math.max(
    0,
    equipe.length - presentsToday
  );

  // =====================================================
  // CHANTIERS EN COURS
  // =====================================================

  const chantiersEnCours = useMemo(
    () =>
      chantiers.filter(
        (c) =>
          getStatutChantier(
            c.date_debut,
            c.date_fin
          ) === "en-cours"
      ),
    [chantiers]
  );

  // =====================================================
  // TAUX DE PRÉSENCE
  // =====================================================

  const tauxPresence = useMemo(() => {
    const total = equipe.length;

    if (!total) {
      return 0;
    }

    return Math.round(
      (presentsToday / total) * 100
    );
  }, [presentsToday, equipe]);

  // =====================================================
  // CAMEMBERT
  // =====================================================

  const pieData = useMemo(() => {
    return [
      {
        name: "Présents",
        value: presentsToday,
        color: COLORS.green,
      },
      {
        name: "En cours",
        value: enCoursToday,
        color: COLORS.amber,
      },
      {
        name: "Absents",
        value: absentsToday,
        color: COLORS.red,
      },
    ].filter(
      (item) => item.value > 0
    );
  }, [
    presentsToday,
    enCoursToday,
    absentsToday,
  ]);

  const totalPresence =
    presentsToday +
    enCoursToday +
    absentsToday;

  // =====================================================
  // PRÉSENCE SUR 7 JOURS
  // =====================================================

  const presenceSemaine = useMemo(() => {
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(
        date.getDate() - i
      );

      const dateString =
        date.toISOString().split("T")[0];

      const dayPointages =
        pointages.filter(
          (p) =>
            getDateOnly(
              p.date_pointage
            ) === dateString
        );

      const presents =
        dayPointages.filter(
          (p) => p.heure_arrivee
        ).length;

      const absentsCalc = Math.max(
        0,
        equipe.length - presents
      );

      result.push({
        jour: date
          .toLocaleDateString(
            "fr-FR",
            {
              weekday: "short",
            }
          )
          .replace(".", ""),
        presents,
        absents: absentsCalc,
      });
    }

    return result;
  }, [pointages, equipe]);

  // =====================================================
  // HEURES PAR CHANTIER
  // =====================================================

  const heuresParChantier = useMemo(() => {
    const map = {};

    pointages.forEach((p) => {
      const nom =
        p.chantier?.nom ??
        "Chantier";

      map[nom] =
        (map[nom] ?? 0) +
        calculateWorkedHours(p);
    });

    return Object.entries(map)
      .map(
        ([chantier, heures]) => ({
          chantier,
          heures:
            Math.round(
              heures * 10
            ) / 10,
        })
      )
      .sort(
        (a, b) =>
          b.heures - a.heures
      )
      .slice(0, 5);
  }, [pointages]);

  const totalHeures = useMemo(
    () =>
      heuresParChantier.reduce(
        (sum, item) =>
          sum + item.heures,
        0
      ),
    [heuresParChantier]
  );

  // =====================================================
  // ACTIVITÉ RÉCENTE
  // =====================================================

  const recentActivity = useMemo(() => {
    const activities = [];

    todayPointages.forEach((p) => {
      const chantierNom =
        p.chantier?.nom ??
        "Chantier";

      if (p.heure_arrivee) {
        activities.push({
          id: `${p.id}-a`,
          user: p.utilisateur,
          chantier: chantierNom,
          type: "arrivee",
          heure: p.heure_arrivee,
        });
      }

      if (p.heure_depart) {
        activities.push({
          id: `${p.id}-d`,
          user: p.utilisateur,
          chantier: chantierNom,
          type: "depart",
          heure: p.heure_depart,
        });
      }
    });

    return activities
      .sort((a, b) =>
        String(b.heure).localeCompare(
          String(a.heure)
        )
      )
      .slice(0, 10);
  }, [todayPointages]);

  const todayLabel =
    new Date().toLocaleDateString(
      "fr-FR",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      }
    );

  const firstName =
    utilisateur?.prenom ?? "";

  return (
    <div className="flex-1 overflow-y-auto bg-[#E5EEF2]">
      <div className="max-w-[1320px] mx-auto px-6 py-6 space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#64748B] mb-1">
              Accueil / Tableau de bord
            </p>

            <h1 className="text-[22px] font-bold text-[#0F172A]">
              Bonjour
              {firstName
                ? `, ${firstName}`
                : ""}{" "}
              👋
            </h1>

            <p className="text-sm text-[#64748B] mt-1 capitalize">
              {todayLabel}
            </p>
          </div>

          <span className="self-start sm:self-auto text-xs text-[#475569] px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-[8px]">
            {isAdmin
              ? "Vue globale · Tous les chantiers"
              : monChantier
              ? `Chantier · ${monChantier.nom}`
              : "Aucun chantier affecté"}
          </span>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-[8px] bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {!isAdmin &&
        !loading &&
        !monChantier ? (
          <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-10 text-center text-sm text-[#64748B]">
            Vous n'êtes actuellement affecté à aucun chantier.
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                isAdmin
                  ? "xl:grid-cols-4"
                  : "xl:grid-cols-3"
              } gap-4`}
            >
              <KpiCard
                icon={Users}
                label="Employés"
                value={
                  loading
                    ? "—"
                    : equipe.length
                }
                description="Effectif de l'équipe"
                // dark
              />

              <KpiCard
                icon={Clock3}
                label="Pointages aujourd'hui"
                value={
                  loading
                    ? "—"
                    : todayPointages.length
                }
                description={`${presentsToday} avec une arrivée`}
              />

              <KpiCard
                icon={TrendingUp}
                label="Taux de présence"
                value={
                  loading
                    ? "—"
                    : `${tauxPresence}%`
                }
                description="Aujourd'hui"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#E2E8F0] p-5">

                <SectionHeader
                  title="Évolution des présences (7 jours)"
                />

                {loading ? (
                  <div className="h-[240px] flex items-center justify-center text-sm text-[#64748B]">
                    Chargement...
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer
                      width="100%"
                      height={220}
                    >
                      <AreaChart
                        data={presenceSemaine}
                        margin={{
                          top: 5,
                          right: 10,
                          left: -20,
                          bottom: 0,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="presenceGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={
                                COLORS.navy
                              }
                              stopOpacity={0.12}
                            />

                            <stop
                              offset="95%"
                              stopColor={
                                COLORS.navy
                              }
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#F1F5F9"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="jour"
                          tick={{
                            fontSize: 11,
                            fill: "#94A3B8",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: 11,
                            fill: "#94A3B8",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          content={
                            <PresenceTooltip />
                          }
                        />

                        <Area
                          type="monotone"
                          dataKey="presents"
                          name="Présents"
                          stroke={
                            COLORS.navy
                          }
                          strokeWidth={2}
                          fill="url(#presenceGradient)"
                        />

                        <Area
                          type="monotone"
                          dataKey="absents"
                          name="Absents"
                          stroke={
                            COLORS.red
                          }
                          strokeWidth={1.5}
                          fill="transparent"
                        />
                      </AreaChart>
                    </ResponsiveContainer>

                    <div className="flex items-center gap-5 pt-3 border-t border-[#E2E8F0]">

                      <span className="flex items-center gap-2 text-xs text-[#64748B]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A5F]" />
                        Présents
                      </span>

                      <span className="flex items-center gap-2 text-xs text-[#64748B]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                        Absents
                      </span>

                    </div>
                  </>
                )}
              </div>

              <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-5">

                <SectionHeader
                  title="Répartition aujourd'hui"
                />

                {loading ? (
                  <div className="h-[250px] flex items-center justify-center text-sm text-[#64748B]">
                    Chargement...
                  </div>
                ) : totalPresence === 0 ? (
                  <div className="h-[250px] flex flex-col items-center justify-center text-sm text-[#64748B]">
                    <Clock3
                      size={28}
                      className="mb-2 text-[#94A3B8]"
                    />
                    Aucun pointage aujourd'hui.
                  </div>
                ) : (
                  <div className="flex flex-col items-center">

                    <div className="relative">

                      <ResponsiveContainer
                        width={190}
                        height={190}
                      >
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={78}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map(
                              (
                                entry,
                                index
                              ) => (
                                <Cell
                                  key={
                                    index
                                  }
                                  fill={
                                    entry.color
                                  }
                                />
                              )
                            )}
                          </Pie>

                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-[#0F172A]">
                          {totalPresence}
                        </span>

                        <span className="text-[10px] text-[#64748B]">
                          pointages
                        </span>
                      </div>
                    </div>

                    <div className="w-full space-y-3 mt-2">

                      {[
                        {
                          label: "Présents",
                          value:
                            presentsToday,
                          color:
                            "#16A34A",
                        },
                        {
                          label: "En cours",
                          value:
                            enCoursToday,
                          color:
                            "#F59E0B",
                        },
                        {
                          label: "Absents",
                          value:
                            absentsToday,
                          color:
                            "#DC2626",
                        },
                      ].map((row) => (
                        <div
                          key={
                            row.label
                          }
                          className="flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2 text-xs text-[#475569]">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{
                                background:
                                  row.color,
                              }}
                            />

                            {row.label}
                          </span>

                          <span className="text-xs font-semibold text-[#0F172A]">
                            {row.value}
                          </span>
                        </div>
                      ))}

                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-5">

                <SectionHeader
                  title="Heures par chantier"
                  action="Voir rapports"
                  onAction={() =>
                    navigate(
                      "/rapports"
                    )
                  }
                />

                {heuresParChantier.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center text-sm text-[#64748B]">
                    Aucune heure enregistrée.
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer
                      width="100%"
                      height={200}
                    >
                      <BarChart
                        data={
                          heuresParChantier
                        }
                        layout="vertical"
                        margin={{
                          top: 0,
                          right: 10,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#F1F5F9"
                          horizontal={false}
                        />

                        <XAxis
                          type="number"
                          tick={{
                            fontSize: 10,
                            fill: "#94A3B8",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          type="category"
                          dataKey="chantier"
                          width={90}
                          tick={{
                            fontSize: 10,
                            fill: "#475569",
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="heures"
                          fill={
                            COLORS.navy
                          }
                          radius={[
                            0,
                            4,
                            4,
                            0,
                          ]}
                          maxBarSize={16}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="pt-3 mt-2 border-t border-[#E2E8F0] flex justify-between">
                      <span className="text-xs text-[#64748B]">
                        Total
                      </span>

                      <span className="text-sm font-bold text-[#0F172A]">
                        {formatHours(
                          totalHeures
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-5">

                <SectionHeader
                  title="Activité en temps réel"
                  action={
                    isAdmin
                      ? "Voir pointages"
                      : undefined
                  }
                  onAction={() =>
                    navigate(
                      "/pointages"
                    )
                  }
                />

                {recentActivity.length === 0 ? (
                  <div className="py-10 text-center text-sm text-[#64748B]">
                    Aucun pointage aujourd'hui.
                  </div>
                ) : (
                  <div className="divide-y divide-[#F1F5F9]">

                    {recentActivity.map(
                      (activity) => {
                        const isArrivee =
                          activity.type ===
                          "arrivee";

                        return (
                          <div
                            key={
                              activity.id
                            }
                            className="flex items-center gap-3 py-3"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isArrivee
                                  ? "bg-amber-100"
                                  : "bg-green-100"
                              }`}
                            >
                              {isArrivee ? (
                                <Clock3
                                  size={14}
                                  className="text-[#F59E0B]"
                                />
                              ) : (
                                <CheckCircle2
                                  size={14}
                                  className="text-[#16A34A]"
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#0F172A]">
                                <span className="font-medium">
                                  {getFullName(
                                    activity.user
                                  )}
                                </span>

                                <span className="text-[#64748B]">
                                  {" "}
                                  a pointé sur{" "}
                                </span>

                                <span className="font-medium text-[#1E3A5F]">
                                  {
                                    activity.chantier
                                  }
                                </span>
                              </p>
                            </div>

                            <span
                              className={`text-xs font-mono tabular-nums font-semibold flex-shrink-0 ${
                                isArrivee
                                  ? "text-[#F59E0B]"
                                  : "text-[#16A34A]"
                              }`}
                            >
                              {
                                activity.heure
                              }
                            </span>
                          </div>
                        );
                      }
                    )}

                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}