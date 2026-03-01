"use client";

import { useState } from "react";
import Window from "@/components/shared/Window";
import { adminBlogPosts } from "@/lib/mock/stats";
import type { Dictionary } from "@/lib/i18n/getDictionary";

interface ContentManagerProps {
  dict: Dictionary;
}

export default function ContentManager({ dict }: ContentManagerProps) {
  const [activeTab, setActiveTab] = useState<"pages" | "blog" | "gallery">(
    "pages"
  );

  return (
    <Window
      title={dict.admin.contentManager}
      icon="orange"
      className="win-window-full admin-content-window"
    >
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "pages" ? "active" : ""}`}
          onClick={() => setActiveTab("pages")}
        >
          {dict.admin.pageContent}
        </button>
        <button
          className={`admin-tab ${activeTab === "blog" ? "active" : ""}`}
          onClick={() => setActiveTab("blog")}
        >
          {dict.admin.blogPosts}
        </button>
        <button
          className={`admin-tab ${activeTab === "gallery" ? "active" : ""}`}
          onClick={() => setActiveTab("gallery")}
        >
          {dict.admin.galleryItems}
        </button>
      </div>

      {activeTab === "pages" && <PageContentForm dict={dict} />}
      {activeTab === "blog" && <BlogContentList dict={dict} />}
      {activeTab === "gallery" && <GalleryContentList dict={dict} />}
    </Window>
  );
}

function PageContentForm({ dict }: { dict: Dictionary }) {
  return (
    <div>
      <div className="admin-form-group">
        <label className="admin-form-label">
          {dict.home.profileTitle} - {dict.home.name}
        </label>
        <input
          className="admin-form-input"
          type="text"
          defaultValue={dict.home.name}
        />
      </div>
      <div className="admin-form-group">
        <label className="admin-form-label">{dict.home.role}</label>
        <input
          className="admin-form-input"
          type="text"
          defaultValue={dict.home.role}
        />
      </div>
      <div className="admin-form-group">
        <label className="admin-form-label">Bio</label>
        <textarea
          className="admin-form-textarea"
          defaultValue={dict.home.bio}
        />
      </div>
      <div className="admin-form-group">
        <label className="admin-form-label">{dict.home.email}</label>
        <input
          className="admin-form-input"
          type="email"
          defaultValue={dict.home.email}
        />
      </div>
      <div className="admin-form-actions">
        <button>{dict.admin.save}</button>
        <button>{dict.common.cancel}</button>
      </div>
    </div>
  );
}

function BlogContentList({ dict }: { dict: Dictionary }) {
  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <button>{dict.common.add} {dict.admin.blogPosts}</button>
      </div>
      <div className="admin-content-list">
        {adminBlogPosts.map((post) => (
          <div key={post.id} className="admin-content-item">
            <div>
              <strong>{post.title}</strong>
              <br />
              <span style={{ fontSize: "10px", color: "#666" }}>
                {post.date}
              </span>
              <span
                className={`admin-badge ${
                  post.status === "published"
                    ? "admin-badge--published"
                    : "admin-badge--draft"
                }`}
                style={{ marginLeft: "8px" }}
              >
                {dict.admin[post.status]}
              </span>
            </div>
            <div className="admin-content-item-actions">
              <button>{dict.common.edit}</button>
              <button>{dict.common.delete}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryContentList({ dict }: { dict: Dictionary }) {
  return (
    <div>
      <div style={{ marginBottom: "8px" }}>
        <button>{dict.common.add} {dict.admin.galleryItems}</button>
      </div>
      <div className="admin-form-group">
        <label className="admin-form-label">Title</label>
        <input className="admin-form-input" type="text" placeholder="Certificate title..." />
      </div>
      <div className="admin-form-group">
        <label className="admin-form-label">{dict.gallery.issuedBy}</label>
        <input className="admin-form-input" type="text" placeholder="Issuer..." />
      </div>
      <div className="admin-form-group">
        <label className="admin-form-label">{dict.gallery.date}</label>
        <input className="admin-form-input" type="date" />
      </div>
      <div className="admin-form-actions">
        <button>{dict.admin.save}</button>
        <button>{dict.common.cancel}</button>
      </div>
    </div>
  );
}
