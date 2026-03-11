"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { useHeaderActions } from "@/app/admin/_components/HeaderActionsContext";
import { HintList } from "@/app/admin/_components/HintList";
import dynamic from "next/dynamic";
import styles from "@/app/style/admin/posts.module.css";
import editorStyles from "@/app/style/admin/editor.module.css";

const TiptapEditor = dynamic(
  () => import("@/app/admin/_components/TiptapEditor").then((m) => m.TiptapEditor),
  { ssr: false }
);

interface PostItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  content: string;
  collectionId: string;
  topicId: string;
  isPinned: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface HintItem {
  id: string;
  title: string;
  content: string;
  type: "tip" | "hint" | "note";
  topicId: string;
  relatedPostId: string;
  order: number;
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
  isNew: boolean;
  collections: CollectionItem[];
  topics: TopicItem[];
  onNew: () => void;
  onEdit: (post: PostItem) => void;
  onSave: (post: PostItem) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  onAddHint: (hint: Omit<HintItem, "id">) => void;
  onUpdateHint: (hint: HintItem) => void;
  onDeleteHint: (id: string) => void;
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const generateSlug = (text: string) =>
  text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

export function PostPanel({ posts, hints, selectedTopicId, editingPost, isNew, collections, topics, onNew, onEdit, onSave, onDelete, onCancel, onAddHint, onUpdateHint, onDeleteHint }: Props) {
  const { dictionary: dict } = useDictionary();
  const t = dict.admin.posts;
  const [tab, setTab] = useState<"posts" | "hints">("posts");
  const [search, setSearch] = useState("");

  if (editingPost) {
    return (
      <PostEditor
        post={editingPost}
        isNew={isNew}
        collections={collections}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  const displayPosts = search.trim()
    ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : posts;

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
          <button type="button" className={styles.postNewBtn} onClick={onNew}>
            + {t.newPost}
          </button>
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
            {displayPosts.map((post) => (
              <div key={post.id} className={styles.postItem} onClick={() => onEdit(post)}>
                <div className={styles.postItemInfo}>
                  <div className={styles.postItemTitle}>
                    {post.isPinned && <span className={styles.pinBadge}>PIN</span>}
                    {post.title}
                  </div>
                  <div className={styles.postItemMeta}>
                    <span>{post.views} views</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
            {displayPosts.length === 0 && (
              <div className={styles.panelEmpty}>No posts found</div>
            )}
          </div>
        </>
      ) : (
        <HintList
          hints={hints}
          selectedTopicId={selectedTopicId}
          onAdd={onAddHint}
          onUpdate={onUpdateHint}
          onDelete={onDeleteHint}
        />
      )}
    </div>
  );
}

function PostEditor({ post, isNew, collections, onSave, onCancel }: {
  post: PostItem;
  isNew: boolean;
  collections: CollectionItem[];
  onSave: (post: PostItem) => void;
  onCancel: () => void;
}) {
  const { dictionary: dict } = useDictionary();
  const t = dict.admin.posts;
  const { setActions } = useHeaderActions();

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [thumbnail, setThumbnail] = useState(post.thumbnail);
  const [content, setContent] = useState(post.content);
  const [collectionId, setCollectionId] = useState(post.collectionId);
  const [isPinned, setIsPinned] = useState(post.isPinned);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew) setSlug(generateSlug(val));
  };

  const onSaveRef = useRef(onSave);
  const onCancelRef = useRef(onCancel);
  onSaveRef.current = onSave;
  onCancelRef.current = onCancel;

  const handleSave = useCallback(() => {
    if (!title.trim()) return;
    onSaveRef.current({
      ...post,
      title: title.trim(),
      slug: slug || generateSlug(title),
      thumbnail,
      content,
      collectionId,
      topicId: post.topicId,
      isPinned,
      updatedAt: new Date().toISOString().split("T")[0],
    });
  }, [title, slug, thumbnail, content, collectionId, isPinned, post]);

  const handleCancel = useCallback(() => {
    onCancelRef.current();
  }, []);

  useEffect(() => {
    setActions(
      <>
        <button type="button" className={styles.editorBackBtn} onClick={handleCancel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
        </button>
        <button type="button" className={styles.cancelBtn} onClick={handleCancel}>{t.cancel}</button>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>{t.save}</button>
      </>
    );
    return () => setActions(null);
  }, [handleSave, handleCancel, setActions, t.cancel, t.save]);

  return (
    <div className={styles.editorPanel}>
      <div className={styles.editorFields}>
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
        <div className={styles.editorFieldRow}>
          <div className={editorStyles.fieldGroup} style={{ flex: 1 }}>
            <label className={editorStyles.label}>{t.thumbnailLabel}</label>
            <input className={editorStyles.input} type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <div className={styles.editorFieldRow}>
          <div className={editorStyles.fieldGroup}>
            <label className={editorStyles.label}>{t.collectionLabel}</label>
            <select className={editorStyles.select} value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className={editorStyles.checkRow}>
            <input type="checkbox" id="pinned-editor" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
            <label htmlFor="pinned-editor">{t.pinned}</label>
          </div>
        </div>
      </div>
      <div className={styles.editorContent}>
        <div className={styles.editorContentInner}>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
