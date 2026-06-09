import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getToken } from './auth';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type RoomAvailability = {
  salleId: number;
  capacity: number;
  occupied: number;
  available: number;
};

export type MobileRoom = {
  id: number;
  nom: string;
  capacite: number;
  etage?: number | null;
  type?: string | null;
  siteId: number;
  equipements?: Array<{
    quantite: number;
    materiel?: {
      nom?: string;
      libelle?: string;
    } | null;
  }>;
};

export type MobileReservation = {
  id: number;
  dateDebut: string;
  dateFin: string;
  status: string;
  statut?: string;
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
  };
  salle: {
    id: number;
    nom: string;
    capacite: number;
    site?: { id: number; nom: string } | null;
    equipements?: Array<{
      quantite: number;
      materiel?: {
        nom?: string;
        libelle?: string;
      } | null;
    }>;
  };
};

export type MobileSite = {
  id: number;
  nom: string;
  ville?: string | null;
};

export type MobileSiteDetail = MobileSite & {
  salles?: MobileRoom[];
};

export type MobileMateriel = {
  id: number;
  nom: string;
  quantiteTotale?: number;
  siteId?: number;
};

export type RoomPayload = {
  nom: string;
  capacite: number;
  siteId: number;
  equipements?: Array<{ materielId: number; quantite: number }>;
};

export async function fetchMyReservations() {
  const response = await api.get<MobileReservation[]>('/reservations/me');
  return response.data;
}

export async function fetchSiteReservations(siteId: number) {
  const response = await api.get<MobileReservation[]>('/reservations', {
    params: { siteId },
  });
  return response.data;
}

export async function fetchRooms(siteId?: number | null) {
  const response = await api.get<MobileRoom[]>('/salles', {
    params: siteId ? { siteId } : undefined,
  });
  return response.data;
}

export async function fetchSites() {
  const response = await api.get<MobileSite[]>('/sites');
  return response.data;
}

export async function fetchSite(siteId: number) {
  const response = await api.get<MobileSiteDetail>(`/sites/${siteId}`);
  return response.data;
}

export async function fetchMateriel() {
  const response = await api.get<MobileMateriel[]>('/materiel');
  return response.data;
}

export async function createRoom(payload: RoomPayload) {
  const response = await api.post('/salles', payload);
  return response.data;
}

export async function updateRoom(roomId: number, payload: RoomPayload) {
  const response = await api.put(`/salles/${roomId}`, payload);
  return response.data;
}

export async function deleteRoom(roomId: number) {
  const response = await api.delete(`/salles/${roomId}`);
  return response.data;
}

export async function fetchAvailability(dateDebut: string, dateFin: string) {
  const response = await api.get<RoomAvailability[]>('/reservations/availability', {
    params: { dateDebut, dateFin },
  });
  return response.data;
}

export async function createReservation(payload: { salleId: number; dateDebut: string; dateFin: string }) {
  const response = await api.post('/reservations', payload);
  return response.data;
}

export async function fetchReservation(reservationId: number) {
  try {
    const response = await api.get<MobileReservation>(`/reservations/${reservationId}`);
    return response.data;
  } catch (err: any) {
    // If backend doesn't expose GET /reservations/:id, fallback to fetching /reservations/me and find it locally
    if (err?.response?.status === 404) {
      const all = await fetchMyReservations();
      const found = all.find((r) => r.id === reservationId);
      if (!found) throw err;
      return found;
    }
    throw err;
  }
}

export async function cancelReservation(reservationId: number) {
  const response = await api.delete(`/reservations/${reservationId}`);
  return response.data;
}
