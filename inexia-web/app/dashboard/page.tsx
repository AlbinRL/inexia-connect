'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'next/navigation';

type Reservation = {
  id: number;
  date: string;
  salle?: {
    nom: string;
    site?: {
      nom: string;
    };
  };
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchReservations = async () => {
      try {
        const res = await fetch(`http://localhost:3000/reservations/user/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setReservations(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du planning", error);
      }
    };

    fetchReservations();
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Mon Planning</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
          + Nouvelle Réservation
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {reservations.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Vous n'avez aucune réservation à venir.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {reservations.map((resa) => (
              <li key={resa.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">
                    {new Date(resa.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {resa.salle?.site?.nom} - {resa.salle?.nom}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Confirmée
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}