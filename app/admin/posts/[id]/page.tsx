"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/app/admin/_components/TiptapEditor").then(m => m.TiptapEditor), { ssr: false });
import styles from "@/app/style/admin/editor.module.css";

type ViewMode = "editor" | "preview" | "mobile";

export default function EditPostPage() {
  const { dictionary: dict } = useDictionary();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const t = dict.admin.posts;

  const [title, setTitle] = useState("Getting Started with Next.js 16");
  const [slug, setSlug] = useState("getting-started-nextjs-16");
  const [collectionId, setCollectionId] = useState("tech");
  const [topicId, setTopicId] = useState("nextjs");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("<p>This is a sample post content for editing. The real data will be loaded from Firestore in a future task.</p>");
  const [isPinned, setIsPinned] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [saving, setSaving] = useState(false);

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
          <button
            className={styles.cancelBtn}
            onClick={() => router.push("/admin/posts")}
          >
            {t.cancel}
          </button>
          <button className={styles.saveBtn} disabled={saving}>
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
                onChange={(e) => setTitle(e.target.value)}
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
