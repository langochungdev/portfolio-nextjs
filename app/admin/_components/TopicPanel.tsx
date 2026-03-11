"use client";

import { useState } from "react";
import styles from "@/app/style/admin/posts.module.css";

interface TopicItem {
  id: string;
  name: string;
  collectionId: string;
  order: number;
}

interface Props {
  items: TopicItem[];
  selectedId: string | null;
  totalCount: number;
  counts: Record<string, number>;
  disabled: boolean;
  onSelect: (id: string | null) => void;
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

export function TopicPanel({ items, selectedId, totalCount, counts, disabled, onSelect, onAdd, onRename, onDelete }: Props) {
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

  if (disabled) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Topics</span>
        </div>
        <div className={styles.panelEmpty}>Select a collection</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Topics</span>
        <button
          type="button"
          className={styles.panelAddBtn}
          onClick={() => setAddingNew(true)}
          aria-label="Add topic"
        >+</button>
      </div>
      <div className={styles.panelList}>
        <div
          className={`${styles.panelItem} ${selectedId === null ? styles.panelItemActive : ""}`}
          onClick={() => onSelect(null)}
        >
          <span className={styles.panelItemName}>All</span>
          <span className={styles.panelCount}>{totalCount}</span>
        </div>
        {items.map((topic) => {
          const isSelected = selectedId === topic.id;
          const isEditing = editingId === topic.id;

          return (
            <div
              key={topic.id}
              className={`${styles.panelItem} ${isSelected ? styles.panelItemActive : ""}`}
              onClick={() => !isEditing && onSelect(topic.id)}
            >
              {isEditing ? (
                <input
                  className={styles.panelInlineInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(topic.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  onBlur={() => handleRename(topic.id)}
                  autoFocus
                />
              ) : (
                <>
                  <span className={styles.panelItemName}>{topic.name}</span>
                  <span className={styles.panelCount}>{counts[topic.id] ?? 0}</span>
                  <div className={styles.panelItemActions}>
                    <button type="button" className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); setEditingId(topic.id); setEditName(topic.name); }}>
                      <PencilIcon />
                    </button>
                    <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}>
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
            <input
              className={styles.panelInlineInput}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setAddingNew(false); setNewName(""); }
              }}
              onBlur={handleAdd}
              placeholder="Topic name..."
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
