"use client";

// ─── Owner-Auswahl ────────────────────────────────────────────────────────────
// Lädt die Optionen aus profiles + memberships der aktuellen Organisation
// (WorkspaceInit.members) – nichts ist hart codiert. Gruppiert nach
// Unternehmen (SEESZN / Klühspies), mit Suche nach Name; eingeladene, noch
// nie angemeldete Mitglieder sind als „eingeladen“ gekennzeichnet.

import { useMemo } from "react";
import { COMPANY_LABEL, type MemberCompany, type MemberRow } from "@/lib/kpi/types";
import { displayName } from "@/lib/kpi/format";
import GroupedPicker, { type PickerGroup } from "./GroupedPicker";
import { useWorkspace } from "./workspace";

const COMPANY_ORDER: MemberCompany[] = ["seeszn", "kluehspies"];

/** Owner-fähig ist nur, wer eine Unternehmenszuordnung und einen gültigen
 *  Status (aktiv oder eingeladen) hat. Memberships ohne company erscheinen
 *  bewusst nicht in der Owner-Auswahl. */
function isSelectableOwner(member: MemberRow): member is MemberRow & { company: MemberCompany } {
  return member.company !== null && (member.status === "active" || member.status === "invited");
}

export function buildOwnerGroups(members: MemberRow[]): PickerGroup[] {
  const selectable = members.filter(isSelectableOwner);
  return COMPANY_ORDER.map((company) => ({
    label: COMPANY_LABEL[company],
    options: selectable
      .filter((member) => member.company === company)
      .sort((a, b) => displayName(a).localeCompare(displayName(b), "de"))
      .map((member) => ({
        id: member.profile_id,
        label: displayName(member),
        meta: member.status === "invited" ? "eingeladen" : undefined,
        searchText: `${member.full_name ?? ""} ${member.email ?? ""}`,
      })),
  })).filter((group) => group.options.length > 0);
}

export default function OwnerPicker({
  id,
  value,
  onChange,
  disabled,
  clearLabel = "Nicht zugewiesen",
}: {
  id: string;
  value: string | null;
  onChange: (ownerId: string | null) => void;
  disabled?: boolean;
  clearLabel?: string;
}) {
  const { members } = useWorkspace();
  const groups = useMemo(() => buildOwnerGroups(members), [members]);

  return (
    <GroupedPicker
      id={id}
      value={value}
      onChange={onChange}
      groups={groups}
      placeholder={clearLabel}
      searchPlaceholder="Nach Name suchen…"
      clearLabel={clearLabel}
      disabled={disabled}
    />
  );
}
