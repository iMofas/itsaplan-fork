import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// A checklist title or item text, edited in place. Reads as plain text until it is
// clicked; Enter and blur commit, Escape puts the original back. An empty value is
// not a delete — it reverts, since deleting has its own control. The value is
// single-line: pasted line breaks collapse on commit.
export default function IssueChecklistEditableText({
  value,
  maxLength,
  onCommit,
  readOnly,
  className,
}: {
  value: string;
  // Matches the API's own bound on this field.
  maxLength: number;
  onCommit: (next: string) => void;
  readOnly: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) ref.current?.select();
  }, [editing]);

  function commit() {
    const trimmed = draft.replace(/\s+/g, ' ').trim();
    if (trimmed && trimmed !== value) onCommit(trimmed);
    else setDraft(value);
    setEditing(false);
  }

  if (readOnly)
    return (
      <span dir="auto" className={cn('min-w-0 flex-1 wrap-break-word', className)}>
        {value}
      </span>
    );

  if (!editing)
    return (
      <button
        type="button"
        dir="auto"
        className={cn('min-w-0 flex-1 cursor-text text-start wrap-break-word', className)}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
      >
        {value}
      </button>
    );

  return (
    <textarea
      ref={ref}
      rows={1}
      dir="auto"
      value={draft}
      maxLength={maxLength}
      className={cn(
        'field-sizing-content min-w-0 flex-1 resize-none rounded-sm bg-transparent ring-1 ring-ring/40 outline-none focus:ring-ring',
        className,
      )}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        }
        if (e.key === 'Escape') {
          setDraft(value);
          setEditing(false);
        }
      }}
    />
  );
}
