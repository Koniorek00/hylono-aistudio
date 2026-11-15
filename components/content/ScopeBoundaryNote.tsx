interface ScopeBoundaryNoteProps {
  lead: string;
  denials: string[];
  className?: string;
}

export function ScopeBoundaryNote({ lead, denials, className = '' }: ScopeBoundaryNoteProps) {
  return (
    <p className={className}>
      {lead} Not: {denials.join(', ')}.
    </p>
  );
}
