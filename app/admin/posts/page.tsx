"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { CollectionPanel } from "@/app/admin/_components/CollectionPanel";
import { TopicPanel } from "@/app/admin/_components/TopicPanel";
import { PostPanel } from "@/app/admin/_components/PostPanel";
import {
  fetchCollections,
  addCollection as addColFb,
  renameCollection as renameColFb,
  deleteCollection as deleteColFb,
  fetchTopics,
  addTopic as addTopicFb,
  renameTopic as renameTopicFb,
  deleteTopic as deleteTopicFb,
  type CollectionDoc,
  type TopicDoc,
} from "@/lib/firebase/collections";
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost as deletePostFb,
  type PostDoc,
} from "@/lib/firebase/posts";
import {
  processContentMedia,
  deleteContentMedia,
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
} from "@/lib/cloudinary/client";
import styles from "@/app/style/admin/posts.module.css";

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

export default function AdminPostsPage() {
  const [collections, setCollections] = useState<CollectionDoc[]>([]);
  const [topics, setTopics] = useState<TopicDoc[]>([]);
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [hints, setHints] = useState<HintItem[]>([]);
  const [selectedColId, setSelectedColId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<PostDoc | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cols, tps, pts] = await Promise.all([
        fetchCollections(),
        fetchTopics(),
        fetchPosts(),
      ]);
      setCollections(cols);
      setTopics(tps);
      setPosts(pts);
      if (cols.length > 0 && !selectedColId) setSelectedColId(cols[0].id);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedColId]);

  useEffect(() => { loadData(); }, []);

  const colTopics = useMemo(
    () => topics.filter((t) => t.collectionId === selectedColId),
    [topics, selectedColId]
  );

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedColId && p.collectionId !== selectedColId) return false;
      if (selectedTopicId && p.topicId !== selectedTopicId) return false;
      return true;
    });
  }, [posts, selectedColId, selectedTopicId]);

  const totalColPosts = useMemo(
    () => posts.filter((p) => p.collectionId === selectedColId).length,
    [posts, selectedColId]
  );

  const colCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of posts) map[p.collectionId] = (map[p.collectionId] ?? 0) + 1;
    return map;
  }, [posts]);

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of posts) {
      if (p.topicId) map[p.topicId] = (map[p.topicId] ?? 0) + 1;
    }
    return map;
  }, [posts]);

  const handleSelectCol = (id: string) => {
    setSelectedColId(id);
    setSelectedTopicId(null);
    setEditingPost(null);
    setIsNewPost(false);
  };

  const handleSelectTopic = (id: string | null) => {
    setSelectedTopicId(id === selectedTopicId ? null : id);
    setEditingPost(null);
    setIsNewPost(false);
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

  const addTopic = async (name: string) => {
    if (!selectedColId) return;
    try {
      const id = await addTopicFb(name, selectedColId, colTopics.length);
      setTopics((prev) => [...prev, { id, name, collectionId: selectedColId, order: colTopics.length }]);
    } catch (err) { console.error(err); }
  };

  const renameTopic = async (id: string, name: string) => {
    try {
      await renameTopicFb(id, name);
      setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
    } catch (err) { console.error(err); }
  };

  const deleteTopic = async (id: string) => {
    try {
      await deleteTopicFb(id);
      setTopics((prev) => prev.filter((t) => t.id !== id));
      if (selectedTopicId === id) setSelectedTopicId(null);
    } catch (err) { console.error(err); }
  };

  const filteredHints = useMemo(() => {
    if (selectedTopicId) return hints.filter((h) => h.topicId === selectedTopicId);
    if (selectedColId) {
      const topicIds = new Set(colTopics.map((t) => t.id));
      return hints.filter((h) => h.topicId && topicIds.has(h.topicId));
    }
    return [];
  }, [hints, selectedTopicId, selectedColId, colTopics]);

  const handleNewPost = () => {
    const now = new Date().toISOString().split("T")[0];
    setEditingPost({
      id: "", title: "", slug: "", thumbnail: "", content: "",
      collectionId: selectedColId ?? "", topicId: selectedTopicId ?? "",
      isPinned: false, views: 0, createdAt: now, updatedAt: now,
    });
    setIsNewPost(true);
  };

  const handleEditPost = (post: PostDoc) => {
    setEditingPost({ ...post });
    setIsNewPost(false);
  };

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
          title: post.title, slug: post.slug, thumbnail: finalThumbnail,
          content: processedHtml, collectionId: post.collectionId,
          topicId: post.topicId, isPinned: post.isPinned,
        });
        setPosts((prev) => prev.map((p) => p.id === tempId ? { ...optimisticPost, id, thumbnail: finalThumbnail, content: processedHtml } : p));
      } else {
        await updatePost(post.id, {
          title: post.title, slug: post.slug, thumbnail: finalThumbnail,
          content: processedHtml, collectionId: post.collectionId,
          topicId: post.topicId, isPinned: post.isPinned,
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

    const prevPosts = [...posts];
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (editingPost?.id === id) { setEditingPost(null); setIsNewPost(false); }

    try {
      await Promise.all([
        deleteContentMedia(post.content),
        (() => { const tid = post.thumbnail ? extractPublicId(post.thumbnail) : null; return tid ? deleteFromCloudinary([tid]).catch(console.error) : Promise.resolve(); })(),
        deletePostFb(id),
      ]);
    } catch (err) {
      console.error("Delete failed:", err);
      setPosts(prevPosts);
      alert(err instanceof Error ? err.message : "Lỗi khi xóa bài viết");
    }
  };

  const handleAddHint = (hint: Omit<HintItem, "id">) => {
    setHints((prev) => [{ ...hint, id: `h${Date.now()}` }, ...prev]);
  };

  const handleUpdateHint = (hint: HintItem) => {
    setHints((prev) => prev.map((h) => (h.id === hint.id ? hint : h)));
  };

  const handleDeleteHint = (id: string) => {
    setHints((prev) => prev.filter((h) => h.id !== id));
  };

  const handleCancelEdit = () => { setEditingPost(null); setIsNewPost(false); };

  if (loading) {
    return <div className={styles.triPanel}><div className={styles.panel}>Loading...</div></div>;
  }

  return (
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
      />
      <PostPanel
        posts={filteredPosts}
        hints={filteredHints}
        selectedTopicId={selectedTopicId}
        editingPost={editingPost}
        isNew={isNewPost}
        collections={collections}
        topics={topics}
        saving={saving}
        onNew={handleNewPost}
        onEdit={handleEditPost}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
        onCancel={handleCancelEdit}
        onAddHint={handleAddHint}
        onUpdateHint={handleUpdateHint}
        onDeleteHint={handleDeleteHint}
      />
    </div>
  );
}
