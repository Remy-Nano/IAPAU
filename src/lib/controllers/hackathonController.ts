import { Hackathon, IHackathon } from "@/lib/models/hackathon";

export async function getAllHackathons() {
  try {
    const data = await Hackathon.find().sort({ "dates.debut": -1 });
    return data;
  } catch (err) {
    console.error("Erreur getAllHackathons:", err);
    throw err;
  }
}

export async function getHackathonById(id: string) {
  try {
    const hack = await Hackathon.findById(id);
    if (!hack) {
      throw new Error("Hackathon non trouvé");
    }
    return hack;
  } catch (err) {
    console.error(`Erreur getHackathonById(${id}):`, err);
    throw err;
  }
}

export async function createHackathon(data: Partial<IHackathon>) {
  try {
    console.log(
      "Création hackathon, données reçues:",
      JSON.stringify(data, null, 2)
    );

    // On retire _id, createdAt et updatedAt s'ils étaient passés dans le body
    const { _id: _, createdAt: __, updatedAt: ___, ...payload } = data;

    // Normaliser les dates si nécessaire
    if (payload.dates) {
      if (typeof payload.dates.debut === "string") {
        try {
          payload.dates.debut = new Date(payload.dates.debut);
        } catch (e) {
          console.error("Erreur conversion date début:", e);
        }
      }

      if (typeof payload.dates.fin === "string") {
        try {
          payload.dates.fin = new Date(payload.dates.fin);
        } catch (e) {
          console.error("Erreur conversion date fin:", e);
        }
      }
    }

    console.log(
      "Payload après transformation:",
      JSON.stringify(payload, null, 2)
    );
    const newHack = new Hackathon(payload);
    const saved = await newHack.save();
    console.log("Hackathon sauvegardé avec succès, id:", saved._id);
    return saved;
  } catch (err) {
    console.error("Erreur createHackathon:", err);
    throw err;
  }
}

export async function updateHackathon(id: string, data: Partial<IHackathon>) {
  try {
    console.log(
      `Mise à jour hackathon ${id}, données:`,
      JSON.stringify(data, null, 2)
    );

    // On retire _id, createdAt et updatedAt pour ne pas les modifier
    const { _id: _, createdAt: __, updatedAt: ___, ...payload } = data;

    // Normaliser les dates si nécessaire
    if (payload.dates) {
      if (typeof payload.dates.debut === "string") {
        try {
          payload.dates.debut = new Date(payload.dates.debut);
        } catch (e) {
          console.error("Erreur conversion date début:", e);
        }
      }

      if (typeof payload.dates.fin === "string") {
        try {
          payload.dates.fin = new Date(payload.dates.fin);
        } catch (e) {
          console.error("Erreur conversion date fin:", e);
        }
      }
    }

    const updated = await Hackathon.findByIdAndUpdate(id, payload, {
      new: true,
    });

    if (!updated) {
      throw new Error("Hackathon non trouvé");
    }

    return updated;
  } catch (err) {
    console.error(`Erreur updateHackathon(${id}):`, err);
    throw err;
  }
}

export async function deleteHackathon(id: string) {
  try {
    const deleted = await Hackathon.findByIdAndDelete(id);
    if (!deleted) {
      throw new Error("Hackathon non trouvé");
    }
    return deleted;
  } catch (err) {
    console.error(`Erreur deleteHackathon(${id}):`, err);
    throw err;
  }
}
