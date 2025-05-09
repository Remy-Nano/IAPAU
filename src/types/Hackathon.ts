export interface HackathonDates {
  debut: string; // ISO string
  fin: string; // ISO string
  archiveLe?: string; // ISO string ou undefined
}

export interface HackathonQuotas {
  promptsParEtudiant: number;
  tokensParEtudiant: number;
}

export interface Hackathon {
  _id: string;
  nom: string;
  description: string;
  objectifs: string;
  dates: HackathonDates;
  anonymatActif: boolean;
  quotas: HackathonQuotas;
  taches: string[];
  statut: string;
  createdAt: string;
  updatedAt: string;
}
