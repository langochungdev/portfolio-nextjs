"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getOrCreateVisitorId,
  type VisitorIdentity,
} from "@/lib/visitor/identity";
import {
  subscribeMessages,
  sendMessage,
  updateConversationUserName,
  fetchConversationUserName,
  type MessageDoc,
} from "@/lib/firebase/conversations";
import { saveFcmToken } from "@/lib/firebase/notifications";
import { requestFcmToken, onForegroundMessage } from "@/lib/firebase/messaging";
import styles from "@/app/style/shared/ChatWidget.module.css";

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const ChatIcon = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [identity, setIdentity] = useState<VisitorIdentity | null>(null);
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [userName, setUserName] = useState("");
  const [nameSaved, setNameSaved] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const msgInputRef = useRef<HTMLInputElement>(null);
  const lastCountRef = useRef(0);
  const fcmRequestedRef = useRef(false);
  const userNameRef = useRef(userName);
  userNameRef.current = userName;

  useEffect(() => {
    getOrCreateVisitorId()
      .then(setIdentity)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!identity) return;
    fetchConversationUserName(identity.visitorId)
      .then((name) => {
        if (name) {
          setUserName(name);
          setNameSaved(true);
        }
      })
      .catch(() => {});
  }, [identity]);

  useEffect(() => {
    if (!identity) return;
    const unsub = onForegroundMessage((payload) => {
      if (!open) setHasUnread(true);
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(payload.title, { body: payload.body });
      }
    });
    if (!unsub) return;
    return unsub;
  }, [identity, open]);

  useEffect(() => {
    if (!identity) return;
    const unsub = subscribeMessages(identity.visitorId, (msgs) => {
      setMessages(msgs);
      if (!open && msgs.length > lastCountRef.current) {
        const last = msgs[msgs.length - 1];
        if (last?.sender === "admin") setHasUnread(true);
      }
      lastCountRef.current = msgs.length;
    });
    return unsub;
  }, [identity, open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (open) {
      if (nameSaved) msgInputRef.current?.focus();
      else nameInputRef.current?.focus();
      setHasUnread(false);
    }
  }, [open, nameSaved]);

  const saveUserName = useCallback(async () => {
    const trimmed = userNameRef.current.trim();
    if (!identity || !trimmed) return;
    try {
      await updateConversationUserName(identity.visitorId, trimmed);
      setNameSaved(true);
    } catch {
      /* save failed */
    }
  }, [identity]);

  const handleNameKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" || !identity) return;
      e.preventDefault();
      await saveUserName();
      msgInputRef.current?.focus();
    },
    [identity, saveUserName],
  );

  const handleNameBlur = useCallback(async () => {
    await saveUserName();
  }, [saveUserName]);

  const handleSend = useCallback(async () => {
    const msg = text.trim();
    if (!msg || !identity || sending) return;
    if (userNameRef.current.trim() && !nameSaved) {
      await saveUserName();
    }
    setSending(true);
    try {
      await sendMessage(identity.visitorId, msg, "user");
      setText("");
      if (!fcmRequestedRef.current) {
        fcmRequestedRef.current = true;
        try {
          const token = await requestFcmToken();
          if (token) await saveFcmToken(identity.visitorId, token);
        } catch {
          /* user denied or FCM unavailable */
        }
      }
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  }, [text, identity, sending, nameSaved, saveUserName]);

  const handleMsgKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    },
    [handleSend],
  );

  return (
    <>
      <button
        className={styles.chatToggle}
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat"
      >
        {ChatIcon}
        {hasUnread && <span className={styles.unreadDot} />}
      </button>

      {open && (
        <div className={styles.chatBox}>
          <div className={styles.chatHeader}>
            <span className={styles.chatTitle}>Chat</span>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <div className={styles.emptyChat}>Say hi!</div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.sender === "user" ? styles.msgRowUser : styles.msgRowAdmin}
              >
                <div className={msg.sender === "user" ? styles.msgUser : styles.msgAdmin}>
                  {msg.text}
                </div>
                <span className={styles.msgTime}>{formatTime(msg.createdAt)}</span>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className={styles.chatInputArea}>
            <div className={styles.nameRow}>
              <input
                ref={nameInputRef}
                className={styles.nameField}
                type="text"
                placeholder="Your name..."
                value={userName}
                onChange={(e) => { setUserName(e.target.value); setNameSaved(false); }}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameBlur}
                disabled={!identity}
              />
              {nameSaved && <span className={styles.nameSaved}>&#10003;</span>}
            </div>
            <div className={styles.chatInput}>
              <input
                ref={msgInputRef}
                className={styles.chatInputField}
                type="text"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleMsgKeyDown}
                disabled={sending || !identity}
              />
              <button
                className={styles.chatSendBtn}
                onClick={handleSend}
                disabled={sending || !text.trim() || !identity}
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
