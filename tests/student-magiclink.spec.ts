import { test, expect } from "@playwright/test";

test("Étudiant : login magic-link + accès résultats", async ({ page, request }) => {
  const studentEmail = "matheoalves030@gmail.com";

  const res = await request.post("/api/auth/login", {
    data: { email: studentEmail },
  });

  expect(res.ok()).toBeTruthy();

  const json = await res.json();
  expect(json.magicLink).toBeTruthy();

  await page.goto(json.magicLink);

  await expect(page).toHaveURL(/dashboard\/student/);

  await page.goto("/dashboard/student/results");
  await expect(page.getByRole("heading", { name: "Mes résultats" })).toBeVisible();
});
