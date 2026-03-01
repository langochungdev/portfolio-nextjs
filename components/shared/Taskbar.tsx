"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";

interface TaskbarProps {
  dict: Dictionary;
  locale: Locale;
}

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, []);

  return <span className="taskbar-clock">{time}</span>;
}

function getActivePage(pathname: string): "home" | "blog" | "gallery" | "admin" {
  if (pathname.includes("/blog")) return "blog";
  if (pathname.includes("/gallery")) return "gallery";
  if (pathname.includes("/admin")) return "admin";
  return "home";
}

export default function Taskbar({ dict, locale }: TaskbarProps) {
  const [startOpen, setStartOpen] = useState(false);
  const pathname = usePathname();
  const activePage = getActivePage(pathname);
  const otherLocale = locale === "vi" ? "en" : "vi";

  const navItems = [
    { key: "home" as const, href: `/${locale}`, icon: "blue" },
    { key: "blog" as const, href: `/${locale}/blog`, icon: "green" },
    { key: "gallery" as const, href: `/${locale}/gallery`, icon: "yellow" },
  ];

  return (
    <>
      <div className={`start-menu window ${startOpen ? "open" : ""}`}>
        <div className="title-bar">
          <div className="title-bar-text">Menu</div>
        </div>
        <div className="window-body">
          <div className="start-menu-list">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="start-menu-item"
                onClick={() => setStartOpen(false)}
              >
                <span className={`win-icon win-icon--${item.icon}`} />
                {dict.common[item.key]}
              </Link>
            ))}
            <div className="start-menu-separator" />
            <Link
              href={`/${locale}/admin`}
              className="start-menu-item"
              onClick={() => setStartOpen(false)}
            >
              <span className="win-icon win-icon--red" />
              {dict.common.admin}
            </Link>
          </div>
        </div>
      </div>
      <div className="taskbar">
        <button
          className="taskbar-start"
          onClick={() => setStartOpen((p) => !p)}
        >
          <span className="taskbar-start-icon" />
          <span>{dict.common.start}</span>
        </button>
        <div className="taskbar-divider" />
        <nav className="taskbar-nav">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href}>
              <button
                className={`taskbar-nav-btn ${
                  activePage === item.key ? "active" : ""
                }`}
              >
                <span className={`win-icon win-icon--${item.icon}`} />
                <span>{dict.common[item.key]}</span>
              </button>
            </Link>
          ))}
        </nav>
        <div className="taskbar-tray">
          <Link href={`/${otherLocale}/${activePage === "home" ? "" : activePage}`}>
            <button className="taskbar-lang">
              {locale.toUpperCase()}
            </button>
          </Link>
          <Clock />
        </div>
      </div>
    </>
  );
}
