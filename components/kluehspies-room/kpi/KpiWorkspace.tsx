"use client";

// ─── KPI-Workspace: Einstieg ──────────────────────────────────────────────────
// Komposition des KPI-Slice innerhalb der Sektion „KPI Monitoring“:
// Steuerleiste, primärer KPI, Maßnahmenliste und die drei Drawer. Alle
// kw-Styles leben hier zentral; die Sprache bleibt die des Raums: ein Serif,
// ein Sans, Hairlines, warmes Papier, Gelb nur als Marker.

import type { WorkspaceInit } from "@/lib/kpi/types";
import { WorkspaceProvider } from "./workspace";
import KpiControlBar from "./KpiControlBar";
import PrimaryKpiPanel from "./PrimaryKpiPanel";
import TaskList from "./TaskList";
import KpiDetailDrawer from "./KpiDetailDrawer";
import TaskDetailDrawer from "./TaskDetailDrawer";
import TaskCreateDrawer from "./TaskCreateDrawer";
import UndoToast from "./UndoToast";

export default function KpiWorkspace({ init }: { init: WorkspaceInit }) {
  return (
    <WorkspaceProvider init={init}>
      <div className="kw">
        <KpiControlBar />
        <PrimaryKpiPanel />
        <div className="kw-tasks-block">
          <p className="kr-eyebrow kw-block-label">Maßnahmen zum KPI</p>
          <TaskList />
        </div>
      </div>

      <KpiDetailDrawer />
      <TaskDetailDrawer />
      <TaskCreateDrawer />
      <UndoToast />

      <style>{`
        /* ── KPI-Workspace: gleiche Sprache wie der Raum ────────────────── */
        .kw { display: flex; flex-direction: column; }
        .kw-block-label { border-top: 1px solid var(--line); padding-top: 18px; margin: clamp(48px, 6vw, 72px) 0 20px; }
        .kw-muted { color: var(--text-muted); }
        .kw-empty { padding: 18px 0; }
        .kw-empty-block { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 28px 0; }

        .kw-visually-hidden {
          position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
          overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
        }

        /* ── Steuerleiste ───────────────────────────────────────────────── */
        .kw-bar { border-top: 1px solid var(--line); padding-top: 16px; margin-bottom: clamp(28px, 3.5vw, 44px); }
        .kw-bar-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 28px; }
        .kw-bar-group { display: inline-flex; align-items: center; gap: 10px; }
        .kw-bar-group--sync { gap: 16px; }
        .kw-bar-label {
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-muted); white-space: nowrap;
        }
        .kw-bar-spacer { flex: 1; min-width: 8px; }
        .kw-bar-meta { margin: 12px 0 0; font-size: 13px; line-height: 1.5; color: var(--text-muted); }
        .kw-bar-error { margin: 10px 0 0; font-size: 13px; line-height: 1.5; color: var(--clay); }

        .kw-chip {
          font-family: var(--sans); font-size: 13px; color: var(--text-secondary);
          background: none; border: none; border-bottom: 1px solid transparent;
          padding: 4px 0 5px; cursor: pointer; transition: color 0.2s, border-color 0.2s;
          min-height: 32px;
        }
        .kw-chip + .kw-chip { margin-left: 14px; }
        .kw-chip:hover { color: var(--ink-strong); }
        .kw-chip[data-active] { color: var(--ink-strong); border-color: var(--warm-black); }
        .kw-chip:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }

        .kw-select {
          font-family: var(--sans); font-size: 13px; color: var(--ink-strong);
          background: transparent; border: none; border-bottom: 1px solid var(--border-btn);
          padding: 6px 18px 7px 0; min-height: 34px; cursor: pointer; max-width: 100%;
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, var(--text-muted) 50%),
            linear-gradient(135deg, var(--text-muted) 50%, transparent 50%);
          background-position: calc(100% - 10px) 55%, calc(100% - 5px) 55%;
          background-size: 5px 5px;
          background-repeat: no-repeat;
        }
        .kw-select:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }
        .kw-select:disabled { opacity: 0.5; cursor: default; }

        .kw-link {
          font-family: var(--sans); font-size: 13px; color: var(--ink-strong);
          background: none; border: none; padding: 0 0 2px; cursor: pointer;
          border-bottom: 1px solid var(--border-btn); transition: border-color 0.2s, opacity 0.2s;
          text-align: left;
        }
        .kw-link:hover:not(:disabled) { border-color: var(--warm-black); }
        .kw-link:disabled { opacity: 0.4; cursor: default; }
        .kw-link:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }

        .kw-sync { display: inline-flex; align-items: baseline; gap: 8px; font-size: 13px; color: var(--text-secondary); }
        .kw-sync i { width: 6px; height: 6px; flex: none; background: var(--signal); align-self: center; }
        .kw-sync[data-state="syncing"] i { background: transparent; box-shadow: inset 0 0 0 1px var(--line-strong); animation: kw-pulse 1.4s ease-in-out infinite; }
        .kw-sync[data-state="checking"] i { background: var(--text-faint); }
        .kw-sync[data-state="error"] i { background: var(--clay); }
        .kw-sync[data-state="error"] { color: var(--clay); }
        .kw-sync-checking, .kw-sync-rt { color: var(--text-muted); }
        .kw-sync-rt--off { color: var(--clay); }
        @keyframes kw-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @media (prefers-reduced-motion: reduce) { .kw-sync[data-state="syncing"] i { animation: none; } }

        /* ── Primärer KPI ───────────────────────────────────────────────── */
        .kw-primary {
          display: block; width: 100%; text-align: left; cursor: pointer;
          background: var(--paper-soft); border: 1px solid var(--line);
          padding: clamp(24px, 3vw, 40px);
          transition: background-color 0.3s ease, border-color 0.3s ease;
          font-family: var(--sans); color: var(--text-body);
        }
        .kw-primary:hover { background: var(--surface-raised); border-color: var(--line-strong); }
        .kw-primary:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }
        .kw-primary--empty { cursor: default; }
        .kw-primary-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
        .kw-primary-open { font-size: 13px; color: var(--text-muted); white-space: nowrap; }
        .kw-primary:hover .kw-primary-open { color: var(--ink-strong); }
        .kw-primary-name {
          font-family: var(--serif); font-weight: 400; font-size: clamp(22px, 2.6vw, 30px);
          line-height: 1.2; color: var(--ink-strong); margin: 14px 0 0;
        }
        .kw-primary-grid {
          display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 2fr);
          gap: 24px clamp(28px, 4vw, 64px); margin-top: clamp(20px, 2.5vw, 32px);
          align-items: end;
        }
        .kw-primary-value-block { display: flex; flex-direction: column; gap: 8px; }
        .kw-primary-value {
          font-family: var(--serif); font-size: clamp(52px, 6vw, 76px); line-height: 1;
          color: var(--ink-strong); letter-spacing: -0.01em;
        }
        .kw-primary-value--empty { color: var(--text-faint); }
        .kw-skeleton { background: var(--surface); min-width: 120px; }
        .kw-primary-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 28px; margin: 0; }
        .kw-primary-meta dt { margin-bottom: 6px; }
        .kw-primary-meta dd { margin: 0; font-size: 15px; line-height: 1.5; color: var(--ink-strong); }
        .kw-delta { font-size: 13px; color: var(--text-secondary); }
        .kw-delta[data-dir="down"] { color: var(--clay); }
        .kw-primary-foot {
          display: flex; flex-wrap: wrap; align-items: center; gap: 10px 24px;
          border-top: 1px solid var(--line); margin-top: clamp(20px, 2.5vw, 30px); padding-top: 16px;
          font-size: 13px;
        }

        /* ── Drawer ─────────────────────────────────────────────────────── */
        .kw-drawer-root { position: fixed; inset: 0; z-index: 90; }
        .kw-drawer-root[data-layer="2"] { z-index: 95; }
        .kw-drawer-backdrop {
          position: absolute; inset: 0;
          background: color-mix(in srgb, var(--warm-black) 24%, transparent);
        }
        .kw-drawer {
          position: absolute; top: 0; right: 0; bottom: 0;
          width: min(760px, 96vw); background: var(--paper);
          border-left: 1px solid var(--line-strong);
          display: flex; flex-direction: column;
          font-family: var(--sans); color: var(--text-body);
          animation: kw-slide 0.42s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kw-drawer[data-wide] { width: min(980px, 96vw); }
        .kw-drawer-root[data-layer="2"] .kw-drawer { width: min(640px, 92vw); }
        @keyframes kw-slide { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .kw-drawer { animation: none; } }
        .kw-drawer:focus { outline: none; }
        .kw-drawer-head {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
          padding: 22px clamp(24px, 3.5vw, 48px) 18px;
          border-bottom: 1px solid var(--line);
          background: var(--paper);
        }
        .kw-drawer-title .kr-eyebrow { display: block; margin-bottom: 8px; }
        .kw-drawer-name {
          display: block; font-family: var(--serif); font-size: clamp(19px, 2.2vw, 24px);
          line-height: 1.25; color: var(--ink-strong);
        }
        .kw-drawer-close {
          flex: none; font-family: var(--sans); font-size: 13px; color: var(--text-muted);
          background: none; border: none; cursor: pointer; padding: 4px 0;
          display: inline-flex; align-items: center; gap: 8px; min-height: 36px;
          transition: color 0.2s;
        }
        .kw-drawer-close:hover { color: var(--ink-strong); }
        .kw-drawer-close:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }
        .kw-drawer-body { flex: 1; overflow-y: auto; padding: 0 clamp(24px, 3.5vw, 48px) 48px; }

        .kw-dsection { padding-top: clamp(28px, 3.5vw, 44px); }
        .kw-dsection--head { padding-top: 24px; }
        .kw-dsection--last { padding-bottom: 24px; }
        .kw-dsection-head {
          display: flex; align-items: baseline; justify-content: space-between; gap: 20px;
          border-top: 1px solid var(--line); padding-top: 16px; margin-bottom: 18px;
        }
        .kw-dsection--head + .kw-dsection .kw-dsection-head { border-top: 1px solid var(--line); }
        .kw-dsection-title {
          font-family: var(--serif); font-weight: 400; font-size: 19px; line-height: 1.3;
          color: var(--ink-strong); margin: 0;
        }

        .kw-dhead-grid {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px clamp(20px, 3vw, 40px);
        }
        .kw-dhead-grid .kr-eyebrow { display: block; margin-bottom: 10px; }
        .kw-dhead-value {
          display: block; font-family: var(--serif); font-size: clamp(36px, 4vw, 48px);
          line-height: 1.05; color: var(--ink-strong); margin-bottom: 6px;
        }
        .kw-dhead-mid {
          display: block; font-family: var(--serif); font-size: 26px; line-height: 1.15;
          color: var(--ink-strong); margin-bottom: 6px;
        }
        .kw-dhead-mid--text { font-size: 19px; }
        .kw-dhead-foot {
          display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px;
          border-top: 1px solid var(--line-soft); margin-top: 22px; padding-top: 16px;
        }
        .kw-dhead-foot .kr-btn { margin-left: auto; }
        .kw-target-edit { display: flex; flex-direction: column; gap: 8px; }
        .kw-input--target { max-width: 140px; font-size: 19px; font-family: var(--serif); }

        /* ── Diagramm ───────────────────────────────────────────────────── */
        .kw-chart { margin: 0 0 20px; }
        .kw-chart-frame { position: relative; }
        .kw-chart-frame svg { display: block; width: 100%; height: auto; }
        .kw-chart-frame svg:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 4px; }
        .kw-grid { stroke: var(--line-soft); }
        .kw-axis { stroke: var(--line); }
        .kw-tick { font-family: var(--sans); font-size: 10px; fill: var(--text-faint); letter-spacing: 0.04em; }
        .kw-line-cur { stroke: var(--ink); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .kw-line-prev { stroke: var(--text-muted); stroke-width: 1.5; stroke-dasharray: 4 5; stroke-linecap: round; }
        .kw-line-target { stroke: var(--line-strong); stroke-width: 1; stroke-dasharray: 2 6; }
        .kw-target-label { font-family: var(--sans); font-size: 10px; fill: var(--text-muted); }
        .kw-dl { font-family: var(--sans); font-size: 12px; font-weight: 500; fill: var(--text-body); }
        .kw-point { fill: var(--ink); stroke: var(--paper); stroke-width: 2; }
        .kw-point--prev { fill: var(--text-muted); }
        .kw-cross { stroke: var(--line-strong); stroke-width: 1; }
        .kw-ann { cursor: pointer; }
        .kw-ann:focus-visible .kw-ann-mark { outline: 1px solid var(--ink-strong); outline-offset: 2px; }
        .kw-ann-mark { fill: var(--signal); stroke: var(--warm-black); stroke-width: 0.75; }
        .kw-tip {
          position: absolute; top: 8px; transform: translateX(-50%);
          background: var(--surface-raised); border: 1px solid var(--line);
          padding: 10px 14px; min-width: 170px; max-width: 240px; pointer-events: none;
          display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--text-body);
        }
        .kw-tip-date { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); }
        .kw-tip-row { display: flex; align-items: baseline; gap: 8px; }
        .kw-tip-row strong { font-weight: 600; color: var(--ink-strong); min-width: 34px; }
        .kw-tip-row span:last-child { color: var(--text-muted); }
        .kw-tip-ann { border-top: 1px solid var(--line-soft); padding-top: 5px; color: var(--text-secondary); }
        .kw-key { display: inline-block; width: 14px; height: 0; border-top: 2px solid var(--ink); align-self: center; }
        .kw-key--prev { border-top: 2px dashed var(--text-muted); }
        .kw-key--target { border-top: 1px dashed var(--line-strong); }
        .kw-key--ann { width: 8px; height: 8px; border: none; background: var(--signal); box-shadow: inset 0 0 0 1px var(--warm-black); }
        .kw-legend {
          display: flex; flex-wrap: wrap; gap: 8px 24px; margin-top: 10px;
          font-size: 12px; color: var(--text-muted);
        }
        .kw-legend span { display: inline-flex; align-items: center; gap: 8px; }
        .kw-chart-note { margin-top: 10px; }
        .kw-chart-empty { border: 1px solid var(--line); padding: 40px 24px; text-align: center; }

        /* ── Tabellen ───────────────────────────────────────────────────── */
        .kw-table-wrap { overflow-x: auto; }
        .kw-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .kw-th {
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-muted); text-align: left; padding: 0 14px 10px 0;
          border-bottom: 1px solid var(--line); white-space: nowrap;
        }
        .kw-th--num, .kw-td--num { text-align: right; }
        .kw-th-btn {
          font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit;
          background: none; border: none; padding: 0; cursor: pointer;
        }
        .kw-th-btn:hover { color: var(--ink-strong); }
        .kw-th-btn:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 2px; }
        .kw-th-dir { display: inline-block; min-width: 12px; }
        .kw-td { padding: 12px 14px 12px 0; border-bottom: 1px solid var(--line-soft); vertical-align: top; color: var(--text-body); }
        .kw-td--name { min-width: 180px; }
        .kw-td--query { font-weight: 500; color: var(--ink-strong); }
        .kw-td--num { font-variant-numeric: tabular-nums; white-space: nowrap; }
        .kw-td--action { text-align: right; white-space: nowrap; }
        .kw-tr[data-open] { background: var(--paper-soft); }
        .kw-row-open {
          font-family: var(--serif); font-size: 15px; color: var(--ink-strong);
          background: none; border: none; padding: 0; cursor: pointer; text-align: left;
        }
        .kw-row-open:hover { border-bottom: 1px solid var(--line-strong); }
        .kw-row-open:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }
        .kw-row-detail { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; align-items: flex-start; }
        .kw-query-tools { display: flex; align-items: baseline; gap: 20px; margin-bottom: 14px; flex-wrap: wrap; }
        .kw-more { margin-top: 14px; }

        /* ── Gewinner / Verlierer ───────────────────────────────────────── */
        .kw-findings { display: flex; flex-direction: column; }
        .kw-finding { border-top: 1px solid var(--line-soft); padding: 16px 0 18px; }
        .kw-finding:last-child { border-bottom: 1px solid var(--line-soft); }
        .kw-finding-head { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; margin-bottom: 8px; }
        .kw-finding-obs, .kw-finding-int { margin: 6px 0 0; font-size: 14px; line-height: 1.6; color: var(--text-body); }
        .kw-finding-obs { color: var(--ink-strong); }
        .kw-finding-tag {
          display: inline-block; margin-right: 10px; font-size: 10px; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted);
        }
        .kw-finding .kr-meta { margin-top: 8px; }

        /* ── Formulare ──────────────────────────────────────────────────── */
        .kw-form { display: flex; flex-direction: column; gap: 18px; }
        .kw-form--inline { border: 1px solid var(--line); padding: 20px; margin-bottom: 20px; background: var(--paper-soft); }
        .kw-form-row { display: flex; gap: 20px; flex-wrap: wrap; }
        .kw-form-row .kw-field { flex: 1; min-width: 160px; }
        .kw-field { display: flex; flex-direction: column; gap: 7px; }
        .kw-field--grow { flex: 1; }
        .kw-field-compact { display: inline-flex; flex-direction: column; gap: 5px; }
        .kw-input {
          font-family: var(--sans); font-size: 14px; color: var(--ink-strong);
          background: transparent; border: none; border-bottom: 1px solid var(--border-btn);
          padding: 7px 0 9px; min-height: 36px; outline: none; transition: border-color 0.2s;
          width: 100%;
        }
        .kw-input:focus { border-color: var(--warm-black); }
        .kw-input:disabled { opacity: 0.5; }
        .kw-input::placeholder { color: var(--text-faint); }
        .kw-input--search { max-width: 320px; }
        .kw-textarea { resize: vertical; line-height: 1.55; }
        .kw-form-error { margin: 0; font-size: 13px; line-height: 1.5; color: var(--clay); }
        .kw-form-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .kw-form-actions--end { justify-content: flex-end; }
        .kw-check { display: flex; gap: 12px; align-items: flex-start; font-size: 14px; color: var(--ink-strong); cursor: pointer; }
        .kw-check input { margin-top: 3px; accent-color: var(--warm-black); }
        .kw-check-note { display: block; margin-top: 3px; }
        .kw-insight { border-left: 2px solid var(--signal); background: var(--paper-soft); padding: 16px 18px; display: flex; flex-direction: column; gap: 8px; }
        .kw-insight--plain { border-left-color: var(--line-strong); background: transparent; padding: 0; }
        .kw-section-tools { display: flex; justify-content: space-between; align-items: baseline; gap: 20px; margin-bottom: 14px; flex-wrap: wrap; }

        /* ── Annotationen ───────────────────────────────────────────────── */
        .kw-ann-list { list-style: none; margin: 0; padding: 0; }
        .kw-ann-item { border-top: 1px solid var(--line-soft); }
        .kw-ann-item:last-child { border-bottom: 1px solid var(--line-soft); }
        .kw-ann-item[data-open] { background: var(--paper-soft); }
        .kw-ann-toggle {
          display: flex; gap: 18px; align-items: baseline; width: 100%;
          background: none; border: none; padding: 12px 6px; cursor: pointer; text-align: left;
          font-family: var(--sans);
        }
        .kw-ann-toggle--static { cursor: default; }
        .kw-ann-toggle:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: -1px; }
        .kw-ann-date { flex: none; font-size: 12px; color: var(--text-muted); min-width: 82px; font-variant-numeric: tabular-nums; }
        .kw-ann-title { font-size: 14px; color: var(--ink-strong); }
        .kw-ann-detail { padding: 0 6px 16px calc(82px + 24px); display: flex; flex-direction: column; gap: 8px; }
        .kw-ann-actions { display: flex; gap: 18px; flex-wrap: wrap; }
        .kw-ann-inline-desc { padding: 0 6px 12px calc(82px + 24px); margin: -4px 0 0; }

        /* ── Maßnahmenliste ─────────────────────────────────────────────── */
        .kw-task-filters { display: flex; flex-wrap: wrap; gap: 14px 24px; align-items: flex-end; margin-bottom: 18px; }
        .kw-task-rows { list-style: none; margin: 0; padding: 0; border-bottom: 1px solid var(--line); }
        .kw-task-row { border-top: 1px solid var(--line); }
        .kw-task-row[data-overdue] { box-shadow: inset 2px 0 0 var(--signal); }
        .kw-task-open {
          display: flex; flex-direction: column; gap: 8px; width: 100%; text-align: left;
          background: none; border: none; padding: 16px 10px; cursor: pointer;
          font-family: var(--sans); transition: background-color 0.25s ease;
        }
        .kw-task-open:hover:not(:disabled) { background: var(--paper-soft); }
        .kw-task-open:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: -1px; }
        .kw-task-open:disabled { cursor: default; opacity: 0.6; }
        .kw-task-title { font-family: var(--serif); font-size: 17px; line-height: 1.3; color: var(--ink-strong); }
        .kw-task-meta { display: flex; flex-wrap: wrap; gap: 4px 8px; font-size: 13px; color: var(--text-muted); align-items: baseline; }
        .kw-task-meta [data-priority="high"] { color: var(--ink-strong); font-weight: 500; }
        .kw-task-sep { color: var(--text-faint); }
        .kw-task-due[data-overdue] { color: var(--ink-strong); font-weight: 500; }
        .kw-task-foot { margin-top: 14px; }
        .kw-linked-tasks { list-style: none; margin: 0; padding: 0; border-bottom: 1px solid var(--line-soft); }
        .kw-linked-tasks li { border-top: 1px solid var(--line-soft); }

        /* ── Kommentare ─────────────────────────────────────────────────── */
        .kw-comment-list { list-style: none; margin: 0 0 20px; padding: 0; }
        .kw-comment { border-top: 1px solid var(--line-soft); padding: 14px 0 16px; }
        .kw-comment:last-child { border-bottom: 1px solid var(--line-soft); }
        .kw-comment-head { display: flex; justify-content: space-between; gap: 16px; align-items: baseline; margin-bottom: 6px; flex-wrap: wrap; }
        .kw-comment-author { font-size: 13px; font-weight: 500; color: var(--ink-strong); }
        .kw-comment[data-mine] .kw-comment-author::after { content: " · Sie"; font-weight: 400; color: var(--text-muted); }
        .kw-comment-body { margin: 0; font-size: 14px; line-height: 1.6; color: var(--text-body); white-space: pre-wrap; }
        .kw-comment-form { display: flex; flex-direction: column; gap: 12px; }
        .kw-comment-hint { border-top: 1px solid var(--line-soft); padding-top: 14px; }

        /* ── Freigaben ──────────────────────────────────────────────────── */
        .kw-approvals { display: flex; flex-direction: column; gap: 22px; }
        .kw-approval-open, .kw-approval-none { display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
        .kw-approval-state { display: inline-flex; align-items: center; gap: 9px; font-size: 14px; color: var(--ink-strong); }
        .kw-approval-state i { width: 7px; height: 7px; flex: none; background: var(--text-faint); }
        .kw-approval-state[data-status="requested"] i { background: transparent; box-shadow: inset 0 0 0 1px var(--line-strong); }
        .kw-approval-state[data-status="approved"] i { background: var(--signal); }
        .kw-approval-state[data-status="changes_requested"] i { background: var(--clay); }
        .kw-approval-history > .kr-eyebrow { display: block; margin-bottom: 12px; }
        .kw-approval-history ul { list-style: none; margin: 0; padding: 0; }
        .kw-approval-round { border-top: 1px solid var(--line-soft); padding: 14px 0 16px; display: flex; flex-direction: column; gap: 7px; }
        .kw-approval-round:last-child { border-bottom: 1px solid var(--line-soft); }
        .kw-approval-note { margin: 0; font-size: 14px; line-height: 1.55; color: var(--text-body); font-style: normal; }

        /* ── Aktivität ──────────────────────────────────────────────────── */
        .kw-activity { list-style: none; margin: 0; padding: 0; }
        .kw-activity-row {
          display: grid; grid-template-columns: 150px 1fr; gap: 4px 20px;
          border-top: 1px solid var(--line-soft); padding: 11px 0;
        }
        .kw-activity-row:last-child { border-bottom: 1px solid var(--line-soft); }
        .kw-activity-time { white-space: nowrap; }
        .kw-activity-text { font-size: 14px; line-height: 1.55; color: var(--text-body); }

        /* ── Task-Detail ────────────────────────────────────────────────── */
        .kw-props { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 28px; }
        .kw-prop-static { font-size: 14px; color: var(--ink-strong); padding: 8px 0; }
        .kw-props-hint { margin-top: 16px; }
        .kw-task-desc { max-width: 640px; margin-bottom: 14px; white-space: pre-wrap; }
        .kw-task-created { margin-top: 16px; }

        /* ── Quellenkennzeichnung & Dimensionstabellen ──────────────────── */
        .kw-provenance { margin: 0; font-size: 12px; line-height: 1.6; letter-spacing: 0.01em; }
        .kw-dim-period {
          margin: 0 0 14px; padding: 8px 0 10px;
          border-bottom: 1px solid var(--line-soft);
        }
        .kw-primary-pending { max-width: 560px; margin-top: 14px; }

        /* ── Gruppierte Auswahl (Owner, Produktseiten) ──────────────────── */
        .kw-picker { position: relative; display: flex; flex-direction: column; gap: 6px; }
        .kw-picker-trigger { text-align: left; width: 100%; }
        .kw-picker-placeholder { color: var(--text-muted); }
        .kw-picker-open-link { align-self: flex-start; color: var(--text-secondary); text-decoration: none; border-bottom: 1px solid var(--border-btn); padding-bottom: 1px; }
        .kw-picker-open-link:hover { color: var(--ink-strong); border-color: var(--warm-black); }
        .kw-picker-panel {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 30;
          background: var(--paper); border: 1px solid var(--line-strong);
          box-shadow: 0 18px 40px -28px color-mix(in srgb, var(--warm-black) 45%, transparent);
          display: flex; flex-direction: column; min-width: 240px;
        }
        .kw-picker-search { border-bottom: 1px solid var(--line); padding: 10px 14px 11px; min-height: 40px; }
        .kw-picker-search:focus { border-color: var(--line-strong); }
        .kw-picker-list { max-height: 300px; overflow-y: auto; padding: 4px 0 8px; }
        .kw-picker-group-label {
          display: flex; justify-content: space-between; align-items: baseline; gap: 12px;
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--text-muted); padding: 12px 14px 6px;
          border-top: 1px solid var(--line-soft); margin-top: 4px;
        }
        .kw-picker-group:first-child .kw-picker-group-label { border-top: none; margin-top: 0; }
        .kw-picker-count { font-variant-numeric: tabular-nums; color: var(--text-faint); letter-spacing: 0; }
        .kw-picker-option {
          display: flex; align-items: baseline; gap: 10px; padding: 8px 14px; cursor: pointer;
          font-size: 14px; color: var(--ink-strong);
        }
        .kw-picker-option[data-active] { background: var(--paper-soft); box-shadow: inset 2px 0 0 var(--signal); }
        .kw-picker-option[data-selected] .kw-picker-option-label { font-weight: 600; }
        .kw-picker-option--clear { color: var(--text-muted); }
        .kw-picker-option-label { flex: 1; min-width: 0; }
        .kw-picker-option-meta { font-size: 12px; color: var(--text-muted); white-space: nowrap; }
        .kw-picker-option-link {
          flex: none; font-size: 12px; color: var(--text-muted); text-decoration: none; padding: 0 2px;
        }
        .kw-picker-option-link:hover { color: var(--ink-strong); }
        .kw-picker-empty { padding: 14px; margin: 0; }

        /* ── @-Erwähnungen ──────────────────────────────────────────────── */
        .kw-mention-field { position: relative; }
        .kw-mention-panel {
          position: absolute; top: calc(100% + 4px); left: 0; z-index: 30;
          min-width: 220px; max-height: 240px; overflow-y: auto;
          background: var(--paper); border: 1px solid var(--line-strong);
          box-shadow: 0 18px 40px -28px color-mix(in srgb, var(--warm-black) 45%, transparent);
          padding: 4px 0;
        }
        .kw-mention {
          background: color-mix(in srgb, var(--signal) 26%, transparent);
          color: var(--ink-strong); font-weight: 500; padding: 0 2px;
        }

        /* ── Drei-Punkte-Menü im Task-Drawer ────────────────────────────── */
        .kw-task-tools { position: relative; display: flex; justify-content: flex-end; margin-bottom: 4px; }
        .kw-menu-trigger {
          font-family: var(--sans); font-size: 18px; line-height: 1; letter-spacing: 0.08em;
          color: var(--text-muted); background: none; border: none; cursor: pointer;
          padding: 4px 8px; min-height: 32px;
        }
        .kw-menu-trigger:hover { color: var(--ink-strong); }
        .kw-menu-trigger:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }
        .kw-menu {
          position: absolute; top: calc(100% + 4px); right: 0; z-index: 30; min-width: 260px;
          background: var(--paper); border: 1px solid var(--line-strong);
          box-shadow: 0 18px 40px -28px color-mix(in srgb, var(--warm-black) 45%, transparent);
          display: flex; flex-direction: column; padding: 6px 0;
        }
        .kw-menu-item {
          display: flex; flex-direction: column; gap: 2px; text-align: left;
          font-family: var(--sans); font-size: 14px; color: var(--ink-strong);
          background: none; border: none; cursor: pointer; padding: 10px 16px;
        }
        .kw-menu-item:hover { background: var(--paper-soft); }
        .kw-menu-item:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: -1px; }
        .kw-menu-item--danger { color: var(--clay); }
        .kw-menu-note { font-size: 12px; color: var(--text-muted); }

        /* ── Löschen: Dialog, Hinweis, Admin-Ansicht, Rückgängig ────────── */
        .kw-confirm {
          border: 1px solid var(--line-strong); background: var(--paper-soft);
          padding: 20px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 14px;
        }
        .kw-confirm-title { margin: 0; color: var(--ink-strong); }
        .kw-deleted-note {
          border-left: 2px solid var(--clay); background: var(--paper-soft);
          padding: 14px 18px; margin-bottom: 18px;
          display: flex; flex-direction: column; gap: 8px; align-items: flex-start;
        }
        .kw-deleted-block { margin-top: clamp(28px, 3.5vw, 44px); border-top: 1px solid var(--line); padding-top: 16px; }
        .kw-deleted-rows { margin-top: 14px; }
        .kw-deleted-row {
          display: flex; justify-content: space-between; align-items: baseline; gap: 20px;
          padding: 16px 10px;
        }
        .kw-deleted-row > div { display: flex; flex-direction: column; gap: 8px; }
        .kw-undo {
          position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 120;
          display: flex; align-items: baseline; gap: 18px;
          background: var(--paper); border: 1px solid var(--line-strong);
          box-shadow: 0 18px 40px -24px color-mix(in srgb, var(--warm-black) 50%, transparent);
          padding: 12px 20px; font-family: var(--sans); font-size: 13px; color: var(--text-body);
          max-width: min(560px, calc(100vw - 32px));
        }
        .kw-undo-text { color: var(--ink-strong); }

        /* ── Responsiv ──────────────────────────────────────────────────── */
        @media (max-width: 1100px) {
          .kw-primary-grid { grid-template-columns: 1fr; }
          .kw-dhead-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .kw-props { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 720px) {
          .kw-drawer, .kw-drawer[data-wide], .kw-drawer-root[data-layer="2"] .kw-drawer { width: 100vw; border-left: none; }
          .kw-primary-meta { grid-template-columns: 1fr; }
          .kw-dhead-grid { grid-template-columns: 1fr; }
          .kw-props { grid-template-columns: 1fr; }
          .kw-activity-row { grid-template-columns: 1fr; }
          .kw-ann-detail, .kw-ann-inline-desc { padding-left: 6px; }
          .kw-bar-row { align-items: flex-start; }
        }
      `}</style>
    </WorkspaceProvider>
  );
}
