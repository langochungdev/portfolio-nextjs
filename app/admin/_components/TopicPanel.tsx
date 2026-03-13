"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { resizeImage } from "@/lib/cloudinary/resize";
import styles from "@/app/style/admin/posts.module.css";

type VisibilityStatus = "public" | "hidden" | "draft";

interface TopicItem {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  description: string;
  collectionId: string;
  order: number;
  visibility: VisibilityStatus;
}

export interface TopicFormData {
  name: string;
  slug: string;
  thumbnail: string;
  thumbnailFile?: File;
  description: string;
  visibility: VisibilityStatus;
}

interface Props {
  items: TopicItem[];
  selectedId: string | null;
  totalCount: number;
  counts: Record<string, number>;
  disabled: boolean;
  onSelect: (id: string | null) => void;
  onAdd: (data: TopicFormData) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onReorder: (items: TopicItem[]) => void;
  onSaveOrder: () => void;
  onResetOrder: () => void;
  orderChanged: boolean;
  onUpdateTopic: (id: string, data: Partial<Pick<TopicItem, "name" | "slug" | "thumbnail" | "description" | "visibility">>, thumbnailFile?: File) => void;
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

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const DragHandle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

const generateSlug = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

const OG_RATIO = 1200 / 630;
const RATIO_TOLERANCE = 0.15;

function checkOgRatio(width: number, height: number): { ok: boolean; actual: string; expected: string } {
  const actual = width / height;
  const ok = Math.abs(actual - OG_RATIO) / OG_RATIO <= RATIO_TOLERANCE;
  return { ok, actual: `${width}:${height} (${actual.toFixed(2)})`, expected: `1200:630 (${OG_RATIO.toFixed(2)})` };
}

interface ModalProps {
  editingTopic?: TopicItem;
  onClose: () => void;
  onSubmit: (data: TopicFormData) => void;
  onUpdate?: (id: string, data: Partial<Pick<TopicItem, "name" | "slug" | "thumbnail" | "description" | "visibility">>, file?: File) => void;
}

function TopicModal({ editingTopic, onClose, onSubmit, onUpdate }: ModalProps) {
  const initialName = editingTopic?.name ?? "";
  const initialSlug = editingTopic?.slug || (editingTopic ? generateSlug(editingTopic.name) : "");
  const initialDescription = editingTopic?.description ?? "";
  const initialVisibility = editingTopic?.visibility ?? "public";
  const initialThumbnail = editingTopic?.thumbnail ?? "";

  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [description, setDescription] = useState(initialDescription);
  const [visibility, setVisibility] = useState<VisibilityStatus>(initialVisibility);
  const [thumbnail, setThumbnail] = useState(initialThumbnail);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialThumbnail);
  const [resizing, setResizing] = useState(false);
  const [ratioWarning, setRatioWarning] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleId = editingTopic ? "topic-modal-title-edit" : "topic-modal-title-new";

  const hasChanges = useMemo(() => {
    if (thumbnailFile) return true;

    return (
      name.trim() !== initialName.trim() ||
      slug.trim() !== initialSlug.trim() ||
      description !== initialDescription ||
      visibility !== initialVisibility ||
      thumbnail !== initialThumbnail
    );
  }, [
    thumbnailFile,
    name,
    initialName,
    slug,
    initialSlug,
    description,
    initialDescription,
    visibility,
    initialVisibility,
    thumbnail,
    initialThumbnail,
  ]);

  const canSave = !!name.trim() && hasChanges && !saving;

  const handleProtectedClose = useCallback(() => {
    if (saving) return;
    if (hasChanges) return;
    onClose();
  }, [saving, hasChanges, onClose]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      handleProtectedClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleProtectedClose]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(generateSlug(val));
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setResizing(true);
    setRatioWarning("");
    try {
      const { blob, width, height } = await resizeImage(file);
      const ratio = checkOgRatio(width, height);
      if (!ratio.ok) {
        setRatioWarning(`Tỉ lệ ảnh ${ratio.actual} khác chuẩn OG ${ratio.expected}. Nên dùng ảnh 1200×630 hoặc tỉ lệ ~1.91:1.`);
      }
      const resizedFile = new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
      setThumbnailFile(resizedFile);
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(blob));
      setThumbnail("");
    } catch {
      setRatioWarning("Không thể xử lý ảnh");
    } finally {
      setResizing(false);
    }
  }, [preview]);

  const handleRemoveImage = () => {
    setThumbnailFile(null);
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview("");
    setThumbnail("");
    setRatioWarning("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !hasChanges) return;
    const generatedSlug = generateSlug(trimmedName);
    setSaving(true);
    try {
      if (editingTopic && onUpdate) {
        onUpdate(editingTopic.id, {
          name: trimmedName,
          slug: generatedSlug,
          thumbnail: thumbnailFile ? "" : (thumbnail || preview),
          description,
          visibility,
        }, thumbnailFile ?? undefined);
      } else {
        onSubmit({
          name: trimmedName,
          slug: generatedSlug,
          thumbnail: thumbnail || preview,
          thumbnailFile: thumbnailFile ?? undefined,
          description,
          visibility,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (e.target !== e.currentTarget) return;
    handleProtectedClose();
  };

  return (
    <div
      className={styles.topicModalOverlay}
      onPointerDown={handleOverlayPointerDown}
    >
      <div className={styles.topicModalBox} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.topicModalHeader}>
          <h2 id={titleId} className={styles.topicModalTitle}>{editingTopic ? "Chỉnh sửa Topic" : "Tạo Topic mới"}</h2>
          <div className={styles.topicModalHeaderRight}>
            <label className={styles.topicModalStatusLabel}>
              Trạng thái
              <select
                className={styles.topicDetailInput}
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as VisibilityStatus)}
              >
                <option value="public">Public</option>
                <option value="hidden">Hidden</option>
                <option value="draft">Draft</option>
              </select>
            </label>
            <button
              type="button"
              className={styles.topicDetailClose}
              onClick={handleProtectedClose}
              disabled={saving || hasChanges}
              title={hasChanges ? "Có thay đổi chưa lưu. Bấm Hủy để đóng." : "Đóng"}
            >
              ✕
            </button>
          </div>
        </div>

        <div className={styles.topicModalBody}>
          <div className={styles.topicModalRow}>
            <label className={styles.topicDetailLabel}>
              Tên topic
              <input
                className={styles.topicDetailInput}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nhập tên topic..."
                autoFocus
              />
            </label>

            <label className={styles.topicDetailLabel}>
              Slug
              <input
                className={`${styles.topicDetailInput} ${styles.slugReadonly}`}
                value={slug}
                readOnly
                placeholder="tu-dong-tao-tu-ten"
              />
            </label>
          </div>

          <div className={styles.topicDetailLabel}>
            Thumbnail
            <div className={styles.topicThumbArea}>
              {preview ? (
                <div className={styles.topicThumbPreview}>
                  <img src={preview} alt="Thumbnail preview" />
                  <div className={styles.topicThumbActions}>
                    <button type="button" onClick={() => fileRef.current?.click()}>Đổi ảnh</button>
                    <button type="button" onClick={handleRemoveImage}>Xóa</button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.topicThumbUpload}
                  onClick={() => fileRef.current?.click()}
                  disabled={resizing}
                >
                  {resizing ? "Đang xử lý..." : "Chọn ảnh từ máy"}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
            {ratioWarning && <span className={styles.topicRatioWarn}>{ratioWarning}</span>}
          </div>

          <label className={styles.topicDetailLabel}>
            Mô tả (OG description)
            <textarea
              className={styles.topicDetailTextarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Mô tả topic cho SEO/OG..."
            />
          </label>

        </div>

        <div className={styles.topicModalFooter}>
          <button type="button" className={styles.resetOrderBtn} onClick={onClose}>Hủy</button>
          <button type="button" className={styles.saveOrderBtn} onClick={handleSave} disabled={!canSave}>
            {saving ? "..." : editingTopic ? "Lưu" : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TopicPanel({
  items,
  selectedId,
  totalCount,
  counts,
  disabled,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onReorder,
  onSaveOrder,
  onResetOrder,
  orderChanged,
  onUpdateTopic,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState<TopicItem | undefined>(undefined);
  const [copied, setCopied] = useState<string | null>(null);
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleRename = (id: string) => {
    const name = editName.trim();
    if (!name) { setEditingId(null); return; }
    onRename(id, name);
    setEditingId(null);
  };

  const openCreateModal = () => {
    setModalTopic(undefined);
    setModalOpen(true);
  };

  const openEditModal = (topic: TopicItem) => {
    setModalTopic(topic);
    setModalOpen(true);
  };

  const copyLink = (topic: TopicItem) => {
    const slug = topic.slug || generateSlug(topic.name);
    const url = `${window.location.origin}/vi/blog?topic=${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(topic.id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDragLeave = () => { setDragOverIdx(null); };
  const handleDrop = (dropIdx: number) => {
    const from = dragIdx.current;
    if (from === null || from === dropIdx) {
      dragIdx.current = null;
      setDragOverIdx(null);
      return;
    }
    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(dropIdx, 0, moved);
    onReorder(reordered);
    dragIdx.current = null;
    setDragOverIdx(null);
  };
  const handleDragEnd = () => {
    dragIdx.current = null;
    setDragOverIdx(null);
  };

  if (disabled) {
    return (
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Topics</span>
          {orderChanged && (
            <div className={styles.hintToolbarRight}>
              <button type="button" className={styles.resetOrderBtn} onClick={onResetOrder}>Cancel</button>
              <button type="button" className={styles.saveOrderBtn} onClick={onSaveOrder}>Save Order</button>
            </div>
          )}
        </div>
        <div className={styles.panelEmpty}>Select a collection</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Topics</span>
        <div className={styles.hintToolbarRight}>
          {orderChanged && (
            <>
              <button type="button" className={styles.resetOrderBtn} onClick={onResetOrder}>Cancel</button>
              <button type="button" className={styles.saveOrderBtn} onClick={onSaveOrder}>Save Order</button>
            </>
          )}
          <button
            type="button"
            className={styles.panelAddBtn}
            onClick={openCreateModal}
            aria-label="Add topic"
          >+</button>
        </div>
      </div>
      <div className={styles.panelList}>
        <div
          className={`${styles.panelItem} ${selectedId === null ? styles.panelItemActive : ""}`}
          onClick={() => onSelect(null)}
        >
          <span className={styles.panelItemName}>All</span>
          <span className={styles.panelCount}>{totalCount}</span>
        </div>
        {items.map((topic, idx) => {
          const isSelected = selectedId === topic.id;
          const isEditing = editingId === topic.id;

          return (
            <div
              key={topic.id}
              className={`${styles.panelItem} ${isSelected ? styles.panelItemActive : ""} ${dragOverIdx === idx ? styles.dragOver : ""}`}
              onClick={() => !isEditing && onSelect(topic.id)}
              draggable={!isEditing}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(idx)}
              onDragEnd={handleDragEnd}
            >
              {!isEditing && <span className={styles.dragHandle}><DragHandle /></span>}
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
                  <div className={styles.panelItemMain}>
                    <span className={styles.panelItemName}>{topic.name}</span>
                    <span className={styles.panelItemSlug}>/{topic.slug || generateSlug(topic.name)}</span>
                  </div>
                  <div className={styles.topicRowMeta}>
                    <span className={`${styles.statusBadge} ${styles[`status${topic.visibility.charAt(0).toUpperCase()}${topic.visibility.slice(1)}`]}`}>
                      {topic.visibility}
                    </span>
                    <span className={styles.panelCount}>{counts[topic.id] ?? 0}</span>
                    <div className={styles.panelItemActions}>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${copied === topic.id ? styles.iconBtnCopied : ""}`}
                        onClick={(e) => { e.stopPropagation(); copyLink(topic); }}
                        title="Copy link"
                      >
                        <CopyIcon />
                      </button>
                      <button type="button" className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); openEditModal(topic); }} title="Edit details">
                        <PencilIcon />
                      </button>
                      <button type="button" className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {items.length > 0 && (
          <div
            className={`${styles.bottomDropZone} ${dragOverIdx === items.length ? styles.dragOver : ""}`}
            onDragOver={(e) => handleDragOver(e, items.length)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(items.length)}
          />
        )}
      </div>
      {modalOpen && (
        <TopicModal
          editingTopic={modalTopic}
          onClose={() => setModalOpen(false)}
          onSubmit={onAdd}
          onUpdate={onUpdateTopic}
        />
      )}
    </div>
  );
}
