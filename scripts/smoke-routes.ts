const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';

const checks = [
  { path: '/it', markers: ['chefamo', 'Palermo'] },
  {
    path: '/it/palermo',
    markers: ['Palermo', 'Attivita in evidenza', 'Programmi attivi', 'Quartieri coperti', 'Persone, non solo slot.'],
    absent: ['Soglia di copertura', 'Copertura CTA', 'Quando Supabase non è configurato']
  },
  {
    path: '/it/palermo/classes',
    markers: ['Filtri', 'Vista mappa', 'Calendario'],
    absent: ['Soglia di copertura', 'Copertura CTA', 'Not published on captured pages']
  },
  {
    path: '/it/palermo/classes?view=map',
    markers: ['Vista mappa', 'attività visibili'],
    absent: ['NEXT_PUBLIC_MAPBOX_TOKEN', 'Mappa non configurata', 'Map not configured']
  },
  { path: '/it/palermo/organizers', markers: ['Organizzatori a Palermo', 'Persone, non solo slot.'] },
  { path: '/it/palermo/places', markers: ['Luoghi a Palermo', 'Spazi utili per la vita di famiglia'] },
  { path: '/it/suggest-calendar', markers: ['Suggerisci la tua programmazione', 'Scrivici via email'] },
  { path: '/it/account', markers: ['Account'] },
  { path: '/it/favorites', markers: ['Preferiti per scegliere con calma', 'Qui tornano le scelte che vuoi seguire con calma'] },
  { path: '/it/schedule', markers: ['La tua settimana, gia filtrata'] },
  {
    path: '/it/sign-in',
    markers: ['Accedi', 'Uno spazio personale leggero e utile'],
    absent: ['Supabase', 'Modalità', 'Auth reale attiva', 'Qualcosa si è interrotto']
  }
];

const failures: string[] = [];

async function run() {
  for (const check of checks) {
    const url = new URL(check.path, baseUrl).toString();

    try {
      const response = await fetch(url);
      const body = await response.text();

      if (!response.ok) {
        failures.push(`${check.path}: expected 200, got ${response.status}`);
        continue;
      }

      for (const marker of check.markers) {
        if (!body.includes(marker)) {
          failures.push(`${check.path}: missing marker "${marker}"`);
        }
      }

      for (const marker of check.absent ?? []) {
        if (body.includes(marker)) {
          failures.push(`${check.path}: unexpected marker "${marker}"`);
        }
      }
    } catch (error) {
      failures.push(`${check.path}: ${(error as Error).message}`);
    }
  }

  if (failures.length > 0) {
    console.error('Smoke route check failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Smoke route check passed for ${checks.length} routes on ${baseUrl}`);
}

void run();
