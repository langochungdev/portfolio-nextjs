"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { CollectionPanel } from "@/app/admin/_components/CollectionPanel";
import { TopicPanel } from "@/app/admin/_components/TopicPanel";
import { PostPanel } from "@/app/admin/_components/PostPanel";
import type { HintItem } from "@/app/admin/_components/HintList";
import {
  fetchCollections,
  addCollection as addColFb,
  renameCollection as renameColFb,
  deleteCollection as deleteColFb,
  fetchTopics,
  addTopic as addTopicFb,
  updateTopic as updateTopicFb,
  deleteTopic as deleteTopicFb,
  updateTopicOrders,
  type CollectionDoc,
  type TopicDoc,
  type VisibilityStatus,
} from "@/lib/firebase/collections";
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost as deletePostFb,
  updatePostOrders,
  type PostDoc,
} from "@/lib/firebase/posts";
import {
  fetchHints,
  createHint,
  updateHint as updateHintFb,
  deleteHint as deleteHintFb,
  updateHintOrders,
  type HintDoc,
} from "@/lib/firebase/hints";
import {
  processContentMedia,
  deleteContentMedia,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from "@/lib/cloudinary/client";
import styles from "@/app/style/admin/posts.module.css";

type PendingDeleteKind = "post" | "topic" | "hint";

interface PendingDeleteAction {
  id: string;
  kind: PendingDeleteKind;
  label: string;
  rollback: () => void;
  commit: () => Promise<void>;
}

const DELETE_UNDO_MS = 3000;

export default function AdminPostsPage() {
  const [collections, setCollections] = useState<CollectionDoc[]>([]);
  const [topics, setTopics] = useState<TopicDoc[]>([]);
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [hints, setHints] = useState<HintDoc[]>([]);
  const [selectedColId, setSelectedColId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<PostDoc | null>(null);
  const [editingHint, setEditingHint] = useState<HintItem | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [isNewHint, setIsNewHint] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [postOrderChanged, setPostOrderChanged] = useState(false);
  const [hintOrderChanged, setHintOrderChanged] = useState(false);
  const [topicOrderChanged, setTopicOrderChanged] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Pick<PendingDeleteAction, "id" | "kind" | "label"> | null>(null);
  const originalPostOrder = useRef<string[]>([]);
  const originalHintOrder = useRef<string[]>([]);
  const originalTopicOrder = useRef<string[]>([]);
  const pendingDeleteRef = useRef<PendingDeleteAction | null>(null);
  const pendingDeleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingDeleteTimer = useCallback(() => {
    if (!pendingDeleteTimerRef.current) return;
    clearTimeout(pendingDeleteTimerRef.current);
    pendingDeleteTimerRef.current = null;
  }, []);

  const dismissPendingDelete = useCallback(() => {
    clearPendingDeleteTimer();
    setPendingDelete(null);
    const current = pendingDeleteRef.current;
    pendingDeleteRef.current = null;
    return current;
  }, [clearPendingDeleteTimer]);

  const runDeleteCommit = useCallback(async (action: PendingDeleteAction) => {
    try {
      await action.commit();
    } catch (err) {
      console.error("Delete commit failed:", err);
      alert(err instanceof Error ? err.message : `Lỗi khi xóa ${action.label}`);
    }
  }, []);

  const finalizePendingDelete = useCallback(async () => {
    const action = dismissPendingDelete();
    if (!action) return;
    await runDeleteCommit(action);
  }, [dismissPendingDelete, runDeleteCommit]);

  const startPendingDeleteTimer = useCallback(() => {
    if (!pendingDeleteRef.current) return;
    clearPendingDeleteTimer();
    pendingDeleteTimerRef.current = setTimeout(() => {
      void finalizePendingDelete();
    }, DELETE_UNDO_MS);
  }, [clearPendingDeleteTimer, finalizePendingDelete]);

  const pausePendingDeleteTimer = useCallback(() => {
    clearPendingDeleteTimer();
  }, [clearPendingDeleteTimer]);

  const restartPendingDeleteTimer = useCallback(() => {
    startPendingDeleteTimer();
  }, [startPendingDeleteTimer]);

  const undoPendingDelete = useCallback(() => {
    const action = dismissPendingDelete();
    if (!action) return;
    action.rollback();
  }, [dismissPendingDelete]);

  const stagePendingDelete = useCallback((action: PendingDeleteAction) => {
    const previousAction = dismissPendingDelete();
    if (previousAction) {
      void runDeleteCommit(previousAction);
    }

    pendingDeleteRef.current = action;
    setPendingDelete({ id: action.id, kind: action.kind, label: action.label });
    startPendingDeleteTimer();
  }, [dismissPendingDelete, runDeleteCommit, startPendingDeleteTimer]);

  useEffect(() => {
    return () => {
      clearPendingDeleteTimer();
      const pendingAction = pendingDeleteRef.current;
      pendingDeleteRef.current = null;
      if (pendingAction) {
        void runDeleteCommit(pendingAction);
      }
    };
  }, [clearPendingDeleteTimer, runDeleteCommit]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cols, tps, pts, hts] = await Promise.all([
        fetchCollections(),
        fetchTopics(undefined, { includeNonPublic: true }),
        fetchPosts({ includeNonPublic: true }),
        fetchHints({ includeNonPublic: true }),
      ]);
      setCollections(cols);
      setTopics(tps);
      setPosts(pts);
      setHints(hts);
      if (cols.length > 0 && !selectedColId) setSelectedColId(cols[0].id);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedColId]);

  useEffect(() => { loadData(); }, []);

  const colTopics = useMemo(
    () => topics
      .filter((t) => t.collectionId === selectedColId)
      .sort((a, b) => a.order - b.order),
    [topics, selectedColId]
  );

  const filteredPosts = useMemo(() => {
    const contextKey = selectedTopicId ?? selectedColId ?? "";
    return posts
      .filter((p) => {
        if (selectedColId && !p.collectionIds.includes(selectedColId)) return false;
        if (selectedTopicId && !p.topicIds.includes(selectedTopicId)) return false;
        return true;
      })
      .sort((a, b) => (a.orderMap[contextKey] ?? Infinity) - (b.orderMap[contextKey] ?? Infinity));
  }, [posts, selectedColId, selectedTopicId]);

  const filteredHints = useMemo(() => {
    if (selectedTopicId) {
      return hints
        .filter((h) => h.topicId === selectedTopicId)
        .sort((a, b) => a.order - b.order);
    }
    if (selectedColId) {
      const topicIds = new Set(colTopics.map((t) => t.id));
      const postIds = new Set(
        posts
          .filter((p) => p.collectionIds.includes(selectedColId))
          .map((p) => p.id),
      );
      return hints
        .filter((h) =>
          (h.topicId && topicIds.has(h.topicId)) || (h.postId && postIds.has(h.postId))
        )
        .sort((a, b) => a.order - b.order);
    }
    return [];
  }, [hints, selectedTopicId, selectedColId, colTopics, posts]);

  useEffect(() => {
    originalPostOrder.current = filteredPosts.map((p) => p.id);
    setPostOrderChanged(false);
  }, [selectedColId, selectedTopicId]);

  useEffect(() => {
    originalHintOrder.current = filteredHints.map((h) => h.id);
    setHintOrderChanged(false);
  }, [selectedColId, selectedTopicId]);

  useEffect(() => {
    originalTopicOrder.current = colTopics.map((topic) => topic.id);
    setTopicOrderChanged(false);
  }, [selectedColId, colTopics.length]);

  const totalColPosts = useMemo(
    () => posts.filter((p) => selectedColId && p.collectionIds.includes(selectedColId)).length,
    [posts, selectedColId]
  );

  const colCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of posts) {
      for (const cid of p.collectionIds) map[cid] = (map[cid] ?? 0) + 1;
    }
    return map;
  }, [posts]);

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of posts) {
      for (const tid of p.topicIds) map[tid] = (map[tid] ?? 0) + 1;
    }
    return map;
  }, [posts]);

  const handleSelectCol = (id: string) => {
    setSelectedColId(id);
    setSelectedTopicId(null);
    setEditingPost(null);
    setEditingHint(null);
    setIsNewPost(false);
    setIsNewHint(false);
  };

  const handleSelectTopic = (id: string | null) => {
    setSelectedTopicId(id === selectedTopicId ? null : id);
    setEditingPost(null);
    setEditingHint(null);
    setIsNewPost(false);
    setIsNewHint(false);
  };

  const addCol = async (name: string) => {
    try {
      const id = await addColFb(name, collections.length);
      setCollections((prev) => [...prev, { id, name, order: prev.length }]);
    } catch (err) { console.error(err); }
  };

  const renameCol = async (id: string, name: string) => {
    try {
      await renameColFb(id, name);
      setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
    } catch (err) { console.error(err); }
  };

  const deleteCol = async (id: string) => {
    try {
      await deleteColFb(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      if (selectedColId === id) { setSelectedColId(null); setSelectedTopicId(null); }
    } catch (err) { console.error(err); }
  };

  const addTopic = async (data: { name: string; slug: string; thumbnail: string; thumbnailFile?: File; description: string; visibility: VisibilityStatus }) => {
    if (!selectedColId) return;
    try {
      const normalizedName = data.name.trim();
      const normalizedSlug = normalizedName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u0111/g, "d")
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      let thumbnailUrl = data.thumbnail;
      if (data.thumbnailFile) {
        const result = await uploadToCloudinary(data.thumbnailFile);
        thumbnailUrl = result.url;
      }
      const id = await addTopicFb(normalizedName, selectedColId, colTopics.length, normalizedSlug, thumbnailUrl, data.description, data.visibility);
      setTopics((prev) => [...prev, { id, name: normalizedName, slug: normalizedSlug, thumbnail: thumbnailUrl, description: data.description, collectionId: selectedColId, order: colTopics.length, visibility: data.visibility }]);
    } catch (err) { console.error(err); }
  };

  const renameTopic = async (id: string, name: string) => {
    try {
      const normalizedName = name.trim();
      const slug = normalizedName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0111/g, "d").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
      await updateTopicFb(id, { name: normalizedName, slug });
      setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, name: normalizedName, slug } : t)));
    } catch (err) { console.error(err); }
  };

  const deleteTopic = async (id: string) => {
    const topic = topics.find((t) => t.id === id);
    if (!topic) return;

    const originalIndex = topics.findIndex((item) => item.id === id);
    const wasSelected = selectedTopicId === id;

    setTopics((prev) => prev.filter((item) => item.id !== id));
    if (wasSelected) setSelectedTopicId(null);

    stagePendingDelete({
      id,
      kind: "topic",
      label: `topic \"${topic.name}\"`,
      rollback: () => {
        setTopics((current) => {
          if (current.some((item) => item.id === id)) return current;
          const next = [...current];
          const insertIndex = Math.min(originalIndex, next.length);
          next.splice(insertIndex, 0, topic);
          return next;
        });
        if (wasSelected) setSelectedTopicId(id);
      },
      commit: async () => {
        try {
          if (topic.thumbnail) {
            const thumbId = extractPublicId(topic.thumbnail);
            if (thumbId) await deleteFromCloudinary([thumbId]).catch(console.error);
          }
          await deleteTopicFb(id);
        } catch (err) {
          setTopics((current) => {
            if (current.some((item) => item.id === id)) return current;
            const next = [...current];
            const insertIndex = Math.min(originalIndex, next.length);
            next.splice(insertIndex, 0, topic);
            return next;
          });
          if (wasSelected) setSelectedTopicId(id);
          throw err;
        }
      },
    });
  };

  const handleNewPost = () => {
    const now = new Date().toISOString().split("T")[0];
    setEditingPost({
      id: "", title: "", slug: "", thumbnail: "", content: "",
      summary: "",
      excerpt: "", readTime: 1,
      collectionIds: selectedColId ? [selectedColId] : [], topicIds: selectedTopicId ? [selectedTopicId] : [],
      isPinned: false, orderMap: {}, views: 0, createdAt: now, updatedAt: now, visibility: "public",
    });
    setIsNewPost(true);
  };

  const handleEditPost = (post: PostDoc) => {
    setEditingPost({ ...post });
    setIsNewPost(false);
  };

  const handleCreateTopicForPost = useCallback(async (name: string) => {
    const colId = selectedColId ?? "";
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0111/g, "d").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    const id = await addTopicFb(name, colId, colTopics.length, slug, "", "", "public");
    setTopics((prev) => [...prev, { id, name, slug, thumbnail: "", description: "", collectionId: colId, order: colTopics.length, visibility: "public" }]);
    return id;
  }, [selectedColId, colTopics.length]);

  const handleSavePost = async (post: PostDoc, thumbnailFile?: File) => {
    const tempId = isNewPost ? `temp-${Date.now()}` : post.id;
    const now = new Date().toISOString().split("T")[0];
    const optimisticPost = { ...post, id: tempId, updatedAt: now, ...(isNewPost ? { createdAt: now } : {}) };

    if (isNewPost) {
      setPosts((prev) => [optimisticPost, ...prev]);
    } else {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? optimisticPost : p)));
    }
    setEditingPost(null);
    const wasNew = isNewPost;
    setIsNewPost(false);
    setSaving(false);

    const prevPosts = [...posts];
    const rollback = () => setPosts(prevPosts);

    try {
      let finalThumbnail = post.thumbnail;
      if (thumbnailFile) {
        const oldThumb = wasNew ? "" : (prevPosts.find((p) => p.id === post.id)?.thumbnail ?? "");
        const oldId = oldThumb ? extractPublicId(oldThumb) : null;
        if (oldId) deleteFromCloudinary([oldId]).catch(console.error);
        const { url } = await uploadToCloudinary(thumbnailFile);
        finalThumbnail = url;
      } else if (!post.thumbnail) {
        const oldThumb = wasNew ? "" : (prevPosts.find((p) => p.id === post.id)?.thumbnail ?? "");
        const oldId = oldThumb ? extractPublicId(oldThumb) : null;
        if (oldId) deleteFromCloudinary([oldId]).catch(console.error);
        finalThumbnail = "";
      }

      const oldContent = wasNew ? "" : (prevPosts.find((p) => p.id === post.id)?.content ?? "");
      const { processedHtml } = await processContentMedia(post.content, oldContent);

      if (wasNew) {
        const id = await createPost({
          title: post.title, slug: post.slug, summary: post.summary, thumbnail: finalThumbnail,
          content: processedHtml, collectionIds: post.collectionIds,
          topicIds: post.topicIds, isPinned: post.isPinned, orderMap: post.orderMap, visibility: post.visibility,
        });
        setPosts((prev) => prev.map((p) => p.id === tempId ? { ...optimisticPost, id, thumbnail: finalThumbnail, content: processedHtml } : p));
      } else {
        await updatePost(post.id, {
          title: post.title, slug: post.slug, summary: post.summary, thumbnail: finalThumbnail,
          content: processedHtml, collectionIds: post.collectionIds,
          topicIds: post.topicIds, isPinned: post.isPinned, orderMap: post.orderMap, visibility: post.visibility,
        });
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...optimisticPost, thumbnail: finalThumbnail, content: processedHtml } : p));
      }
    } catch (err) {
      console.error("Save failed:", err);
      rollback();
      alert(err instanceof Error ? err.message : "Lỗi khi lưu bài viết");
    }
  };

  const handleDeletePost = async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const originalIndex = posts.findIndex((item) => item.id === id);
    const wasEditingPost = editingPost?.id === id ? editingPost : null;
    const wasNewEditingPost = editingPost?.id === id ? isNewPost : false;

    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (editingPost?.id === id) { setEditingPost(null); setIsNewPost(false); }

    stagePendingDelete({
      id,
      kind: "post",
      label: `bài viết \"${post.title}\"`,
      rollback: () => {
        setPosts((current) => {
          if (current.some((item) => item.id === id)) return current;
          const next = [...current];
          const insertIndex = Math.min(originalIndex, next.length);
          next.splice(insertIndex, 0, post);
          return next;
        });
        if (wasEditingPost) {
          setEditingPost(wasEditingPost);
          setIsNewPost(wasNewEditingPost);
        }
      },
      commit: async () => {
        try {
          const thumbId = post.thumbnail ? extractPublicId(post.thumbnail) : null;
          await Promise.all([
            deleteContentMedia(post.content),
            thumbId ? deleteFromCloudinary([thumbId]).catch(console.error) : Promise.resolve(),
            deletePostFb(id),
          ]);
        } catch (err) {
          setPosts((current) => {
            if (current.some((item) => item.id === id)) return current;
            const next = [...current];
            const insertIndex = Math.min(originalIndex, next.length);
            next.splice(insertIndex, 0, post);
            return next;
          });
          if (wasEditingPost) {
            setEditingPost(wasEditingPost);
            setIsNewPost(wasNewEditingPost);
          }
          throw err;
        }
      },
    });
  };

  const handleNewHint = () => {
    const now = new Date().toISOString().split("T")[0];
    const initialTopicId = selectedTopicId ?? colTopics[0]?.id ?? "";
    const initialPostId = filteredPosts.find((post) =>
      initialTopicId ? post.topicIds.includes(initialTopicId) : true,
    )?.id ?? "";
    setEditingHint({
      id: "", title: "", content: "", type: "tip",
      topicId: initialTopicId, postId: initialPostId,
      order: hints.length, createdAt: now, updatedAt: now, visibility: "public",
    });
    setIsNewHint(true);
  };

  const handleEditHint = (hint: HintItem) => {
    setEditingHint({ ...hint });
    setIsNewHint(false);
  };

  const handleSaveHint = async (hint: HintItem) => {
    const tempId = isNewHint ? `temp-${Date.now()}` : hint.id;
    const now = new Date().toISOString().split("T")[0];
    const optimistic = { ...hint, id: tempId, updatedAt: now, ...(isNewHint ? { createdAt: now } : {}) };

    const prevHints = [...hints];
    if (isNewHint) {
      setHints((prev) => [optimistic, ...prev]);
    } else {
      setHints((prev) => prev.map((h) => (h.id === hint.id ? optimistic : h)));
    }
    setEditingHint(null);
    const wasNew = isNewHint;
    setIsNewHint(false);

    try {
      const oldContent = wasNew ? "" : (prevHints.find((h) => h.id === hint.id)?.content ?? "");
      const { processedHtml } = await processContentMedia(hint.content, oldContent);

      if (wasNew) {
        const id = await createHint({
          title: hint.title, content: processedHtml, type: hint.type,
          topicId: hint.topicId, postId: hint.postId, order: hint.order, visibility: hint.visibility,
        });
        setHints((prev) => prev.map((h) => h.id === tempId ? { ...optimistic, id, content: processedHtml } : h));
      } else {
        await updateHintFb(hint.id, {
          title: hint.title, content: processedHtml, type: hint.type,
          topicId: hint.topicId, postId: hint.postId, visibility: hint.visibility,
        });
        setHints((prev) => prev.map((h) => h.id === hint.id ? { ...optimistic, content: processedHtml } : h));
      }
    } catch (err) {
      console.error("Save hint failed:", err);
      setHints(prevHints);
      alert(err instanceof Error ? err.message : "Lỗi khi lưu hint");
    }
  };

  const handleDeleteHint = async (id: string) => {
    const hint = hints.find((h) => h.id === id);
    if (!hint) return;

    const originalIndex = hints.findIndex((item) => item.id === id);
    const wasEditingHint = editingHint?.id === id ? editingHint : null;

    setHints((prev) => prev.filter((h) => h.id !== id));
    if (editingHint?.id === id) { setEditingHint(null); setIsNewHint(false); }

    stagePendingDelete({
      id,
      kind: "hint",
      label: `hint \"${hint.title}\"`,
      rollback: () => {
        setHints((current) => {
          if (current.some((item) => item.id === id)) return current;
          const next = [...current];
          const insertIndex = Math.min(originalIndex, next.length);
          next.splice(insertIndex, 0, hint);
          return next;
        });
        if (wasEditingHint) {
          setEditingHint(wasEditingHint);
          setIsNewHint(false);
        }
      },
      commit: async () => {
        try {
          await Promise.all([
            deleteContentMedia(hint.content),
            deleteHintFb(id),
          ]);
        } catch (err) {
          setHints((current) => {
            if (current.some((item) => item.id === id)) return current;
            const next = [...current];
            const insertIndex = Math.min(originalIndex, next.length);
            next.splice(insertIndex, 0, hint);
            return next;
          });
          if (wasEditingHint) {
            setEditingHint(wasEditingHint);
            setIsNewHint(false);
          }
          throw err;
        }
      },
    });
  };

  const handleCancelHint = () => { setEditingHint(null); setIsNewHint(false); };

  const handleReorderPosts = (reordered: PostDoc[]) => {
    const contextKey = selectedTopicId ?? selectedColId ?? "";
    const reorderedIds = reordered.map((p) => p.id);
    const idSet = new Set(reorderedIds);
    const updated = reordered.map((p, i) => ({
      ...p,
      orderMap: { ...p.orderMap, [contextKey]: i },
    }));
    const unchanged = posts.filter((p) => !idSet.has(p.id));
    setPosts([...updated, ...unchanged]);
    const changed = reorderedIds.join(",") !== originalPostOrder.current.join(",");
    setPostOrderChanged(changed);
  };

  const handleSavePostOrder = async () => {
    try {
      const updates = filteredPosts.map((p) => ({ id: p.id, orderMap: p.orderMap }));
      await updatePostOrders(updates);
      originalPostOrder.current = filteredPosts.map((p) => p.id);
      setPostOrderChanged(false);
    } catch (err) {
      console.error("Save post order failed:", err);
      alert("Lỗi khi lưu thứ tự bài viết");
    }
  };

  const handleResetPostOrder = () => {
    const origIds = originalPostOrder.current;
    const contextKey = selectedTopicId ?? selectedColId ?? "";
    const idSet = new Set(filteredPosts.map((p) => p.id));
    const sorted = origIds
      .map((id) => posts.find((p) => p.id === id))
      .filter((p): p is PostDoc => !!p)
      .map((p, i) => ({ ...p, orderMap: { ...p.orderMap, [contextKey]: i } }));
    const unchanged = posts.filter((p) => !idSet.has(p.id));
    setPosts([...sorted, ...unchanged]);
    setPostOrderChanged(false);
  };

  const handleReorderTopics = (reordered: TopicDoc[]) => {
    const reorderedIds = reordered.map((topic) => topic.id);
    const idSet = new Set(reorderedIds);
    const updated = reordered.map((topic, index) => ({ ...topic, order: index }));
    const unchanged = topics.filter((topic) => !idSet.has(topic.id));
    setTopics([...updated, ...unchanged]);
    const changed = reorderedIds.join(",") !== originalTopicOrder.current.join(",");
    setTopicOrderChanged(changed);
  };

  const handleSaveTopicOrder = async () => {
    try {
      const updates = colTopics.map((topic, index) => ({ id: topic.id, order: index }));
      await updateTopicOrders(updates);
      originalTopicOrder.current = colTopics.map((topic) => topic.id);
      setTopicOrderChanged(false);
    } catch (err) {
      console.error("Save topic order failed:", err);
      alert("Lỗi khi lưu thứ tự topic");
    }
  };

  const handleResetTopicOrder = () => {
    const originalIds = originalTopicOrder.current;
    const idSet = new Set(colTopics.map((topic) => topic.id));
    const sorted = originalIds
      .map((id) => topics.find((topic) => topic.id === id))
      .filter((topic): topic is TopicDoc => !!topic)
      .map((topic, index) => ({ ...topic, order: index }));
    const unchanged = topics.filter((topic) => !idSet.has(topic.id));
    setTopics([...sorted, ...unchanged]);
    setTopicOrderChanged(false);
  };

  const handleReorderHints = (reordered: HintItem[]) => {
    const reorderedIds = reordered.map((h) => h.id);
    const idSet = new Set(reorderedIds);
    const unchanged = hints.filter((h) => !idSet.has(h.id));
    setHints([...reordered, ...unchanged] as HintDoc[]);
    const changed = reorderedIds.join(",") !== originalHintOrder.current.join(",");
    setHintOrderChanged(changed);
  };

  const handleResetHintOrder = () => {
    const origIds = originalHintOrder.current;
    const idSet = new Set(filteredHints.map((h) => h.id));
    const sorted = origIds
      .map((id) => hints.find((h) => h.id === id))
      .filter((h): h is HintDoc => !!h)
      .map((h, i) => ({ ...h, order: i }));
    const unchanged = hints.filter((h) => !idSet.has(h.id));
    setHints([...sorted, ...unchanged] as HintDoc[]);
    setHintOrderChanged(false);
  };

  const handleSaveHintOrder = async () => {
    try {
      const updates = filteredHints.map((h, i) => ({ id: h.id, order: i }));
      await updateHintOrders(updates);
      originalHintOrder.current = filteredHints.map((h) => h.id);
      setHintOrderChanged(false);
    } catch (err) {
      console.error("Save hint order failed:", err);
      alert("Lỗi khi lưu thứ tự hint");
    }
  };

  const handleCancelEdit = () => { setEditingPost(null); setIsNewPost(false); };

  if (loading) {
    return <div className={styles.triPanel}><div className={styles.panel}>Loading...</div></div>;
  }

  return (
    <>
      <div className={styles.triPanel}>
        <CollectionPanel
          items={collections}
          selectedId={selectedColId}
          counts={colCounts}
          onSelect={handleSelectCol}
          onAdd={addCol}
          onRename={renameCol}
          onDelete={deleteCol}
        />
        <TopicPanel
          items={colTopics}
          selectedId={selectedTopicId}
          totalCount={totalColPosts}
          counts={topicCounts}
          disabled={!selectedColId}
          onSelect={handleSelectTopic}
          onAdd={addTopic}
          onRename={renameTopic}
          onDelete={deleteTopic}
          onReorder={handleReorderTopics}
          onSaveOrder={handleSaveTopicOrder}
          onResetOrder={handleResetTopicOrder}
          orderChanged={topicOrderChanged}
          onUpdateTopic={async (id, data, thumbnailFile) => {
            try {
              let updateData = { ...data };
              if (updateData.name) {
                const normalizedName = updateData.name.trim();
                const normalizedSlug = normalizedName
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/\u0111/g, "d")
                  .replace(/[^\w\s-]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/-+/g, "-")
                  .trim();
                updateData = { ...updateData, name: normalizedName, slug: normalizedSlug };
              }
              if (thumbnailFile) {
                const result = await uploadToCloudinary(thumbnailFile);
                updateData = { ...updateData, thumbnail: result.url };
              }
              await updateTopicFb(id, updateData);
              setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...updateData } : t)));
            } catch (err) { console.error(err); }
          }}
        />
        <PostPanel
          posts={filteredPosts}
          hints={filteredHints}
          selectedTopicId={selectedTopicId}
          editingPost={editingPost}
          editingHint={editingHint}
          isNew={isNewPost}
          isNewHint={isNewHint}
          collections={collections}
          topics={topics}
          saving={saving}
          onNew={handleNewPost}
          onEdit={handleEditPost}
          onSave={handleSavePost}
          onDelete={handleDeletePost}
          onCancel={handleCancelEdit}
          onCreateTopic={handleCreateTopicForPost}
          onNewHint={handleNewHint}
          onEditHint={handleEditHint}
          onSaveHint={handleSaveHint}
          onDeleteHint={handleDeleteHint}
          onCancelHint={handleCancelHint}
          onReorderPosts={handleReorderPosts}
          onSavePostOrder={handleSavePostOrder}
          onResetPostOrder={handleResetPostOrder}
          postOrderChanged={postOrderChanged}
          onReorderHints={handleReorderHints}
          onSaveHintOrder={handleSaveHintOrder}
          onResetHintOrder={handleResetHintOrder}
          hintOrderChanged={hintOrderChanged}
        />
      </div>
      {pendingDelete && (
        <div
          className={styles.deleteUndoFloat}
          role="status"
          aria-live="polite"
          onPointerEnter={pausePendingDeleteTimer}
          onPointerLeave={restartPendingDeleteTimer}
        >
          <span className={styles.deleteUndoText}>Đã xóa tạm {pendingDelete.label}. Tự xóa sau 3 giây.</span>
          <div className={styles.deleteUndoActions}>
            <button type="button" className={styles.deleteUndoBtn} onClick={undoPendingDelete}>Hoàn tác</button>
            <button type="button" className={styles.deleteAcceptBtn} onClick={() => { void finalizePendingDelete(); }}>Chấp nhận</button>
          </div>
        </div>
      )}
    </>
  );
}
