"use client";

import { useState, useEffect, useCallback } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import {
  fetchFcmSubscribers,
  type FcmSubscriber,
} from "@/lib/firebase/notifications";
import styles from "@/app/style/admin/notifications.module.css";

interface SendResult {
  type: "success" | "error";
  message: string;
}

export default function AdminNotificationsPage() {
  const { dictionary: dict } = useDictionary();
  const t = dict.admin.notifications;

  const [subscribers, setSubscribers] = useState<FcmSubscriber[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFcmSubscribers()
      .then((subs) => {
        setSubscribers(subs);
        setSelected(new Set(subs.map((s) => s.fcmToken)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleToken = useCallback((token: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(token)) next.delete(token);
      else next.add(token);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selected.size === subscribers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(subscribers.map((s) => s.fcmToken)));
    }
  }, [selected.size, subscribers]);

  const handleSend = useCallback(async () => {
    if (!title.trim() || !body.trim() || selected.size === 0 || sending) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          tokens: Array.from(selected),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({
        type: "success",
        message: `${t.sent}: ${data.success} ${t.successCount}, ${data.failure} ${t.failCount}`,
      });
      setTitle("");
      setBody("");
    } catch (err) {
      setResult({
        type: "error",
        message: err instanceof Error ? err.message : t.sendError,
      });
    } finally {
      setSending(false);
    }
  }, [title, body, selected, sending, t]);

  if (loading) {
    return (
      <div className={styles.notificationsPage}>
        <div className={styles.noSubscribers}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.notificationsPage}>
      <h1 className={styles.pageTitle}>{t.title}</h1>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>{t.titleLabel}</label>
          <input
            className={styles.input}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            disabled={sending}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t.bodyLabel}</label>
          <textarea
            className={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.bodyPlaceholder}
            disabled={sending}
          />
        </div>

        <div className={styles.subscriberSection}>
          <div className={styles.subscriberTitle}>
            {t.recipients} ({subscribers.length})
          </div>

          {subscribers.length === 0 ? (
            <div className={styles.noSubscribers}>{t.noSubscribers}</div>
          ) : (
            <>
              <button className={styles.selectAll} onClick={toggleAll} type="button">
                {selected.size === subscribers.length ? t.deselectAll : t.selectAll}
              </button>
              <div className={styles.subscriberList}>
                {subscribers.map((sub) => (
                  <div
                    key={sub.fcmToken}
                    className={
                      selected.has(sub.fcmToken)
                        ? styles.subscriberItemSelected
                        : styles.subscriberItem
                    }
                    onClick={() => toggleToken(sub.fcmToken)}
                  >
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selected.has(sub.fcmToken)}
                      onChange={() => toggleToken(sub.fcmToken)}
                    />
                    <span className={styles.subscriberName}>{sub.userName}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={sending || !title.trim() || !body.trim() || selected.size === 0}
          >
            {sending ? "..." : t.send}
          </button>
        </div>

        {result && (
          <div
            className={
              result.type === "success" ? styles.resultSuccess : styles.resultError
            }
          >
            {result.message}
          </div>
        )}
      </div>
    </div>
  );
}
