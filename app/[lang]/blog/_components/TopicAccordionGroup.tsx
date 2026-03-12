"use client";

import { useState, useEffect } from "react";
import type { PostDoc, TopicDoc } from "@/app/[lang]/blog/_lib/types";
import type { Locale } from "@/lib/i18n/config";
import { TopicAccordion } from "./TopicAccordion";

interface Props {
  topics: TopicDoc[];
  posts: PostDoc[];
  locale: Locale;
  label: string;
  initialOpenId?: string;
}

export function TopicAccordionGroup({ topics, posts, locale, label, initialOpenId }: Props) {
  const [openTopics, setOpenTopics] = useState<Set<string>>(
    () => new Set(initialOpenId ? [initialOpenId] : []),
  );

  useEffect(() => {
    if (!initialOpenId) return;
    requestAnimationFrame(() => {
      document.getElementById(initialOpenId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [initialOpenId]);

  const toggleTopic = (id: string) =>
    setOpenTopics((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <>
      {topics.map((t) => (
        <TopicAccordion
          key={t.id}
          topic={t}
          posts={posts}
          isOpen={openTopics.has(t.id)}
          locale={locale}
          label={label}
          onToggle={() => toggleTopic(t.id)}
        />
      ))}
    </>
  );
}
