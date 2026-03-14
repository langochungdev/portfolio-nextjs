"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import {
  subscribeConversations,
  subscribeMessages,
  sendMessage,
  markAsRead,
  deleteConversation,
  updateConversationUserName,
  updateConversationNote,
  type ConversationDoc,
  type MessageDoc,
} from "@/lib/firebase/conversations";
import {
  fetchPostSummaries,
  type PostSummaryDoc,
} from "@/lib/firebase/posts";
import styles from "@/app/style/admin/messages.module.css";

const BackIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const MoreIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

type FilterMode = "all" | "named" | "unnamed" | "recent" | "mostVisits";

type RangeSortMode = "newest" | "oldest";

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatRelativeTime(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getLastActiveIso(conv: ConversationDoc): string {
  return conv.presence.lastActive || conv.updatedAt;
}

function getLastActiveTimestamp(conv: ConversationDoc): number {
  const iso = getLastActiveIso(conv);
  return iso ? new Date(iso).getTime() : 0;
}

function formatPageLabel(page: string): string {
  if (!page) return "Unknown";
  if (page === "home") return "Home";
  if (page === "blog") return "Blog";
  if (page === "certificates") return "Certificates";

  const normalized = page.replace(/^\/+/, "");
  const localeBlogMatch = normalized.match(/^[a-z]{2}\/blog\/(.+)$/);
  if (localeBlogMatch?.[1]) return localeBlogMatch[1];
  if (normalized.startsWith("blog/")) return normalized.slice(5);
  if (normalized.includes("/")) return `/${normalized}`;

  return normalized;
}

function isOnline(conv: ConversationDoc): boolean {
  if (!conv.presence.online) return false;
  if (!conv.presence.lastActive) return false;
  return Date.now() - new Date(conv.presence.lastActive).getTime() < 60_000;
}

export default function AdminMessagesPage() {
  const { dictionary: dict } = useDictionary();
  const t = dict.admin.messages;
  const [conversations, setConversations] = useState<ConversationDoc[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [noteValue, setNoteValue] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [listEditId, setListEditId] = useState<string | null>(null);
  const [listEditValue, setListEditValue] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("named");
  const [filterOpen, setFilterOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [rangeFromDate, setRangeFromDate] = useState("");
  const [rangeToDate, setRangeToDate] = useState("");
  const [rangeSortMode, setRangeSortMode] = useState<RangeSortMode>("newest");
  const [postSummaryById, setPostSummaryById] = useState<
    Record<string, PostSummaryDoc>
  >({});
  const [postSummaryLoaded, setPostSummaryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listEditRef = useRef<HTMLInputElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const activeConv = conversations.find((c) => c.id === activeId);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      document.documentElement.style.setProperty("--vv-height", `${vv.height}px`);
      if (chatAreaRef.current) {
        chatAreaRef.current.style.height = `${vv.height}px`;
        chatAreaRef.current.style.top = `${vv.offsetTop}px`;
      }
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.documentElement.style.removeProperty("--vv-height");
    };
  }, [activeId]);

  useEffect(() => {
    const unsub = subscribeConversations((convs) => {
      setConversations(convs);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    const unsub = subscribeMessages(activeId, setMessages);
    markAsRead(activeId).catch(() => {});
    return unsub;
  }, [activeId]);

  useEffect(() => {
    setNoteValue(activeConv?.note ?? "");
  }, [activeConv?.id, activeConv?.note]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (activeId) inputRef.current?.focus();
  }, [activeId]);

  useEffect(() => {
    if (listEditId) listEditRef.current?.focus();
  }, [listEditId]);

  useEffect(() => {
    if (!menuOpenId) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(`.${styles.itemMenu}`)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpenId]);

  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(`.${styles.filterWrapper}`)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [filterOpen]);

  const handleSend = useCallback(async () => {
    const text = reply.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    setReply("");
    try {
      await sendMessage(activeId, text, "admin");
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  }, [reply, activeId, sending]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    },
    [handleSend],
  );

  const handleChatAreaMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target === inputRef.current) return;
    if (target.closest("input, textarea, [contenteditable]")) return;
    e.preventDefault();
  }, []);

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      await deleteConversation(id);
      if (activeId === id) {
        setActiveId(null);
        setShowInfo(false);
      }
      setConfirmDelete(false);
      setMenuOpenId(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }, [activeId]);

  const handleSaveUserName = useCallback(async () => {
    if (!activeId || !editNameValue.trim()) return;
    try {
      await updateConversationUserName(activeId, editNameValue.trim());
      setEditingName(false);
    } catch (err) {
      console.error("Update userName failed:", err);
    }
  }, [activeId, editNameValue]);

  const handleListEditSave = useCallback(async (id: string) => {
    const trimmed = listEditValue.trim();
    if (!trimmed) { setListEditId(null); return; }
    try {
      await updateConversationUserName(id, trimmed);
    } catch (err) {
      console.error("Rename failed:", err);
    }
    setListEditId(null);
  }, [listEditValue]);

  const handleSaveNote = useCallback(async () => {
    if (!activeId || noteSaving) return;
    const nextNote = noteValue.trim();
    if (nextNote === (activeConv?.note ?? "")) return;

    setNoteSaving(true);
    try {
      await updateConversationNote(activeId, nextNote);
    } catch (err) {
      console.error("Update note failed:", err);
    } finally {
      setNoteSaving(false);
    }
  }, [activeId, noteSaving, noteValue, activeConv?.note]);

  useEffect(() => {
    if (!showInfo || !activeConv) return;
    const hasViewedPosts =
      activeConv.viewedPostIds.length > 0 || activeConv.viewedPostSlugs.length > 0;
    if (!hasViewedPosts || postSummaryLoaded) return;

    let cancelled = false;
    fetchPostSummaries({ includeNonPublic: true })
      .then((summaries) => {
        if (cancelled) return;
        const map: Record<string, PostSummaryDoc> = {};
        for (const summary of summaries) {
          map[summary.id] = summary;
        }
        setPostSummaryById(map);
        setPostSummaryLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setPostSummaryLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [showInfo, activeConv, postSummaryLoaded]);

  const viewedPosts = useMemo(() => {
    if (!activeConv) return [] as Array<{ id: string; title: string }>;

    const dedupe = new Set<string>();
    const slugLookup: Record<string, PostSummaryDoc> = {};
    for (const summary of Object.values(postSummaryById)) {
      slugLookup[summary.slug] = summary;
    }

    const items: Array<{ id: string; title: string }> = [];

    for (const postId of activeConv.viewedPostIds) {
      if (dedupe.has(postId)) continue;
      dedupe.add(postId);
      const summary = postSummaryById[postId];
      if (summary) {
        items.push({ id: postId, title: summary.title });
      } else {
        items.push({ id: postId, title: postId });
      }
    }

    for (const slug of activeConv.viewedPostSlugs) {
      const summary = slugLookup[slug];
      if (!summary || dedupe.has(summary.id)) continue;
      dedupe.add(summary.id);
      items.push({ id: summary.id, title: summary.title });
    }

    return items;
  }, [activeConv, postSummaryById]);

  const displayName = (conv: ConversationDoc) =>
    conv.userName || `${conv.metadata.browser} / ${conv.metadata.os}` || conv.id.slice(0, 8);

  const namedCount = conversations.filter((c) => c.userName).length;
  const unnamedCount = conversations.length - namedCount;

  const filtered = (() => {
    let list = [...conversations];
    switch (filterMode) {
      case "named":
        list = list.filter((c) => c.userName);
        break;
      case "unnamed":
        list = list.filter((c) => !c.userName);
        break;
      case "recent":
        list.sort((a, b) => {
          const ta = getLastActiveTimestamp(a);
          const tb = getLastActiveTimestamp(b);
          return tb - ta;
        });
        break;
      case "mostVisits":
        list.sort((a, b) => b.visitCount - a.visitCount);
        break;
    }

    const fromTsRaw = rangeFromDate ? new Date(`${rangeFromDate}T00:00:00`).getTime() : null;
    const toTsRaw = rangeToDate ? new Date(`${rangeToDate}T23:59:59.999`).getTime() : null;
    const hasFrom = typeof fromTsRaw === "number" && !Number.isNaN(fromTsRaw);
    const hasTo = typeof toTsRaw === "number" && !Number.isNaN(toTsRaw);

    if (hasFrom || hasTo) {
      let fromTs = hasFrom ? fromTsRaw! : null;
      let toTs = hasTo ? toTsRaw! : null;

      if (fromTs !== null && toTs !== null && fromTs > toTs) {
        const temp = fromTs;
        fromTs = toTs;
        toTs = temp;
      }

      list = list.filter((conv) => {
        const lastActiveTs = getLastActiveTimestamp(conv);
        if (!lastActiveTs) return false;
        if (fromTs !== null && lastActiveTs < fromTs) return false;
        if (toTs !== null && lastActiveTs > toTs) return false;
        return true;
      });

      list.sort((a, b) => {
        const delta = getLastActiveTimestamp(b) - getLastActiveTimestamp(a);
        return rangeSortMode === "newest" ? delta : -delta;
      });
    }

    return list;
  })();

  const filterLabel: Record<FilterMode, string> = {
    all: `All (${conversations.length})`,
    named: `Named (${namedCount})`,
    unnamed: `Unnamed (${unnamedCount})`,
    recent: "Recent activity",
    mostVisits: "Most visits",
  };

  const hiddenUnreadCount = (() => {
    switch (filterMode) {
      case "named":
        return conversations.filter((c) => c.status === "unread" && !c.userName).length;
      case "unnamed":
        return conversations.filter((c) => c.status === "unread" && !!c.userName).length;
      default:
        return 0;
    }
  })();

  if (loading) {
    return <div className={styles.messagesPage}><div className={styles.emptyChat}>Loading...</div></div>;
  }

  return (
    <div className={`${styles.messagesPage} ${activeId ? styles.chatOpen : ""}`}>
      <div className={styles.convList}>
        <div className={styles.convListHeader}>
          <span>{t.title}</span>
          <div className={styles.convListHeaderControls}>
            <button
              className={styles.rangeToggle}
              onClick={() => setRangeOpen((v) => !v)}
            >
              Sort fields
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points={rangeOpen ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
              </svg>
            </button>
            <div className={styles.filterWrapper}>
              <button
                className={styles.filterToggle}
                onClick={() => setFilterOpen((v) => !v)}
              >
                {filterLabel[filterMode]}
                {hiddenUnreadCount > 0 && (
                  <span className={styles.filterBadge}>{hiddenUnreadCount}</span>
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {filterOpen && (
                <div className={styles.filterDropdown}>
                  {(Object.keys(filterLabel) as FilterMode[]).map((key) => (
                    <button
                      key={key}
                      className={`${styles.filterOption} ${filterMode === key ? styles.filterOptionActive : ""}`}
                      onClick={() => { setFilterMode(key); setFilterOpen(false); }}
                    >
                      {filterLabel[key]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {rangeOpen && (
          <div className={styles.rangeToolbar}>
            <label className={styles.rangeField}>
              <span>From</span>
              <input
                type="date"
                value={rangeFromDate}
                onChange={(e) => setRangeFromDate(e.target.value)}
              />
            </label>
            <label className={styles.rangeField}>
              <span>To</span>
              <input
                type="date"
                value={rangeToDate}
                onChange={(e) => setRangeToDate(e.target.value)}
              />
            </label>
            <label className={styles.rangeFieldSelect}>
              <span>Sort</span>
              <select
                value={rangeSortMode}
                onChange={(e) => setRangeSortMode(e.target.value as RangeSortMode)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
            {(rangeFromDate || rangeToDate) && (
              <button
                className={styles.rangeClearBtn}
                onClick={() => {
                  setRangeFromDate("");
                  setRangeToDate("");
                }}
              >
                Clear range
              </button>
            )}
          </div>
        )}
        {filtered.length === 0 && (
          <div className={styles.emptyChat}>{t.noMessages}</div>
        )}
        {filtered.map((conv) => {
          const online = isOnline(conv);
          return (
            <div
              key={conv.id}
              className={activeId === conv.id ? styles.convItemActive : styles.convItem}
              onClick={() => { setActiveId(conv.id); setMenuOpenId(null); }}
            >
              <div className={styles.convAvatarWrap}>
                <div className={styles.convAvatar}>{displayName(conv)[0].toUpperCase()}</div>
                {online && <span className={styles.onlineDot} />}
              </div>
              <div className={styles.convInfo}>
                {listEditId === conv.id ? (
                  <input
                    ref={listEditRef}
                    className={styles.listEditInput}
                    value={listEditValue}
                    onChange={(e) => setListEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleListEditSave(conv.id);
                      if (e.key === "Escape") setListEditId(null);
                    }}
                    onBlur={() => handleListEditSave(conv.id)}
                    onClick={(e) => e.stopPropagation()}
                    maxLength={50}
                  />
                ) : (
                  <div
                    className={styles.convName}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setListEditId(conv.id);
                      setListEditValue(conv.userName || "");
                    }}
                    title="Double-click to rename"
                  >
                    {displayName(conv)}
                  </div>
                )}
                <div className={styles.convMeta}>
                  <span className={online ? styles.convOnlineText : styles.convLastMsg}>
                    {online
                      ? formatPageLabel(conv.presence.currentPage)
                      : getLastActiveIso(conv)
                        ? formatRelativeTime(getLastActiveIso(conv))
                        : conv.lastMessage || "No activity"}
                  </span>
                  <span className={styles.convStatsText}>
                    Visits {conv.visitCount} · Last page {formatPageLabel(conv.presence.currentPage)}
                  </span>
                  <span className={styles.convTimestampText}>
                    {formatDateTime(getLastActiveIso(conv))}
                  </span>
                </div>
              </div>
              {conv.status === "unread" && <div className={styles.convBadge} />}
              <div className={styles.itemMenu} onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.itemMenuBtn}
                  onClick={() => setMenuOpenId(menuOpenId === conv.id ? null : conv.id)}
                >
                  {MoreIcon}
                </button>
                {menuOpenId === conv.id && (
                  <div className={styles.itemMenuDropdown}>
                    <button
                      className={styles.itemMenuOption}
                      onClick={() => { setActiveId(conv.id); setShowInfo(true); setMenuOpenId(null); }}
                    >
                      View info
                    </button>
                    <button
                      className={`${styles.itemMenuOption} ${styles.itemMenuDanger}`}
                      onClick={() => handleDeleteConversation(conv.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.chatArea} ref={chatAreaRef} onMouseDown={handleChatAreaMouseDown}>
        {activeConv ? (
          <>
            <div className={styles.chatHeader}>
              <button className={styles.chatBackBtn} onClick={() => setActiveId(null)}>
                {BackIcon}
              </button>
              <div className={styles.chatHeaderAvatar}>
                {displayName(activeConv)[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                {editingName ? (
                  <div className={styles.editNameRow}>
                    <input
                      className={styles.editNameInput}
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveUserName();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                      maxLength={50}
                      autoFocus
                    />
                    <button className={styles.editNameSave} onClick={handleSaveUserName}>✓</button>
                    <button className={styles.editNameCancel} onClick={() => setEditingName(false)}>✕</button>
                  </div>
                ) : (
                  <span
                    className={styles.chatHeaderName}
                    onClick={() => {
                      setEditNameValue(activeConv.userName || "");
                      setEditingName(true);
                    }}
                    title="Click to edit name"
                    style={{ cursor: "pointer" }}
                  >
                    {displayName(activeConv)}
                    <svg className={styles.editIcon} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </span>
                )}
                <span className={styles.chatHeaderMeta}>
                  {activeConv.metadata.device} · {activeConv.metadata.browser} · {activeConv.metadata.os}
                </span>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete conversation"
                title="Delete conversation"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
              <button
                className={`${styles.infoBtn} ${showInfo ? styles.infoBtnActive : ""}`}
                onClick={() => setShowInfo((v) => !v)}
                aria-label="User info"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </button>
            </div>
            {showInfo && (
              <div className={styles.infoPanel}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Visitor ID</span>
                  <span className={styles.infoValue}>{activeConv.id}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Fingerprint</span>
                  <span className={styles.infoValue}>{activeConv.fingerprint || "—"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>OS</span>
                  <span className={styles.infoValue}>{activeConv.metadata.os || "—"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Browser</span>
                  <span className={styles.infoValue}>{activeConv.metadata.browser || "—"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Device</span>
                  <span className={styles.infoValue}>{activeConv.metadata.device || "—"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Last source</span>
                  <span className={styles.infoValue}>{activeConv.metadata.lastReferrer || "—"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Status</span>
                  <span className={styles.infoValue}>
                    {isOnline(activeConv)
                      ? `🟢 Online — ${activeConv.presence.currentPage || "—"}`
                      : `⚫ ${activeConv.presence.lastActive ? formatRelativeTime(activeConv.presence.lastActive) : "—"}`}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Visits</span>
                  <span className={styles.infoValue}>{activeConv.visitCount}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Messages</span>
                  <span className={styles.infoValue}>{messages.length}</span>
                </div>
                <div className={styles.infoRowNote}>
                  <span className={styles.infoLabel}>Note</span>
                  <div className={styles.noteEditorWrap}>
                    <textarea
                      className={styles.noteEditor}
                      value={noteValue}
                      onChange={(e) => setNoteValue(e.target.value)}
                      placeholder="Ghi chu cho user nay"
                      maxLength={500}
                    />
                    <div className={styles.noteEditorFooter}>
                      <span className={styles.noteHint}>{noteValue.length}/500</span>
                      <button
                        className={styles.noteSaveBtn}
                        onClick={handleSaveNote}
                        disabled={noteSaving || noteValue.trim() === (activeConv.note || "")}
                      >
                        {noteSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Viewed posts</span>
                  {viewedPosts.length > 0 ? (
                    <ul className={styles.infoList}>
                      {viewedPosts.map((post) => (
                        <li key={post.id} className={styles.infoListItem}>
                          <span>{post.title}</span>
                          <span className={styles.infoListMeta}>#{post.id}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className={styles.infoValue}>—</span>
                  )}
                </div>
              </div>
            )}
            {confirmDelete && (
              <div className={styles.confirmBar}>
                <span>Delete this conversation and all messages?</span>
                <button className={styles.confirmYes} onClick={() => handleDeleteConversation(activeId!)}>Delete</button>
                <button className={styles.confirmNo} onClick={() => setConfirmDelete(false)}>Cancel</button>
              </div>
            )}
            <div className={styles.chatMessages}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={msg.sender === "admin" ? styles.msgRowAdmin : styles.msgRowUser}
                >
                  <div className={msg.sender === "admin" ? styles.msgAdmin : styles.msgUser}>
                    {msg.text}
                  </div>
                  <div className={msg.sender === "admin" ? styles.msgAdminTime : styles.msgTime}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className={styles.chatInput}>
              <input
                ref={inputRef}
                className={styles.chatInputField}
                type="text"
                placeholder={t.typeReply}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className={styles.chatSendBtn}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSend}
                disabled={sending || !reply.trim()}
              >
                {sending ? "..." : t.send}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyChat}>{t.noMessages}</div>
        )}
      </div>
    </div>
  );
}
