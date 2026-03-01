"use client";

import { useState } from "react";
import Window from "@/components/shared/Window";
import DashboardStats from "@/components/admin/DashboardStats";
import type { Dictionary } from "@/lib/i18n/getDictionary";

interface AdminSidebarProps {
  dict: Dictionary;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export function AdminSidebar({
  dict,
  onTabChange,
  activeTab,
}: AdminSidebarProps) {
  const tabs = [
    { key: "dashboard", icon: "📊", label: dict.admin.dashboard },
    { key: "content", icon: "📝", label: dict.admin.contentManager },
    { key: "settings", icon: "⚙️", label: dict.admin.settings },
  ];

  return (
    <Window
      title={dict.common.admin}
      icon="red"
      className="win-window-sidebar admin-sidebar-window"
    >
      <div className="admin-nav-list">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </Window>
  );
}

interface AdminDashboardContentProps {
  dict: Dictionary;
}

export function AdminDashboardContent({ dict }: AdminDashboardContentProps) {
  return (
    <Window
      title={dict.admin.dashboard}
      icon="purple"
      className="win-window-full admin-content-window"
    >
      <DashboardStats dict={dict} />
    </Window>
  );
}

interface AdminLayoutClientProps {
  dict: Dictionary;
  contentManager: React.ReactNode;
}

export default function AdminLayoutClient({
  dict,
  contentManager,
}: AdminLayoutClientProps) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="admin-wrapper">
      <AdminSidebar
        dict={dict}
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />
      {activeTab === "dashboard" && <AdminDashboardContent dict={dict} />}
      {activeTab === "content" && contentManager}
      {activeTab === "settings" && (
        <Window
          title={dict.admin.settings}
          icon="orange"
          className="win-window-full admin-content-window"
        >
          <div className="admin-form-group">
            <label className="admin-form-label">Site Title</label>
            <input
              className="admin-form-input"
              type="text"
              defaultValue="My Portfolio"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">{dict.common.language}</label>
            <select className="admin-form-input" defaultValue="vi">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Theme</label>
            <select className="admin-form-input" defaultValue="win98">
              <option value="win98">Windows 98</option>
            </select>
          </div>
          <div className="admin-form-actions">
            <button>{dict.admin.save}</button>
          </div>
        </Window>
      )}
    </div>
  );
}
