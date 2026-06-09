import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  ariaLabel: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}

export default function FilterSelect({ ariaLabel, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find(option => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => setOpen(current => !current)}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-left font-medium text-slate-800 outline-none transition hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
      >
        <span className="truncate" style={{ fontSize: '11px', lineHeight: '1rem' }}>{selected.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="no-scrollbar absolute left-0 top-full z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 text-[11px] shadow-lg"
        >
          {options.map(option => {
            const active = option.value === value;

            return (
              <button
                key={option.value || option.label}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left transition ${
                  active
                    ? 'bg-emerald-50 font-semibold text-emerald-800'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
