'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';

type TabKey = 'sites' | 'salles' | 'materiel' | 'reservations';

type Site = {
  id: number;
  nom: string;
  ville: string;
};

type Materiel = {
  id: number;
  nom: string;
};

type Equipement = {
  id?: number;
  materielId: number;
  quantite: number;
  materiel?: Materiel | null;
};

type Salle = {
  id: number;
  nom: string;
  capacite: number;
  siteId: number;
  site?: Site | null;
  equipements?: Equipement[];
};

type Reservation = {
  id: number;
  dateDebut: string;
  dateFin: string;
  status?: 'CONFIRMED' | 'CANCELLED';
  statut?: string;
  utilisateurId: number;
  salleId: number;
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
  } | null;
  salle?: {
    id: number;
    nom: string;
  } | null;
};

type ApiListResponse<T> = T[] | { value?: T[] };

const emptySiteForm = { nom: '', ville: '' };
const emptyMaterielForm = { nom: '' };
const emptySalleForm = { nom: '', capacite: '', siteId: '' };

const toNumber = (value: string) => Number.parseInt(value, 10);

const extractArray = <T,>(payload: ApiListResponse<T> | unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { value?: T[] }).value)) {
    return (payload as { value: T[] }).value;
  }

  return [];
};

const formatDateTime = (value: string) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  });
};

const formatDateRange = (dateDebut: string, dateFin: string) => {
  return `${formatDateTime(dateDebut)} → ${formatDateTime(dateFin)}`;
};

const getReservationStatusLabel = (reservation: Reservation, now: Date) => {
  if (reservation.status === 'CANCELLED' || reservation.statut === 'Annulée') {
    return 'Annulée';
  }

  const start = new Date(reservation.dateDebut);
  const end = new Date(reservation.dateFin);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Confirmée';
  }

  if (now < start) return 'Confirmée';
  if (now >= start && now <= end) return 'En cours';
  return 'Terminée';
};

const getReservationStatusClass = (reservation: Reservation, now: Date) => {
  const status = getReservationStatusLabel(reservation, now);

  if (status === 'Annulée') return 'bg-rose-100 text-rose-800';
  if (status === 'En cours') return 'bg-amber-100 text-amber-800';
  if (status === 'Terminée') return 'bg-slate-200 text-slate-700';
  return 'bg-emerald-100 text-emerald-800';
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>('sites');
  const [sites, setSites] = useState<Site[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [siteForm, setSiteForm] = useState(emptySiteForm);
  const [materielForm, setMaterielForm] = useState(emptyMaterielForm);
  const [salleForm, setSalleForm] = useState(emptySalleForm);
  const [newEquipmentMaterialId, setNewEquipmentMaterialId] = useState('');
  const [newEquipmentQuantite, setNewEquipmentQuantite] = useState('1');
  const [salleEquipements, setSalleEquipements] = useState<Array<{ materielId: number; quantite: number }>>([]);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const authHeaders = new Headers({ 'Content-Type': 'application/json' });
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const [sitesResponse, sallesResponse, materielsResponse, reservationsResponse] = await Promise.all([
        fetch(`${API_BASE}/sites`, { headers: authHeaders }),
        fetch(`${API_BASE}/salles`, { headers: authHeaders }),
        fetch(`${API_BASE}/materiel`, { headers: authHeaders }),
        fetch(`${API_BASE}/reservations`, { headers: authHeaders }),
      ]);

      if (!sitesResponse.ok) throw new Error('Impossible de charger les sites');
      if (!sallesResponse.ok) throw new Error('Impossible de charger les salles');
      if (!materielsResponse.ok) throw new Error('Impossible de charger le matériel');
      if (!reservationsResponse.ok) throw new Error('Impossible de charger les réservations');

      const [sitesData, sallesData, materielsData, reservationsData] = await Promise.all([
        sitesResponse.json(),
        sallesResponse.json(),
        materielsResponse.json(),
        reservationsResponse.json(),
      ]);

      setSites(extractArray<Site>(sitesData));
      setSalles(extractArray<Salle>(sallesData));
      setMateriels(extractArray<Materiel>(materielsData));
      setReservations(extractArray<Reservation>(reservationsData));
    } catch (loadError) {
      console.error('Erreur lors du chargement du tableau de bord admin', loadError);
      setError('Impossible de charger les données administratives pour le moment.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      return;
    }

    void Promise.resolve().then(() => {
      void loadData();
    });
  }, [user]);

  const resetForms = () => {
    setSiteForm(emptySiteForm);
    setMaterielForm(emptyMaterielForm);
    setSalleForm(emptySalleForm);
    setNewEquipmentMaterialId('');
    setNewEquipmentQuantite('1');
    setSalleEquipements([]);
  };

  const handleCreateSite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!siteForm.nom.trim() || !siteForm.ville.trim()) {
      setMessage('Le nom et la ville du site sont obligatoires.');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('');

      const authHeaders = new Headers({ 'Content-Type': 'application/json' });
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await fetch(`${API_BASE}/sites`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(siteForm),
      });

      if (!response.ok) {
        throw new Error('La création du site a échoué.');
      }

      await loadData();
      setSiteForm(emptySiteForm);
      setMessage('Site ajouté avec succès.');
    } catch (createError) {
      console.error(createError);
      setMessage('Impossible de créer le site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSite = async (siteId: number) => {
    try {
      setIsSubmitting(true);
      setMessage('');

      const authHeaders = new Headers({ 'Content-Type': 'application/json' });
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await fetch(`${API_BASE}/sites/${siteId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error('La suppression du site a échoué.');
      }

      await loadData();
      setMessage('Site supprimé.');
    } catch (deleteError) {
      console.error(deleteError);
      setMessage('Impossible de supprimer ce site.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMateriel = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!materielForm.nom.trim()) {
      setMessage('Le nom du matériel est obligatoire.');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('');

      const authHeaders = new Headers({ 'Content-Type': 'application/json' });
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await fetch(`${API_BASE}/materiel`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ nom: materielForm.nom }),
      });

      if (!response.ok) {
        throw new Error('La création du matériel a échoué.');
      }

      await loadData();
      setMaterielForm(emptyMaterielForm);
      setMessage('Matériel ajouté avec succès.');
    } catch (createError) {
      console.error(createError);
      setMessage('Impossible de créer le matériel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMateriel = async (materielId: number) => {
    try {
      setIsSubmitting(true);
      setMessage('');

      const authHeaders = new Headers({ 'Content-Type': 'application/json' });
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await fetch(`${API_BASE}/materiel/${materielId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error('La suppression du matériel a échoué.');
      }

      await loadData();
      setMessage('Matériel supprimé.');
    } catch (deleteError) {
      console.error(deleteError);
      setMessage('Impossible de supprimer ce matériel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEquipment = () => {
    if (!newEquipmentMaterialId) {
      setMessage('Choisis un matériel avant de l’ajouter à la salle.');
      return;
    }

    const materialId = toNumber(newEquipmentMaterialId);
    const quantite = Math.max(1, toNumber(newEquipmentQuantite) || 1);

    setSalleEquipements((current) => {
      const existingIndex = current.findIndex((item) => item.materielId === materialId);

      if (existingIndex >= 0) {
        return current.map((item) =>
          item.materielId === materialId ? { ...item, quantite: item.quantite + quantite } : item,
        );
      }

      return [...current, { materielId: materialId, quantite }];
    });

    setNewEquipmentMaterialId('');
    setNewEquipmentQuantite('1');
    setMessage('Équipement ajouté au formulaire de salle.');
  };

  const handleDeleteEquipmentLine = (materielId: number) => {
    setSalleEquipements((current) => current.filter((item) => item.materielId !== materielId));
  };

  const handleCreateSalle = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!salleForm.nom.trim() || !salleForm.capacite || !salleForm.siteId) {
      setMessage('Le nom, la capacité et le site sont obligatoires.');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('');

      const authHeaders = new Headers({ 'Content-Type': 'application/json' });
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await fetch(`${API_BASE}/salles`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          nom: salleForm.nom,
          capacite: Number(salleForm.capacite),
          siteId: Number(salleForm.siteId),
          equipements: salleEquipements,
        }),
      });

      if (!response.ok) {
        throw new Error('La création de la salle a échoué.');
      }

      await loadData();
      setSalleForm(emptySalleForm);
      setSalleEquipements([]);
      setMessage('Salle ajoutée avec succès.');
    } catch (createError) {
      console.error(createError);
      setMessage('Impossible de créer la salle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSalle = async (salleId: number) => {
    try {
      setIsSubmitting(true);
      setMessage('');

      const authHeaders = new Headers({ 'Content-Type': 'application/json' });
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await fetch(`${API_BASE}/salles/${salleId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error('La suppression de la salle a échoué.');
      }

      await loadData();
      setMessage('Salle supprimée.');
    } catch (deleteError) {
      console.error(deleteError);
      setMessage('Impossible de supprimer cette salle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReservation = async (reservationId: number) => {
    try {
      setIsSubmitting(true);
      setMessage('');

      const authHeaders = new Headers({ 'Content-Type': 'application/json' });
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          authHeaders.set('Authorization', `Bearer ${token}`);
        }
      }

      const response = await fetch(`${API_BASE}/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error('L’annulation de la réservation a échoué.');
      }

      await loadData();
      setMessage('Réservation annulée.');
    } catch (deleteError) {
      console.error(deleteError);
      setMessage('Impossible d’annuler cette réservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const tabButtonClass = (tab: TabKey) =>
    [
      'rounded-xl px-4 py-2 text-sm font-semibold transition',
      activeTab === tab
        ? 'bg-slate-950 text-white shadow-sm'
        : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
    ].join(' ');

  return (
    <div className="min-h-[calc(100vh-1rem)] bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-4 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">Inexia-Connect</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Administration globale</h1>
        </header>

        <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <button type="button" onClick={() => setActiveTab('sites')} className={tabButtonClass('sites')}>
            Sites
          </button>
          <button type="button" onClick={() => setActiveTab('salles')} className={tabButtonClass('salles')}>
            Salles
          </button>
          <button type="button" onClick={() => setActiveTab('materiel')} className={tabButtonClass('materiel')}>
            Matériel
          </button>
          <button type="button" onClick={() => setActiveTab('reservations')} className={tabButtonClass('reservations')}>
            Réservations
          </button>
        </nav>

        {message ? (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">{message}</div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-600 shadow-sm">
            Chargement des données administratives...
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    {activeTab === 'sites' && 'Gestion des sites'}
                    {activeTab === 'salles' && 'Gestion des salles'}
                    {activeTab === 'materiel' && 'Gestion du matériel'}
                    {activeTab === 'reservations' && 'Gestion des réservations'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={loadData}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Actualiser
                </button>
              </div>

              {activeTab === 'sites' ? (
                <>
                  <form onSubmit={handleCreateSite} className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_1fr_auto]">
                    <input
                      type="text"
                      value={siteForm.nom}
                      onChange={(event) => setSiteForm((current) => ({ ...current, nom: event.target.value }))}
                      placeholder="Nom du site"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={siteForm.ville}
                      onChange={(event) => setSiteForm((current) => ({ ...current, ville: event.target.value }))}
                      placeholder="Ville"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      Ajouter
                    </button>
                  </form>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Nom</th>
                          <th className="px-4 py-3">Ville</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {sites.map((site) => (
                          <tr key={site.id}>
                            <td className="px-4 py-3 font-medium text-slate-900">{site.nom}</td>
                            <td className="px-4 py-3 text-slate-600">{site.ville}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleDeleteSite(site.id)}
                                disabled={isSubmitting}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}

              {activeTab === 'materiel' ? (
                <>
                  <form onSubmit={handleCreateMateriel} className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto]">
                    <input
                      type="text"
                      value={materielForm.nom}
                      onChange={(event) => setMaterielForm({ nom: event.target.value })}
                      placeholder="Nom du matériel"
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      Ajouter
                    </button>
                  </form>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Matériel</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {materiels.map((materiel) => (
                          <tr key={materiel.id}>
                            <td className="px-4 py-3 font-medium text-slate-900">{materiel.nom}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleDeleteMateriel(materiel.id)}
                                disabled={isSubmitting}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}

              {activeTab === 'salles' ? (
                <>
                  <form onSubmit={handleCreateSalle} className="mb-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        type="text"
                        value={salleForm.nom}
                        onChange={(event) => setSalleForm((current) => ({ ...current, nom: event.target.value }))}
                        placeholder="Nom de la salle"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        min="1"
                        value={salleForm.capacite}
                        onChange={(event) => setSalleForm((current) => ({ ...current, capacite: event.target.value }))}
                        placeholder="Capacité"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                      <select
                        value={salleForm.siteId}
                        onChange={(event) => setSalleForm((current) => ({ ...current, siteId: event.target.value }))}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">Choisir un site</option>
                        {sites.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-sm font-bold text-slate-900">Équipements associés</h3>
                        <span className="text-xs text-slate-500">Ajoute un matériel à la salle</span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
                        <select
                          value={newEquipmentMaterialId}
                          onChange={(event) => setNewEquipmentMaterialId(event.target.value)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="">Choisir un matériel</option>
                          {materiels.map((materiel) => (
                            <option key={materiel.id} value={materiel.id}>
                              {materiel.nom}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={newEquipmentQuantite}
                          onChange={(event) => setNewEquipmentQuantite(event.target.value)}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />

                        <button
                          type="button"
                          onClick={handleAddEquipment}
                          className="rounded-xl border border-slate-300 bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                          Ajouter l’équipement
                        </button>
                      </div>

                      {salleEquipements.length > 0 ? (
                        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                          <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                              <tr>
                                <th className="px-4 py-3">Matériel</th>
                                <th className="px-4 py-3">Quantité</th>
                                <th className="px-4 py-3">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {salleEquipements.map((equipement) => {
                                const material = materiels.find((item) => item.id === equipement.materielId);

                                return (
                                  <tr key={equipement.materielId}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{material?.nom ?? 'Matériel inconnu'}</td>
                                    <td className="px-4 py-3 text-slate-600">{equipement.quantite}</td>
                                    <td className="px-4 py-3">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteEquipmentLine(equipement.materielId)}
                                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                      >
                                        Retirer
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      Ajouter la salle
                    </button>
                  </form>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Salle</th>
                          <th className="px-4 py-3">Capacité</th>
                          <th className="px-4 py-3">Site</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {salles.map((salle) => (
                          <tr key={salle.id}>
                            <td className="px-4 py-3 font-medium text-slate-900">{salle.nom}</td>
                            <td className="px-4 py-3 text-slate-600">{salle.capacite}</td>
                            <td className="px-4 py-3 text-slate-600">{sites.find((site) => site.id === salle.siteId)?.nom ?? salle.site?.nom ?? 'Site inconnu'}</td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleDeleteSalle(salle.id)}
                                disabled={isSubmitting}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}

              {activeTab === 'reservations' ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Début</th>
                        <th className="px-4 py-3">Fin</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">Salle</th>
                        <th className="px-4 py-3">Utilisateur</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {reservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td className="px-4 py-3 text-slate-600">{formatDateTime(reservation.dateDebut)}</td>
                          <td className="px-4 py-3 text-slate-600">{formatDateTime(reservation.dateFin)}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getReservationStatusClass(reservation, currentTime)}`}>
                              {getReservationStatusLabel(reservation, currentTime)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{reservation.salle?.nom ?? `Salle #${reservation.salleId}`}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {reservation.utilisateur ? `${reservation.utilisateur.prenom} ${reservation.utilisateur.nom}` : `Utilisateur #${reservation.utilisateurId}`}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleDeleteReservation(reservation.id)}
                              disabled={isSubmitting}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed"
                            >
                              Annuler
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-1">
              <h2 className="text-lg font-bold text-slate-950">Résumé</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sites</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{sites.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Salles</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{salles.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Matériels</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{materiels.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Réservations</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{reservations.length}</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}