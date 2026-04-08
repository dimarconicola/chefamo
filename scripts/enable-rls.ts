import { enablePublicTableRls } from '@/lib/data/rls';

async function main() {
  const tables = await enablePublicTableRls();
  console.log(
    JSON.stringify(
      {
        ok: true,
        enabledTables: tables.length,
        tables
      },
      null,
      2
    )
  );
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
