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

type StatPoint = { date: string; taux: number };
type Reservation = { id: number; utilisateur: any; salle: any; dateDebut: string; dateFin: string };
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

function formatPercent(value: number) {
  return `${value.toFixed(0)}%`;
}

export default function DirecteurPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'pilotage' | 'presences' | 'report' | 'admin'>(
    'pilotage',
  );

  const [stats, setStats] = useState<StatPoint[]>([]);
  const [chartStartIndex, setChartStartIndex] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [site, setSite] = useState<{ id: number; nom: string; ville?: string } | null>(null);
  const [profileSiteId, setProfileSiteId] = useState<number | null>(null);
  const [isLoadingSite, setIsLoadingSite] = useState(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [selectedPresenceDate, setSelectedPresenceDate] = useState(() => localDateKey(new Date()));

  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoadingSalles, setIsLoadingSalles] = useState(false);

  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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
    await Promise.all([fetchSite(), fetchStats(), fetchReservationsToday(), fetchSalles()]);
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
      // Expect data.points = [{ date, taux }]
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
  const chartVisibleDataPercent = chartVisibleData.map((point) => ({
    ...point,
    taux: point.taux * 100,
  }));
  const averageOccupancyPercent = stats.length
    ? (stats.reduce((sum, point) => sum + point.taux, 0) / stats.length) * 100
    : null;

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

  async function handlePresenceDateChange(date: string) {
    setSelectedPresenceDate(date);
    await fetchReservationsForDate(date);
  }

  async function handleGenerateReport() {
    if (!user?.siteId) return;
    setIsGeneratingReport(true);
    try {
      const res = await fetch(`${API}/reports/export?siteId=${user.siteId}&from=${reportFrom}&to=${reportTo}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Erreur génération rapport');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${user.siteId}-${reportFrom}-${reportTo}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Erreur génération rapport');
    } finally {
      setIsGeneratingReport(false);
    }
  }

  async function handleEditSalle(updated: Salle, equipments: { materielId: number; quantite: number }[]) {
    try {
      const res = await fetch(`${API}/salles/${updated.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ nom: updated.nom, capacite: updated.capacite, equipements: equipments }),
      });
      if (!res.ok) throw new Error('Erreur mise à jour salle');
      await fetchSalles();
      alert('Salle mise à jour');
    } catch (err) {
      console.error(err);
      alert('Erreur mise à jour');
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
          {formatLocalDate(new Date())}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button className={`px-4 py-2 rounded ${tab === 'pilotage' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`} onClick={() => setTab('pilotage')}>Pilotage</button>
        <button className={`px-4 py-2 rounded ${tab === 'presences' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`} onClick={() => setTab('presences')}>Présences & Alertes</button>
        <button className={`px-4 py-2 rounded ${tab === 'report' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`} onClick={() => setTab('report')}>Reporting métier</button>
        <button className={`px-4 py-2 rounded ${tab === 'admin' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`} onClick={() => setTab('admin')}>Administration de proximité</button>
      </div>

      {tab === 'pilotage' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-white shadow rounded">Taux d'occupation (moyenne): <strong>{averageOccupancyPercent !== null ? formatPercent(averageOccupancyPercent) : '—'}</strong></div>
            <div className="p-4 bg-white shadow rounded">Salles: <strong>{salles.length}</strong></div>
            <div className="p-4 bg-white shadow rounded">Réservations aujourd'hui: <strong>{reservations.length}</strong></div>
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
                  <LineChart data={chartVisibleDataPercent} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                    <XAxis
                      dataKey="date"
                      interval={0}
                      tickFormatter={formatChartDate}
                      minTickGap={8}
                      padding={{ left: 12, right: 12 }}
                    />
                    <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(0)}%`} />
                    <Line type="monotone" dataKey="taux" stroke="#3b82f6" />
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
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td className="p-4 text-gray-500" colSpan={4}>
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
                          {new Date(r.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
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

      {tab === 'report' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white shadow rounded">
            <label className="block">Date début</label>
            <input type="date" className="mt-1 p-2 border rounded w-full" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
          </div>
          <div className="p-4 bg-white shadow rounded">
            <label className="block">Date fin</label>
            <input type="date" className="mt-1 p-2 border rounded w-full" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
          </div>
          <div className="col-span-2 p-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" disabled={isGeneratingReport} onClick={handleGenerateReport}>{isGeneratingReport ? 'Génération...' : 'Générer le rapport'}</button>
          </div>
        </div>
      )}

      {tab === 'admin' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Salles du site</h2>
            <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={fetchSalles}>Rafraîchir</button>
          </div>

          <div className="bg-white shadow rounded p-4">
            {isLoadingSalles ? (
              <div>Chargement salles...</div>
            ) : (
              <div className="space-y-4">
                {salles.map((s) => (
                  <SalleEditor key={s.id} salle={s} onSave={handleEditSalle} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SalleEditor({ salle, onSave }: { salle: Salle; onSave: (s: Salle, eq: { materielId: number; quantite: number }[]) => void }) {
  const [nom, setNom] = useState(salle.nom);
  const [capacite, setCapacite] = useState(salle.capacite);
  const [equipments, setEquipments] = useState<{ materielId: number; quantite: number }[]>([]);

  const save = () => {
    onSave({ ...salle, nom, capacite }, equipments);
  };

  return (
    <div className="border p-3 rounded">
      <div className="mb-2">
        <label className="block text-sm">Nom</label>
        <input className="mt-1 p-2 border rounded w-full" value={nom} onChange={(e) => setNom(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Capacité</label>
        <input type="number" className="mt-1 p-2 border rounded w-full" value={capacite} onChange={(e) => setCapacite(Number(e.target.value))} />
      </div>
      <div className="mb-2">
        <label className="block text-sm">Équipements (gérer côté API)</label>
        <div className="text-xs text-gray-500">Sélectionner des équipements et quantités dans le composant (simplifié ici).</div>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={save}>Enregistrer</button>
      </div>
    </div>
  );
}
