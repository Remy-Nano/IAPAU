import { test, expect } from "@playwright/test";

test("Étudiant : envoi prompt -> ai-response -> messages ajoutés", async ({ request }) => {
  // 1) Récupérer (ou créer) une conversation
  //    Ici on récupère la liste et on prend la 1ère.
  const listRes = await request.get("/api/conversations");
  console.log("listRes status =", listRes.status());

  const listText = await listRes.text();
  console.log("listRes body =", listText);

  expect(listRes.ok()).toBeTruthy();

  const listJson = JSON.parse(listText);
  const conversations = listJson.conversations || listJson.data || [];
  console.log("conversations length =", conversations.length);

  expect(conversations.length).toBeGreaterThan(0);

  const conversationId = conversations[0]._id || conversations[0].id;
  console.log("conversation sample =", conversations[0]);
  console.log("conversationId =", conversationId);

  expect(conversationId).toBeTruthy();

  // 2) Appel ai-response
  const aiRes = await request.post(`/api/conversations/${conversationId}/ai-response`, {
    data: {
      prompt: "Dis bonjour en une phrase.",
      modelName: "mistral",
      maxTokens: 64,
    },
  });

  if (!aiRes.ok()) {
    console.log("aiRes status =", aiRes.status());
    console.log("aiRes url =", aiRes.url());
    console.log("aiRes body =", await aiRes.text());
  }

  expect(aiRes.ok()).toBeTruthy();

  const aiJson = await aiRes.json();
  expect(aiJson.success).toBeTruthy();
  expect(aiJson.aiResponse).toBeTruthy();
});
