"use client";

import { useState } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "@/app/style/admin/posts.module.css";

interface HintItem {
  id: string;
  title: string;
  content: string;
  type: "tip" | "hint" | "note";
  topicId: string;
  relatedPostId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  hints: HintItem[];
  selectedTopicId: string | null;
  onAdd: (hint: Omit<HintItem, "id">) => void;
  onUpdate: (hint: HintItem) => void;
  onDelete: (id: string) => void;
}

const TYPE_COLORS: Record<HintItem["type"], string> = {
  tip: "#10B981",
  hint: "#3B82F6",
  note: "#F59E0B",
};

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export function HintList({ hints, selectedTopicId, onAdd, onUpdate, onDelete }: Props) {
  const { dictionary: dict } = useDictionary();
  const ht = dict.admin.hints;
  const [composing, setComposing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<HintItem["type"] | "all">("all");

  const filtered = filterType === "all" ? hints : hints.filter((h) => h.type === filterType);

  const handleCreate = (title: string, content: string, type: HintItem["type"]) => {
    const now = new Date().toISOString().split("T")[0];
    onAdd({
      title, content, type,
      topicId: selectedTopicId ?? "",
      relatedPostId: "",
      order: hints.length,
      createdAt: now,
      updatedAt: now,
    });
    setComposing(false);
  };

  const handleUpdate = (hint: HintItem, title: string, content: string, type: HintItem["type"]) => {
    onUpdate({ ...hint, title, content, type, updatedAt: new Date().toISOString().split("T")[0] });
    setEditingId(null);
  };

  return (
    <>
      <div className={styles.hintToolbar}>
        <div className={styles.hintFilters}>
          {(["all", "tip", "hint", "note"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`${styles.hintFilterBtn} ${filterType === f ? styles.hintFilterBtnActive : ""}`}
              onClick={() => setFilterType(f)}
            >
              {f === "all" ? ht.all : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button type="button" className={styles.postNewBtn} onClick={() => setComposing(true)}>
          + {ht.newHint}
        </button>
      </div>
      <div className={styles.panelList}>
        {composing && (
          <HintForm
            onSubmit={handleCreate}
            onCancel={() => setComposing(false)}
            submitLabel={ht.post}
            cancelLabel={ht.cancel}
          />
        )}
        {filtered.map((hint) =>
          editingId === hint.id ? (
            <HintForm
              key={hint.id}
              initial={hint}
              onSubmit={(title, content, type) => handleUpdate(hint, title, content, type)}
              onCancel={() => setEditingId(null)}
              submitLabel={ht.save}
              cancelLabel={ht.cancel}
            />
          ) : (
            <div key={hint.id} className={styles.hintItem}>
              <div className={styles.hintItemInfo}>
                <div className={styles.hintItemTitle}>
                  <span
                    className={styles.hintTypeBadge}
                    style={{ color: TYPE_COLORS[hint.type], borderColor: TYPE_COLORS[hint.type] }}
                  >
                    {hint.type.toUpperCase()}
                  </span>
                  {hint.title}
                </div>
                <div className={styles.hintItemContent}>{hint.content}</div>
              </div>
              <div className={styles.hintItemActions}>
                <button type="button" className={styles.iconBtn} onClick={() => setEditingId(hint.id)}>
                  <PencilIcon />
                </button>
                <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => onDelete(hint.id)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          )
        )}
        {filtered.length === 0 && !composing && <div className={styles.panelEmpty}>{ht.noHints}</div>}
      </div>
    </>
  );
}

function HintForm({ initial, onSubmit, onCancel, submitLabel, cancelLabel }: {
  initial?: HintItem;
  onSubmit: (title: string, content: string, type: HintItem["type"]) => void;
  onCancel: () => void;
  submitLabel: string;
  cancelLabel: string;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [type, setType] = useState<HintItem["type"]>(initial?.type ?? "tip");

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit(title.trim(), content.trim(), type);
  };

  return (
    <div className={styles.hintForm}>
      <input
        className={styles.hintFormTitle}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title..."
        autoFocus
      />
      <textarea
        className={styles.hintFormContent}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content..."
        rows={3}
      />
      <div className={styles.hintFormFooter}>
        <select
          className={styles.hintFormSelect}
          value={type}
          onChange={(e) => setType(e.target.value as HintItem["type"])}
        >
          <option value="tip">Tip</option>
          <option value="hint">Hint</option>
          <option value="note">Note</option>
        </select>
        <div className={styles.hintFormActions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={styles.saveBtn} onClick={handleSubmit}>{submitLabel}</button>
        </div>
      </div>
    </div>
  );
}
