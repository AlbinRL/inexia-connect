'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';

type Site = {
  id: number;
  nom: string;
  ville: string;
  salles?: Salle[];
};

type Materiel = {
  id: number;
  nom: string;
};

type Equipement = {
  quantite: number;
  materiel?: Materiel | null;
};

type RoomAvailability = {
  salleId: number;
  capacity: number;
  occupied: number;
  available: number;
};

type Salle = {
  id: number;
  nom: string;
  capacite: number;
  siteId: number;
  equipements?: Equipement[];
};

type ApiListResponse<T> = T[] | { value?: T[] };

const extractArray = <T,>(payload: ApiListResponse<T> | unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && Array.isArray((payload as { value?: T[] }).value)) {
    return (payload as { value: T[] }).value;
  }

  return [];
};

const normalizeText = (value: string | number) => String(value).trim().toLowerCase();

export default function ReservationPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();

  const [sites, setSites] = useState<Site[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('all');
  const [search, setSearch] = useState('');
  const [reservationStart, setReservationStart] = useState('');
  const [reservationEnd, setReservationEnd] = useState('');
  const [availabilityByRoomId, setAvailabilityByRoomId] = useState<Record<number, RoomAvailability>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reservingSalleId, setReservingSalleId] = useState<number | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!user) {
      router.push('/');
    }
  }, [isReady, user, router]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [sitesResponse, sallesResponse] = await Promise.all([
          fetch('http://localhost:3000/sites'),
          fetch('http://localhost:3000/salles'),
        ]);

        if (!sitesResponse.ok) {
          throw new Error('Impossible de charger les sites.');
        }

        if (!sallesResponse.ok) {
          throw new Error('Impossible de charger les salles.');
        }

        const [sitesData, sallesData] = await Promise.all([sitesResponse.json(), sallesResponse.json()]);

        setSites(extractArray<Site>(sitesData));
        setSalles(extractArray<Salle>(sallesData));
      } catch (loadError) {
        console.error('Erreur lors du chargement des réservations', loadError);
        setError('Impossible de charger les salles et les équipements pour le moment.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const allRooms = useMemo(() => {
    const fromSites = sites.flatMap((site) => site.salles ?? []);
    return salles.length > 0 ? salles : fromSites;
  }, [sites, salles]);

  const filteredRooms = useMemo(() => {
    const term = normalizeText(search);

    return allRooms.filter((room) => {
      const siteName = sites.find((site) => site.id === room.siteId)?.nom ?? '';
      const matchesSite = selectedSiteId === 'all' || String(room.siteId) === selectedSiteId;
      const matchesSearch =
        term.length === 0 ||
        normalizeText(room.nom).includes(term) ||
        normalizeText(siteName).includes(term);

      return matchesSite && matchesSearch;
    });
  }, [allRooms, search, selectedSiteId, sites]);

  const selectedSlot = useMemo(() => {
    if (!reservationStart || !reservationEnd) {
      return null;
    }

    const startDate = new Date(reservationStart);
    const endDate = new Date(reservationEnd);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      return null;
    }

    return { startDate, endDate };
  }, [reservationEnd, reservationStart]);

  useEffect(() => {
    if (!selectedSlot) {
      setAvailabilityByRoomId({});
      setAvailabilityError('');
      setAvailabilityLoading(false);
      return;
    }

    let isActive = true;

    const loadAvailability = async () => {
      try {
        setAvailabilityLoading(true);
        setAvailabilityError('');

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          return;
        }

        const availabilityUrl = new URL('http://localhost:3000/reservations/availability');
        availabilityUrl.searchParams.set('dateDebut', selectedSlot.startDate.toISOString());
        availabilityUrl.searchParams.set('dateFin', selectedSlot.endDate.toISOString());

        const response = await fetch(availabilityUrl.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Impossible de calculer la disponibilité.');
        }

        const payload = (await response.json()) as RoomAvailability[] | { value?: RoomAvailability[] };
        const entries = Array.isArray(payload) ? payload : payload.value ?? [];

        if (!isActive) {
          return;
        }

        const nextAvailability = Object.fromEntries(entries.map((entry) => [entry.salleId, entry]));
        setAvailabilityByRoomId(nextAvailability);
      } catch (availabilityFetchError) {
        console.error(availabilityFetchError);

        if (isActive) {
          setAvailabilityByRoomId({});
          setAvailabilityError('La disponibilité ne peut pas être calculée pour le moment.');
        }
      } finally {
        if (isActive) {
          setAvailabilityLoading(false);
        }
      }
    };

    void loadAvailability();

    return () => {
      isActive = false;
    };
  }, [selectedSlot]);

  const handleReservation = async (salleId: number) => {
    if (!selectedSlot) {
      setMessage('Choisis une date de début et une date de fin avant de réserver.');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setMessage('Tu dois être connecté pour réserver une salle.');
      return;
    }

    try {
      setReservingSalleId(salleId);
      setMessage('');

      const response = await fetch('http://localhost:3000/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dateDebut: selectedSlot.startDate.toISOString(),
          dateFin: selectedSlot.endDate.toISOString(),
          salleId,
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
        const backendMessage = Array.isArray(errorBody?.message)
          ? errorBody?.message[0]
          : errorBody?.message;

        if (response.status === 409) {
          setMessage(backendMessage ?? 'La salle est déjà complète sur ce créneau.');
        } else {
          setMessage(backendMessage ?? 'La réservation a échoué.');
        }

        return;
      }

      setMessage('Réservation envoyée avec succès.');
      router.push('/dashboard');
    } catch (reservationError) {
      console.error(reservationError);
      setMessage('Impossible de créer la réservation pour le moment.');
    } finally {
      setReservingSalleId(null);
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-full px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Chargement de la session...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Inexia-Connect</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Nouvelle réservation</h1>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-sm font-semibold text-slate-700">Début de réservation</label>
            <input
              type="datetime-local"
              value={reservationStart}
              onChange={(event) => setReservationStart(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <label className="mt-4 block text-sm font-semibold text-slate-700">Fin de réservation</label>
            <input
              type="datetime-local"
              value={reservationEnd}
              onChange={(event) => setReservationEnd(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <label className="mt-4 block text-sm font-semibold text-slate-700">Site</label>
            <select
              value={selectedSiteId}
              onChange={(event) => setSelectedSiteId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">Tous les sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.nom} - {site.ville}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-semibold text-slate-700">Rechercher une salle</label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nom de salle ou site"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            {message ? <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">{message}</div> : null}
            {error ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div> : null}
            {availabilityError ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                {availabilityError}
              </div>
            ) : null}
          </aside>

          <main className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Salles disponibles</h2>
              </div>
              <button
                type="button"
                onClick={() => void router.push('/dashboard')}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Retour au planning
              </button>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
                Chargement des salles et du matériel...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
                Aucune salle ne correspond à tes filtres.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filteredRooms.map((room) => {
                  const siteName = sites.find((site) => site.id === room.siteId)?.nom ?? 'Site inconnu';
                  const availability = selectedSlot ? availabilityByRoomId[room.id] : null;
                  const remainingPlaces = availability?.available ?? room.capacite;
                  const isFullForSlot = Boolean(selectedSlot && availability && availability.available <= 0);
                  const availabilityLabel = selectedSlot
                    ? availabilityLoading && !availability
                      ? 'Calcul de la disponibilité...'
                      : `${remainingPlaces} place(s) restante(s) sur ce créneau`
                    : `${room.capacite} place(s) disponibles par défaut`;

                  const availabilityBoxClass = selectedSlot
                    ? isFullForSlot
                      ? 'border-rose-200 bg-rose-50 text-rose-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-100 text-slate-700';

                  return (
                    <article key={room.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-950">{room.nom}</h3>
                          <p className="text-sm text-slate-600">
                            {siteName} • {room.capacite} places
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Équipements</p>
                        {room.equipements && room.equipements.length > 0 ? (
                          <ul className="mt-3 space-y-2 text-sm text-slate-700">
                            {room.equipements.map((equipement, index) => (
                              <li key={`${room.id}-${equipement.materiel?.id ?? index}`} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                                <span>{equipement.materiel?.nom ?? 'Matériel inconnu'}</span>
                                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                                  x{equipement.quantite}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-slate-500">Aucun équipement renseigné.</p>
                        )}
                      </div>

                      <div className={`mt-4 rounded-xl border px-3 py-2.5 ${availabilityBoxClass}`}>
                        <p className="text-[11px] font-bold uppercase tracking-wide opacity-80">
                          {selectedSlot ? 'Disponibilité sur ce créneau' : 'Capacité de la salle'}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold">{availabilityLabel}</p>
                        {selectedSlot && availability ? (
                          <p className="mt-0.5 text-[11px] font-medium opacity-70">
                            {availability.occupied} réservation(s) déjà prévue(s) sur cette salle.
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleReservation(room.id)}
                        disabled={reservingSalleId === room.id || isFullForSlot}
                        className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                      >
                        {reservingSalleId === room.id
                          ? 'Réservation en cours...'
                          : isFullForSlot
                            ? 'Créneau complet'
                            : 'Réserver cette salle'}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}