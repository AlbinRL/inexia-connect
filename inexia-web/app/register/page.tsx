'use client';

import { useState } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      await register({ nom, prenom, email, motDePasse: password });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'inscription.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Inscription</h1>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nom</label>
          <input 
            type="text" 
            value={nom} 
            onChange={(e) => setNom(e.target.value)} 
            className="w-full border p-2 rounded text-black" 
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Prénom</label>
          <input 
            type="text" 
            value={prenom} 
            onChange={(e) => setPrenom(e.target.value)} 
            className="w-full border p-2 rounded text-black" 
            required 
          />
        </div>

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

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Mot de passe</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full border p-2 rounded text-black" 
            required 
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Confirmer le mot de passe</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="w-full border p-2 rounded text-black" 
            required 
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4">
          S&apos;inscrire
        </button>

        <div className="text-center text-sm">
          <Link href="/" className="text-blue-600 hover:underline">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </form>
    </div>
  );
}
