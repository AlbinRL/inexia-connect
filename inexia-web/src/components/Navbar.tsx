"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  // On masque la navbar si l'utilisateur n'est pas connecté
  if (!user) return null;

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex gap-6 items-center">
        <span className="font-bold text-lg">Inexia-Connect</span>
        <Link href="/dashboard" className="hover:text-blue-200 transition-colors">
          Mon Planning
        </Link>
        {user.role === 'ADMIN' && (
          <Link href="/admin" className="hover:text-blue-200 transition-colors">
            Administration
          </Link>
        )}
      </div>
      <div className="flex gap-4 items-center">
        <span className="text-sm">
          Bonjour, {user.prenom} {user.nom}
        </span>
        <button 
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-semibold transition-colors shadow-sm"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
