import api from '../api/axios';

// ─── Types backend (tels que le Laravel les renvoie) ───────────────────────────

export interface BackendPointage {
  id: number;
  user_id: number;
  chantier_id: number;
  date_pointage: string;       // "2026-09-02"
  heure_arrivee: string;      // "08:12:00"
  heure_depart: string | null;
  latitude: number;
  longitude: number;
  created_at?: string;
  updated_at?: string;
  chantier?: {
    id: number;
    nom: string;
    adresse?: string;
  };
}

export interface BackendStats {
  jours_presents: number;
  absences: number;
  heures_travaillees: string; // "8h53"
}

export interface BackendChantier {
  id: number;
  nom: string;
  adresse: string;
  date_debut: string;
  date_fin: string;
  code_qr: string;
  latitude: number;
  longitude: number;
}

export interface BackendRapport {
  utilisateur_id: number;
  nom: string;
  prenom: string;
  jours_presents: number;
  absences: number;
  heures_travaillees: string;
}

// ─── Types mobile (formatés pour l'UI) ───────────────────────────────────────

export interface Pointage {
  id: string;
  date: string;          // "2026-09-05" (ISO, pour filtrage/calendrier)
  date_formatted: string; // "Mardi 2 Septembre 2026" (affichage)
  arrivee: string;      // "08:12"
  depart: string;       // "17:05" ou "—"
  duree: string;        // "8h53" ou "—"
  type: 'present' | 'partial';
  chantier_id: number;
  chantier_nom: string;
  localisation?: string;
}

export interface Chantier {
  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  rayon: number;
}

export interface UserStats {
  jours_presents: number;
  absences: number;
  heures_travaillees: string;
}

export interface PointageResponse {
  pointage: BackendPointage;
  message: string;
}

// ─── Helpers de formatage ─────────────────────────────────────────────────────

function formatTime(t: string | null | undefined): string {
  if (!t) return '—';
  const [h, m] = t.split(':');
  return `${h}:${m}`;
}

function calculerDuree(arrivee: string, depart: string | null): string {
  if (!arrivee || !depart) return '—';
  const [ah, am] = arrivee.split(':').map(Number);
  const [dh, dm] = depart.split(':').map(Number);
  const totalMin = (dh * 60 + dm) - (ah * 60 + am);
  if (totalMin <= 0) return '—';
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

function pointageType(depart: string | null): 'present' | 'partial' {
  return depart ? 'present' : 'partial';
}

function formatterPointage(p: BackendPointage): Pointage {
  const arriveeFmt = formatTime(p.heure_arrivee);
  const departFmt = formatTime(p.heure_depart);
  const date = new Date(p.date_pointage + 'T00:00:00');
  const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dateStr = `${jours[date.getDay()]} ${date.getDate()} ${mois[date.getMonth()]}`;

  return {
    id: String(p.id),
    date: p.date_pointage,
    date_formatted: dateStr,
    arrivee: arriveeFmt,
    depart: departFmt,
    duree: calculerDuree(p.heure_arrivee ?? '', p.heure_depart),
    type: pointageType(p.heure_depart),
    chantier_id: p.chantier_id,
    chantier_nom: p.chantier?.nom ?? '',
    localisation: p.chantier?.adresse,
  };
}

// ─── API functions ────────────────────────────────────────────────────────────

/** Historique des pointages de l'employé connecté */
export async function getHistorique(): Promise<Pointage[]> {
  const response = await api.get<{ pointages: BackendPointage[] }>('/mes-pointages');
  return response.pointages.map(formatterPointage);
}

/** Récupère le pointage d'aujourd'hui (s'il existe) pour l'employé connecté */
export async function getPointageAujourdhui(): Promise<BackendPointage | null> {
  try {
    const response = await api.get<{ pointages: BackendPointage[] }>('/mes-pointages');
    const today = new Date().toISOString().slice(0, 10); // "2026-09-05"
    const found = response.pointages.find(p => p.date_pointage === today);
    return found ?? null;
  } catch {
    return null;
  }
}

/** Stats mensuelles calculées depuis les pointages de l'employé */
export async function getStats(): Promise<UserStats> {
  try {
    const pointages = await getHistorique();
    const joursPresents = pointages.filter(p => p.type === 'present').length;
    const partiels = pointages.filter(p => p.type === 'partial').length;

    // Calculer heures travaillées (somme des durées)
    let totalMin = 0;
    for (const p of pointages) {
      if (p.duree && p.duree !== '—') {
        const parts = p.duree.replace('h', ':').split(':');
        totalMin += parseInt(parts[0], 10) * 60 + parseInt(parts[1] ?? '0', 10);
      }
    }
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;

    return {
      jours_presents: joursPresents,
      absences: 0,
      heures_travaillees: `${h}h${m.toString().padStart(2, '0')}`,
    };
  } catch {
    return { jours_presents: 0, absences: 0, heures_travaillees: '0h00' };
  }
}

/** Chantier assigné à l'employé connecté */
export async function getMonChantier(): Promise<BackendChantier | null> {
  try {
    const res = await api.get<{ chantier: BackendChantier | null }>('/mon-affectation');
    return res.chantier ?? null;
  } catch {
    return null;
  }
}

/** Liste tous les chantiers (admin) */
export async function getChantiers(): Promise<BackendChantier[]> {
  const response = await api.get<{ chantiers: BackendChantier[] }>('/chantiers');
  return response.chantiers;
}

/** Valider un pointage (arrivée ou départ) */
export async function validerPointage(data: {
  code_qr: string;
  latitude: number;
  longitude: number;
}): Promise<PointageResponse> {
  return api.post<PointageResponse>('/pointages', data);
}

/** Récupérer un pointage par ID (via l'historique) */
export async function getPointage(id: string): Promise<Pointage> {
  const historque = await getHistorique();
  const p = historque.find(pt => pt.id === id);
  if (!p) throw new Error('Pointage non trouvé');
  return p;
}
