"use client";

import { useState } from "react";
import { collectionColors } from "@/lib/mock/blog";
import styles from "@/app/style/admin/posts.module.css";

interface CollectionItem {
  id: string;
  name: string;
  order: number;
}

interface Props {
  items: CollectionItem[];
  selectedId: string | null;
  counts: Record<string, number>;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

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

export function CollectionPanel({ items, selectedId, counts, onSelect, onAdd, onRename, onDelete }: Props) {
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) { setAddingNew(false); return; }
    onAdd(name);
    setNewName("");
    setAddingNew(false);
  };

  const handleRename = (id: string) => {
    const name = editName.trim();
    if (!name) { setEditingId(null); return; }
    onRename(id, name);
    setEditingId(null);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Collections</span>
        <button
          type="button"
          className={styles.panelAddBtn}
          onClick={() => setAddingNew(true)}
          aria-label="Add collection"
        >+</button>
      </div>
      <div className={styles.panelList}>
        {items.map((col) => {
          const color = collectionColors[col.id] ?? "var(--color-text-muted)";
          const isSelected = selectedId === col.id;
          const isEditing = editingId === col.id;

          return (
            <div
              key={col.id}
              className={`${styles.panelItem} ${isSelected ? styles.panelItemActive : ""}`}
              onClick={() => !isEditing && onSelect(col.id)}
            >
              <span className={styles.panelDot} style={{ background: color }} />
              {isEditing ? (
                <input
                  className={styles.panelInlineInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(col.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={() => handleRename(col.id)}
                  autoFocus
                />
              ) : (
                <>
                  <span className={styles.panelItemName}>{col.name}</span>
                  <span className={styles.panelCount}>{counts[col.id] ?? 0}</span>
                  <div className={styles.panelItemActions}>
                    <button type="button" className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); setEditingId(col.id); setEditName(col.name); }}>
                      <PencilIcon />
                    </button>
                    <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={(e) => { e.stopPropagation(); onDelete(col.id); }}>
                      <TrashIcon />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {addingNew && (
          <div className={styles.panelItem}>
            <span className={styles.panelDot} style={{ background: "var(--color-text-muted)" }} />
            <input
              className={styles.panelInlineInput}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAddingNew(false); setNewName(""); }
              }}
              onBlur={handleAdd}
              placeholder="Collection name..."
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
