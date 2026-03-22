import { expect, test } from '@playwright/test';

import { expectNoTechnicalCopy } from './helpers';

test.describe('critical public exploration', () => {
  test('anonymous visitor can explore Palermo classes across filters and views', async ({ page }) => {
    await page.goto('/it');
    await expect(page.getByRole('heading', { name: 'Scopri la lezione ideale nella tua città.' })).toBeVisible();

    await page.getByRole('link', { name: /Esplora le classi/i }).first().click();
    await expect(page).toHaveURL(/\/it\/palermo\/classes/);
    await expect(page.getByRole('heading', { name: 'Classi' })).toBeVisible();
    await expectNoTechnicalCopy(page);

    await page.getByRole('button', { name: 'Mostra filtri' }).click();
    await page.getByLabel('Giorno').selectOption('mon');
    await page.getByLabel('Mattina').check();
    await page.getByRole('button', { name: 'Applica' }).click();

    await expect(page).toHaveURL(/weekday=mon/);
    await expect(page).toHaveURL(/time_bucket=morning/);

    await page.getByRole('button', { name: 'Vista mappa' }).click();
    await expect(page).toHaveURL(/view=map/);
    await expect(page).toHaveURL(/weekday=mon/);
    await expect(page.getByText('Tutti gli studi visibili')).toBeVisible();

    await page.getByRole('button', { name: 'Calendario' }).click();
    await expect(page).toHaveURL(/view=calendar/);
    await expect(page).toHaveURL(/weekday=mon/);
    await expect(page.getByRole('button', { name: 'Settimana successiva' })).toBeVisible();
    await page.getByRole('button', { name: 'Settimana successiva' }).click();
    await expect(page).toHaveURL(/week_offset=1/);
  });

  test('studio details keep Italian pricing and expose direct links', async ({ page }) => {
    await page.goto('/it/palermo/studios/ashtanga-shala-sicilia');

    await expect(page.getByText('Carnet 8 lezioni a 65 EUR; carnet 16 lezioni a 110 EUR.').first()).toBeVisible();
    await expect(page.getByText('8 lessons 65 EUR; 16 lessons 110 EUR')).toHaveCount(0);
    await expectNoTechnicalCopy(page);

    const externalLinks = page.locator('a[href^="http"]');
    await expect(externalLinks.first()).toBeVisible();
  });
});
