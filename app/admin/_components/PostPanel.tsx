"use client";

import { useState, useRef, useCallback } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { HintList, type HintItem } from "@/app/admin/_components/HintList";
import { TagSelector } from "@/app/admin/_components/TagSelector";

import dynamic from "next/dynamic";
import styles from "@/app/style/admin/posts.module.css";
import editorStyles from "@/app/style/admin/editor.module.css";

type VisibilityStatus = "public" | "hidden" | "draft";

const TiptapEditor = dynamic(
  () => import("@/app/admin/_components/TiptapEditor").then((m) => m.TiptapEditor),
  { ssr: false }
);

interface PostItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  content: string;
  excerpt: string;
  readTime: number;
  collectionIds: string[];
  topicIds: string[];
  isPinned: boolean;
  orderMap: Record<string, number>;
  visibility: VisibilityStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface CollectionItem { id: string; name: string; order: number }
interface TopicItem { id: string; name: string; collectionId: string; order: number }

interface Props {
  posts: PostItem[];
  hints: HintItem[];
  selectedTopicId: string | null;
  editingPost: PostItem | null;
  editingHint: HintItem | null;
  isNew: boolean;
  isNewHint: boolean;
  collections: CollectionItem[];
  topics: TopicItem[];
  saving?: boolean;
  onNew: () => void;
  onEdit: (post: PostItem) => void;
  onSave: (post: PostItem, thumbnailFile?: File) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onCreateTopic?: (name: string) => Promise<string>;
  onNewHint: () => void;
  onEditHint: (hint: HintItem) => void;
  onSaveHint: (hint: HintItem) => void;
  onDeleteHint: (id: string) => void;
  onCancelHint: () => void;
  onReorderPosts: (posts: PostItem[]) => void;
  onSavePostOrder: () => void;
  onResetPostOrder: () => void;
  postOrderChanged: boolean;
  onReorderHints: (hints: HintItem[]) => void;
  onSaveHintOrder: () => void;
  onResetHintOrder: () => void;
  hintOrderChanged: boolean;
}

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

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const generateSlug = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

export function PostPanel({
  posts, hints, editingPost, editingHint, isNewHint,
  collections, topics, saving, onNew, onEdit, onSave, onDelete, onCancel, onCreateTopic,
  onNewHint, onEditHint, onSaveHint, onDeleteHint, onCancelHint,
  onReorderPosts, onSavePostOrder, onResetPostOrder, postOrderChanged,
  onReorderHints, onSaveHintOrder, onResetHintOrder, hintOrderChanged,
}: Props) {
  const { dictionary: dict } = useDictionary();
  const t = dict.admin.posts;
  const [tab, setTab] = useState<"posts" | "hints">("posts");
  const [search, setSearch] = useState("");
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPostLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/vi/blog/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  if (editingPost) {
    return (
      <PostEditor
        post={editingPost}
        collections={collections}
        topics={topics}
        saving={saving}
        onSave={onSave}
        onCancel={onCancel}
        onCreateTopic={onCreateTopic}
      />
    );
  }

  const displayPosts = search.trim()
    ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : posts;

  const handleDragStart = (idx: number) => { dragIdx.current = idx; };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDragLeave = () => { setDragOverIdx(null); };
  const handleDrop = (dropIdx: number) => {
    const from = dragIdx.current;
    if (from === null || from === dropIdx) { dragIdx.current = null; setDragOverIdx(null); return; }
    const items = [...posts];
    const [moved] = items.splice(from, 1);
    items.splice(dropIdx, 0, moved);
    onReorderPosts(items);
    dragIdx.current = null;
    setDragOverIdx(null);
  };
  const handleDragEnd = () => { dragIdx.current = null; setDragOverIdx(null); };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.tabBar}>
          <button type="button" className={`${styles.tab} ${tab === "posts" ? styles.tabActive : ""}`} onClick={() => setTab("posts")}>
            {t.title}
          </button>
          <button type="button" className={`${styles.tab} ${tab === "hints" ? styles.tabActive : ""}`} onClick={() => setTab("hints")}>
            {dict.admin.hints.title}
          </button>
        </div>
        {tab === "posts" && (
          <div className={styles.hintToolbarRight}>
            {postOrderChanged && (
              <>
                <button type="button" className={styles.resetOrderBtn} onClick={onResetPostOrder}>
                  Cancel
                </button>
                <button type="button" className={styles.saveOrderBtn} onClick={onSavePostOrder}>
                  Save Order
                </button>
              </>
            )}
            <button type="button" className={styles.postNewBtn} onClick={onNew}>
              + {t.newPost}
            </button>
          </div>
        )}
      </div>
      {tab === "posts" ? (
        <>
          <div className={styles.postToolbar}>
            <input
              className={styles.postSearch}
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.panelList}>
            {displayPosts.map((post, idx) => (
              <div
                key={post.id}
                className={`${styles.postItem} ${dragOverIdx === idx ? styles.dragOver : ""}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
              >
                <span className={styles.dragHandle}><DragHandle /></span>
                <div className={styles.postItemInfo} onClick={() => onEdit(post)}>
                  <div className={styles.postItemTitle}>
                    {post.isPinned && <span className={styles.pinBadge}>PIN</span>}
                    <span className={`${styles.statusBadge} ${styles[`status${post.visibility.charAt(0).toUpperCase()}${post.visibility.slice(1)}`]}`}>
                      {post.visibility}
                    </span>
                    {post.title}
                  </div>
                  <div className={styles.postItemMeta}>
                    <span>{post.views} views</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.iconBtn} ${copiedId === post.id ? styles.iconBtnCopied : ""}`}
                  onClick={(e) => { e.stopPropagation(); copyPostLink(post.slug, post.id); }}
                  title="Copy link"
                >
                  <CopyIcon />
                </button>
                <button
                  type="button"
                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            {displayPosts.length > 0 && (
              <div
                className={`${styles.bottomDropZone} ${dragOverIdx === displayPosts.length ? styles.dragOver : ""}`}
                onDragOver={(e) => handleDragOver(e, displayPosts.length)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(displayPosts.length)}
              />
            )}
            {displayPosts.length === 0 && (
              <div className={styles.panelEmpty}>No posts found</div>
            )}
          </div>
        </>
      ) : (
        <HintList
          hints={hints}
          posts={posts}
          topics={topics}
          editingHint={editingHint}
          isNewHint={isNewHint}
          saving={saving}
          onNew={onNewHint}
          onEdit={onEditHint}
          onSave={onSaveHint}
          onDelete={onDeleteHint}
          onCancel={onCancelHint}
          onReorder={onReorderHints}
          onSaveOrder={onSaveHintOrder}
          onResetOrder={onResetHintOrder}
          orderChanged={hintOrderChanged}
        />
      )}
    </div>
  );
}

function PostEditor({ post, collections, topics, saving, onSave, onCancel, onCreateTopic }: {
  post: PostItem;
  collections: CollectionItem[];
  topics: TopicItem[];
  saving?: boolean;
  onSave: (post: PostItem, thumbnailFile?: File) => void;
  onCancel: () => void;
  onCreateTopic?: (name: string) => Promise<string>;
}) {
  const { dictionary: dict } = useDictionary();
  const t = dict.admin.posts;

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [summary, setSummary] = useState(post.summary ?? "");
  const [showFields, setShowFields] = useState(true);
  const [thumbnail, setThumbnail] = useState(post.thumbnail);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(post.content);
  const [collectionIds, setCollectionIds] = useState(post.collectionIds);
  const [topicIds, setTopicIds] = useState(post.topicIds);
  const [isPinned, setIsPinned] = useState(post.isPinned);
  const [visibility, setVisibility] = useState<VisibilityStatus>(post.visibility ?? "public");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(generateSlug(val));
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnail(URL.createObjectURL(file));
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const handleThumbnailRemove = () => {
    setThumbnailFile(null);
    setThumbnail("");
  };

  const handleSave = useCallback(() => {
    if (!title.trim()) return;

    const topicCollectionIds = topics
      .filter((topic) => topicIds.includes(topic.id))
      .map((topic) => topic.collectionId)
      .filter((collectionId) => !!collectionId);

    const finalCollectionIds = Array.from(
      new Set([...collectionIds, ...topicCollectionIds]),
    );

    if (finalCollectionIds.length === 0) return;

    onSave({
      ...post,
      title: title.trim(),
      slug: slug || generateSlug(title),
      summary: summary.trim(),
      thumbnail,
      content,
      collectionIds: finalCollectionIds,
      topicIds,
      isPinned,
      visibility,
      updatedAt: new Date().toISOString().split("T")[0],
    }, thumbnailFile ?? undefined);
  }, [title, slug, summary, thumbnail, content, collectionIds, topicIds, isPinned, visibility, post, thumbnailFile, onSave, topics]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  return (
    <div className={styles.editorPanel}>
      <div className={styles.editorToolbar}>
        <button type="button" className={styles.editorBackBtn} onClick={handleCancel} disabled={saving}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className={styles.editorToolbarRight}>
          <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>{t.cancel}</button>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? "Saving..." : t.save}</button>
        </div>
      </div>
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
        {showFields ? "Ẩn thông tin" : "Hiện thông tin"}
      </button>
      {showFields && <div className={styles.editorFields}>
        <div className={styles.editorFieldRow}>
          <div className={editorStyles.fieldGroup} style={{ flex: 1 }}>
            <label className={editorStyles.label}>{t.titleLabel}</label>
            <input className={editorStyles.input} type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Post title..." />
          </div>
          <div className={editorStyles.fieldGroup} style={{ flex: 1 }}>
            <label className={editorStyles.label}>{t.slugLabel}</label>
            <input className={`${editorStyles.input} ${editorStyles.slugInput}`} type="text" value={slug} readOnly />
          </div>
        </div>
        <div className={styles.editorFieldRowThree}>
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
            onCreate={onCreateTopic}
            placeholder="Search or create topic..."
          />
          <div className={editorStyles.fieldGroup} style={{ minWidth: 160 }}>
            <label className={editorStyles.label}>Status</label>
            <select className={editorStyles.input} value={visibility} onChange={(e) => setVisibility(e.target.value as VisibilityStatus)}>
              <option value="public">Public</option>
              <option value="hidden">Hidden</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <div className={editorStyles.fieldGroup}>
          <label className={editorStyles.label}>Summary (OG description)</label>
          <textarea
            className={editorStyles.input}
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Nhập mô tả ngắn cho SEO/OG..."
          />
        </div>
        <div className={styles.editorFieldRow}>
          <div className={editorStyles.fieldGroup} style={{ flex: 1 }}>
            <label className={editorStyles.label}>{t.thumbnailLabel}</label>
            {thumbnail ? (
              <div className={styles.thumbnailPreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnail} alt="Thumbnail" className={styles.thumbnailImg} />
                <button type="button" className={styles.thumbnailRemoveBtn} onClick={handleThumbnailRemove} aria-label="Remove thumbnail">✕</button>
                <button type="button" className={styles.thumbnailChangeBtn} onClick={() => thumbnailInputRef.current?.click()}>
                  Change
                </button>
              </div>
            ) : (
              <button type="button" className={styles.thumbnailUploadBtn} onClick={() => thumbnailInputRef.current?.click()}>
                Upload thumbnail
              </button>
            )}
            <input ref={thumbnailInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumbnailUpload} />
          </div>
          <div className={editorStyles.checkRow}>
            <input type="checkbox" id="pinned-editor" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
            <label htmlFor="pinned-editor">{t.pinned}</label>
          </div>
        </div>
      </div>}
      <div className={styles.editorContent}>
        <div className={styles.editorContentInner}>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
