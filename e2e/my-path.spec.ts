import { expect, test } from "@playwright/test";

test("a reader can start, complete and resume a private learning path", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/my-path");
  await page.evaluate(() => localStorage.removeItem("zechub-my-path-v1"));
  await page.reload();
  await page
    .getByRole("article")
    .filter({ hasText: "Learn Zcash" })
    .getByRole("button", { name: "Start this path" })
    .click();
  await expect(page.getByText("0 of 4 complete")).toBeVisible();
  await page
    .getByRole("button", { name: /Mark complete\s*: What is Zcash\?/ })
    .click();
  await expect(page.getByText("1 of 4 complete")).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 of 4 complete")).toBeVisible();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("link", { name: "Continue your path" }),
  ).toHaveAttribute("href", /start-here\/new-user-guide/);
  await page.getByRole("link", { name: "Continue your path" }).click();
  await expect(page).toHaveURL(/start-here\/new-user-guide/, {
    timeout: 90_000,
  });
  await expect(page.getByLabel("My Path page actions")).toContainText(
    "Step 2 of 4",
    { timeout: 30_000 },
  );
  await page.getByRole("button", { name: "Save page" }).click();
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await page.goto("/my-path", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("2 of 4 complete")).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Saved pages" })
      .getByRole("link", { name: "New user guide" }),
  ).toBeVisible();
});

test("path cards fit a narrow mobile viewport", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/my-path", { waitUntil: "domcontentloaded" });
  const cards = page.getByRole("article");
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(second!.y).toBeGreaterThan(first!.y + first!.height - 1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
