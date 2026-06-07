'use client';

import { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, motDePasse: password }),
      });

      if (!res.ok) throw new Error('Identifiants incorrects');

      const data = await res.json();
      login(data.access_token, data.utilisateur);
    } catch (err) {
      setError('Erreur de connexion. Verifiez vos identifiants.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Inexia-Connect</h1>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full border p-2 rounded text-black" 
            required 
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Mot de passe</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full border p-2 rounded text-black" 
            required 
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4">
          Se connecter
        </button>

        <div className="text-center text-sm">
          <Link href="/register" className="text-blue-600 hover:underline">
            Pas encore de compte ? S'inscrire
          </Link>
        </div>
      </form>
    </div>
  );
}
