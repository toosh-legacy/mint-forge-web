import { expect, test, type Page } from "@playwright/test";

const LOADER = '[aria-label="Loading MintForge"]';

/** Collect console errors / page errors for the whole test. */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

async function waitForLoader(page: Page) {
  await expect(page.locator(LOADER)).toBeHidden({ timeout: 20_000 });
}

/** Scroll the forge sequence to a progress value (0..1) and let Lenis/motion settle. */
async function scrollForge(page: Page, progress: number) {
  await page.evaluate((p) => {
    const s = document.getElementById("forge")!;
    window.scrollTo(0, s.offsetTop + p * (s.offsetHeight - window.innerHeight));
  }, progress);
  await page.waitForTimeout(900);
}

const opacityOf = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => {
    let o = 1;
    for (let n: Element | null = el; n; n = n.parentElement) o *= +getComputedStyle(n).opacity;
    return o;
  });

test.describe("Loader", () => {
  test("paints in, locks scroll, then hands off to the hero", async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto("/");

    const loader = page.locator(LOADER);
    await expect(loader).toBeVisible();
    await expect(loader.locator('image[href="/loader/lineart.webp"]')).toBeAttached();
    await expect(loader.locator("mask#paint-mask path")).toHaveCount(8);
    await expect(loader.getByText(/Forging the first cards · \d+%/)).toBeVisible();

    // Scroll is held while the loader is up.
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => scrollY)).toBe(0);

    await waitForLoader(page);
    await expect(page.locator("header nav")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).getByAltText("MintForge")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("Skip ends the intro early", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Skip" }).click();
    await waitForLoader(page);
  });
});

test.describe("Forge scroll sequence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForLoader(page);
  });

  test("anvil falls, hoard rises into the gold sheet", async ({ page }) => {
    const anvil = page.locator('img[src="/hero/anvil.webp"]');
    const y0 = (await anvil.boundingBox())!.y;

    await scrollForge(page, 0.12);
    const y1 = (await anvil.boundingBox())!.y;
    expect(y1).toBeGreaterThan(y0 + 200); // dropped well down the screen

    expect(await opacityOf(page, 'h1 img[alt="MintForge"]')).toBeLessThan(0.05); // title gone

    await scrollForge(page, 0.34);
    await expect(page.getByRole("heading", { name: "The First Forged" }).first()).toBeVisible();
  });

  test("panels split and flip to reveal all three gods", async ({ page }) => {
    await scrollForge(page, 0.9);
    for (const name of ["Goldrax the Dread", "Polyphius Forgeknight", "Quasar Regent"]) {
      await expect(page.getByRole("button", { name: `Open ${name}` })).toBeVisible();
    }
    await expect(page.getByText("Select a god to read their lore")).toBeVisible();
  });

  test("card modal opens with lore and closes on Escape", async ({ page }) => {
    await scrollForge(page, 0.9);
    await page.getByRole("button", { name: "Open Quasar Regent" }).click();

    const dialog = page.getByRole("dialog", { name: "Quasar Regent" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Dark Matter Quantum Fold")).toBeVisible();
    await expect(dialog.getByText(/cosmic god who breathed life/i)).toBeVisible();

    // Page scroll is locked while open.
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => scrollY)).toBe(before);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("nav links jump to their sections", async ({ page, isMobile }) => {
    test.skip(isMobile, "Section links are collapsed into the Shop button on mobile");
    await page.getByRole("link", { name: "Merch" }).click();
    await expect(page.getByRole("heading", { name: "Merch" })).toBeInViewport();
  });
});

test.describe("Bind your name (live card)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForLoader(page);
    await page.locator("#bind").scrollIntoViewIfNeeded();
  });

  test("forges a card from the typed name, deterministically", async ({ page }) => {
    const section = page.locator("#bind");
    const input = section.getByLabel("Name to bind");
    const card = section.locator(".\\@container");

    await expect(card).toContainText("Wanderer"); // default before typing

    await input.fill("Ada Lovelace");
    await expect(card).toContainText("Ada Lovelace");
    const first = await card.innerText();

    await input.fill("Someone Else");
    await expect.poll(() => card.innerText()).not.toBe(first);

    await input.fill("Ada Lovelace");
    await expect.poll(() => card.innerText()).toBe(first); // same name → same stats, ult, lore, number
    await expect(section.getByText(/Patron: (Goldrax the Dread|Polyphius Forgeknight|Quasar Regent)/)).toBeVisible();
  });

  test("Strike the anvil plays the forge and keeps the card", async ({ page }) => {
    const section = page.locator("#bind");
    await section.getByLabel("Name to bind").fill("Tushaar");
    await section.getByLabel("Name to bind").press("Enter");
    await page.waitForTimeout(900);
    await expect(section.locator(".\\@container")).toContainText("Tushaar");
  });
});

test.describe("Merch & contact", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForLoader(page);
    await page.locator("#merch").scrollIntoViewIfNeeded();
  });

  test("shows six coming-soon products", async ({ page }) => {
    await expect(page.getByText("Coming soon")).toHaveCount(6);
  });

  test("notify form validates and confirms", async ({ page }) => {
    const input = page.getByLabel("Notify me when the store opens");
    await input.fill("not-an-email");
    await page.getByRole("button", { name: "Notify me" }).click();
    await expect(page.getByText("That doesn't look like an email address.")).toBeVisible();

    await input.fill("smith@realm.gg");
    await page.getByRole("button", { name: "Notify me" }).click();
    await expect(page.getByText("You're on the list.")).toBeVisible();
  });

  test("Join the list jumps to the notify form", async ({ page, isMobile }) => {
    test.skip(isMobile, "nav links collapse on phones");
    await page.evaluate(() => scrollTo(0, 0));
    await page.getByRole("link", { name: "Join the list" }).click();
    await expect(page.getByLabel("Notify me when the store opens")).toBeInViewport();
  });

  test("footer shows developer contact links", async ({ page }) => {
    const footer = page.locator("footer#contact");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.getByRole("link", { name: /@/ })).toHaveAttribute("href", /^mailto:/);
    for (const label of ["GitHub", "X / Twitter", "Discord", "Instagram"]) {
      await expect(footer.getByRole("link", { name: label })).toHaveAttribute("target", "_blank");
    }
  });
});

test.describe("Layout & accessibility", () => {
  test("no horizontal overflow at any scroll point", async ({ page }) => {
    await page.goto("/");
    await waitForLoader(page);
    for (const p of [0, 0.2, 0.5, 1]) {
      await scrollForge(page, p);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    }
  });

  test("portrait shows the whole title", async ({ page, isMobile }) => {
    test.skip(!isMobile, "portrait-only layout");
    await page.goto("/");
    await waitForLoader(page);
    const box = (await page.getByRole("heading", { level: 1 }).getByAltText("MintForge").boundingBox())!;
    const vw = page.viewportSize()!.width;
    // The lettering spans ~14.5%–87.3% of the art frame; that band must be on-screen.
    expect(box.x + box.width * 0.145).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width * 0.873).toBeLessThanOrEqual(vw);
  });

  test("reduced motion: intro is quick and content still reachable", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const start = Date.now();
    await page.goto("/");
    await waitForLoader(page);
    expect(Date.now() - start).toBeLessThan(15_000);
    await scrollForge(page, 0.9);
    await expect(page.getByRole("button", { name: "Open Goldrax the Dread" })).toBeVisible();
    await ctx.close();
  });
});
