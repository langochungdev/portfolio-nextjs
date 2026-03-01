import Window from "@/components/shared/Window";
import { blogCategories, blogPosts } from "@/lib/mock/blog";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";

interface BlogSidebarProps {
  dict: Dictionary;
  locale: Locale;
}

export default function BlogSidebar({ dict, locale }: BlogSidebarProps) {
  return (
    <Window
      title={dict.blog.categories}
      icon="yellow"
      className="win-window-sidebar blog-sidebar-window"
    >
      <div className="blog-search-box">
        <input type="text" placeholder={dict.blog.searchPlaceholder} />
      </div>
      <div className="blog-section-title">{dict.blog.categories}</div>
      <div className="blog-categories">
        {blogCategories.map((cat) => (
          <button key={cat}>
            {dict.blog[cat as keyof typeof dict.blog] || cat}
          </button>
        ))}
      </div>
      <div className="blog-section-title">{dict.blog.recentPosts}</div>
      <div className="blog-recent-list">
        {blogPosts.slice(0, 4).map((post) => (
          <div key={post.id} className="blog-recent-item">
            {post.title[locale]}
          </div>
        ))}
      </div>
    </Window>
  );
}
