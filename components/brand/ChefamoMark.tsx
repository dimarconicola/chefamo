interface ChefamoMarkProps {
  note?: string;
  className?: string;
}

export function ChefamoMark({ note, className }: ChefamoMarkProps) {
  return (
    <span className={`chefamo-mark${className ? ` ${className}` : ''}`}>
      <span className="chefamo-mark-badge" aria-hidden="true">
        c
      </span>
      <span className="chefamo-mark-copy">
        <span className="chefamo-mark-word">chefamo</span>
        {note ? <span className="chefamo-mark-note">{note}</span> : null}
      </span>
    </span>
  );
}
