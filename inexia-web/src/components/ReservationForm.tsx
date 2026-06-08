"use client";

import React, { useState } from "react";

// --- DONNÉES SIMULÉES (Mocks) POUR LA DÉMONSTRATION ---
// Ces données simulent ce que l"API renverrait.
const SITES = [
  { id: 1, name: "Paris - Siège" },
  { id: 2, name: "Lyon - Part-Dieu" },
];

const EQUIPEMENTS = [
  { id: 1, name: "Vidéoprojecteur" },
  { id: 2, name: "Pieuvre audio" },
  { id: 3, name: "Tableau blanc" },
  { id: 4, name: "Écran 4K" },
];

const SALLES = [
  { id: 1, name: "Salle Alpha", siteId: 1, capacity: 10, equipments: [1, 3] },
  { id: 2, name: "Salle Beta", siteId: 1, capacity: 4, equipments: [4] },
  { id: 3, name: "Salle Gamma", siteId: 1, capacity: 20, equipments: [1, 2, 3] },
  { id: 4, name: "Salle Delta", siteId: 2, capacity: 8, equipments: [1] },
  { id: 5, name: "Salle Echo", siteId: 2, capacity: 12, equipments: [2, 4] },
];
// --------------------------------------------------------

export default function ReservationForm() {
  const [step, setStep] = useState(1);
  const [selectedSiteId, setSelectedSiteId] = useState<number | "">("");
  const [selectedEquipments, setSelectedEquipments] = useState<number[]>([]);
  const [selectedSalleId, setSelectedSalleId] = useState<number | null>(null);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // On filtre les salles avec la méthode native .filter
  const filteredSalles = SALLES.filter((salle) => {
    const matchSite = selectedSiteId === "" || salle.siteId === selectedSiteId;
    const matchEquipement = selectedEquipments.every((equipId) => {
      return salle.equipments.includes(equipId);
    });
    return matchSite && matchEquipement;
  });

  const handleEquipmentChange = (equipId: number) => {
    setSelectedEquipments((prev) => {
      return prev.includes(equipId) 
        ? prev.filter((id) => id !== equipId) 
        : [...prev, equipId];
    });
  };

  const handleSelectSalle = (salleId: number) => {
    setSelectedSalleId(salleId);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage({ text: "Erreur: Vous devez être connecté.", type: "error" });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          dateDebut,
          dateFin,
          salleId: selectedSalleId,
          materielIds: selectedEquipments
        }),
      });

      if (!response.ok) {
        throw new Error("La réservation a échoué.");
      }

      setMessage({ text: "Réservation validée avec succès !", type: "success" });
      setTimeout(() => {
        setStep(1);
        setDateDebut("");
        setDateFin("");
        setSelectedSalleId(null);
        setSelectedEquipments([]);
        setSelectedSiteId("");
        setMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error(error);
      setMessage({ text: "Impossible de créer la réservation. Vérifiez vos saisies.", type: "error" });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nouvelle Réservation</h2>

      {message && (
        <div className={"p-4 mb-6 rounded " + (message.type === "success" ? "bg-green-100 text-green-800 border-l-4 border-green-500" : "bg-red-100 text-red-800 border-l-4 border-red-500")}>
          {message.text}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">1. Choisissez un site</label>
            <select
              value={selectedSiteId}
              onChange={(e) => { setSelectedSiteId(e.target.value === "" ? "" : Number(e.target.value)); }}
              className="w-full border border-gray-300 rounded p-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">-- Sélectionnez un site --</option>
              {SITES.map((site) => {
                return <option key={site.id} value={site.id}>{site.name}</option>;
              })}
            </select>
          </div>

          {selectedSiteId !== "" && (
            <>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">2. Filtrez par matériel (optionnel)</label>
                <div className="flex flex-wrap gap-4">
                  {EQUIPEMENTS.map((equip) => {
                    return (
                      <label key={equip.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEquipments.includes(equip.id)}
                          onChange={() => { handleEquipmentChange(equip.id); }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 text-sm">{equip.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">3. Sélectionnez une salle</label>
                
                {filteredSalles.length === 0 ? (
                  <p className="text-gray-500 italic">Aucune salle ne correspond à vos critères.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 max-h-64 overflow-y-auto p-1">
                    {filteredSalles.map((salle) => {
                      return (
                        <div key={salle.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800">{salle.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">Capacité : {salle.capacity} personnes</p>
                            <div className="flex flex-wrap gap-1">
                              {salle.equipments.map((eqId) => {
                                const eq = EQUIPEMENTS.find(e => e.id === eqId);
                                return eq ? (
                                  <span key={eqId} className="text-[10px] uppercase font-semibold tracking-wider bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {eq.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <button
                            onClick={() => { handleSelectSalle(salle.id); }}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded transition whitespace-nowrap"
                          >
                            Réserver
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-1">Vous allez réserver :</h3>
            <p className="text-blue-900 font-bold text-lg">{SALLES.find(s => s.id === selectedSalleId)?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="date">
              Début de réservation
            </label>
            <input
              id="dateDebut"
              type="datetime-local"
              value={dateDebut}
              onChange={(e) => { setDateDebut(e.target.value); }}
              className="w-full border border-gray-300 rounded p-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />

            <label className="block text-sm font-semibold text-gray-700 mt-4 mb-2" htmlFor="dateFin">
              Fin de réservation
            </label>
            <input
              id="dateFin"
              type="datetime-local"
              value={dateFin}
              onChange={(e) => { setDateFin(e.target.value); }}
              className="w-full border border-gray-300 rounded p-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setStep(1); }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 px-4 rounded border border-gray-300 transition"
            >
              Retour
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded transition"
            >
              Confirmer
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
