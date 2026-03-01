```
firestore
├── users/
│   └── {userId}
│       ├── displayName: string
│       ├── email: string
│       ├── avatar: string
│       ├── role: string
│       ├── bio: { vi: string, en: string }
│       ├── location: { vi: string, en: string }
│       ├── skills: string[]
│       ├── social: { github: string, linkedin: string, twitter: string }
│       └── createdAt: timestamp
│
├── projects/
│   └── {projectId}
│       ├── title: string
│       ├── description: { vi: string, en: string }
│       ├── tech: string[]
│       ├── image: string
│       ├── color: string
│       ├── link: string
│       ├── sourceUrl: string
│       ├── order: number
│       ├── visible: boolean
│       └── createdAt: timestamp
│
├── posts/
│   └── {postId}
│       ├── title: { vi: string, en: string }
│       ├── content: { vi: string, en: string }
│       ├── excerpt: { vi: string, en: string }
│       ├── category: string
│       ├── tags: string[]
│       ├── image: string
│       ├── color: string
│       ├── authorId: string
│       ├── status: "published" | "draft"
│       ├── publishedAt: timestamp
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── categories/
│   └── {categoryId}
│       ├── name: { vi: string, en: string }
│       ├── slug: string
│       ├── order: number
│       └── createdAt: timestamp
│
├── certificates/
│   └── {certificateId}
│       ├── title: { vi: string, en: string }
│       ├── issuer: string
│       ├── date: string
│       ├── type: "certificate" | "award"
│       ├── image: string
│       ├── emoji: string
│       ├── color: string
│       ├── description: { vi: string, en: string }
│       ├── order: number
│       ├── visible: boolean
│       └── createdAt: timestamp
│
├── siteSettings/
│   └── general
│       ├── siteTitle: string
│       ├── siteDescription: { vi: string, en: string }
│       ├── defaultLocale: string
│       ├── theme: string
│       └── updatedAt: timestamp
│
├── analytics/
│   ├── summary
│   │   ├── totalVisits: number
│   │   ├── todayVisits: number
│   │   ├── weeklyVisits: number
│   │   ├── monthlyVisits: number
│   │   └── lastUpdated: timestamp
│   │
│   └── daily/
│       └── {YYYY-MM-DD}
│           ├── visits: number
│           ├── uniqueVisitors: number
│           └── pages: { [path: string]: number }
│
└── pageContent/
    └── {pageKey}
        ├── content: { vi: string, en: string }
        ├── metadata: { vi: object, en: object }
        └── updatedAt: timestamp
```
