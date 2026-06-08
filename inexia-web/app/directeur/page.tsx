"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type StatPoint = { date: string; reservations: number };
type Reservation = { id: number; utilisateur: any; salle: any; dateDebut: string; dateFin: string; status?: 'CONFIRMED' | 'CANCELLED'; statut?: string };
type Materiel = { id: number; nom: string };
type SalleEquipment = { id?: number; materielId: number; quantite: number; materiel?: Materiel | null };
type Salle = { id: number; nom: string; capacite: number };

const CHART_WINDOW_SIZE = 7;
const CHART_STEP = 2;
const CHART_TOTAL_DAYS = 37;

function formatLocalDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Paris',
  }).format(date);
}

function formatLocalTime(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  }).format(date);
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatChartDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(year, month - 1, day));
}

function formatCount(value: number) {
  return `${value.toFixed(0)} réservation(s)`;
}

function getReservationStatusLabel(reservation: Reservation, now: Date) {
  if (reservation.statut) {
    return reservation.statut;
  }

  const start = new Date(reservation.dateDebut);
  const end = new Date(reservation.dateFin);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Confirmée';
  }

  if (now < start) return 'Confirmée';
  if (now >= start && now <= end) return 'En cours';
  return 'Terminée';
}

function getReservationStatusClass(reservation: Reservation, now: Date) {
  const status = getReservationStatusLabel(reservation, now);

  if (status === 'Annulée') return 'bg-rose-100 text-rose-800';
  if (status === 'En cours') return 'bg-amber-100 text-amber-800';
  if (status === 'Terminée') return 'bg-slate-200 text-slate-700';
  return 'bg-emerald-100 text-emerald-800';
}

export default function DirecteurPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'pilotage' | 'presences' | 'admin'>('pilotage');

  const [stats, setStats] = useState<StatPoint[]>([]);
  const [chartStartIndex, setChartStartIndex] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [site, setSite] = useState<{ id: number; nom: string; ville?: string } | null>(null);
  const [profileSiteId, setProfileSiteId] = useState<number | null>(null);
  const [isLoadingSite, setIsLoadingSite] = useState(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [selectedPresenceDate, setSelectedPresenceDate] = useState(() => localDateKey(new Date()));
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoadingSalles, setIsLoadingSalles] = useState(false);
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [isLoadingMateriels, setIsLoadingMateriels] = useState(false);
  const [roomMessage, setRoomMessage] = useState('');
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [newSalleForm, setNewSalleForm] = useState({ nom: '', capacite: '' });
  const [newSalleEquipmentRows, setNewSalleEquipmentRows] = useState<Array<{ materielId: string; quantite: string }>>([]);

  useEffect(() => {
    if (!isReady) return;
    if (!user) return; // still loading handled by loader
    if (user.role !== 'DIRECTEUR') {
      router.push('/');
    } else {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, user]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    };
  };
  const API = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:3000';

  const decodeTokenSiteId = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload.siteId ?? null;
    } catch (err) {
      console.debug('Impossible de décoder le JWT', err);
      return null;
    }
  };

  async function loadAll() {
    await ensureUserSiteId();
    await Promise.all([fetchSite(), fetchStats(), fetchReservationsToday(), fetchSalles(), fetchMateriels()]);
  }

  async function ensureUserSiteId() {
    // If user.siteId is already present or token contains it, nothing to do
    const tokenSite = decodeTokenSiteId();
    if (user?.siteId || tokenSite) {
      if (tokenSite && !user?.siteId) {
        // persist to localStorage for consistency
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const u = JSON.parse(stored);
            u.siteId = tokenSite;
            localStorage.setItem('user', JSON.stringify(u));
          }
        } catch (e) {
          console.debug('Erreur écriture localStorage', e);
        }
      }
      return;
    }

    // Otherwise fetch the profile from the API (requires auth)
    try {
      const res = await fetch(`${API}/utilisateurs/${user?.id}`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.siteId) {
        setProfileSiteId(data.siteId);
        try {
          const stored = localStorage.getItem('user');
          if (stored) {
            const u = JSON.parse(stored);
            u.siteId = data.siteId;
            localStorage.setItem('user', JSON.stringify(u));
          }
        } catch (e) {
          console.debug('Erreur écriture localStorage', e);
        }
      }
    } catch (err) {
      console.error('Erreur récupération profil utilisateur', err);
    }
  }

  async function fetchSite() {
    const siteId = user?.siteId ?? decodeTokenSiteId() ?? profileSiteId;
    console.debug('fetchSite siteId from user/token', user?.siteId, siteId);
    if (!siteId) return;
    setIsLoadingSite(true);
    try {
      const res = await fetch(`${API}/sites/${siteId}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Erreur récupération site');
      const data = await res.json();
      setSite(data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSite(false);
    }
  }

  async function fetchStats() {
    const siteId = user?.siteId ?? decodeTokenSiteId() ?? profileSiteId;
    console.debug('fetchStats siteId from user/token', user?.siteId, siteId);
    if (!siteId) return;
    setIsLoadingStats(true);
    try {
      const res = await fetch(`${API}/sites/${siteId}/stats?days=${CHART_TOTAL_DAYS}&startOffset=-6`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Erreur récupération stats');
      const data = await res.json();
      // Expect data.points = [{ date, reservations }]
      setStats(data.points || []);
      setChartStartIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingStats(false);
    }
  }

  const chartVisibleData = stats.slice(chartStartIndex, chartStartIndex + CHART_WINDOW_SIZE);
  const chartMaxStartIndex = Math.max(0, stats.length - CHART_WINDOW_SIZE);
  const averageReservationsPerDay = stats.length
    ? stats.reduce((sum, point) => sum + point.reservations, 0) / stats.length
    : null;
  const activeReservationsToday = reservations.filter(
    (reservation) => reservation.status !== 'CANCELLED' && reservation.statut !== 'Annulée',
  );

  const moveChart = (direction: -1 | 1) => {
    setChartStartIndex((current) => {
      const next = current + direction * CHART_STEP;
      return Math.min(Math.max(next, 0), chartMaxStartIndex);
    });
  };

  const chartRangeLabel =
    chartVisibleData.length > 0
      ? `Du ${formatChartDate(chartVisibleData[0].date)} au ${formatChartDate(chartVisibleData[chartVisibleData.length - 1].date)}`
      : '';

  async function fetchReservationsForDate(date: string) {
    const siteId = user?.siteId ?? decodeTokenSiteId() ?? profileSiteId;
    console.debug('fetchReservationsForDate siteId from user/token', user?.siteId, siteId, date);
    if (!siteId) return;
    setIsLoadingReservations(true);
    try {
      const res = await fetch(`${API}/reservations?siteId=${siteId}&date=${date}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Erreur récupération réservations');
      const data = await res.json();
      setReservations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReservations(false);
    }
  }

  async function fetchReservationsToday() {
    return fetchReservationsForDate(selectedPresenceDate);
  }

  async function deleteReservation(id: number) {
    try {
      const res = await fetch(`${API}/reservations/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Impossible de supprimer');
      // refresh
      await fetchReservationsToday();
    } catch (err) {
      console.error(err);
      alert('Erreur suppression réservation');
    }
  }

  async function fetchSalles() {
    const siteId = user?.siteId ?? decodeTokenSiteId() ?? profileSiteId;
    console.debug('fetchSalles siteId from user/token', user?.siteId, siteId);
    if (!siteId) return;
    setIsLoadingSalles(true);
    try {
      const res = await fetch(`${API}/salles?siteId=${siteId}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Erreur récupération salles');
      const data = await res.json();
      setSalles(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSalles(false);
    }
  }

  async function fetchMateriels() {
    setIsLoadingMateriels(true);
    try {
      const res = await fetch(`${API}/materiel`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Erreur récupération matériel');
      const data = await res.json();
      setMateriels(Array.isArray(data) ? data : data?.value ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMateriels(false);
    }
  }

  async function handlePresenceDateChange(date: string) {
    setSelectedPresenceDate(date);
    await fetchReservationsForDate(date);
  }

  const normalizeEquipmentRows = (rows: Array<{ materielId: string; quantite: string }>) =>
    rows
      .map((row) => ({
        materielId: Number(row.materielId),
        quantite: Number(row.quantite),
      }))
      .filter((row) => Number.isFinite(row.materielId) && row.materielId > 0 && Number.isFinite(row.quantite) && row.quantite > 0);

  async function handleCreateSalle() {
    const siteId = user?.siteId ?? decodeTokenSiteId() ?? profileSiteId;
    if (!siteId) return;

    if (!newSalleForm.nom.trim() || !newSalleForm.capacite.trim()) {
      setRoomMessage('Le nom et la capacité sont obligatoires.');
      return;
    }

    const capacite = Number(newSalleForm.capacite);
    if (!Number.isFinite(capacite) || capacite <= 0) {
      setRoomMessage('La capacité doit être un nombre positif.');
      return;
    }

    const equipements = normalizeEquipmentRows(newSalleEquipmentRows);

    try {
      setIsSavingRoom(true);
      setRoomMessage('');

      const res = await fetch(`${API}/salles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nom: newSalleForm.nom.trim(),
          capacite,
          siteId,
          equipements,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur création salle');
      }

      setNewSalleForm({ nom: '', capacite: '' });
      setNewSalleEquipmentRows([]);
      await fetchSalles();
      setRoomMessage('Salle créée avec succès.');
    } catch (err) {
      console.error(err);
      setRoomMessage('Impossible de créer la salle.');
    } finally {
      setIsSavingRoom(false);
    }
  }

  async function handleEditSalle(updated: { id: number; nom: string; capacite: number }, equipments: { materielId: number; quantite: number }[]) {
    try {
      setRoomMessage('');
      setIsSavingRoom(true);
      const res = await fetch(`${API}/salles/${updated.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nom: updated.nom,
          capacite: updated.capacite,
          siteId: user?.siteId ?? decodeTokenSiteId() ?? profileSiteId ?? undefined,
          equipements: equipments,
        }),
      });
      if (!res.ok) throw new Error('Erreur mise à jour salle');
      await fetchSalles();
      alert('Salle mise à jour');
    } catch (err) {
      console.error(err);
      alert('Erreur mise à jour');
    } finally {
      setIsSavingRoom(false);
    }
  }

  async function handleDeleteSalle(id: number) {
    if (!confirm('Supprimer cette salle ?')) return;

    try {
      setRoomMessage('');
      setIsSavingRoom(true);
      const res = await fetch(`${API}/salles/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const backendMessage = Array.isArray(body?.message) ? body.message[0] : body?.message;
        throw new Error(backendMessage ?? 'Erreur suppression salle');
      }

      await fetchSalles();
      setRoomMessage('Salle supprimée.');
    } catch (err) {
      console.error(err);
      setRoomMessage(err instanceof Error ? err.message : 'Impossible de supprimer cette salle.');
    } finally {
      setIsSavingRoom(false);
    }
  }

  if (!isReady || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-700">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Espace Directeur</h1>
        <div className="text-sm text-gray-600 mt-1">
          {isLoadingSite ? 'Chargement du site...' : site ? `${site.nom}${site.ville ? ' — ' + site.ville : ''}` : (user.siteId ? `Site #${user.siteId}` : '—')}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {formatLocalDate(currentDateTime)} à {formatLocalTime(currentDateTime)}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button className={`px-4 py-2 rounded ${tab === 'pilotage' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`} onClick={() => setTab('pilotage')}>Pilotage</button>
        <button className={`px-4 py-2 rounded ${tab === 'presences' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`} onClick={() => setTab('presences')}>Présences & Alertes</button>
        <button className={`px-4 py-2 rounded ${tab === 'admin' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`} onClick={() => setTab('admin')}>Administration de proximité</button>
      </div>

      {tab === 'pilotage' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white shadow rounded">Réservations moyennes/jour: <strong>{averageReservationsPerDay !== null ? formatCount(averageReservationsPerDay) : '—'}</strong></div>
            <div className="p-4 bg-white shadow rounded">Salles: <strong>{salles.length}</strong></div>
            <div className="p-4 bg-white shadow rounded">Réservations aujourd'hui: <strong>{activeReservationsToday.length}</strong></div>
          </div>

          <div className="p-4 bg-white shadow rounded h-72">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
                onClick={() => moveChart(-1)}
                disabled={chartStartIndex === 0 || isLoadingStats}
              >
                ←
              </button>
              <div className="text-sm text-gray-600">{chartRangeLabel}</div>
              <button
                type="button"
                className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 disabled:opacity-40"
                onClick={() => moveChart(1)}
                disabled={chartStartIndex >= chartMaxStartIndex || isLoadingStats}
              >
                →
              </button>
            </div>
            {isLoadingStats ? (
              <div>Chargement graphique...</div>
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartVisibleData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                    <XAxis
                      dataKey="date"
                      interval={0}
                      tickFormatter={formatChartDate}
                      minTickGap={8}
                      padding={{ left: 12, right: 12 }}
                    />
                    <YAxis tickFormatter={(value) => `${value}`} allowDecimals={false} />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(0)} réservation(s)`} />
                    <Line type="monotone" dataKey="reservations" stroke="#3b82f6" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'presences' && (
        <div>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Date des réservations</label>
              <input
                type="date"
                className="p-2 border rounded bg-white text-gray-900"
                value={selectedPresenceDate}
                onChange={(e) => handlePresenceDateChange(e.target.value)}
              />
            </div>
            <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={fetchReservationsToday}>Rafraîchir</button>
          </div>
          <div className="bg-white shadow rounded overflow-auto">
            {isLoadingReservations ? (
              <div className="p-4">Chargement...</div>
            ) : (
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Collaborateur</th>
                    <th className="p-2">Salle</th>
                    <th className="p-2">Heure</th>
                    <th className="p-2">Statut</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td className="p-4 text-gray-500" colSpan={5}>
                        Aucune réservation trouvée pour cette date.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((r) => (
                      <tr key={r.id} className="border-b">
                        <td className="p-2">{r.utilisateur?.prenom} {r.utilisateur?.nom}</td>
                        <td className="p-2">{r.salle?.nom}</td>
                        <td className="p-2">
                          {new Date(r.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                          {' '}
                          →{' '}
                          {new Date(r.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })}
                        </td>
                        <td className="p-2">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getReservationStatusClass(r, currentDateTime)}`}>
                            {getReservationStatusLabel(r, currentDateTime)}
                          </span>
                        </td>
                        <td className="p-2">
                          <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => deleteReservation(r.id)}>Libérer le poste</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'admin' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">Gestion des salles du site</h2>
              <p className="text-sm text-gray-500">Créer, modifier et supprimer les salles de l’agence connectée.</p>
            </div>
            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => { void fetchSalles(); void fetchMateriels(); }}>
              Rafraîchir
            </button>
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-base font-semibold text-gray-800">Créer une salle</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  className="mt-1 w-full rounded border border-gray-300 bg-white p-2"
                  value={newSalleForm.nom}
                  onChange={(event) => setNewSalleForm((current) => ({ ...current, nom: event.target.value }))}
                  placeholder="Salle A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacité</label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full rounded border border-gray-300 bg-white p-2"
                  value={newSalleForm.capacite}
                  onChange={(event) => setNewSalleForm((current) => ({ ...current, capacite: event.target.value }))}
                  placeholder="12"
                />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-gray-700">Équipements</h4>
                <button
                  type="button"
                  className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white"
                  onClick={() => setNewSalleEquipmentRows((current) => [...current, { materielId: '', quantite: '1' }])}
                >
                  Ajouter une ligne
                </button>
              </div>

              {newSalleEquipmentRows.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">Aucun équipement ajouté pour le moment.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {newSalleEquipmentRows.map((row, index) => (
                    <div key={`new-room-eq-${index}`} className="grid gap-2 md:grid-cols-[1fr_120px_auto]">
                      <select
                        className="rounded border border-gray-300 bg-white p-2"
                        value={row.materielId}
                        onChange={(event) => {
                          const value = event.target.value;
                          setNewSalleEquipmentRows((current) => current.map((currentRow, currentIndex) => currentIndex === index ? { ...currentRow, materielId: value } : currentRow));
                        }}
                      >
                        <option value="">Matériel</option>
                        {materiels.map((materiel) => (
                          <option key={materiel.id} value={materiel.id}>
                            {materiel.nom}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        className="rounded border border-gray-300 bg-white p-2"
                        value={row.quantite}
                        onChange={(event) => {
                          const value = event.target.value;
                          setNewSalleEquipmentRows((current) => current.map((currentRow, currentIndex) => currentIndex === index ? { ...currentRow, quantite: value } : currentRow));
                        }}
                        placeholder="Qté"
                      />
                      <button
                        type="button"
                        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                        onClick={() => setNewSalleEquipmentRows((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                onClick={() => void handleCreateSalle()}
                disabled={isSavingRoom || isLoadingMateriels}
              >
                {isSavingRoom ? 'Enregistrement...' : 'Créer la salle'}
              </button>
              <span className="text-sm text-gray-500">
                {isLoadingMateriels ? 'Chargement du matériel...' : `${materiels.length} matériel(s) disponible(s)`}
              </span>
            </div>

            {roomMessage ? <div className="mt-3 rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">{roomMessage}</div> : null}
          </div>

          <div className="bg-white shadow rounded p-4">
            {isLoadingSalles ? (
              <div>Chargement salles...</div>
            ) : (
              <div className="space-y-4">
                {salles.map((s) => (
                  <SalleEditor
                    key={s.id}
                    salle={s}
                    materiels={materiels}
                    isBusy={isSavingRoom}
                    onSave={handleEditSalle}
                    onDelete={handleDeleteSalle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SalleEditor({
  salle,
  materiels,
  isBusy,
  onSave,
  onDelete,
}: {
  salle: Salle & { equipements?: SalleEquipment[] };
  materiels: Materiel[];
  isBusy: boolean;
  onSave: (s: { id: number; nom: string; capacite: number }, eq: { materielId: number; quantite: number }[]) => void;
  onDelete: (id: number) => void;
}) {
  const [nom, setNom] = useState(salle.nom);
  const [capacite, setCapacite] = useState(salle.capacite);
  const [equipments, setEquipments] = useState<{ materielId: string; quantite: string }[]>(
    (salle.equipements ?? []).map((equipement) => ({
      materielId: String(equipement.materielId),
      quantite: String(equipement.quantite),
    })),
  );

  const save = () => {
    onSave(
      { id: salle.id, nom, capacite },
      equipments
        .map((row) => ({ materielId: Number(row.materielId), quantite: Number(row.quantite) }))
        .filter((row) => Number.isFinite(row.materielId) && row.materielId > 0 && Number.isFinite(row.quantite) && row.quantite > 0),
    );
  };

  const equipmentLabel = (equipment: SalleEquipment) => {
    const name = equipment.materiel?.nom ?? materiels.find((materiel) => materiel.id === equipment.materielId)?.nom ?? 'Matériel inconnu';
    return `${equipment.quantite} x ${name}`;
  };

  return (
    <div className="rounded border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Salle #{salle.id}</h3>
          <p className="text-sm text-gray-500">{salle.equipements?.length ? salle.equipements.map(equipmentLabel).join(' · ') : 'Aucun équipement associé'}</p>
        </div>
        <button
          type="button"
          className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 disabled:opacity-50"
          onClick={() => onDelete(salle.id)}
          disabled={isBusy}
        >
          Supprimer
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input className="mt-1 w-full rounded border border-gray-300 p-2" value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Capacité</label>
          <input type="number" className="mt-1 w-full rounded border border-gray-300 p-2" value={capacite} onChange={(e) => setCapacite(Number(e.target.value))} />
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-700">Équipements</h4>
          <button
            type="button"
            className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white"
            onClick={() => setEquipments((current) => [...current, { materielId: '', quantite: '1' }])}
          >
            Ajouter une ligne
          </button>
        </div>

        {equipments.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">Aucun équipement configuré.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {equipments.map((row, index) => (
              <div key={`${salle.id}-eq-${index}`} className="grid gap-2 md:grid-cols-[1fr_120px_auto]">
                <select
                  className="rounded border border-gray-300 bg-white p-2"
                  value={row.materielId}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEquipments((current) => current.map((currentRow, currentIndex) => currentIndex === index ? { ...currentRow, materielId: value } : currentRow));
                  }}
                >
                  <option value="">Matériel</option>
                  {materiels.map((materiel) => (
                    <option key={materiel.id} value={materiel.id}>
                      {materiel.nom}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="rounded border border-gray-300 bg-white p-2"
                  value={row.quantite}
                  onChange={(event) => {
                    const value = event.target.value;
                    setEquipments((current) => current.map((currentRow, currentIndex) => currentIndex === index ? { ...currentRow, quantite: value } : currentRow));
                  }}
                />
                <button
                  type="button"
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
                  onClick={() => setEquipments((current) => current.filter((_, currentIndex) => currentIndex !== index))}
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="rounded bg-green-600 px-3 py-2 text-white disabled:opacity-50" onClick={save} disabled={isBusy}>Enregistrer</button>
      </div>
    </div>
  );
}
