# Blog System Architecture

## Data Models

### BlogPost

| Field    | Type       | Description                                       |
| -------- | ---------- | ------------------------------------------------- |
| id       | number     | Unique identifier                                 |
| slug     | string     | URL-friendly identifier                           |
| title    | { vi, en } | Localized title                                   |
| excerpt  | { vi, en } | Localized excerpt                                 |
| content  | { vi, en } | Localized full content                            |
| category | string     | Category key (tech, design, code, life, tutorial) |
| topic?   | string     | Optional topic ID — groups posts into a topic     |
| date     | string     | Publication date (YYYY-MM-DD)                     |
| readTime | number     | Estimated read time in minutes                    |
| author   | string     | Author name                                       |
| color    | string     | Accent color hex                                  |

### BlogTopic

| Field       | Type       | Description                                         |
| ----------- | ---------- | --------------------------------------------------- |
| id          | string     | Unique topic identifier                             |
| category    | string     | Parent category key                                 |
| title       | { vi, en } | Localized topic title                               |
| description | { vi, en } | Localized topic description                         |
| pinned?     | boolean    | If true, posts display as flat cards (no accordion) |

### Classification System

```
Category (collector)
├── Standalone posts (no topic)
├── Topic A (pinned)
│   ├── Post 1 → displayed as regular cards
│   └── Post 2
└── Topic B (not pinned)
    ├── Post 3 → displayed inside accordion
    └── Post 4
```

- **Categories** = top-level collectors (tech, design, code, life, tutorial)
- **Topics** = optional grouping within a category
- **Pinned topics** = posts shown as flat cards alongside standalone posts
- **Non-pinned topics** = posts inside collapsible accordions

## Page Architecture

### Blog Listing (`app/[lang]/blog/page.tsx`)

**All View** (default):

- 5-card grid layout: 4 content cards + 1 "view more" card
- Content cards = latest posts OR topic wrap cards (grouped)
- Topic wrap card shows topic title, description, post count, pinned badge
- "View more" card navigates to category page

**Single Collector View** (category selected):

- First section: pinned topic posts + standalone posts as flat card grid
- Second section: non-pinned topics as collapsible accordions

### Blog Detail (`app/[lang]/blog/[slug]/page.tsx`)

**Layout**: CSS Grid `220px 1fr` — sidebar + main content

**Sidebar**:

- Back link to blog listing
- If post belongs to a topic: shows topic name + numbered vertical nav of all topic posts with active indicator
- If post has no topic: shows category posts as links
- Independent scroll (separate `overflow-y: auto`)

**Main Content**:

- Article header (tag, color dot, date, read time)
- Title, author, full content
- Independent scroll (separate `overflow-y: auto`)

**Mobile** (≤768px): sidebar stacks above content, no fixed height

## Component Map

```
app/[lang]/blog/
├── page.tsx                    → Blog listing (All + Single views)
├── [slug]/page.tsx             → Blog detail with sidebar
├── _components/
│   ├── BlogNav.tsx             → Sidebar nav + mobile pill strip
│   ├── PostCard.tsx            → Reusable post card
│   └── TopicAccordion.tsx      → Collapsible topic section
└── _lib/
    └── helpers.ts              → groupByCategory, buildDisplayItems, latestDate
```

## Styling

| File                               | Scope                        |
| ---------------------------------- | ---------------------------- |
| `app/style/blog/page.module.css`   | Blog listing styles          |
| `app/style/blog/detail.module.css` | Blog detail + sidebar styles |

Both support dark mode via `:global([data-theme="dark"])` and responsive via `@media (max-width: 768px)`. Hover styles use `@media (hover: hover)`.

## Database Design Guide

When migrating from mock data to a real database:

```sql
CREATE TABLE blog_posts (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(255) UNIQUE NOT NULL,
  title_vi    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  excerpt_vi  TEXT,
  excerpt_en  TEXT,
  content_vi  TEXT NOT NULL,
  content_en  TEXT NOT NULL,
  category    VARCHAR(50) NOT NULL,
  topic_id    VARCHAR(100) REFERENCES blog_topics(id),
  date        DATE NOT NULL,
  read_time   INT,
  author      VARCHAR(100),
  color       VARCHAR(7)
);

CREATE TABLE blog_topics (
  id          VARCHAR(100) PRIMARY KEY,
  category    VARCHAR(50) NOT NULL,
  title_vi    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  desc_vi     TEXT,
  desc_en     TEXT,
  pinned      BOOLEAN DEFAULT FALSE
);
```
