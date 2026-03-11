"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import {
  subscribeConversations,
  subscribeMessages,
  sendMessage,
  markAsRead,
  deleteConversation,
  updateConversationUserName,
  type ConversationDoc,
  type MessageDoc,
} from "@/lib/firebase/conversations";
import styles from "@/app/style/admin/messages.module.css";

const BackIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (activeId) inputRef.current?.focus();
  }, [activeId]);

  const handleSend = useCallback(async () => {
    const text = reply.trim();
    if (!text || !activeId || sending) return;
    setSending(true);
    try {
      await sendMessage(activeId, text, "admin");
      setReply("");
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

  const handleDeleteConversation = useCallback(async () => {
    if (!activeId) return;
    try {
      await deleteConversation(activeId);
      setActiveId(null);
      setConfirmDelete(false);
      setShowInfo(false);
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

  const activeConv = conversations.find((c) => c.id === activeId);

  const displayName = (conv: ConversationDoc) =>
    conv.userName || `${conv.metadata.browser} / ${conv.metadata.os}` || conv.id.slice(0, 8);

  if (loading) {
    return <div className={styles.messagesPage}><div className={styles.emptyChat}>Loading...</div></div>;
  }

  return (
    <div className={`${styles.messagesPage} ${activeId ? styles.chatOpen : ""}`}>
      <div className={styles.convList}>
        <div className={styles.convListHeader}>{t.title}</div>
        {conversations.length === 0 && (
          <div className={styles.emptyChat}>{t.noMessages}</div>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={activeId === conv.id ? styles.convItemActive : styles.convItem}
            onClick={() => setActiveId(conv.id)}
          >
            <div className={styles.convAvatar}>{displayName(conv)[0].toUpperCase()}</div>
            <div className={styles.convInfo}>
              <div className={styles.convName}>{displayName(conv)}</div>
              <div className={styles.convLastMsg}>{conv.lastMessage}</div>
            </div>
            {conv.status === "unread" && <div className={styles.convBadge} />}
          </div>
        ))}
      </div>

      <div className={styles.chatArea}>
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
                  <span className={styles.infoLabel}>Status</span>
                  <span className={styles.infoValue}>{activeConv.status}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Last active</span>
                  <span className={styles.infoValue}>
                    {activeConv.updatedAt ? new Date(activeConv.updatedAt).toLocaleString() : "—"}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Messages</span>
                  <span className={styles.infoValue}>{messages.length}</span>
                </div>
              </div>
            )}
            {confirmDelete && (
              <div className={styles.confirmBar}>
                <span>Delete this conversation and all messages?</span>
                <button className={styles.confirmYes} onClick={handleDeleteConversation}>Delete</button>
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
                disabled={sending}
              />
              <button
                className={styles.chatSendBtn}
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
