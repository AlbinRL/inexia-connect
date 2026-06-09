// Ce fichier sert a definir le contrat d'entree pour creer une reservation.
export class CreateReservationDto {
  dateDebut!: string; // ex: "2026-06-10T09:00"
  dateFin!: string; // ex: "2026-06-10T10:30"
  salleId!: number;
}
