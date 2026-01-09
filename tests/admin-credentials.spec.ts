import { test, expect } from "@playwright/test";

test("Admin : login credentials + /api/users/me", async ({ request }) => {
  const email = process.env.E2E_ADMIN_EMAIL || "admin@exemple.com";
  const password = process.env.E2E_ADMIN_PASSWORD || "admin123";

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
  expect(meJson.user?.role).toBe("admin");
});
