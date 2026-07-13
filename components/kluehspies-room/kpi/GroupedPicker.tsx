"use client";

// ─── GroupedPicker ────────────────────────────────────────────────────────────
// Ruhige Auswahl mit Suche und visueller Gruppierung, im Stil des Raums:
// Hairlines, keine Karten, Gelb nur als Fokusmarker der Tastatur. Wird für die
// Owner-Auswahl (SEESZN / Klühspies) und die Produktseiten (Deutschland /
// Europa) verwendet.
//
// Bedienung: Öffnen per Klick oder Enter/Leertaste/Pfeil-runter; Suche tippt
// direkt; Pfeiltasten navigieren, Enter und Tab wählen aus, Escape schließt.
// ARIA: Combobox-Muster (Suchfeld role=combobox, Liste role=listbox,
// aktive Option über aria-activedescendant).

import { useEffect, useMemo, useRef, useState } from "react";

export interface PickerOption {
  id: string;
  label: string;
  /** Sekundärzeile, z. B. "Tschechien" oder "eingeladen". */
  meta?: string;
  /** Zusätzlicher Suchtext (Stadt, Land, E-Mail …). */
  searchText?: string;
  /** Externer Link, z. B. die echte Produktseite. */
  href?: string;
}

export interface PickerGroup {
  label: string;
  options: PickerOption[];
}

export default function GroupedPicker({
  id,
  value,
  onChange,
  groups,
  placeholder,
  searchPlaceholder,
  clearLabel,
  disabled,
}: {
  id: string;
  value: string | null;
  onChange: (id: string | null) => void;
  groups: PickerGroup[];
  /** Text der geschlossenen Auswahl ohne Wert, z. B. "Später zuweisen". */
  placeholder: string;
  searchPlaceholder: string;
  /** Option zum Leeren der Auswahl; ohne Angabe gibt es keine. */
  clearLabel?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selected = allOptions.find((o) => o.id === value) ?? null;

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        label: group.label,
        options: group.options.filter((o) =>
          `${o.label} ${o.meta ?? ""} ${o.searchText ?? ""}`.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [groups, query]);

  // Sichtbare Optionen in Anzeigereihenfolge, inklusive der Leeren-Option.
  const visible = useMemo(() => {
    const options = filteredGroups.flatMap((g) => g.options);
    return clearLabel && !query.trim()
      ? [{ id: "", label: clearLabel } as PickerOption, ...options]
      : options;
  }, [filteredGroups, clearLabel, query]);

  // Aktive Option während des Renders ableiten statt per Effect: fällt die
  // markierte Option aus dem Filter, rückt die erste sichtbare nach.
  const effectiveActiveId =
    activeId !== null && visible.some((o) => o.id === activeId)
      ? activeId
      : ((visible.find((o) => o.id === (value ?? "")) ?? visible[0])?.id ?? null);

  // Klick außerhalb schließt.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function openPicker() {
    if (disabled) return;
    setQuery("");
    setActiveId(value ?? (clearLabel ? "" : null));
    setOpen(true);
  }

  function close(returnFocus = true) {
    setOpen(false);
    setQuery("");
    if (returnFocus) buttonRef.current?.focus();
  }

  function select(optionId: string) {
    onChange(optionId === "" ? null : optionId);
    close();
  }

  function move(delta: number) {
    if (visible.length === 0) return;
    const index = visible.findIndex((o) => o.id === effectiveActiveId);
    const next = index === -1 ? 0 : (index + delta + visible.length) % visible.length;
    setActiveId(visible[next].id);
    document
      .getElementById(`${id}-option-${visible[next].id || "none"}`)
      ?.scrollIntoView({ block: "nearest" });
  }

  function onInputKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Enter" || event.key === "Tab") {
      if (effectiveActiveId !== null && visible.length > 0) {
        event.preventDefault();
        select(effectiveActiveId);
      } else {
        close(event.key !== "Tab");
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  const listId = `${id}-listbox`;

  return (
    <div className="kw-picker" ref={rootRef}>
      <button
        type="button"
        ref={buttonRef}
        id={id}
        className="kw-select kw-picker-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : openPicker())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            openPicker();
          }
        }}
      >
        <span className={selected ? undefined : "kw-picker-placeholder"}>
          {selected?.label ?? placeholder}
        </span>
      </button>
      {selected?.href && (
        <a
          className="kw-picker-open-link kr-meta"
          href={selected.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Produktseite öffnen ↗
        </a>
      )}

      {open && (
        <div className="kw-picker-panel">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            className="kw-input kw-picker-search"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              effectiveActiveId !== null ? `${id}-option-${effectiveActiveId || "none"}` : undefined
            }
          />
          <div className="kw-picker-list" role="listbox" id={listId}>
            {clearLabel && !query.trim() && (
              <div
                id={`${id}-option-none`}
                role="option"
                aria-selected={value === null}
                className="kw-picker-option kw-picker-option--clear"
                data-active={effectiveActiveId === "" || undefined}
                onPointerDown={(event) => {
                  event.preventDefault();
                  select("");
                }}
                onPointerMove={() => setActiveId("")}
              >
                {clearLabel}
              </div>
            )}
            {filteredGroups.map((group) => (
              <div key={group.label} className="kw-picker-group" role="group" aria-label={group.label}>
                <div className="kw-picker-group-label" aria-hidden="true">
                  {group.label}
                  <span className="kw-picker-count">{group.options.length}</span>
                </div>
                {group.options.map((option) => (
                  <div
                    key={option.id}
                    id={`${id}-option-${option.id}`}
                    role="option"
                    aria-selected={option.id === value}
                    className="kw-picker-option"
                    data-active={effectiveActiveId === option.id || undefined}
                    data-selected={option.id === value || undefined}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      select(option.id);
                    }}
                    onPointerMove={() => setActiveId(option.id)}
                  >
                    <span className="kw-picker-option-label">{option.label}</span>
                    {option.meta && <span className="kw-picker-option-meta">{option.meta}</span>}
                    {option.href && (
                      <a
                        className="kw-picker-option-link"
                        href={option.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${option.label} auf der Website öffnen`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                      >
                        ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {visible.length === 0 && <p className="kr-meta kw-picker-empty">Keine Treffer.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
