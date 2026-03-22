export function StatCard({
  label,
  value,
  detail,
  detailClassName
}: {
  label: string;
  value: string;
  detail?: string;
  detailClassName?: string;
}) {
  return (
    <article className="panel stat-card">
      <p className="eyebrow">{label}</p>
      <h3>{value}</h3>
      {detail ? <p className={`muted${detailClassName ? ` ${detailClassName}` : ''}`}>{detail}</p> : null}
    </article>
  );
}
