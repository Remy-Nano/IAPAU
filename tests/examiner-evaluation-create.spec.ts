import { test, expect } from "@playwright/test";

test("Examinateur : crée une évaluation sur une conversation", async ({ request }) => {
  // 1) Login examinateur
  const loginRes = await request.post("/api/auth/credentials", {
    data: { email: "examinateur@exemple.com", password: "examiner123" },
  });

  if (!loginRes.ok()) {
    console.log("loginRes status =", loginRes.status());
    console.log("loginRes body =", await loginRes.text());
  }
  expect(loginRes.ok()).toBeTruthy();

  const loginJson = await loginRes.json();
  expect(loginJson.token).toBeTruthy();
  const token: string = loginJson.token;

  const examinerId: string | undefined = loginJson.user?._id;
  expect(examinerId).toBeTruthy();

  // 2) Récupérer des conversations
  const listRes = await request.get("/api/conversations");
  if (!listRes.ok()) {
    console.log("listRes status =", listRes.status());
    console.log("listRes body =", await listRes.text());
  }
  expect(listRes.ok()).toBeTruthy();

  const listJson = await listRes.json();
  const conversations = listJson.conversations || listJson.data || [];
  expect(conversations.length).toBeGreaterThan(0);

  // 3) Trouver une conversation valide (avec studentId)
  const candidates = conversations.filter((c: any) => (c._id || c.id) && c.studentId);
  expect(candidates.length).toBeGreaterThan(0);

  // 4) Essayer de créer une évaluation (si 409 => on tente une autre conversation)
  let success = false;
  let lastBody = "";
  let lastStatus = 0;

  for (const c of candidates.slice(0, 10)) {
    const conversationId = c._id || c.id;
    const studentId = c.studentId;

    const evalRes = await request.post("/api/evaluations", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        conversationId,
        studentId,
        examinerId,
        note: 4,
        comment: "E2E: évaluation ajoutée correctement.",
      },
    });

    lastStatus = evalRes.status();
    lastBody = await evalRes.text();

    if (evalRes.ok()) {
      const evalJson = JSON.parse(lastBody);
      expect(evalJson.success).toBeTruthy();
      expect(evalJson.evaluation).toBeTruthy();
      success = true;
      break;
    }

    // 409 = déjà évaluée -> on essaie une autre conversation
    if (lastStatus === 409) continue;

    // autre erreur -> stop direct (on veut voir le body)
    break;
  }

  if (!success) {
    console.log("❌ Impossible de créer une évaluation.");
    console.log("lastStatus =", lastStatus);
    console.log("lastBody =", lastBody);
  }

  expect(success).toBeTruthy();
});
