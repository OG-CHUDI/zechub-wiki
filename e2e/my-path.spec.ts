import { expect, test } from "@playwright/test";
import fr from "../dictionaries/fr.json";
import ar from "../dictionaries/ar.json";
import { learningPaths } from "../src/lib/learningPaths";

const learnSteps = learningPaths.find((path) => path.id === "learn")!.steps.length;

test("visitors choose whether to save learning progress", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/my-path", { waitUntil: "domcontentloaded" });
  await page.getByRole("article").filter({ hasText: "Learn Zcash" }).getByRole("button", { name: "Start this path" }).click();
  const dialog = page.getByRole("dialog", { name: "How My Path works" });
  await expect(dialog).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("zechub-my-path-v1"))).toBeNull();
  await dialog.getByRole("button", { name: "Continue without saving" }).click();
  await page.getByRole("button", { name: /Mark complete\s*: What is Zcash/ }).click();
  await expect(page.getByText(`1 of ${learnSteps} complete`)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("zechub-my-path-v1"))).toBeNull();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Choose a path" })).toBeVisible();
});

test("completed paths lead to another path and the full wiki", async ({ page }) => {
  await page.addInitScript((paths) => {
    if (!localStorage.getItem("zechub-my-path-v1")) localStorage.setItem("zechub-my-path-v1", JSON.stringify({ version: 2, consent: true, state: { activePath: "learn", completed: { learn: paths.find((path) => path.id === "learn")!.steps.map((step) => step.href) }, saved: [] } }));
  }, learningPaths);
  await page.goto("/my-path");
  await expect(page.getByRole("button", { name: /Try another path:/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore the full wiki" }).first()).toHaveAttribute("href", /\/sitemap/);
  await page.getByRole("button", { name: /Try another path:/ }).click();
  await expect(page.getByRole("heading", { name: "Use Zcash privately", level: 2 })).toBeVisible();
  await page.evaluate((paths) => {
    localStorage.setItem("zechub-my-path-v1", JSON.stringify({ version: 2, consent: true, state: { activePath: "learn", completed: Object.fromEntries(paths.map((path) => [path.id, path.steps.map((step) => step.href)])), saved: [] } }));
  }, learningPaths);
  await page.reload();
  await expect(page.getByRole("button", { name: /Try another path:/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Explore the full wiki" }).first()).toBeVisible();
});

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
  await page.getByRole("dialog").getByRole("button", { name: "Save on this browser" }).click();
  await expect(page.getByText(`0 of ${learnSteps} complete`)).toBeVisible();
  await page
    .getByRole("button", { name: /Mark complete\s*: What is Zcash\?/ })
    .click();
  await expect(page.getByText(`1 of ${learnSteps} complete`)).toBeVisible();
  await page.reload();
  await expect(page.getByText(`1 of ${learnSteps} complete`)).toBeVisible();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("link", { name: "Continue your path" }),
  ).toHaveAttribute("href", /start-here\/new-user-guide/);
  await page.getByRole("link", { name: "Continue your path" }).click();
  await expect(page).toHaveURL(/start-here\/new-user-guide/, {
    timeout: 90_000,
  });
  await expect(page.getByLabel("My Path page actions")).toContainText(
    `Step 2 of ${learnSteps}`,
    { timeout: 30_000 },
  );
  await page.getByRole("button", { name: "Save page" }).click();
  await page.getByRole("button", { name: "Mark complete" }).click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await page.goto("/my-path", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(`2 of ${learnSteps} complete`)).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "Saved pages" })
      .getByRole("link", { name: "New user guide" }),
  ).toBeVisible();
});

test("path cards scroll within a narrow mobile viewport", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/my-path", { waitUntil: "domcontentloaded" });
  const cards = page.getByRole("article");
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(second!.x).toBeGreaterThan(first!.x);
  const cardsRow = page.locator("#path-cards");
  expect(await cardsRow.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Next paths" }).click();
  await expect.poll(() => cardsRow.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("a longer path can be navigated a page at a time", async ({ page }) => {
  await page.goto("/my-path");
  await page.evaluate(() => localStorage.removeItem("zechub-my-path-v1"));
  await page.reload();
  await page.getByRole("article").filter({ hasText: "Learn Zcash" }).getByRole("button", { name: "Start this path" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Continue without saving" }).click();
  const steps = page.getByRole("navigation", { name: "Step pages" });
  await expect(steps).toContainText("Page 1 of 2");
  await steps.getByRole("button", { name: "Next" }).click();
  await expect(steps).toContainText("Page 2 of 2");
  await expect(page.getByRole("link", { name: "Monetary policy" })).toBeVisible();
  await steps.getByRole("button", { name: "Previous" }).click();
  await expect(page.getByRole("link", { name: "What is Zcash?", exact: true })).toBeVisible();
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
  await page.getByRole("dialog").getByRole("button", { name: "Continue without saving" }).click();
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

test("the real Desktop dock opens My Path", async ({ page }) => {
  test.skip(!process.env.DESKTOP_DOCK_TEST, "Requires the updated Desktop app configured in NEXT_PUBLIC_DESKTOP_INTERFACE_URL");
  test.setTimeout(120_000);
  await page.addInitScript(() => localStorage.setItem("zechub-interface", "desktop"));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const dockButton = page.frameLocator('iframe[title="ZecHub Desktop"]').getByRole("button", { name: "My Path", exact: true });
  await expect(dockButton).toBeVisible({ timeout: 60_000 });
  await expect(page.locator("[data-desktop-path-trigger]")).toHaveCount(0);
  await dockButton.click();
  const panel = page.getByRole("complementary", { name: "My Path" });
  await expect(panel).toBeVisible();
  await panel.getByRole("article").filter({ hasText: "Learn Zcash" }).getByRole("button", { name: "Start this path" }).click();
  await expect(page.getByRole("dialog", { name: "How My Path works" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Continue without saving" }).click();
  expect(await page.evaluate(() => localStorage.getItem("zechub-my-path-v1"))).toBeNull();
});

test("localized paths preserve translated copy, routes and right-to-left layout", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/fr/my-path", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: fr.myPath.heading })).toBeVisible();
  await page.getByRole("article").filter({ hasText: fr.myPath.paths.learn.title }).getByRole("button", { name: fr.myPath.startPath }).click();
  await page.getByRole("dialog").getByRole("button", { name: fr.myPath.consentNoSave }).click();
  await expect(page.getByRole("link", { name: new RegExp(fr.myPath.paths.learn.steps[0].title) }).first()).toHaveAttribute("href", /\/fr\/start-here\/what-is-zec-and-zcash/);
  await page.goto("/ar/my-path", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: ar.myPath.heading })).toBeVisible();
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
        { timeout: 30_000 },
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
