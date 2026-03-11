"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "@/app/style/admin/posts.module.css";

interface MockPost {
  id: string;
  title: string;
  slug: string;
  collectionId: string;
  topicId: string;
  isPinned: boolean;
  views: number;
  createdAt: string;
}

const POSTS_PER_PAGE = 9;

const mockPosts: MockPost[] = [
  { id: "1", title: "Getting Started with Next.js 16", slug: "getting-started-nextjs-16", collectionId: "tech", topicId: "nextjs", isPinned: true, views: 245, createdAt: "2026-03-10" },
  { id: "2", title: "CSS Grid Layout Complete Guide", slug: "css-grid-complete-guide", collectionId: "code", topicId: "", isPinned: false, views: 182, createdAt: "2026-03-09" },
  { id: "3", title: "Firebase Authentication Best Practices", slug: "firebase-auth-best-practices", collectionId: "tech", topicId: "firebase", isPinned: false, views: 156, createdAt: "2026-03-08" },
  { id: "4", title: "Design System with CSS Variables", slug: "design-system-css-variables", collectionId: "design", topicId: "", isPinned: false, views: 134, createdAt: "2026-03-07" },
  { id: "5", title: "TypeScript Utility Types Deep Dive", slug: "typescript-utility-types", collectionId: "code", topicId: "typescript", isPinned: true, views: 298, createdAt: "2026-03-06" },
  { id: "6", title: "Building a Blog with Tiptap", slug: "building-blog-tiptap", collectionId: "tutorial", topicId: "", isPinned: false, views: 89, createdAt: "2026-03-05" },
  { id: "7", title: "React Server Components Explained", slug: "react-server-components", collectionId: "tech", topicId: "react", isPinned: false, views: 210, createdAt: "2026-03-04" },
  { id: "8", title: "My Journey into Software Engineering", slug: "journey-software-engineering", collectionId: "life", topicId: "", isPinned: false, views: 167, createdAt: "2026-03-03" },
  { id: "9", title: "Optimizing Web Performance", slug: "optimizing-web-performance", collectionId: "tech", topicId: "", isPinned: false, views: 143, createdAt: "2026-03-02" },
  { id: "10", title: "Responsive Design Patterns", slug: "responsive-design-patterns", collectionId: "design", topicId: "", isPinned: false, views: 112, createdAt: "2026-03-01" },
];

export default function AdminPostsPage() {
  const { dictionary: dict } = useDictionary();
  const router = useRouter();
  const t = dict.admin.posts;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(mockPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (page - 1) * POSTS_PER_PAGE;
    return mockPosts.slice(start, start + POSTS_PER_PAGE);
  }, [page]);

  return (
    <div className={styles.postsPage}>
      <div className={styles.toolbar}>
        <span />
        <button
          className={styles.newBtn}
          onClick={() => router.push("/admin/posts/new")}
        >
          + {t.newPost}
        </button>
      </div>

      {mockPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyTitle}>{t.noPostsYet}</div>
          <div className={styles.emptyDesc}>{t.createFirst}</div>
        </div>
      ) : (
        <>
          <div className={styles.cardGrid}>
            {paginatedPosts.map((post) => (
              <div
                key={post.id}
                className={`${styles.card} ${post.isPinned ? styles.cardPinned : ""}`}
                onClick={() => router.push(`/admin/posts/${post.id}`)}
              >
                {post.isPinned && <span className={styles.cardPin}>{dict.blog.pinned}</span>}
                <div className={styles.cardTitle}>{post.title}</div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardTag}>{post.collectionId}</span>
                  <span>{post.views} views</span>
                  <span>{post.createdAt}</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.cardBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/posts/${post.id}`);
                    }}
                  >
                    {t.editPost}
                  </button>
                  <button
                    className={styles.cardBtnDanger}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(t.confirmDelete)) {
                        /* mockup - will connect later */
                      }
                    }}
                  >
                    {t.deletePost}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                &larr;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === page ? styles.pageBtnActive : styles.pageBtn}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
