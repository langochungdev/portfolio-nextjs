"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "@/app/style/admin/tag-selector.module.css";

interface TagOption {
  id: string;
  name: string;
}

interface TagSelectorProps {
  label: string;
  options: TagOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  onCreate?: (name: string) => Promise<string>;
  required?: boolean;
  placeholder?: string;
  single?: boolean;
}

export function TagSelector({
  label,
  options,
  selected,
  onChange,
  onCreate,
  required,
  placeholder = "Search...",
  single,
}: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      if (selected.includes(id)) {
        if (required && selected.length <= 1) return;
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange(single ? [id] : [...selected, id]);
      }
    },
    [selected, onChange, required, single],
  );

  const handleCreate = useCallback(async () => {
    if (!onCreate || !search.trim() || creating) return;
    setCreating(true);
    try {
      const id = await onCreate(search.trim());
      onChange([...selected, id]);
      setSearch("");
    } catch (err) {
      console.error("Failed to create:", err);
    } finally {
      setCreating(false);
    }
  }, [onCreate, search, creating, selected, onChange]);

  const filtered = search.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    : options;

  const exactMatch = options.some(
    (o) => o.name.toLowerCase() === search.trim().toLowerCase(),
  );

  const selectedOptions = options.filter((o) => selected.includes(o.id));

  return (
    <div className={styles.container} ref={containerRef}>
      <label className={styles.label}>{label}</label>
      <div
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        {selectedOptions.length > 0 ? (
          <div className={styles.tags}>
            {selectedOptions.map((o) => (
              <span key={o.id} className={styles.tag}>
                {o.name}
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(o.id);
                  }}
                  disabled={required && selected.length <= 1}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      {open && (
        <div className={styles.dropdown}>
          <input
            ref={inputRef}
            className={styles.search}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onCreate && search.trim() && !exactMatch) {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <div className={styles.list}>
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`${styles.option} ${selected.includes(o.id) ? styles.optionSelected : ""}`}
                onClick={() => toggle(o.id)}
              >
                <span className={styles.check}>{selected.includes(o.id) ? "✓" : ""}</span>
                {o.name}
              </button>
            ))}
            {filtered.length === 0 && !onCreate && (
              <div className={styles.empty}>No results</div>
            )}
            {onCreate && search.trim() && !exactMatch && (
              <button
                type="button"
                className={styles.createBtn}
                onClick={handleCreate}
                disabled={creating}
              >
                + {creating ? "Creating..." : `Create "${search.trim()}"`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
