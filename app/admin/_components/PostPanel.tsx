"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
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

const POST_EDITOR_DRAFT_PREFIX = "admin-post-editor-draft-v1";
const POST_EDITOR_AUTOSAVE_MS = 900;

interface PostEditorFormState {
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  content: string;
  collectionIds: string[];
  topicIds: string[];
  isPinned: boolean;
  visibility: VisibilityStatus;
}

interface PostEditorDraftState extends PostEditorFormState {
  savedAt: number;
}

function toSortedUniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function areStringArraysEqualAsSet(left: string[], right: string[]): boolean {
  const leftSorted = toSortedUniqueStrings(left);
  const rightSorted = toSortedUniqueStrings(right);
  if (leftSorted.length !== rightSorted.length) return false;
  return leftSorted.every((item, index) => item === rightSorted[index]);
}

function buildPostEditorInitialState(post: PostItem): PostEditorFormState {
  return {
    title: post.title,
    slug: post.slug,
    summary: post.summary ?? "",
    thumbnail: post.thumbnail,
    content: post.content,
    collectionIds: post.collectionIds,
    topicIds: post.topicIds,
    isPinned: post.isPinned,
    visibility: post.visibility ?? "public",
  };
}

function isVisibilityStatus(value: unknown): value is VisibilityStatus {
  return value === "public" || value === "hidden" || value === "draft";
}

function parsePostEditorDraft(raw: string): PostEditorDraftState | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const data = parsed as Record<string, unknown>;
    const collectionIds = data.collectionIds;
    const topicIds = data.topicIds;

    if (typeof data.title !== "string") return null;
    if (typeof data.slug !== "string") return null;
    if (typeof data.summary !== "string") return null;
    if (typeof data.thumbnail !== "string") return null;
    if (typeof data.content !== "string") return null;
    if (!Array.isArray(collectionIds) || !collectionIds.every((item) => typeof item === "string")) return null;
    if (!Array.isArray(topicIds) || !topicIds.every((item) => typeof item === "string")) return null;
    if (typeof data.isPinned !== "boolean") return null;
    if (!isVisibilityStatus(data.visibility)) return null;

    return {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      thumbnail: data.thumbnail,
      content: data.content,
      collectionIds,
      topicIds,
      isPinned: data.isPinned,
      visibility: data.visibility,
      savedAt: typeof data.savedAt === "number" ? data.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function getPostEditorDraftKey(post: PostItem): string {
  return `${POST_EDITOR_DRAFT_PREFIX}:${post.id || "new"}`;
}

function sanitizeThumbnailForDraft(thumbnail: string): string {
  return thumbnail.startsWith("blob:") ? "" : thumbnail;
}

function arePostEditorStatesEqual(left: PostEditorFormState, right: PostEditorFormState): boolean {
  if (left.title !== right.title) return false;
  if (left.slug !== right.slug) return false;
  if (left.summary !== right.summary) return false;
  if (left.thumbnail !== right.thumbnail) return false;
  if (left.content !== right.content) return false;
  if (left.isPinned !== right.isPinned) return false;
  if (left.visibility !== right.visibility) return false;
  if (!areStringArraysEqualAsSet(left.collectionIds, right.collectionIds)) return false;
  if (!areStringArraysEqualAsSet(left.topicIds, right.topicIds)) return false;
  return true;
}

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
  const [localDraftFlags, setLocalDraftFlags] = useState<Record<string, true>>({});

  const refreshLocalDraftFlags = useCallback(() => {
    if (typeof window === "undefined") return;

    const nextFlags: Record<string, true> = {};
    try {
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index);
        if (!key || !key.startsWith(`${POST_EDITOR_DRAFT_PREFIX}:`)) continue;

        const draftId = key.slice(`${POST_EDITOR_DRAFT_PREFIX}:`.length);
        if (!draftId || draftId === "new") continue;

        const rawDraft = window.localStorage.getItem(key);
        if (!rawDraft) continue;

        const parsedDraft = parsePostEditorDraft(rawDraft);
        if (!parsedDraft) {
          window.localStorage.removeItem(key);
          continue;
        }

        nextFlags[draftId] = true;
      }
    } catch (error) {
      console.error("Failed to read local draft flags:", error);
    }

    setLocalDraftFlags(nextFlags);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    refreshLocalDraftFlags();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith(`${POST_EDITOR_DRAFT_PREFIX}:`)) {
        refreshLocalDraftFlags();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshLocalDraftFlags();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshLocalDraftFlags);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshLocalDraftFlags);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshLocalDraftFlags]);

  useEffect(() => {
    if (editingPost) return;
    refreshLocalDraftFlags();
  }, [editingPost, refreshLocalDraftFlags]);

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
        key={editingPost.id || "new"}
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
                    {localDraftFlags[post.id] && (
                      <span className={styles.localDraftBadge}>Lưu tạm</span>
                    )}
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

  const initialState = useMemo(() => buildPostEditorInitialState(post), [post]);
  const draftKey = useMemo(() => getPostEditorDraftKey(post), [post]);

  const [title, setTitle] = useState(initialState.title);
  const [slug, setSlug] = useState(initialState.slug);
  const [summary, setSummary] = useState(initialState.summary);
  const [showFields, setShowFields] = useState(false);
  const [thumbnail, setThumbnail] = useState(initialState.thumbnail);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(initialState.content);
  const [collectionIds, setCollectionIds] = useState(initialState.collectionIds);
  const [topicIds, setTopicIds] = useState(initialState.topicIds);
  const [isPinned, setIsPinned] = useState(initialState.isPinned);
  const [visibility, setVisibility] = useState<VisibilityStatus>(initialState.visibility);
  const [editorRenderKey, setEditorRenderKey] = useState(0);
  const [saveSource, setSaveSource] = useState<"firestore" | "local">("firestore");
  const [autoSavePending, setAutoSavePending] = useState(false);
  const [lastLocalSavedAt, setLastLocalSavedAt] = useState<number | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedDraftRef = useRef(false);

  const clearAutoSaveTimer = useCallback(() => {
    if (!autoSaveTimerRef.current) return;
    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      clearAutoSaveTimer();
    };
  }, [clearAutoSaveTimer]);

  useEffect(() => {
    if (hasLoadedDraftRef.current) return;
    hasLoadedDraftRef.current = true;
    if (typeof window === "undefined") return;

    const rawDraft = window.localStorage.getItem(draftKey);
    if (!rawDraft) return;

    const parsedDraft = parsePostEditorDraft(rawDraft);
    if (!parsedDraft) {
      window.localStorage.removeItem(draftKey);
      return;
    }

    setTitle(parsedDraft.title);
    setSlug(parsedDraft.slug);
    setSummary(parsedDraft.summary);
    setThumbnail(parsedDraft.thumbnail);
    setContent(parsedDraft.content);
    setCollectionIds(parsedDraft.collectionIds);
    setTopicIds(parsedDraft.topicIds);
    setIsPinned(parsedDraft.isPinned);
    setVisibility(parsedDraft.visibility);
    setSaveSource("local");
    setLastLocalSavedAt(parsedDraft.savedAt);
    setEditorRenderKey((value) => value + 1);
  }, [draftKey]);

  const topicCollectionIds = useMemo(
    () => topics
      .filter((topic) => topicIds.includes(topic.id))
      .map((topic) => topic.collectionId)
      .filter((collectionId) => !!collectionId),
    [topics, topicIds],
  );

  const finalCollectionIds = useMemo(
    () => Array.from(new Set([...collectionIds, ...topicCollectionIds])),
    [collectionIds, topicCollectionIds],
  );

  const currentState = useMemo<PostEditorFormState>(() => ({
    title,
    slug,
    summary,
    thumbnail,
    content,
    collectionIds,
    topicIds,
    isPinned,
    visibility,
  }), [title, slug, summary, thumbnail, content, collectionIds, topicIds, isPinned, visibility]);

  const hasChanges = useMemo(
    () => !arePostEditorStatesEqual(currentState, initialState) || Boolean(thumbnailFile),
    [currentState, initialState, thumbnailFile],
  );

  const canSave = Boolean(title.trim()) && hasChanges && finalCollectionIds.length > 0 && !saving;

  useEffect(() => {
    if (typeof window === "undefined") return;

    clearAutoSaveTimer();

    if (!hasChanges) {
      try {
        window.localStorage.removeItem(draftKey);
      } catch (error) {
        console.error("Failed to clear local draft:", error);
      }
      setAutoSavePending(false);
      setLastLocalSavedAt(null);
      setSaveSource("firestore");
      return;
    }

    setSaveSource("local");
    setAutoSavePending(true);
    autoSaveTimerRef.current = setTimeout(() => {
      const payload: PostEditorDraftState = {
        ...currentState,
        thumbnail: sanitizeThumbnailForDraft(currentState.thumbnail),
        savedAt: Date.now(),
      };

      try {
        window.localStorage.setItem(draftKey, JSON.stringify(payload));
        setLastLocalSavedAt(payload.savedAt);
      } catch (error) {
        console.error("Failed to save local draft:", error);
      } finally {
        setAutoSavePending(false);
      }
    }, POST_EDITOR_AUTOSAVE_MS);

    return () => {
      clearAutoSaveTimer();
    };
  }, [currentState, hasChanges, draftKey, clearAutoSaveTimer]);

  const handleDiscardTemporaryChanges = useCallback(() => {
    clearAutoSaveTimer();
    setTitle(initialState.title);
    setSlug(initialState.slug);
    setSummary(initialState.summary);
    setThumbnail(initialState.thumbnail);
    setThumbnailFile(null);
    setContent(initialState.content);
    setCollectionIds(initialState.collectionIds);
    setTopicIds(initialState.topicIds);
    setIsPinned(initialState.isPinned);
    setVisibility(initialState.visibility);
    setSaveSource("firestore");
    setAutoSavePending(false);
    setLastLocalSavedAt(null);
    setEditorRenderKey((value) => value + 1);

    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(draftKey);
    } catch (error) {
      console.error("Failed to remove local draft:", error);
    }
  }, [clearAutoSaveTimer, initialState, draftKey]);

  const localSavedTimeText = useMemo(() => {
    if (!lastLocalSavedAt) return "";
    return new Date(lastLocalSavedAt).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastLocalSavedAt]);

  const saveBadgeText = useMemo(() => {
    if (saveSource === "firestore") {
      return "Đã đồng bộ Firestore";
    }
    if (autoSavePending) {
      return "Đang lưu tạm local";
    }
    if (localSavedTimeText) {
      return `Đã lưu tạm local lúc ${localSavedTimeText}`;
    }
    return "Đã lưu tạm local";
  }, [saveSource, autoSavePending, localSavedTimeText]);

  const showDiscardBtn = hasChanges || saveSource === "local";

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
    if (!canSave) return;

    clearAutoSaveTimer();
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(draftKey);
      } catch (error) {
        console.error("Failed to clear local draft before save:", error);
      }
    }
    setSaveSource("firestore");
    setAutoSavePending(false);
    setLastLocalSavedAt(null);

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
  }, [canSave, clearAutoSaveTimer, draftKey, post, title, slug, summary, thumbnail, content, finalCollectionIds, topicIds, isPinned, visibility, thumbnailFile, onSave]);

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
          <span
            className={`${styles.editorSaveStateBadge} ${saveSource === "firestore" ? styles.editorSaveStateBadgeRemote : styles.editorSaveStateBadgeLocal}`}
            aria-live="polite"
          >
            {saveBadgeText}
          </span>
          {showDiscardBtn && (
            <button type="button" className={styles.discardDraftBtn} onClick={handleDiscardTemporaryChanges} disabled={saving}>
              Hủy lưu tạm
            </button>
          )}
          <button type="button" className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>{t.cancel}</button>
          <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={!canSave}>{saving ? "Saving..." : t.save}</button>
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
          <TiptapEditor key={editorRenderKey} content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
