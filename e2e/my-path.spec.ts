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

test("Desktop users can open a path without changing interfaces", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.route(
    "https://zechub-wiki-workspace.vercel.app/**",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><title>Desktop mock</title><p>Desktop content</p>",
      });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem("zechub-interface", "desktop");
    localStorage.removeItem("zechub-my-path-v1");
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const desktop = page.getByTitle("ZecHub Desktop");
  await expect(desktop).toBeVisible();
  await page.getByRole("button", { name: "My Path" }).click();
  const panel = page.getByRole("complementary", { name: "My Path" });
  await panel
    .getByRole("article")
    .filter({ hasText: "Learn Zcash" })
    .getByRole("button", { name: "Start this path" })
    .click();
  await panel.getByRole("link", { name: "Continue: What is Zcash?" }).click();
  await expect(desktop).toHaveAttribute(
    "src",
    /start-here\/what-is-zec-and-zcash/,
  );
  await expect(page.locator("html")).toHaveAttribute(
    "data-interface",
    "desktop",
  );
  await expect(panel).not.toBeVisible();
});

for (const theme of ["default", "ocean", "sunset", "forest", "ledger"]) {
  for (const mode of ["light", "dark"]) {
    test(`My Path remains readable with ${theme} ${mode}`, async ({ page }) => {
      test.setTimeout(120_000);
      await page.addInitScript(
        ({ theme, mode }) => {
          localStorage.setItem("zechub-color-theme", theme);
          localStorage.setItem("theme", mode);
          localStorage.setItem("zechub-interface", "reader");
        },
        { theme, mode },
      );
      await page.goto("/my-path", { waitUntil: "domcontentloaded" });
      await expect(
        page.getByRole("heading", { name: "Find your way with Zcash." }),
      ).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute(
        "data-interface",
        "reader",
      );
      if (theme !== "default")
        await expect(page.locator("html")).toHaveAttribute(
          "data-color-theme",
          theme,
        );
      await expect(page.locator("html")).toHaveClass(
        mode === "dark" ? /dark/ : /light/,
      );
      const button = page
        .getByRole("article")
        .first()
        .getByRole("button", { name: "Start this path" });
      const contrast = await button.evaluate((element) => {
        const style = getComputedStyle(element);
        const canvas = document.createElement("canvas").getContext("2d")!;
        function channels(color: string) {
          canvas.fillStyle = "#000";
          canvas.fillStyle = color;
          canvas.clearRect(0, 0, 1, 1);
          canvas.fillRect(0, 0, 1, 1);
          return Array.from(
            canvas.getImageData(0, 0, 1, 1).data.slice(0, 3),
            (v) => v / 255,
          );
        }
        function luminance(color: string) {
          const rgb = channels(color).map((v) =>
            v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
          );
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        }
        const a = luminance(style.color);
        const b = luminance(style.backgroundColor);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
      await page.evaluate(() =>
        document.documentElement.removeAttribute("data-interface"),
      );
      await expect(button).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
  }
}
