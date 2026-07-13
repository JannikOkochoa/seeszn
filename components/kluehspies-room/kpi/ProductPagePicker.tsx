"use client";

// ─── Produktseiten-Auswahl ────────────────────────────────────────────────────
// Auswahl der importierten Reiseziele im Aufgabenformular: Suchfeld (Name,
// Stadt, Land), Gruppen Deutschland und Europa mit Anzahl, Link zum Öffnen der
// echten Produktseite. Archivierte Ziele erscheinen nicht mehr zur Auswahl,
// bleiben aber an bestehenden Maßnahmen sichtbar.

import { useMemo } from "react";
import { PAGE_REGION_LABEL, type PageRegion, type PageRow } from "@/lib/kpi/types";
import GroupedPicker, { type PickerGroup } from "./GroupedPicker";
import { useWorkspace } from "./workspace";

const REGION_ORDER: PageRegion[] = ["deutschland", "europa"];

export function buildPageGroups(pages: PageRow[], selectedId: string | null): PickerGroup[] {
  const selectable = pages.filter(
    (page) => (page.region !== null && page.archived_at === null) || page.id === selectedId,
  );

  const groups: PickerGroup[] = REGION_ORDER.map((region) => ({
    label: PAGE_REGION_LABEL[region],
    options: selectable
      .filter((page) => page.region === region)
      .sort((a, b) => a.name.localeCompare(b.name, "de"))
      .map((page) => ({
        id: page.id,
        label: page.name,
        meta:
          [page.archived_at !== null ? "archiviert" : null, region === "europa" ? page.country : null]
            .filter(Boolean)
            .join(" · ") || undefined,
        searchText: `${page.city ?? ""} ${page.country ?? ""}`,
        href: page.url,
      })),
  })).filter((group) => group.options.length > 0);

  // Seiten ohne Region (Altbestand vor dem Import) bleiben auswählbar.
  const legacy = selectable.filter((page) => page.region === null);
  if (legacy.length > 0) {
    groups.push({
      label: "Weitere Seiten",
      options: legacy
        .sort((a, b) => a.name.localeCompare(b.name, "de"))
        .map((page) => ({ id: page.id, label: page.name, href: page.url })),
    });
  }
  return groups;
}

export default function ProductPagePicker({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: string | null;
  onChange: (pageId: string | null) => void;
  disabled?: boolean;
}) {
  const { pages } = useWorkspace();
  const groups = useMemo(() => buildPageGroups(pages, value), [pages, value]);

  return (
    <GroupedPicker
      id={id}
      value={value}
      onChange={onChange}
      groups={groups}
      placeholder="Keine Seite"
      searchPlaceholder="Stadt oder Land suchen…"
      clearLabel="Keine Seite"
      disabled={disabled}
    />
  );
}
