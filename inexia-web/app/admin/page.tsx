'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => {
    // Double sécurité : Non connecté OU pas admin = Dehors !
    if (!user) {
      router.push('/');
      return;
    }
    if (user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    // Récupération de la liste des agences
    const fetchSites = async () => {
      try {
        const res = await fetch('http://localhost:3000/sites');
        if (res.ok) {
          const data = await res.json();
          setSites(data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des sites", error);
      }
    };

    fetchSites();
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Vue Globale Administrateur</h1>
      
      {/* Fausses statistiques pour le côté "Dashboard de gestion" de la maquette */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Taux d' occupation</h2>
          <p className="text-4xl font-bold">78%</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Réservations (Mois)</h2>
          <p className="text-4xl font-bold">142</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Agences Actives</h2>
          <p className="text-4xl font-bold">{sites.length}</p>
        </div>
      </div>

      {/* Liste réelle des sites provenant de ta base de données */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Réseau d'Agences Inexia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <div key={site.id} className="border p-4 rounded hover:bg-gray-50 transition">
              <h3 className="font-bold text-lg text-gray-800">{site.nom}</h3>
              <p className="text-gray-500">{site.ville}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
