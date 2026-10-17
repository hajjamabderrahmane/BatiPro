import { useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios";

export default function ModalChantier({ chantier, onSaved, onClose }) {
    const isEdit = !!chantier?.id;

  const [form, setForm] = useState({
    nom: chantier?.nom ?? "",
    adresse: chantier?.adresse ?? "",
    date_debut: chantier?.date_debut ?? "",
    date_fin: chantier?.date_fin ?? "",
    latitude: chantier?.latitude ?? "",
    longitude: chantier?.longitude ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const inputCls =
    "w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#0F172A] placeholder-[#94a3b8] focus:outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/10 transition-colors";

  const labelCls =
    "block text-[13px] font-medium text-[#475569] mb-1.5";

  const handleSubmit = async () => {
    setSaving(true);
    setError("");

    try {
      const res = isEdit
        ? await api.put(`/chantiers/${chantier.id}`, form)
        : await api.post("/chantiers", form);

      const saved = res.data.chantier ?? res.data;

onSaved(saved);
onClose();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] w-full max-w-lg shadow-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] flex-shrink-0">
          <h3 className="text-base font-semibold text-[#0F172A]">
            {isEdit ? "Modifier le chantier" : "Nouveau chantier"}
          </h3>

          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#475569] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {error && (
            <div className="px-3 py-2.5 rounded-[8px] bg-red-50 border border-red-200 text-sm text-[#DC2626]">
              {error}
            </div>
          )}

          {/* Nom */}
          <div>
            <label className={labelCls}>
              Nom du chantier *
            </label>

            <input
              value={form.nom}
              onChange={(e) => set("nom", e.target.value)}
              placeholder="Chantier Centre-Ville"
              className={inputCls}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className={labelCls}>
                Date de début *
              </label>

              <input
                type="date"
                value={form.date_debut}
                onChange={(e) => set("date_debut", e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Date de fin prévue *
              </label>

              <input
                type="date"
                value={form.date_fin}
                onChange={(e) => set("date_fin", e.target.value)}
                className={inputCls}
              />
            </div>

          </div>

          {/* Adresse */}
          <div>
            <label className={labelCls}>
              Adresse
            </label>

            <input
              value={form.adresse}
              onChange={(e) => set("adresse", e.target.value)}
              placeholder="Casablanca"
              className={inputCls}
            />
          </div>

          {/* GPS */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className={labelCls}>
                Latitude
              </label>

              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => set("latitude", e.target.value)}
                placeholder="33.5731"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Longitude
              </label>

              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => set("longitude", e.target.value)}
                placeholder="-7.5898"
                className={inputCls}
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#E2E8F0] flex-shrink-0">

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#475569] border border-[#E2E8F0] rounded-[8px] hover:bg-[#F6F8FA] transition-colors"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={!form.nom || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#16304D] rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? "Enregistrement..."
              : isEdit
              ? "Enregistrer"
              : "Créer le chantier"}
          </button>

        </div>
      </div>
    </div>
  );
}