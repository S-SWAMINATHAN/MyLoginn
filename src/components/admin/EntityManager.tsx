"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AnimatedPlus } from "@/components/ui/icons/AnimatedPlus";
import { AnimatedEdit } from "@/components/ui/icons/AnimatedEdit";
import { AnimatedTrash } from "@/components/ui/icons/AnimatedTrash";
import { AnimatedClose } from "@/components/ui/icons/AnimatedClose";
import { useLiveData } from "@/components/admin/useLiveData";
import { CategoryPicker } from "@/components/admin/CategoryPicker";
import { DataTable, LiveIndicator, type Column, type Row } from "@/components/admin/DataTable";
import { Modal, ConfirmDialog, useToast, type ConfirmState } from "@/components/admin/Modal";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox" | "date" | "category";
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Span both columns of the form grid. */
  full?: boolean;
  min?: number;
  max?: number;
  step?: string;
};

export type EntityConfig = {
  entity: string;
  titleSingular: string;
  titlePlural: string;
  description: string;
  columns: Column[];
  /** Present ⇒ the "Add" button is shown. */
  createFields?: FieldDef[];
  /** Present ⇒ each row gets an edit action. */
  editFields?: FieldDef[];
  createDefaults?: Record<string, unknown>;
  /** Row key used to name the record inside confirmation popups. */
  nameKey: string;
  canDelete?: boolean;
  /** Select-type fields offered in the bulk-edit modal for multi-selected rows. */
  bulkFields?: FieldDef[];
};

type FormValues = Record<string, unknown>;

function initialValues(fields: FieldDef[], source?: Row, defaults?: Record<string, unknown>): FormValues {
  const values: FormValues = {};
  for (const f of fields) {
    const raw = source?.[f.name] ?? defaults?.[f.name];
    if (f.type === "checkbox") values[f.name] = Boolean(raw);
    else if (f.type === "date" && typeof raw === "string") values[f.name] = raw.slice(0, 10);
    else values[f.name] = raw ?? "";
  }
  return values;
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "textarea") {
    return (
      <Textarea
        label={field.label}
        rows={3}
        required={field.required}
        placeholder={field.placeholder}
        hint={field.hint}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "category") {
    return (
      <CategoryPicker
        label={field.label}
        value={String(value ?? "")}
        onChange={onChange}
        hint={field.hint}
      />
    );
  }
  if (field.type === "select") {
    return (
      <Select
        label={field.label}
        options={field.options ?? []}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3">
        <span className="text-sm font-medium">{field.label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => onChange(!value)}
          className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ${
            value ? "brand-gradient-bg" : "bg-surface-2 border border-border-soft"
          }`}
        >
          <span
            className={`absolute top-1/2 h-4.5 w-4.5 -translate-y-1/2 rounded-full bg-white shadow transition-all duration-300 ${
              value ? "left-[calc(100%-1.375rem)]" : "left-1"
            }`}
          />
        </button>
      </label>
    );
  }
  return (
    <Input
      label={field.label}
      type={field.type}
      required={field.required}
      placeholder={field.placeholder}
      hint={field.hint}
      min={field.min}
      max={field.max}
      step={field.step}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function EntityManager({ config }: { config: EntityConfig }) {
  const { entity, titleSingular, titlePlural, description, columns, createFields, editFields, createDefaults, nameKey, bulkFields } = config;
  const canDelete = config.canDelete !== false;

  const { data, error, loading, updatedAt, refresh } = useLiveData<{ rows: Row[] }>(`/api/admin/${entity}`);
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const toast = useToast();

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [values, setValues] = useState<FormValues>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkValues, setBulkValues] = useState<FormValues>({});

  // Drop selections that no longer exist after a live refresh.
  useEffect(() => {
    setSelectedIds((prev) => {
      const existing = new Set(rows.map((r) => r.id));
      const next = new Set([...prev].filter((id) => existing.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const activeFields = formMode === "create" ? createFields ?? [] : editFields ?? [];

  function openCreate() {
    setValues(initialValues(createFields ?? [], undefined, createDefaults));
    setFormError(null);
    setFormMode("create");
  }

  function openEdit(row: Row) {
    setEditingRow(row);
    setValues(initialValues(editFields ?? [], row));
    setFormError(null);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setEditingRow(null);
  }

  async function send(method: "POST" | "PATCH" | "DELETE", id: string | null, body?: FormValues) {
    const url = id ? `/api/admin/${entity}/${encodeURIComponent(id)}` : `/api/admin/${entity}`;
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? "Request failed");
    }
  }

  /** Form submit → confirmation popup → API call → toast + live refresh. */
  function requestSave() {
    const missing = activeFields.find(
      (f) => f.required && String(values[f.name] ?? "").trim() === ""
    );
    if (missing) {
      setFormError(`${missing.label} is required`);
      return;
    }
    setFormError(null);

    const mode = formMode;
    const row = editingRow;
    const label =
      mode === "edit"
        ? String(row?.[nameKey] ?? titleSingular)
        : String(values[nameKey] ?? "").trim() || `new ${titleSingular.toLowerCase()}`;

    setConfirm({
      title: mode === "create" ? `Add ${titleSingular.toLowerCase()}?` : "Save changes?",
      message: (
        <>
          {mode === "create" ? "Create " : "Update "}
          <span className="font-semibold text-foreground">“{label}”</span>
          {mode === "create" ? ` in ${titlePlural.toLowerCase()}?` : ` — the change goes live immediately.`}
        </>
      ),
      confirmLabel: mode === "create" ? "Yes, add it" : "Yes, save",
      tone: "primary",
      onConfirm: async () => {
        try {
          const payload: FormValues = {};
          for (const f of activeFields) {
            const v = values[f.name];
            if (f.type === "password" && String(v ?? "") === "") continue;
            payload[f.name] = f.type === "number" ? Number(v ?? 0) : v;
          }
          await send(mode === "create" ? "POST" : "PATCH", mode === "edit" ? String(row?.id) : null, payload);
          toast("success", mode === "create" ? `${titleSingular} added` : `${titleSingular} updated`);
          closeForm();
          refresh();
        } catch (err) {
          toast("error", err instanceof Error ? err.message : "Request failed");
        }
      },
    });
  }

  function requestDelete(row: Row) {
    setConfirm({
      title: `Delete ${titleSingular.toLowerCase()}?`,
      message: (
        <>
          <span className="font-semibold text-foreground">“{String(row[nameKey] ?? row.id)}”</span> will be permanently
          removed along with its linked records. This cannot be undone.
        </>
      ),
      confirmLabel: "Yes, delete",
      tone: "danger",
      onConfirm: async () => {
        try {
          await send("DELETE", String(row.id));
          toast("success", `${titleSingular} deleted`);
          refresh();
        } catch (err) {
          toast("error", err instanceof Error ? err.message : "Delete failed");
        }
      },
    });
  }

  /** Run one request per selected row in parallel and report the outcome. */
  async function runBulk(fn: (id: string) => Promise<void>, verb: string) {
    const ids = [...selectedIds];
    const results = await Promise.allSettled(ids.map(fn));
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) toast("success", `${ids.length} record${ids.length === 1 ? "" : "s"} ${verb}`);
    else toast("error", `${ids.length - failed} ${verb}, ${failed} failed`);
    setSelectedIds(new Set());
    refresh();
  }

  function requestBulkApply() {
    const payload: FormValues = {};
    for (const f of bulkFields ?? []) {
      const v = bulkValues[f.name];
      if (String(v ?? "").trim() !== "") payload[f.name] = v;
    }
    if (Object.keys(payload).length === 0) return;
    const n = selectedIds.size;
    setConfirm({
      title: "Apply to selected?",
      message: (
        <>
          Update <span className="font-semibold text-foreground">{n}</span> selected{" "}
          {n === 1 ? titleSingular.toLowerCase() : titlePlural.toLowerCase()} at the same time — the changes go live
          immediately.
        </>
      ),
      confirmLabel: `Yes, update ${n}`,
      tone: "primary",
      onConfirm: async () => {
        setBulkOpen(false);
        setBulkValues({});
        await runBulk((id) => send("PATCH", id, payload), "updated");
      },
    });
  }

  function requestBulkDelete() {
    const n = selectedIds.size;
    setConfirm({
      title: `Delete ${n} record${n === 1 ? "" : "s"}?`,
      message: (
        <>
          All <span className="font-semibold text-foreground">{n}</span> selected{" "}
          {n === 1 ? titleSingular.toLowerCase() : titlePlural.toLowerCase()} and their linked records will be
          permanently removed. This cannot be undone.
        </>
      ),
      confirmLabel: `Yes, delete ${n}`,
      tone: "danger",
      onConfirm: () => runBulk((id) => send("DELETE", id), "deleted"),
    });
  }

  const hasActions = Boolean(editFields) || canDelete;
  const hasBulk = Boolean(bulkFields?.length) || canDelete;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 basis-56 text-sm text-muted">{description}</p>
        <LiveIndicator updatedAt={updatedAt} error={error} />
        {createFields && (
          <Button size="sm" icon={<AnimatedPlus className="h-4.5 w-4.5" />} onClick={openCreate}>
            Add {titleSingular.toLowerCase()}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage={`No ${titlePlural.toLowerCase()} found.`}
        selected={hasBulk ? selectedIds : undefined}
        onSelectedChange={hasBulk ? setSelectedIds : undefined}
        actions={
          hasActions
            ? (row) => (
                <>
                  {editFields && (
                    <button
                      onClick={() => openEdit(row)}
                      aria-label={`Edit ${titleSingular.toLowerCase()}`}
                      className="cursor-pointer rounded-full p-1.5 transition-all duration-200 hover:scale-110 hover:bg-brand-50 active:scale-90 dark:hover:bg-brand-900/25"
                    >
                      <AnimatedEdit className="h-4.5 w-4.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => requestDelete(row)}
                      aria-label={`Delete ${titleSingular.toLowerCase()}`}
                      className="cursor-pointer rounded-full p-1.5 transition-all duration-200 hover:scale-110 hover:bg-danger/10 active:scale-90"
                    >
                      <AnimatedTrash className="h-4.5 w-4.5" />
                    </button>
                  )}
                </>
              )
            : undefined
        }
      />

      <Modal
        open={formMode !== null}
        onClose={closeForm}
        wide={activeFields.length > 5}
        title={formMode === "create" ? `Add ${titleSingular.toLowerCase()}` : `Edit ${titleSingular.toLowerCase()}`}
        subtitle={
          formMode === "edit" && editingRow ? `Editing “${String(editingRow[nameKey] ?? "")}”` : undefined
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestSave();
          }}
        >
          <div className={`grid grid-cols-1 gap-4 ${activeFields.length > 5 ? "sm:grid-cols-2" : ""}`}>
            {activeFields.map((f) => (
              <div key={f.name} className={f.full ? "sm:col-span-full" : undefined}>
                <FieldControl
                  field={f}
                  value={values[f.name]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [f.name]: v }))}
                />
              </div>
            ))}
          </div>
          {formError && <p className="mt-4 rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">{formError}</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button size="sm" variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
            <Button size="sm" type="submit">
              {formMode === "create" ? `Add ${titleSingular.toLowerCase()}` : "Save changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Floating bulk-action bar — acts on every selected row at once. */}
      <AnimatePresence>
        {hasBulk && selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-5 left-1/2 z-[60] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-border-soft bg-[var(--glass-nav-bg)] px-4 py-3 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:gap-3"
          >
            <span className="text-sm font-semibold">
              {selectedIds.size} selected
            </span>
            {Boolean(bulkFields?.length) && (
              <Button size="sm" variant="secondary" icon={<AnimatedEdit className="h-4.5 w-4.5" />} onClick={() => setBulkOpen(true)}>
                Bulk edit
              </Button>
            )}
            {canDelete && (
              <Button size="sm" variant="danger" icon={<AnimatedTrash className="h-4.5 w-4.5" />} onClick={requestBulkDelete}>
                Delete selected
              </Button>
            )}
            <button
              onClick={() => setSelectedIds(new Set())}
              aria-label="Clear selection"
              className="cursor-pointer rounded-full p-1.5 transition-transform duration-200 hover:scale-110 hover:bg-surface-2 active:scale-90"
            >
              <AnimatedClose className="h-4.5 w-4.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk edit modal — only the fields you set are applied to every selected row. */}
      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title={`Bulk edit ${selectedIds.size} ${selectedIds.size === 1 ? titleSingular.toLowerCase() : titlePlural.toLowerCase()}`}
        subtitle="Leave a field on “No change” to keep each record's current value."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestBulkApply();
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            {(bulkFields ?? []).map((f) => (
              <Select
                key={f.name}
                label={f.label}
                value={String(bulkValues[f.name] ?? "")}
                onChange={(e) => setBulkValues((prev) => ({ ...prev, [f.name]: e.target.value }))}
                options={[{ label: "— No change —", value: "" }, ...(f.options ?? [])]}
              />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button size="sm" variant="ghost" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={!(bulkFields ?? []).some((f) => String(bulkValues[f.name] ?? "").trim() !== "")}>
              Apply to {selectedIds.size} selected
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
