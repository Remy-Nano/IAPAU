import { test, expect } from "@playwright/test";

test("Admin : créer puis supprimer un hackathon", async ({ request }) => {
  // 1) Login admin
  const loginRes = await request.post("/api/auth/credentials", {
    data: {
      email: "admin@exemple.com",
      password: "admin123",
    },
  });

  expect(loginRes.ok()).toBeTruthy();
  const loginJson = await loginRes.json();
  const token = loginJson.token;
  expect(token).toBeTruthy();

  // 2) Création hackathon
  const now = Date.now();
  const payload = {
    nom: `E2E Hackathon ${now}`,
    dates: {
      debut: new Date(now + 60 * 60 * 1000).toISOString(),
      fin: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
    },
  };

  const createRes = await request.post("/api/hackathons", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: payload,
  });

  if (!createRes.ok()) {
    console.log("CREATE status:", createRes.status());
    console.log("CREATE body:", await createRes.text());
  }

  expect(createRes.status()).toBe(201);
  const created = await createRes.json();
  const hackathonId = created._id || created.id;
  expect(hackathonId).toBeTruthy();

  // 3) Récupération
  const getRes = await request.get(`/api/hackathons/${hackathonId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(getRes.ok()).toBeTruthy();
  const fetched = await getRes.json();
  expect(fetched.nom).toContain("E2E Hackathon");

  // 4) Suppression
  const deleteRes = await request.delete(`/api/hackathons/${hackathonId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!deleteRes.ok()) {
    console.log("DELETE status:", deleteRes.status());
    console.log("DELETE body:", await deleteRes.text());
  }

  expect(deleteRes.status()).toBe(204);

  // 5) Vérification suppression
  const getAfterDelete = await request.get(
    `/api/hackathons/${hackathonId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  expect(getAfterDelete.status()).toBe(404);
});
