"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "next/navigation";

type Reservation = {
  id: string | number;
  dateDebut: string;
  dateFin: string;
  userId?: number | string;
  utilisateurId?: number | string;
  user?: {
    id?: number | string;
  };
  utilisateur?: {
    id?: number | string;
  };
  salle?: {
    nom?: string;
    site?: {
      nom?: string;
    };
  };
  statut?: string;
};

export default function DashboardPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationsError, setReservationsError] = useState("");

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

  if (!isReady) return null;

  if (!user) return null;

  const upcomingCount = reservations.length;
  const [deletingReservationId, setDeletingReservationId] = useState<string | number | null>(null);

  return (
    <div className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-950/85 p-4 text-white shadow-[0_24px_70px_-35px_rgba(15,23,42,0.7)] backdrop-blur md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300">Dashboard</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Mes réservations</h1>
          <p className="mt-1 text-sm text-slate-300">Retrouve ici toutes tes réservations à venir.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right">
            <p className="text-[11px] uppercase tracking-wide text-slate-300">Réservations</p>
            <p className="text-xl font-black text-white">{upcomingCount}</p>
          </div>
          <button
            onClick={() => {
              router.push("/reservation");
            }}
            className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            + Nouvelle Réservation
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-[0_24px_70px_-35px_rgba(15,23,42,0.25)] backdrop-blur">
        {loadingReservations ? (
          <div className="py-10 text-center text-slate-500">Chargement de vos réservations...</div>
        ) : reservationsError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {reservationsError}
          </div>
        ) : reservations.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg font-semibold text-slate-900">Vous n&apos;avez aucune réservation à venir.</p>
            <p className="mt-2 text-sm text-slate-500">Créez une nouvelle réservation depuis la page dédiée.</p>
            <button
              onClick={() => {
                router.push("/reservation");
              }}
              className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Réserver une salle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {reservations.map((reservation) => {
              const reservationStart = reservation.dateDebut ? new Date(reservation.dateDebut) : null;
              const reservationEnd = reservation.dateFin ? new Date(reservation.dateFin) : null;
              const formattedStartDate = reservationStart && !Number.isNaN(reservationStart.getTime())
                ? reservationStart.toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Date inconnue";

              const formattedStartTime = reservationStart && !Number.isNaN(reservationStart.getTime())
                ? reservationStart.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: 'UTC',
                  })
                : "--:--";

              const formattedEndTime = reservationEnd && !Number.isNaN(reservationEnd.getTime())
                ? reservationEnd.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: 'UTC',
                  })
                : "--:--";

              return (
                <article
                  key={reservation.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Réservation</p>
                      <h2 className="mt-1 text-lg font-black text-slate-950">
                        {reservation.salle?.site?.nom ?? "Site inconnu"} - {reservation.salle?.nom ?? "Salle inconnue"}
                      </h2>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                      {reservation.statut ?? "Confirmée"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-700">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Début</p>
                      <p className="mt-1 font-semibold text-slate-900">{formattedStartDate} à {formattedStartTime}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Fin</p>
                      <p className="mt-1 font-semibold text-slate-900">{formattedEndTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>ID {reservation.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 font-semibold text-white">
                        {reservation.salle?.site?.nom ?? "Aucun site"}
                      </span>
                      <button
                        type="button"
                        disabled={deletingReservationId !== null}
                        onClick={async () => {
                          if (!confirm('Confirmer l\'annulation de cette réservation ?')) return;
                          try {
                            setDeletingReservationId(reservation.id ?? null);
                            const token = localStorage.getItem('token');
                            const res = await fetch(`http://localhost:3000/reservations/${reservation.id}`, {
                              method: 'DELETE',
                              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                            });
                            if (!res.ok) {
                              const body = await res.json().catch(() => null);
                              const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
                              setReservationsError(msg ?? 'Impossible d\'annuler la réservation.');
                            } else {
                              setReservations((prev) => prev.filter((r) => String(r.id) !== String(reservation.id)));
                            }
                          } catch (err) {
                            console.error('Erreur annulation réservation', err);
                            setReservationsError('Erreur lors de l\'annulation.');
                          } finally {
                            setDeletingReservationId(null);
                          }
                        }}
                        className="rounded-2xl bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                      >
                        Annuler
                      </button>
                    </div>
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