"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface CompactSelectOption {
  value: string;
  label: string;
  description?: string;
  mobileLabel?: string;
  triggerLabel?: string;
  menuLabel?: string;
}

interface CompactSelectProps {
  ariaLabel: string;
  options: CompactSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  containerClassName?: string;
  triggerClassName?: string;
  menuClassName?: string;
}

export default function CompactSelect({
  ariaLabel,
  options,
  value,
  onChange,
  placeholder,
  containerClassName = "",
  triggerClassName = "",
  menuClassName = "",
}: CompactSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const mobileLabel =
    selectedOption?.mobileLabel ??
    selectedOption?.triggerLabel ??
    selectedOption?.label ??
    placeholder;
  const desktopLabel =
    selectedOption?.triggerLabel ?? selectedOption?.label ?? placeholder;

  return (
    <div ref={containerRef} className={`relative ${containerClassName}`.trim()}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-900 transition outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 ${triggerClassName}`.trim()}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
      >
        <span className="min-w-0 flex-1 truncate sm:hidden">{mobileLabel}</span>
        <span className="hidden min-w-0 flex-1 truncate sm:block">
          {desktopLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div
          className={`absolute inset-x-0 top-[calc(100%+0.5rem)] z-20 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.35)] ${menuClassName}`.trim()}
        >
          <div className="max-h-64 overflow-y-auto pr-1" role="listbox" aria-label={ariaLabel}>
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value || "__empty__"}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isSelected
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {option.menuLabel ?? option.label}
                    </p>
                    {option.description ? (
                      <p className="truncate text-xs text-slate-500">
                        {option.description}
                      </p>
                    ) : null}
                  </div>
                  {isSelected ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
