import type { Locale } from '@/lib/catalog/types';
import { ServerLink } from '@/components/ui/server';

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy =
    locale === 'it'
      ? 'Guida locale per attività 0-14, weekend culturali, laboratori e luoghi family-friendly a Palermo.'
      : 'Local guide for 0-14 activities, culture weekends, labs, and family-friendly places in Palermo.';
  const meta = `© ${new Date().getFullYear()} chefamo · Palermo-first family activity guide`;
  const labels =
    locale === 'it'
      ? {
          classes: 'Attività',
          teachers: 'Organizzatori',
          whoWeAre: 'Chi siamo',
          suggestCalendar: 'Suggerisci programma',
          privacy: 'Privacy Policy',
          cookies: 'Cookies'
        }
      : {
          classes: 'Activities',
          teachers: 'Organizers',
          whoWeAre: 'Who we are',
          suggestCalendar: 'Suggest program',
          privacy: 'Privacy Policy',
          cookies: 'Cookies'
        };

  return (
    <footer className="site-footer-wrap">
      <div className="site-shell site-footer">
        <div className="footer-brand-block">
          <p className="footer-title">chefamo</p>
          <p className="footer-copy">{copy}</p>
          <p className="footer-meta">{meta}</p>
        </div>
        <div className="footer-links">
          <ServerLink href={`/${locale}/palermo`}>Palermo</ServerLink>
          <ServerLink href={`/${locale}/palermo/activities`}>{labels.classes}</ServerLink>
          <ServerLink href={`/${locale}/palermo/organizers`}>{labels.teachers}</ServerLink>
          <ServerLink href={`/${locale}/who-we-are`}>{labels.whoWeAre}</ServerLink>
          <ServerLink href={`/${locale}/privacy-policy`}>{labels.privacy}</ServerLink>
          <ServerLink href={`/${locale}/cookies`}>{labels.cookies}</ServerLink>
        </div>
        <div className="footer-secondary-link">
          <ServerLink href={`/${locale}/suggest-calendar`}>{labels.suggestCalendar}</ServerLink>
        </div>
      </div>
    </footer>
  );
}
