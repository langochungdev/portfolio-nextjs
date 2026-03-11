"use client";

import { useState } from "react";

import { useRouter, useParams } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import dynamic from "next/dynamic";

const TiptapEditor = dynamic(() => import("@/app/admin/_components/TiptapEditor").then(m => m.TiptapEditor), { ssr: false });
import styles from "@/app/style/admin/editor.module.css";

export default function EditPostPage() {
  const { dictionary: dict } = useDictionary();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const t = dict.admin.posts;

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const [title, setTitle] = useState("Getting Started with Next.js 16");
  const [slug, setSlug] = useState("getting-started-nextjs-16");
  const [collectionId, setCollectionId] = useState("tech");
  const [topicId, setTopicId] = useState("nextjs");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("<p>This is a sample post content for editing. The real data will be loaded from Firestore in a future task.</p>");
  const [isPinned, setIsPinned] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFields, setShowFields] = useState(true);
  const [mobilePreview, setMobilePreview] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(generateSlug(val));
  };

  return (
    <div className={styles.editorPage}>
      <div className={styles.editorToolbar}>
        <div className={styles.left} />
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
          <button className={styles.saveBtn} disabled={saving}>
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
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t.slugLabel}</label>
                <input
                  className={`${styles.input} ${styles.slugInput}`}
                  type="text"
                  value={slug}
                  readOnly
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
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>{t.topicLabel}</label>
                  <input
                    className={styles.input}
                    type="text"
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
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
