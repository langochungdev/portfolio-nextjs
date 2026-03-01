import Window from "@/components/shared/Window";
import { blogPosts } from "@/lib/mock/blog";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";

interface PostsWindowProps {
  dict: Dictionary;
  locale: Locale;
}

export default function PostsWindow({ dict, locale }: PostsWindowProps) {
  return (
    <Window
      title={dict.blog.title}
      icon="green"
      className="win-window-full blog-posts-window"
      submenu={[
        { label: dict.blog.reblog },
        { label: dict.blog.permalink },
      ]}
    >
      <div className="blog-masonry">
        {blogPosts.map((post) => (
          <div key={post.id} className="blog-post-card">
            {post.image && (
              <div
                className="blog-post-image"
                style={{ backgroundColor: post.color }}
              >
                📷 {post.title[locale]}
              </div>
            )}
            <div className="blog-post-body">
              <div className="blog-user-row">
                <div className="win-avatar" />
                <span className="win-username">{post.author}</span>
              </div>
              <span className="blog-post-category">
                {dict.blog[post.category as keyof typeof dict.blog] ||
                  post.category}
              </span>
              <h3 className="blog-post-title">{post.title[locale]}</h3>
              <div className="blog-post-date">{post.date}</div>
              <p className="blog-post-excerpt">{post.excerpt[locale]}</p>
              <div className="blog-post-actions">
                <button className="blog-post-action">
                  {dict.blog.readMore}
                </button>
                <button className="blog-post-action">
                  {dict.blog.permalink}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Window>
  );
}
