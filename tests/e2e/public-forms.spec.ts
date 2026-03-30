import { expect, test } from '@playwright/test';

import { expectNoTechnicalCopy, expectOneOfTexts } from './helpers';

test.describe('public submission flows', () => {
  test('suggest calendar returns explicit feedback for a valid public submission', async ({ page }) => {
    await page.goto('/it/suggest-calendar');

    await page.getByLabel('Nome luogo o progetto').fill('Test Place Palermo');
    await page.getByLabel('Nome referente').fill('QA Runner');
    await page.getByLabel('Email').fill(`qa+calendar-${Date.now()}@example.com`);
    await page.getByLabel('URL fonti pubbliche (una per riga)').fill('https://example.com/schedule');
    await page.getByLabel('Dettagli attività, orari, età e note').fill('Laboratorio del sabato 10:30-12:00 per 6-10 anni su prenotazione.');
    await page.getByLabel('Confermo che i dati inviati sono pubblici o autorizzati alla verifica.').check();
    await page.getByRole('button', { name: 'Invia programmazione' }).click();

    await expectOneOfTexts(page, [
      'Ricevuto. Il team verifica e inserisce la programmazione nella coda editoriale.',
      'Invio non riuscito. Controlla i campi e riprova.'
    ]);
    await expectNoTechnicalCopy(page);
  });

  test('claim flow accepts a valid request', async ({ page }) => {
    await page.goto('/it/claim/minimupa-palermo');

    await page.getByLabel('Nome').fill('QA Owner');
    await page.getByLabel('Email').fill(`qa+claim-${Date.now()}@example.com`);
    await page.getByLabel('Ruolo').fill('Manager');
    await page.getByLabel('Note').fill('Vorrei aggiornare contatti e orari pubblici.');
    await page.getByRole('button', { name: 'Invia aggiornamento' }).click();

    await expect(page.getByText('Grazie. Il team verificherà l aggiornamento prima della pubblicazione.')).toBeVisible();
    await expectNoTechnicalCopy(page);
  });

  test('digest surface stays readable and non-technical', async ({ page }) => {
    await page.goto('/it');

    const digest = page.locator('form.digest-form').first();
    await expect(digest).toBeVisible();
    await expect(digest.getByRole('heading', { name: 'Solo idee che aiutano davvero a decidere' })).toBeVisible();
    await expect(digest.getByPlaceholder('nome@email.com')).toBeVisible();
    await expect(digest.getByRole('button', { name: 'Iscriviti al digest' })).toBeVisible();
    await expectNoTechnicalCopy(page);
  });
});
