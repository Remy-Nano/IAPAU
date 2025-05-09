import { Hackathon } from "@/types/Hackathon";
import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const fetchHackathons = async (): Promise<Hackathon[]> => {
  const { data } = await API.get<Hackathon[]>("/hackathons");
  return data;
};

export const fetchHackathon = async (id: string): Promise<Hackathon> => {
  const { data } = await API.get<Hackathon>(`/hackathons/${id}`);
  return data;
};

export const saveHackathon = async (h: Hackathon): Promise<Hackathon> => {
  if (h._id) {
    const { data } = await API.patch<Hackathon>(`/hackathons/${h._id}`, h);
    return data;
  } else {
    const { data } = await API.post<Hackathon>("/hackathons", h);
    return data;
  }
};

export const deleteHackathon = async (id: string): Promise<void> => {
  await API.delete(`/hackathons/${id}`);
};
