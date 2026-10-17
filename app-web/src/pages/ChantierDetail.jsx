
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  QrCode,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { EditButton } from "../components/ActionButtons";
import ModalChantier from "../components/ModalChantier";

// ======================================================
// Correction icône Leaflet
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ======================================================
// QR CODE
// ======================================================

function QRPanel({ codeQr, nom }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] overflow-hidden">
      <button
        onClick={() => setExpanded((value) => !value)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8FAFC] transition-colors"
      >
        <div className="flex items-center gap-2">
          <QrCode
            size={16}
            className="text-[#1E3A5F]"
          />

          <span className="text-sm font-semibold text-[#0F172A]">
            Code QR de pointage
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`text-[#94A3B8] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-[#E2E8F0] px-5 py-5">
          <p className="text-xs text-[#64748B] leading-relaxed mb-5">
            Les employés peuvent scanner ce QR code depuis
            l'application mobile pour enregistrer leur pointage
            sur ce chantier.
          </p>

          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-[12px] border-2 border-[#E2E8F0] inline-flex flex-col items-center gap-3">
              <QRCodeSVG
                value={codeQr || ""}
                size={170}
                bgColor="#ffffff"
                fgColor="#1E3A5F"
                level="M"
              />

              <div className="text-center">
                <p className="text-[10px] font-bold text-[#1E3A5F] tracking-widest uppercase">
                  BATIPRO
                </p>

                <p className="text-[10px] text-[#64748B] mt-0.5 max-w-[170px] truncate">
                  {nom}
                </p>
              </div>
            </div>

            <div className="w-full mt-4 px-3 py-2.5 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0]">
              <p className="text-[10px] text-[#64748B] mb-1">
                Code du chantier
              </p>

              <p className="text-xs font-mono text-[#0F172A] break-all">
                {codeQr || "—"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================================================
// INFO ITEM
// ======================================================

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon
        size={14}
        className="text-[#94A3B8] mt-0.5 flex-shrink-0"
      />

      <div>
        <p className="text-[11px] text-[#64748B] font-medium uppercase tracking-wide">
          {label}
        </p>

        <p className="text-sm font-medium text-[#0F172A] mt-0.5">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// STATUT
// ======================================================

function getStatutChantier(dateDebut, dateFin) {
  const now = new Date();

  if (dateDebut && now < new Date(dateDebut)) {
    return {
      label: "Planifié",
      className:
        "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  if (dateFin && now > new Date(dateFin)) {
    return {
      label: "Terminé",
      className:
        "bg-slate-100 text-slate-600 border-slate-200",
    };
  }

  return {
    label: "En cours",
    className:
      "bg-green-50 text-green-700 border-green-200",
  };
}

// ======================================================
// PAGE
// ======================================================

export default function ChantierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { utilisateur } = useAuth();

  const role = utilisateur?.role;
  const isAdmin = role === "admin";
  const isChef = role === "chef_chantier";

  const [chantier, setChantier] = useState(null);
  const [equipe, setEquipe] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editTarget, setEditTarget] = useState(false);

  // ====================================================
  // CHARGEMENT
  // ====================================================

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        // ================================================
        // ADMIN
        // ================================================

        if (isAdmin) {
          if (!id) {
            setError("Identifiant du chantier manquant.");
            return;
          }

          const [
            resChantier,
            resUtilisateurs,
          ] = await Promise.all([
            api.get(`/chantiers/${id}`),
            api.get(`/chantiers/${id}/utilisateurs`),
          ]);

          setChantier(resChantier.data.chantier);

          setEquipe(
            resUtilisateurs.data.utilisateurs || []
          );

          return;
        }

        // ================================================
        // CHEF DE CHANTIER
        // ================================================

        if (isChef) {
  const response = await api.get(
    "/mon-affectation"
  );

  const chantier = response.data.chantier;

  if (!chantier) {
    setError("Aucun chantier ne vous est affecté.");
    return;
  }

  setChantier(chantier);

  // Récupérer l'équipe du chantier
  const resUtilisateurs = await api.get(
    `/chantiers/${chantier.id}/utilisateurs`
  );

  setEquipe(
    resUtilisateurs.data.utilisateurs || []
  );

  return;
}

        setError("Accès non autorisé.");
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401) {
          setError("Votre session a expiré.");
        } else if (err.response?.status === 403) {
          setError(
            "Vous n'avez pas accès à ce chantier."
          );
        } else if (err.response?.status === 404) {
          setError(
            isChef
              ? "Aucun chantier ne vous est affecté."
              : "Chantier introuvable."
          );
        } else {
          setError(
            "Impossible de charger le chantier."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchData();
    }
  }, [id, role, isAdmin, isChef]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-[#64748B]">
          Chargement...
        </p>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error || !chantier) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <p className="text-sm text-[#DC2626] mb-3">
            {error || "Chantier introuvable."}
          </p>

          <button
            onClick={() =>
              navigate(
                isAdmin
                  ? "/chantiers"
                  : "/dashboard"
              )
            }
            className="text-xs text-[#1E3A5F] hover:underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // DONNÉES
  // ====================================================

  const statut = getStatutChantier(
    chantier.date_debut,
    chantier.date_fin
  );

  const latitude = Number(chantier.latitude);
  const longitude = Number(chantier.longitude);

  const hasLocation =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  const googleMapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-5">

        {/* ==================================================
            BREADCRUMB
        ================================================== */}

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              navigate(
                isAdmin
                  ? "/chantiers"
                  : "/dashboard"
              )
            }
            className="inline-flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1E3A5F] transition-colors"
          >
            <ArrowLeft size={13} />

            {isAdmin
              ? "Chantiers"
              : "Dashboard"}
          </button>

          <span className="text-xs text-[#94A3B8]">
            /
          </span>

          <span className="text-xs text-[#0F172A] font-medium truncate max-w-[250px]">
            {chantier.nom}
          </span>
        </div>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="bg-white rounded-[12px] border border-[#E2E8F0] px-5 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">

                <h1 className="text-[22px] font-bold text-[#0F172A]">
                  {chantier.nom}
                </h1>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium ${statut.className}`}
                >
                  <CheckCircle2 size={12} />
                  {statut.label}
                </span>

              </div>

              <div className="flex items-center gap-1.5 mt-2 text-sm text-[#64748B]">
                <MapPin size={13} />

                <span>
                  {chantier.adresse ||
                    "Adresse non renseignée"}
                </span>
              </div>
            </div>

            {isAdmin && (
              <EditButton
                onClick={() =>
                  setEditTarget(chantier)
                }
              />
            )}

          </div>
        </div>

        {/* ==================================================
            INFORMATIONS
        ================================================== */}

        <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-5">

          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">
            Informations du chantier
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <InfoItem
              icon={Calendar}
              label="Date de début"
              value={
                chantier.date_debut
                  ? new Date(
                      chantier.date_debut
                    ).toLocaleDateString(
                      "fr-FR"
                    )
                  : "—"
              }
            />

            <InfoItem
              icon={Calendar}
              label="Date de fin prévue"
              value={
                chantier.date_fin
                  ? new Date(
                      chantier.date_fin
                    ).toLocaleDateString(
                      "fr-FR"
                    )
                  : "—"
              }
            />

            <InfoItem
              icon={Users}
              label="Effectif"
              value={`${equipe.length} personne${
                equipe.length > 1
                  ? "s"
                  : ""
              }`}
            />

          </div>
        </div>

        {/* ==================================================
            LOCALISATION + QR
        ================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ================= LOCALISATION ================= */}

          <div className="xl:col-span-2 bg-white rounded-[12px] border border-[#E2E8F0] overflow-hidden">

            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-3">

              <div>
                <div className="flex items-center gap-2">

                  <MapPin
                    size={16}
                    className="text-[#1E3A5F]"
                  />

                  <h2 className="text-sm font-semibold text-[#0F172A]">
                    Localisation du chantier
                  </h2>

                </div>

                <p className="text-xs text-[#64748B] mt-1">
                  Position géographique du chantier
                </p>
              </div>

              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#E2E8F0] text-xs font-medium text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1E3A5F] transition-colors"
                >
                  <ExternalLink size={12} />
                  Ouvrir Maps
                </a>
              )}

            </div>

            {hasLocation ? (
              <div className="h-[360px] w-full">

                <MapContainer
                  center={[
                    latitude,
                    longitude,
                  ]}
                  zoom={16}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker
                    position={[
                      latitude,
                      longitude,
                    ]}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>
                          {chantier.nom}
                        </strong>

                        <br />

                        {chantier.adresse}
                      </div>
                    </Popup>
                  </Marker>

                </MapContainer>

              </div>
            ) : (
              <div className="h-[360px] flex flex-col items-center justify-center bg-[#F8FAFC]">

                <MapPin
                  size={28}
                  className="text-[#94A3B8] mb-2"
                />

                <p className="text-sm font-medium text-[#475569]">
                  Localisation indisponible
                </p>

                <p className="text-xs text-[#94A3B8] mt-1">
                  Les coordonnées GPS ne sont pas
                  renseignées.
                </p>

              </div>
            )}

          </div>

          {/* ================= QR ================= */}

          <div>
            <QRPanel
              codeQr={chantier.code_qr}
              nom={chantier.nom}
            />
          </div>

        </div>

        {/* ==================================================
            EQUIPE
        ================================================== */}

        <div className="bg-white rounded-[12px] border border-[#E2E8F0] overflow-hidden">

          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">

            <div>

              <h2 className="text-sm font-semibold text-[#0F172A]">
                Équipe affectée
              </h2>

              <p className="text-xs text-[#64748B] mt-1">
                {equipe.length} membre
                {equipe.length > 1
                  ? "s"
                  : ""}{" "}
                affecté
                {equipe.length > 1
                  ? "s"
                  : ""}{" "}
                à ce chantier
              </p>

            </div>

            <div className="w-8 h-8 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center">

              <Users
                size={15}
                className="text-[#1E3A5F]"
              />

            </div>

          </div>

          {equipe.length === 0 ? (

            <div className="px-5 py-10 text-center">

              <Users
                size={25}
                className="mx-auto text-[#CBD5E1] mb-2"
              />

              <p className="text-sm text-[#64748B]">
                Aucun employé affecté à ce chantier.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-[#E2E8F0]">

              {equipe.map((emp) => (

                <div
                  key={emp.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFC] transition-colors"
                >

                  {/* Avatar */}

                  <div className="w-9 h-9 rounded-full bg-[#1E3A5F]/10 flex items-center justify-center flex-shrink-0">

                    <span className="text-[10px] font-bold text-[#1E3A5F]">

                      {emp.prenom?.[0] || ""}
                      {emp.nom?.[0] || ""}

                    </span>

                  </div>

                  {/* Nom */}

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium text-[#0F172A]">
                      {emp.prenom} {emp.nom}
                    </p>

                    <p className="text-xs text-[#64748B] mt-0.5">

                      {emp.role ===
                      "chef_chantier"
                        ? "Chef de chantier"
                        : "Employé"}

                    </p>

                  </div>

                  {/* Date affectation */}

                  {emp.pivot
                    ?.date_affectation && (

                    <span className="text-xs text-[#94A3B8] flex-shrink-0">

                      Affecté le{" "}

                      {new Date(
                        emp.pivot.date_affectation
                      ).toLocaleDateString(
                        "fr-FR"
                      )}

                    </span>

                  )}

                </div>

              ))}

            </div>

          )}

        </div>

        {/* ==================================================
            MODAL ADMIN
        ================================================== */}

        {isAdmin &&
          editTarget !== false && (

            <ModalChantier
              chantier={editTarget}

              onSave={(updatedChantier) => {
                setChantier(
                  updatedChantier
                );

                setEditTarget(false);
              }}

              onClose={() =>
                setEditTarget(false)
              }
            />

          )}

      </div>
    </div>
  );
}

