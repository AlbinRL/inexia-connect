export class CreateReservationDto {
  date: string; // ou Date selon comment le front l'envoie (ex: "2026-06-10T09:00:00Z")
  salleId: number;
}
