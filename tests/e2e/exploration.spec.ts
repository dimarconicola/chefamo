import { expect, test } from '@playwright/test';

import { expectNoTechnicalCopy } from './helpers';

test.describe('critical public exploration', () => {
  test('anonymous visitor can explore Palermo activities across filters and views', async ({ page }) => {
    await page.goto('/it');
    await expect(page.getByRole('heading', { name: 'Chefamo rende leggibile il tempo libero in famiglia.' })).toBeVisible();

    await page.getByRole('link', { name: /Esplora attività/i }).first().click();
    await expect(page).toHaveURL(/\/it\/palermo\/activities/);
    await expect(page.getByRole('heading', { name: 'Attività' })).toBeVisible();
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
    await expect(page.getByText('luoghi in mappa')).toBeVisible();
    await expect(page.getByText('Luoghi che corrispondono ai filtri')).toBeVisible();

    const fallbackMarkers = page.locator('.fallback-map-marker');
    if ((await fallbackMarkers.count()) > 0) {
      await fallbackMarkers.first().click();
    } else {
      await page.locator('.classes-map-venue-item').first().click();
    }

    await expect(page).toHaveURL(/venue=/);
    await expect(page.getByText('Dettaglio luogo')).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/view=map/);
    await expect(page).toHaveURL(/venue=/);
    await expect(page.getByText('Dettaglio luogo')).toBeVisible();

    await page.getByRole('button', { name: 'Calendario' }).click();
    await expect(page).toHaveURL(/view=calendar/);
    await expect(page).toHaveURL(/weekday=mon/);
    await expect(page.getByRole('button', { name: 'Settimana successiva' })).toBeVisible();
    await page.getByRole('button', { name: 'Settimana successiva' }).click();
    await expect(page).toHaveURL(/week_offset=1/);
  });

  test('mobile map view stays map-first with a bottom sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/it/palermo/activities?view=map');

    await expect(page.locator('.classes-map-layout')).toBeVisible();
    await expect(page.locator('.classes-map-stage-canvas')).toBeVisible();
    await expect(page.locator('.classes-map-sheet')).toBeVisible();
    await expect(page.locator('.map-overview-panel')).toHaveCount(0);
    await expectNoTechnicalCopy(page);
  });

  test('place details expose family-oriented catalog actions and direct links', async ({ page }) => {
    await page.goto('/it/palermo/places/minimupa-palermo');

    await expect(page.getByRole('heading', { name: 'MiniMuPa' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Segui luogo' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Invia richiesta' })).toBeVisible();
    await expectNoTechnicalCopy(page);

    const externalLinks = page.locator('a[href^="http"]');
    await expect(externalLinks.first()).toBeVisible();
  });

  test('organizers directory is public and alphabetical', async ({ page }) => {
    await page.goto('/it/palermo/organizers');

    await expect(page.getByRole('heading', { name: 'Chi cura l esperienza family a Palermo' })).toBeVisible();
    await expect(page.getByText('Fondazione Teatro Massimo')).toBeVisible();
    await expect(page.getByText('MiniMuPa')).toBeVisible();
    await expect(page.getByRole('link', { name: /Apri profilo/i }).first()).toBeVisible();
    await expectNoTechnicalCopy(page);
  });

  test('places directory supports list and map browsing', async ({ page }) => {
    await page.goto('/it/palermo/places');

    await expect(page.getByRole('heading', { name: 'Dove andare con bambini e preadolescenti a Palermo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Luoghi in ordine alfabetico' })).toBeVisible();
    await expect(page.getByText('Teatro Massimo')).toBeVisible();

    await page.getByRole('button', { name: 'Vista mappa' }).click();
    await expect(page).toHaveURL(/view=map/);
    await expect(page.getByRole('heading', { name: 'Tutti i luoghi sulla mappa' })).toBeVisible();

    await page.locator('.studios-map-list-item').first().click();
    await expect(page).toHaveURL(/venue=/);
    await expect(page.getByRole('link', { name: 'Apri luogo' })).toBeVisible();
    await expectNoTechnicalCopy(page);
  });
});
