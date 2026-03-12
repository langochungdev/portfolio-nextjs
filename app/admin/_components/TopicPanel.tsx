"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { resizeImage } from "@/lib/cloudinary/resize";
import styles from "@/app/style/admin/posts.module.css";

interface TopicItem {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  description: string;
  collectionId: string;
  order: number;
}

export interface TopicFormData {
  name: string;
  slug: string;
  thumbnail: string;
  thumbnailFile?: File;
  description: string;
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
  onUpdateTopic: (id: string, data: Partial<Pick<TopicItem, "slug" | "thumbnail" | "description">>, thumbnailFile?: File) => void;
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
  onUpdate?: (id: string, data: Partial<Pick<TopicItem, "slug" | "thumbnail" | "description">>, file?: File) => void;
}

function TopicModal({ editingTopic, onClose, onSubmit, onUpdate }: ModalProps) {
  const [name, setName] = useState(editingTopic?.name ?? "");
  const [slug, setSlug] = useState(editingTopic?.slug || (editingTopic ? generateSlug(editingTopic.name) : ""));
  const [description, setDescription] = useState(editingTopic?.description ?? "");
  const [thumbnail, setThumbnail] = useState(editingTopic?.thumbnail ?? "");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(editingTopic?.thumbnail ?? "");
  const [resizing, setResizing] = useState(false);
  const [ratioWarning, setRatioWarning] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingTopic) setSlug(generateSlug(val));
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
    if (!trimmedName) return;
    setSaving(true);
    try {
      if (editingTopic && onUpdate) {
        onUpdate(editingTopic.id, {
          slug: slug || generateSlug(trimmedName),
          thumbnail: thumbnailFile ? "" : (thumbnail || preview),
          description,
        }, thumbnailFile ?? undefined);
      } else {
        onSubmit({
          name: trimmedName,
          slug: slug || generateSlug(trimmedName),
          thumbnail: thumbnail || preview,
          thumbnailFile: thumbnailFile ?? undefined,
          description,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={styles.topicModalOverlay}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={styles.topicModalBox}>
        <div className={styles.topicModalHeader}>
          <span>{editingTopic ? "Chỉnh sửa Topic" : "Tạo Topic mới"}</span>
          <button type="button" className={styles.topicDetailClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.topicModalBody}>
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
          <button type="button" className={styles.saveOrderBtn} onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "..." : editingTopic ? "Lưu" : "Tạo"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TopicPanel({ items, selectedId, totalCount, counts, disabled, onSelect, onAdd, onRename, onDelete, onUpdateTopic }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState<TopicItem | undefined>(undefined);
  const [copied, setCopied] = useState<string | null>(null);

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
          onClick={openCreateModal}
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
                </>
              )}
            </div>
          );
        })}
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
