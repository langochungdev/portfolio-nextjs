"use client";

import { useState, useMemo } from "react";
import { CollectionPanel } from "@/app/admin/_components/CollectionPanel";
import { TopicPanel } from "@/app/admin/_components/TopicPanel";
import { PostPanel } from "@/app/admin/_components/PostPanel";
import styles from "@/app/style/admin/posts.module.css";

interface CollectionItem {
  id: string;
  name: string;
  order: number;
}

interface TopicItem {
  id: string;
  name: string;
  collectionId: string;
  order: number;
}

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

const INIT_COLLECTIONS: CollectionItem[] = [
  { id: "tech", name: "Tech", order: 0 },
  { id: "code", name: "Code", order: 1 },
  { id: "design", name: "Design", order: 2 },
  { id: "life", name: "Life", order: 3 },
  { id: "tutorial", name: "Tutorial", order: 4 },
];

const INIT_TOPICS: TopicItem[] = [
  { id: "nextjs", name: "Next.js", collectionId: "tech", order: 0 },
  { id: "react", name: "React", collectionId: "tech", order: 1 },
  { id: "firebase", name: "Firebase", collectionId: "tech", order: 2 },
  { id: "typescript", name: "TypeScript", collectionId: "code", order: 0 },
];

const INIT_POSTS: PostItem[] = [
  { id: "1", title: "Getting Started with Next.js 16", slug: "getting-started-nextjs-16", thumbnail: "", content: "<p>Sample content...</p>", collectionId: "tech", topicId: "nextjs", isPinned: true, views: 245, createdAt: "2026-03-10", updatedAt: "2026-03-10" },
  { id: "2", title: "CSS Grid Layout Complete Guide", slug: "css-grid-complete-guide", thumbnail: "", content: "<p>CSS Grid guide...</p>", collectionId: "code", topicId: "", isPinned: false, views: 182, createdAt: "2026-03-09", updatedAt: "2026-03-09" },
  { id: "3", title: "Firebase Auth Best Practices", slug: "firebase-auth-best-practices", thumbnail: "", content: "<p>Firebase auth...</p>", collectionId: "tech", topicId: "firebase", isPinned: false, views: 156, createdAt: "2026-03-08", updatedAt: "2026-03-08" },
  { id: "4", title: "Design System with CSS Variables", slug: "design-system-css-variables", thumbnail: "", content: "<p>Design system...</p>", collectionId: "design", topicId: "", isPinned: false, views: 134, createdAt: "2026-03-07", updatedAt: "2026-03-07" },
  { id: "5", title: "TypeScript Utility Types Deep Dive", slug: "typescript-utility-types", thumbnail: "", content: "<p>TypeScript types...</p>", collectionId: "code", topicId: "typescript", isPinned: true, views: 298, createdAt: "2026-03-06", updatedAt: "2026-03-06" },
];

const INIT_HINTS: HintItem[] = [
  { id: "h1", title: "Server Component không cần 'use client'", content: "Trong Next.js App Router, mọi component mặc định là Server Component. Chỉ thêm 'use client' khi cần hooks hoặc browser APIs.", type: "tip", topicId: "nextjs", relatedPostId: "1", order: 0, createdAt: "2026-03-10", updatedAt: "2026-03-10" },
  { id: "h2", title: "React.cache() deduplicate fetch", content: "Wrap fetch trong React.cache(). React sẽ tự deduplicate — chỉ gọi API 1 lần dù nhiều components cùng request.", type: "tip", topicId: "react", relatedPostId: "", order: 0, createdAt: "2026-03-09", updatedAt: "2026-03-09" },
  { id: "h3", title: "Firebase Auth refresh token", content: "Sử dụng onAuthStateChanged listener thay vì check auth state manually. Tự handle refresh token.", type: "hint", topicId: "firebase", relatedPostId: "3", order: 0, createdAt: "2026-03-08", updatedAt: "2026-03-08" },
  { id: "h4", title: "TypeScript: Prefer unknown over any", content: "Khi không biết type, dùng unknown thay vì any. unknown bắt buộc type narrowing trước khi sử dụng.", type: "tip", topicId: "typescript", relatedPostId: "", order: 0, createdAt: "2026-03-07", updatedAt: "2026-03-07" },
  { id: "h5", title: "CSS Modules: composes để share styles", content: "Dùng composes: className from './shared.module.css' để share styles giữa modules.", type: "note", topicId: "", relatedPostId: "", order: 0, createdAt: "2026-03-06", updatedAt: "2026-03-06" },
];

export default function AdminPostsPage() {
  const [collections, setCollections] = useState(INIT_COLLECTIONS);
  const [topics, setTopics] = useState(INIT_TOPICS);
  const [posts, setPosts] = useState(INIT_POSTS);
  const [hints, setHints] = useState(INIT_HINTS);
  const [selectedColId, setSelectedColId] = useState<string | null>("tech");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [isNewPost, setIsNewPost] = useState(false);

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

  const addCol = (name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "-");
    setCollections((prev) => [...prev, { id, name, order: prev.length }]);
  };

  const renameCol = (id: string, name: string) => {
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const deleteCol = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (selectedColId === id) { setSelectedColId(null); setSelectedTopicId(null); }
  };

  const addTopic = (name: string) => {
    if (!selectedColId) return;
    const id = name.toLowerCase().replace(/\s+/g, "-");
    setTopics((prev) => [...prev, { id, name, collectionId: selectedColId, order: colTopics.length }]);
  };

  const renameTopic = (id: string, name: string) => {
    setTopics((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  };

  const deleteTopic = (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    if (selectedTopicId === id) setSelectedTopicId(null);
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
      collectionId: selectedColId ?? "tech", topicId: selectedTopicId ?? "",
      isPinned: false, views: 0, createdAt: now, updatedAt: now,
    });
    setIsNewPost(true);
  };

  const handleEditPost = (post: PostItem) => {
    setEditingPost({ ...post });
    setIsNewPost(false);
  };

  const handleSavePost = (post: PostItem) => {
    if (isNewPost) {
      setPosts((prev) => [{ ...post, id: Date.now().toString() }, ...prev]);
    } else {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    }
    setEditingPost(null);
    setIsNewPost(false);
  };

  const handleDeletePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (editingPost?.id === id) { setEditingPost(null); setIsNewPost(false); }
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
