"use client";

import { useState } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "@/app/style/admin/messages.module.css";

interface MockConversation {
  id: string;
  userName: string;
  lastMessage: string;
  status: "unread" | "replied";
  messages: { text: string; sender: "user" | "admin"; time: string }[];
}

const mockConversations: MockConversation[] = [
  {
    id: "visitor1",
    userName: "Minh Anh",
    lastMessage: "How can I contact you for freelance work?",
    status: "unread",
    messages: [
      { text: "Hi! I love your portfolio", sender: "user", time: "10:30" },
      { text: "How can I contact you for freelance work?", sender: "user", time: "10:31" },
    ],
  },
  {
    id: "visitor2",
    userName: "John D.",
    lastMessage: "Thanks for the quick reply!",
    status: "replied",
    messages: [
      { text: "Great blog posts! Keep it up", sender: "user", time: "09:15" },
      { text: "Thank you! I appreciate it", sender: "admin", time: "09:20" },
      { text: "Thanks for the quick reply!", sender: "user", time: "09:22" },
    ],
  },
  {
    id: "visitor3",
    userName: "Hoa Nguyen",
    lastMessage: "Can you share the source code?",
    status: "unread",
    messages: [
      { text: "Can you share the source code?", sender: "user", time: "08:45" },
    ],
  },
];

export default function AdminMessagesPage() {
  const { dictionary: dict } = useDictionary();
  const t = dict.admin.messages;
  const [activeId, setActiveId] = useState<string | null>(mockConversations[0]?.id ?? null);

  const activeConv = mockConversations.find((c) => c.id === activeId);

  return (
    <div className={styles.messagesPage}>
      <div className={styles.convList}>
        {mockConversations.map((conv) => (
          <div
            key={conv.id}
            className={activeId === conv.id ? styles.convItemActive : styles.convItem}
            onClick={() => setActiveId(conv.id)}
          >
            <div className={styles.convAvatar}>{conv.userName[0]}</div>
            <div className={styles.convInfo}>
              <div className={styles.convName}>{conv.userName}</div>
              <div className={styles.convLastMsg}>{conv.lastMessage}</div>
            </div>
            {conv.status === "unread" && <div className={styles.convBadge} />}
          </div>
        ))}
      </div>

      <div className={styles.chatArea}>
        {activeConv ? (
          <>
            <div className={styles.chatMessages}>
              {activeConv.messages.map((msg, i) => (
                <div key={i}>
                  <div className={msg.sender === "user" ? styles.msgUser : styles.msgAdmin}>
                    {msg.text}
                  </div>
                  <div className={msg.sender === "admin" ? styles.msgAdminTime : styles.msgTime}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.chatInput}>
              <input
                className={styles.chatInputField}
                type="text"
                placeholder={t.typeReply}
              />
              <button className={styles.chatSendBtn}>{t.send}</button>
            </div>
          </>
        ) : (
          <div className={styles.emptyChat}>{t.noMessages}</div>
        )}
      </div>
    </div>
  );
}
