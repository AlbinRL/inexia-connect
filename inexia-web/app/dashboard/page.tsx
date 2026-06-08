"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "next/navigation";

type Reservation = {
  id: string | number;
  dateDebut: string;
  dateFin: string;
  status?: 'CONFIRMED' | 'CANCELLED';
  userId?: number | string;
  utilisateurId?: number | string;
  user?: {
    id?: number | string;
  };
  utilisateur?: {
    id?: number | string;
  };
  salle?: {
    id?: number | string;
    nom?: string;
    site?: {
      nom?: string;
    };
    equipements?: Array<{
      quantite?: number;
      materiel?: {
        nom?: string;
      } | null;
    }>;
  };
  statut?: string;
};

export default function DashboardPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState("");
  const [deletingReservationId, setDeletingReservationId] = useState<string | number | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!user) {
      router.push("/");
      return;
    }

    const fetchReservations = async () => {
      try {
        setLoadingReservations(true);
        setReservationsError("");

        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/reservations/me', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) {
          throw new Error('Impossible de charger vos réservations.');
        }

        const data = await res.json();
        setReservations(data);
      } catch (error) {
        console.error("Erreur lors de la récupération du planning", error);
        setReservations([]);
        setReservationsError(error instanceof Error ? error.message : "Le service de réservation est momentanément indisponible.");
      } finally {
        setLoadingReservations(false);
      }
    };

    fetchReservations();
  }, [user, isReady, router]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const weekDays = useMemo(() => {
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    baseDate.setDate(baseDate.getDate() + weekOffset * 7);

    const startOfWeek = new Date(baseDate);
    const dayIndex = (startOfWeek.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - dayIndex);

    return Array.from({ length: 5 }, (_, index) => {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + index);
      return currentDate;
    });
  }, [weekOffset]);

  const weeklyReservations = useMemo(() => {
    return weekDays.map((day) => {
      const dayKey = day.toDateString();

      const reservationsForDay = reservations.filter((reservation) => {
        const start = new Date(reservation.dateDebut);
        return !Number.isNaN(start.getTime()) && start.toDateString() === dayKey;
      }).sort((left, right) => new Date(left.dateDebut).getTime() - new Date(right.dateDebut).getTime());

      return {
        day,
        reservations: reservationsForDay,
      };
    });
  }, [reservations, weekDays]);

  const reservationHistory = useMemo(() => {
    return [...reservations].sort((left, right) => new Date(right.dateDebut).getTime() - new Date(left.dateDebut).getTime());
  }, [reservations]);

  const formatEquipmentList = (reservation: Reservation) => {
    const equipements = reservation.salle?.equipements ?? [];

    if (equipements.length === 0) {
      return 'Aucun équipement renseigné';
    }

    return equipements
      .map((equipement) => `${equipement.quantite ?? 1} x ${equipement.materiel?.nom ?? 'Matériel inconnu'}`)
      .join(' · ');
  };

  const formatDayLabel = (date: Date) =>
    date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).replace('.', '');

  const formatRange = (date: Date) =>
    date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatReservationTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '--:--';
    }

    return parsed.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    });
  };

  if (!isReady) return null;

  if (!user) return null;

  const upcomingCount = reservations.length;

  const getReservationLabel = (reservation: Reservation) => {
    if (reservation.status === 'CANCELLED' || reservation.statut === 'Annulée') {
      return 'Annulée';
    }

    const start = new Date(reservation.dateDebut);
    const end = new Date(reservation.dateFin);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return reservation.statut ?? 'Confirmée';
    }

    if (currentTime < start) {
      return 'Confirmée';
    }

    if (currentTime >= start && currentTime <= end) {
      return 'En cours';
    }

    return 'Terminée';
  };

  const getReservationBadgeClass = (reservation: Reservation) => {
    const status = getReservationLabel(reservation);
    if (status === 'Annulée') {
      return 'bg-rose-100 text-rose-800';
    }

    if (status === 'En cours') {
      return 'bg-amber-100 text-amber-800';
    }

    if (status === 'Terminée') {
      return 'bg-slate-200 text-slate-700';
    }

    return 'bg-emerald-100 text-emerald-800';
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.18)] md:px-8 md:py-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-blue-600">TABLEAU DE BORD</p>
          <div className="mt-1 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Bonjour, {user.prenom}.
            </h1>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Réservations</p>
                <p className="text-xl font-black text-slate-900">{upcomingCount}</p>
              </div>
              <button
                onClick={() => {
                  router.push('/reservation');
                }}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                + Nouvelle Réservation
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.14)]">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Votre Semaine</h2>
              <p className="text-sm text-slate-500">
                {formatRange(weekDays[0])} - {formatRange(weekDays[weekDays.length - 1])}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekOffset((current) => current - 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                aria-label="Semaine précédente"
              >
                <span className="text-lg">‹</span>
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cette semaine
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((current) => current + 1)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100"
                aria-label="Semaine suivante"
              >
                <span className="text-lg">›</span>
              </button>
            </div>
          </div>

          {loadingReservations ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
              Chargement de votre planning...
            </div>
          ) : reservationsError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              {reservationsError}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
              {weeklyReservations.map(({ day, reservations: dayReservations }) => (
                <section key={day.toDateString()} className="min-h-[320px] rounded-3xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{formatDayLabel(day)}</h3>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      {dayReservations.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {dayReservations.length === 0 ? (
                      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-3 text-center text-sm text-slate-400">
                        Aucune réservation
                      </div>
                    ) : (
                      dayReservations.map((reservation) => (
                        <article
                          key={reservation.id}
                          className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="mt-1 text-sm font-black text-slate-950">
                                {reservation.salle?.site?.nom ?? 'Site inconnu'}
                              </h4>
                              <p className="text-sm text-slate-500">{reservation.salle?.nom ?? 'Salle inconnue'}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getReservationBadgeClass(reservation)}`}>
                              {getReservationLabel(reservation)}
                            </span>
                          </div>

                          <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                            {formatReservationTime(reservation.dateDebut)} → {formatReservationTime(reservation.dateFin)}
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
                            <button
                              type="button"
                              disabled={deletingReservationId !== null}
                              onClick={async () => {
                                if (!confirm("Confirmer l'annulation de cette réservation ?")) return;

                                try {
                                  setDeletingReservationId(reservation.id ?? null);
                                  const token = localStorage.getItem('token');
                                  const response = await fetch(`http://localhost:3000/reservations/${reservation.id}`, {
                                    method: 'DELETE',
                                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                                  });

                                  if (!response.ok) {
                                    const body = await response.json().catch(() => null);
                                    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
                                    setReservationsError(message ?? "Impossible d'annuler la réservation.");
                                    return;
                                  }

                                  setReservations((current) => current.filter((currentReservation) => String(currentReservation.id) !== String(reservation.id)));
                                } catch (error) {
                                  console.error('Erreur annulation réservation', error);
                                  setReservationsError("Erreur lors de l'annulation.");
                                } finally {
                                  setDeletingReservationId(null);
                                }
                              }}
                              className="rounded-full bg-rose-600 px-3 py-1.5 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Annuler
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.14)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Historique des réservations</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {reservationHistory.length} réservation(s)
            </span>
          </div>

          {reservationHistory.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Aucun historique pour le moment.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {reservationHistory.map((reservation) => {
                const start = new Date(reservation.dateDebut);
                const end = new Date(reservation.dateFin);
                const isValid = !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime());

                return (
                  <article
                    key={`history-${reservation.id}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="mt-1 text-base font-black text-slate-950">
                          {reservation.salle?.site?.nom ?? 'Site inconnu'} - {reservation.salle?.nom ?? 'Salle inconnue'}
                        </h3>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getReservationBadgeClass(reservation)}`}>
                        {getReservationLabel(reservation)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 rounded-2xl bg-white p-3 text-sm text-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Début</span>
                        <span className="font-semibold text-slate-900">
                          {isValid ? start.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date inconnue'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Créneau</span>
                        <span className="font-semibold text-slate-900">
                          {formatReservationTime(reservation.dateDebut)} → {formatReservationTime(reservation.dateFin)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Salle</span>
                        <span className="font-semibold text-slate-900">{reservation.salle?.nom ?? 'Salle inconnue'}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-500">Équipements</span>
                        <span className="text-xs font-medium leading-relaxed text-slate-700">
                          {formatEquipmentList(reservation)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <button
                        type="button"
                        disabled={deletingReservationId !== null}
                        onClick={async () => {
                          if (!confirm("Confirmer l'annulation de cette réservation ?")) return;

                          try {
                            setDeletingReservationId(reservation.id ?? null);
                            const token = localStorage.getItem('token');
                            const response = await fetch(`http://localhost:3000/reservations/${reservation.id}`, {
                              method: 'DELETE',
                              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                            });

                            if (!response.ok) {
                              const body = await response.json().catch(() => null);
                              const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
                              setReservationsError(message ?? "Impossible d'annuler la réservation.");
                              return;
                            }

                            setReservations((current) => current.filter((currentReservation) => String(currentReservation.id) !== String(reservation.id)));
                          } catch (error) {
                            console.error('Erreur annulation réservation', error);
                            setReservationsError("Erreur lors de l'annulation.");
                          } finally {
                            setDeletingReservationId(null);
                          }
                        }}
                        className="rounded-full bg-rose-600 px-3 py-1.5 font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}