"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import dynamic from "next/dynamic";
import styles from "@/app/style/admin/posts.module.css";
import editorStyles from "@/app/style/admin/editor.module.css";

type VisibilityStatus = "public" | "hidden" | "draft";

const TiptapEditor = dynamic(
  () => import("@/app/admin/_components/TiptapEditor").then((m) => m.TiptapEditor),
  { ssr: false }
);

export interface HintItem {
  id: string;
  title: string;
  content: string;
  type: "tip" | "hint" | "note";
  topicId: string;
  postId: string;
  order: number;
  visibility: VisibilityStatus;
  createdAt: string;
  updatedAt: string;
}

interface TopicItem { id: string; name: string; collectionId: string; order: number }
interface PostItem { id: string; title: string; topicIds: string[] }

interface Props {
  hints: HintItem[];
  posts: PostItem[];
  topics: TopicItem[];
  editingHint: HintItem | null;
  isNewHint: boolean;
  saving?: boolean;
  onNew: () => void;
  onEdit: (hint: HintItem) => void;
  onSave: (hint: HintItem) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onReorder: (items: HintItem[]) => void;
  onSaveOrder: () => void;
  onResetOrder: () => void;
  orderChanged: boolean;
}

const TYPE_COLORS: Record<HintItem["type"], string> = {
  tip: "#10B981",
  hint: "#3B82F6",
  note: "#F59E0B",
};

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const DragHandle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

export function HintList({
  hints, posts, topics, editingHint, saving,
  onNew, onEdit, onSave, onDelete, onCancel, onReorder, onSaveOrder, onResetOrder, orderChanged,
}: Props) {
  const { dictionary: dict } = useDictionary();
  const ht = dict.admin.hints;
  const [filterType, setFilterType] = useState<HintItem["type"] | "all">("all");
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  if (editingHint) {
    return (
      <HintEditor
        hint={editingHint}
        posts={posts}
        topics={topics}
        saving={saving}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  const filtered = filterType === "all" ? hints : hints.filter((h) => h.type === filterType);

  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDragLeave = () => { setDragOverIdx(null); };
  const handleDrop = (dropIdx: number) => {
    const from = dragIdx.current;
    if (from === null || from === dropIdx) { dragIdx.current = null; setDragOverIdx(null); return; }
    const items = [...hints];
    const [moved] = items.splice(from, 1);
    items.splice(dropIdx, 0, moved);
    const reordered = items.map((item, i) => ({ ...item, order: i }));
    onReorder(reordered);
    dragIdx.current = null;
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { dragIdx.current = null; setDragOverIdx(null); };

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
        <div className={styles.hintToolbarRight}>
          {orderChanged && (
            <>
              <button type="button" className={styles.resetOrderBtn} onClick={onResetOrder}>
                Cancel
              </button>
              <button type="button" className={styles.saveOrderBtn} onClick={onSaveOrder}>
                Save Order
              </button>
            </>
          )}
          <button type="button" className={styles.postNewBtn} onClick={onNew}>
            + {ht.newHint}
          </button>
        </div>
      </div>
      <div className={styles.panelList}>
        {filtered.map((hint, idx) => (
          <div
            key={hint.id}
            className={`${styles.hintItem} ${dragOverIdx === idx ? styles.dragOver : ""}`}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(idx)}
            onDragEnd={handleDragEnd}
          >
            <span className={styles.dragHandle}><DragHandle /></span>
            <div className={styles.hintItemInfo} onClick={() => onEdit(hint)}>
              <div className={styles.hintItemTitle}>
                <span
                  className={styles.hintTypeBadge}
                  style={{ color: TYPE_COLORS[hint.type], borderColor: TYPE_COLORS[hint.type] }}
                >
                  {hint.type.toUpperCase()}
                </span>
                <span className={`${styles.statusBadge} ${styles[`status${hint.visibility.charAt(0).toUpperCase()}${hint.visibility.slice(1)}`]}`}>
                  {hint.visibility}
                </span>
                {hint.title}
              </div>
              <div className={styles.hintItemContent}>{hint.content.replace(/<[^>]+>/g, "")}</div>
            </div>
            <div className={styles.hintItemActions}>
              <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => onDelete(hint.id)}>
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
        {filtered.length > 0 && (
          <div
            className={`${styles.bottomDropZone} ${dragOverIdx === filtered.length ? styles.dragOver : ""}`}
            onDragOver={(e) => handleDragOver(e, filtered.length)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(filtered.length)}
          />
        )}
        {filtered.length === 0 && <div className={styles.panelEmpty}>{ht.noHints}</div>}
      </div>
    </>
  );
}

function HintEditor({ hint, posts, topics, saving, onSave, onCancel }: {
  hint: HintItem;
  posts: PostItem[];
  topics: TopicItem[];
  saving?: boolean;
  onSave: (hint: HintItem) => void;
  onCancel: () => void;
}) {
  const { dictionary: dict } = useDictionary();
  const ht = dict.admin.hints;

  const [title, setTitle] = useState(hint.title);
  const [content, setContent] = useState(hint.content);
  const [type, setType] = useState<HintItem["type"]>(hint.type);
  const [topicId, setTopicId] = useState(hint.topicId ?? "");
  const [postId, setPostId] = useState(hint.postId ?? "");
  const [visibility, setVisibility] = useState<VisibilityStatus>(hint.visibility ?? "public");
  const [showFields, setShowFields] = useState(false);

  const postsForTopic = useMemo(
    () => (topicId ? posts.filter((post) => post.topicIds.includes(topicId)) : posts),
    [posts, topicId],
  );

  const handleTopicChange = useCallback((nextTopicId: string) => {
    setTopicId(nextTopicId);
    if (!postId) return;
    if (!nextTopicId) return;
    const stillValid = posts.some((post) => post.id === postId && post.topicIds.includes(nextTopicId));
    if (!stillValid) setPostId("");
  }, [postId, posts]);

  const handlePostChange = useCallback((nextPostId: string) => {
    setPostId(nextPostId);
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim()) return;
    onSave({
      ...hint,
      title: title.trim(),
      content,
      type,
      topicId,
      postId,
      visibility,
      updatedAt: new Date().toISOString().split("T")[0],
    });
  }, [title, content, type, topicId, postId, visibility, hint, onSave]);

  const handleCancel = useCallback(() => { onCancel(); }, [onCancel]);

  return (
    <div className={styles.editorPanel}>
      <div className={styles.editorToolbar}>
        <button type="button" className={styles.editorBackBtn} onClick={handleCancel} disabled={saving}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={styles.editorToolbarRight}>
          <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>{ht.cancel}</button>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : ht.save}</button>
        </div>
      </div>
      <button type="button" className={styles.fieldsToggle} onClick={() => setShowFields((v) => !v)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d={showFields ? "M4 6L8 10L12 6" : "M6 4L10 8L6 12"}
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        {showFields ? "Ẩn thông tin" : "Hiện thông tin"}
      </button>
      {showFields && (
        <div className={styles.editorFields}>
          <div className={styles.editorFieldRow}>
            <div className={editorStyles.fieldGroup} style={{ flex: 1 }}>
              <label className={editorStyles.label}>{dict.admin.posts.titleLabel}</label>
              <input className={editorStyles.input} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={ht.titlePlaceholder} />
            </div>
            <div className={editorStyles.fieldGroup} style={{ flex: 1 }}>
              <label className={editorStyles.label}>Type</label>
              <select className={editorStyles.input} value={type} onChange={(e) => setType(e.target.value as HintItem["type"])}>
                <option value="tip">Tip</option>
                <option value="hint">Hint</option>
                <option value="note">Note</option>
              </select>
            </div>
          </div>
          <div className={styles.editorFieldRowThree}>
            <div className={editorStyles.fieldGroup} style={{ flex: 1 }}>
              <label className={editorStyles.label}>{dict.admin.posts.topicLabel ?? "Topic"}</label>
              <select
                className={editorStyles.input}
                value={topicId}
                onChange={(e) => handleTopicChange(e.target.value)}
              >
                <option value="">No topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
            <div className={editorStyles.fieldGroup} style={{ flex: 1 }}>
              <label className={editorStyles.label}>Post</label>
              <select
                className={editorStyles.input}
                value={postId}
                onChange={(e) => handlePostChange(e.target.value)}
                disabled={postsForTopic.length === 0}
              >
                <option value="">No post</option>
                {postsForTopic.map((post) => (
                  <option key={post.id} value={post.id}>{post.title}</option>
                ))}
              </select>
            </div>
            <div className={editorStyles.fieldGroup} style={{ minWidth: 160 }}>
              <label className={editorStyles.label}>Status</label>
              <select className={editorStyles.input} value={visibility} onChange={(e) => setVisibility(e.target.value as VisibilityStatus)}>
                <option value="public">Public</option>
                <option value="hidden">Hidden</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>
      )}
      <div className={styles.editorContent}>
        <div className={styles.editorContentInner}>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
