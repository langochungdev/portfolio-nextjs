"use client";

import { useState, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { TagSelector } from "@/app/admin/_components/TagSelector";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/app/admin/_components/TiptapEditor").then(m => m.TiptapEditor), { ssr: false });
import { createPost } from "@/lib/firebase/posts";
import {
  fetchCollections,
  fetchTopics,
  addTopic as addTopicFb,
  type CollectionDoc,
  type TopicDoc,
} from "@/lib/firebase/collections";
import { processContentMedia } from "@/lib/cloudinary/client";
import styles from "@/app/style/admin/editor.module.css";

export default function NewPostPage() {
  const { dictionary: dict } = useDictionary();
  const router = useRouter();
  const t = dict.admin.posts;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<CollectionDoc[]>([]);
  const [topics, setTopics] = useState<TopicDoc[]>([]);
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFields, setShowFields] = useState(true);
  const [mobilePreview, setMobilePreview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cols, tps] = await Promise.all([fetchCollections(), fetchTopics()]);
        setCollections(cols);
        setTopics(tps);
        if (cols.length > 0) setCollectionIds([cols[0].id]);
      } catch (err) {
        console.error("Failed to load options:", err);
      }
    })();
  }, []);

  const handleCreateTopic = useCallback(async (name: string) => {
    const colId = collectionIds[0] ?? "";
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0111/g, "d").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    const id = await addTopicFb(name, colId, topics.length, slug);
    setTopics((prev) => [...prev, { id, name, slug, thumbnail: "", description: "", collectionId: colId, order: prev.length }]);
    return id;
  }, [collectionIds, topics.length]);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(generateSlug(val));
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Tiêu đề, slug và nội dung là bắt buộc");
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const { processedHtml } = await processContentMedia(content, "");
      const id = await createPost({
        title: title.trim(),
        slug: slug.trim(),
        thumbnail: thumbnail.trim(),
        content: processedHtml,
        collectionIds,
        topicIds,
        isPinned,
        orderMap: {},
      });
      setSuccess(`Đã tạo bài viết! ID: ${id}`);
      setTimeout(() => router.push("/admin/posts"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.editorPage}>
      <div className={styles.editorToolbar}>
        <div className={styles.left}>
          {error && <span className={styles.error}>{error}</span>}
          {success && <span className={styles.success}>{success}</span>}
        </div>
        <div className={styles.right}>
          <button
            className={`${styles.previewBtn} ${mobilePreview ? styles.previewBtnActive : ""}`}
            onClick={() => setMobilePreview((v) => !v)}
          >
            {mobilePreview ? "Desktop" : "Mobile"}
          </button>
          <button
            className={styles.cancelBtn}
            onClick={() => router.push("/admin/posts")}
          >
            {t.cancel}
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "..." : t.save}
          </button>
        </div>
      </div>

      <div className={styles.splitView}>
        <div className={styles.editorPane}>
          <button
            type="button"
            className={styles.fieldsToggle}
            onClick={() => setShowFields((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d={showFields ? "M4 6L8 10L12 6" : "M6 4L10 8L6 12"}
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            {showFields ? "Ẩn thông tin bài viết" : "Hiện thông tin bài viết"}
          </button>

          {showFields && (
            <div className={styles.fieldsCollapse}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.titleLabel}</label>
                <input
                  className={styles.input}
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.slugLabel}</label>
                <input
                  className={`${styles.input} ${styles.slugInput}`}
                  type="text"
                  value={slug}
                  readOnly
                  placeholder="slug-tu-dong-tao"
                />
              </div>

              <div className={styles.fieldRow}>
                <TagSelector
                  label={t.collectionLabel}
                  options={collections}
                  selected={collectionIds}
                  onChange={setCollectionIds}
                  required
                  placeholder="Select collections..."
                />
                <TagSelector
                  label={t.topicLabel ?? "Topic"}
                  options={topics}
                  selected={topicIds}
                  onChange={setTopicIds}
                  onCreate={handleCreateTopic}
                  placeholder="Search or create topic..."
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>{t.thumbnailLabel}</label>
                  <input
                    className={styles.input}
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                  />
                </div>
                <div className={styles.checkRow}>
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                  />
                  <label htmlFor="pinned">{t.pinned}</label>
                </div>
              </div>
            </div>
          )}

          <div className={mobilePreview ? styles.mobilePreviewWrap : undefined}>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>
      </div>


    </div>
  );
}
