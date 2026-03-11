"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/app/admin/_components/TiptapEditor").then(m => m.TiptapEditor), { ssr: false });
import { createPost } from "@/lib/firebase/posts";
import styles from "@/app/style/admin/editor.module.css";

type ViewMode = "editor" | "preview" | "mobile";

export default function NewPostPage() {
  const { dictionary: dict } = useDictionary();
  const router = useRouter();
  const t = dict.admin.posts;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [collectionId, setCollectionId] = useState("tech");
  const [topicId, setTopicId] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(val));
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      setError("Title, slug, and content are required");
      return;
    }

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const id = await createPost({
        title: title.trim(),
        slug: slug.trim(),
        thumbnail: thumbnail.trim(),
        content,
        collectionId,
        topicId,
        isPinned,
      });
      setSuccess(`Post created! ID: ${id}`);
      setTimeout(() => router.push("/admin/posts"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const showEditor = viewMode === "editor";
  const showPreview = viewMode === "preview" || viewMode === "mobile";

  return (
    <div className={styles.editorPage}>
      <div className={styles.editorToolbar}>
        <div className={styles.left}>
          <button
            className={viewMode === "editor" ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setViewMode("editor")}
          >
            {t.editor}
          </button>
          <button
            className={viewMode === "preview" ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setViewMode("preview")}
          >
            {t.preview}
          </button>
          <button
            className={viewMode === "mobile" ? styles.tabBtnActive : styles.tabBtn}
            onClick={() => setViewMode("mobile")}
          >
            {t.mobilePreview}
          </button>
        </div>
        <div className={styles.right}>
          {error && <span className={styles.error}>{error}</span>}
          {success && <span className={styles.success}>{success}</span>}
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

      <div className={styles.splitView} style={showPreview && !showEditor ? { gridTemplateColumns: "1fr" } : undefined}>
        {showEditor && (
          <div className={styles.editorPane}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>{t.titleLabel}</label>
              <input
                className={styles.input}
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.slugLabel}</label>
                <input
                  className={styles.input}
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.thumbnailLabel}</label>
                <input
                  className={styles.input}
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.collectionLabel}</label>
                <select
                  className={styles.select}
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                >
                  <option value="tech">Tech</option>
                  <option value="code">Code</option>
                  <option value="design">Design</option>
                  <option value="life">Life</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.topicLabel}</label>
                <input
                  className={styles.input}
                  type="text"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                />
              </div>
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

            <TiptapEditor content={content} onChange={setContent} />
          </div>
        )}

        {showPreview && (
          <div className={`${styles.previewPane} ${viewMode === "mobile" ? styles.previewMobile : ""}`}>
            <div className={styles.previewContent}>
              {title && <h1>{title}</h1>}
              <div dangerouslySetInnerHTML={{ __html: content || "<p style='color:var(--color-text-muted)'>Start writing to see preview...</p>" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
