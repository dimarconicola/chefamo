import { expect, type Locator, type Page } from '@playwright/test';

export const technicalCopy = [
  'Soglia di copertura',
  'Copertura CTA',
  'Quando Supabase non è configurato',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'Mappa non configurata',
  'Map not configured',
  'Auth reale attiva',
  'Modalità',
  'fallback demo',
  'live auth'
];

export async function expectNoTechnicalCopy(page: Page) {
  for (const entry of technicalCopy) {
    await expect(page.getByText(entry)).toHaveCount(0);
  }
}

export async function expectOneOfTexts(page: Page, values: string[]) {
  await expect
    .poll(
      async () => {
        const bodyText = await page.locator('body').innerText();
        return values.find((value) => bodyText.includes(value)) ?? '';
      },
      {
        timeout: 10_000,
        message: `Expected one of these texts to appear: ${values.join(', ')}`
      }
    )
    .not.toBe('');
}

export async function expectOneOfLocators(locators: Locator[]) {
  for (const locator of locators) {
    if ((await locator.count()) > 0) {
      await expect(locator.first()).toBeVisible();
      return;
    }
  }

  throw new Error('None of the expected locators were found');
}
