import { test, expect } from "@playwright/test";

test("Examiner : login credentials + /api/users/me", async ({ request }) => {
  const email = process.env.E2E_EXAMINER_EMAIL || "examinateur@exemple.com";
  const password = process.env.E2E_EXAMINER_PASSWORD || "examiner123";

  const res = await request.post("/api/auth/credentials", {
    data: { email, password },
  });
  expect(res.ok()).toBeTruthy();

  const json = await res.json();
  expect(json.token).toBeTruthy();
  expect(json.user?.role).toBeTruthy();

  const me = await request.get("/api/users/me", {
    headers: { Authorization: `Bearer ${json.token}` },
  });
  expect(me.ok()).toBeTruthy();

  const meJson = await me.json();
  expect(["examiner", "examinateur"]).toContain(meJson.user?.role);
});
