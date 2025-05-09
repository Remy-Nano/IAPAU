// // src/services/hackathonService.ts
// import axios from 'axios';
// import { Hackathon } from '../types/Hackathon';

// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
// });

// export const fetchHackathons = async (): Promise<Hackathon[]> => {
//   const { data } = await API.get<Hackathon[]>('/hackathons');
//   return data;
// };

// export const fetchHackathon = async (id: string): Promise<Hackathon> => {
//   const { data } = await API.get<Hackathon>(`/hackathons/${id}`);
//   return data;
// };

// export const saveHackathon = async (h: Hackathon): Promise<Hackathon> => {
//   if (h._id) {
//     const { data } = await API.put<Hackathon>(`/hackathons/${h._id}`, h);
//     return data;
//   } else {
//     const { data } = await API.post<Hackathon>('/hackathons', h);
//     return data;
//   }
// };
// src/services/hackathonService.ts
import axios from 'axios';
import { Hackathon } from '../types/Hackathon';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

export const fetchHackathons = async (): Promise<Hackathon[]> => {
  const { data } = await API.get<Hackathon[]>('/hackathons');
  return data;
};

export const fetchHackathon = async (id: string): Promise<Hackathon> => {
  const { data } = await API.get<Hackathon>(`/hackathons/${id}`);
  return data;
};

export const saveHackathon = async (h: Hackathon): Promise<Hackathon> => {
  if (h._id) {
    const { data } = await API.put<Hackathon>(`/hackathons/${h._id}`, h);
    return data;
  } else {
    const { data } = await API.post<Hackathon>('/hackathons', h);
    return data;
  }
};

// ← NOUVEAU
export const deleteHackathon = async (id: string): Promise<void> => {
  await API.delete(`/hackathons/${id}`);
};
