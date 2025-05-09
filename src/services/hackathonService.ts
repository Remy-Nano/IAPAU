import { Hackathon } from "@/types/Hackathon";
import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const fetchHackathons = async (): Promise<Hackathon[]> => {
  try {
    console.log("📤 Client: Appel API GET /hackathons");
    const { data } = await API.get<Hackathon[]>("/hackathons");
    console.log(`📥 Client: ${data.length} hackathons reçus`);
    return data;
  } catch (error) {
    console.error(
      "❌ Client: Erreur lors de la récupération des hackathons:",
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      console.error("Détails de l'erreur:", error.response.data);
      console.error("Status code:", error.response.status);
    }
    throw error;
  }
};

export const fetchHackathon = async (id: string): Promise<Hackathon> => {
  try {
    console.log(`📤 Client: Appel API GET /hackathons/${id}`);
    const { data } = await API.get<Hackathon>(`/hackathons/${id}`);
    return data;
  } catch (error) {
    console.error(
      `❌ Client: Erreur lors de la récupération du hackathon ${id}:`,
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      console.error("Détails de l'erreur:", error.response.data);
      console.error("Status code:", error.response.status);
    }
    throw error;
  }
};

export const saveHackathon = async (h: Hackathon): Promise<Hackathon> => {
  try {
    if (h._id) {
      console.log(`📤 Client: Appel API PATCH /hackathons/${h._id}`);
      const { data } = await API.patch<Hackathon>(`/hackathons/${h._id}`, h);
      return data;
    } else {
      console.log(`📤 Client: Appel API POST /hackathons`);
      const { data } = await API.post<Hackathon>("/hackathons", h);
      return data;
    }
  } catch (error) {
    console.error(
      "❌ Client: Erreur lors de la sauvegarde du hackathon:",
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      console.error("Détails de l'erreur:", error.response.data);
      console.error("Status code:", error.response.status);
    }
    throw error;
  }
};

export const deleteHackathon = async (id: string): Promise<void> => {
  try {
    console.log(`📤 Client: Appel API DELETE /hackathons/${id}`);
    await API.delete(`/hackathons/${id}`);
  } catch (error) {
    console.error(
      `❌ Client: Erreur lors de la suppression du hackathon ${id}:`,
      error
    );
    if (axios.isAxiosError(error) && error.response) {
      console.error("Détails de l'erreur:", error.response.data);
      console.error("Status code:", error.response.status);
    }
    throw error;
  }
};
