import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="site-shell site-main">
      <section className="empty-state">
        <h1>Pagina non trovata</h1>
        <p>Questo percorso non esiste oppure la citta non e ancora pubblica.</p>
        <Link href="/it" className="button button-primary">
          Torna a chefamo
        </Link>
      </section>
    </main>
  );
}
