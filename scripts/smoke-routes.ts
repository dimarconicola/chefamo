import http from 'node:http';
import https from 'node:https';

const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';

const checks = [
  { path: '/it', markers: ['chefamo', 'Palermo'] },
  {
    path: '/it/palermo',
    markers: ['Palermo', 'Attivita in evidenza', 'Programmi attivi', 'Quartieri coperti'],
    absent: ['Soglia di copertura', 'Copertura CTA', 'Quando Supabase non è configurato']
  },
  {
    path: '/it/palermo/activities',
    markers: ['Filtri', 'Vista mappa', 'Calendario'],
    absent: ['Soglia di copertura', 'Copertura CTA', 'Not published on captured pages']
  },
  {
    path: '/it/palermo/activities?view=map',
    markers: ['Vista mappa'],
    absent: ['NEXT_PUBLIC_MAPBOX_TOKEN', 'Mappa non configurata', 'Map not configured']
  },
  { path: '/it/palermo/places/planetario-palermo-place', markers: ['Planetario di Palermo', 'museum'] },
  { path: '/it/palermo/categories/stem', markers: ['Palermo', 'Programmi ricorrenti'] },
  { path: '/it/palermo/organizers/planetario-palermo', markers: ['Planetario Palermo'] },
  { path: '/it/palermo/organizers', markers: ['Organizzatori a Palermo', 'Planetario Palermo'] },
  { path: '/it/palermo/places', markers: ['Luoghi a Palermo', 'Planetario di Palermo'] },
  { path: '/it/suggest-calendar', markers: ['Suggerisci la tua programmazione', 'Invio rapido'] },
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

const requestHtml = async (target: string) =>
  new Promise<{ status: number; body: string }>((resolve, reject) => {
    const url = new URL(target);
    const client = url.protocol === 'https:' ? https : http;
    const request = client.get(
      url,
      {
        headers: {
          Accept: 'text/html',
          Connection: 'close'
        },
        timeout: 10_000
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        response.on('end', () => {
          resolve({
            status: response.statusCode ?? 0,
            body: Buffer.concat(chunks).toString('utf8')
          });
        });
      }
    );

    request.setTimeout(10_000, () => {
      request.destroy(new Error(`Timed out fetching ${target}`));
    });
    request.on('error', reject);
  });

async function run() {
  for (const check of checks) {
    const url = new URL(check.path, baseUrl).toString();

    try {
      const response = await requestHtml(url);
      const body = response.body;

      if (response.status < 200 || response.status >= 300) {
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
