Firestore Root
│
├── collections (collection)
│   └── {collectionId} (doc)
│       ├── name: string
│       └── order: number
│
├── topics (collection)
│   └── {topicId} (doc)
│       ├── name: string
│       ├── slug: string
│       ├── thumbnail: string (URL, optional)
│       ├── description: string (OG/SEO description, optional)
│       ├── collectionId: string
│       ├── order: number
│       └── visibility: "public" | "hidden" | "draft"
│
├── posts (collection)
│   └── {postId} (doc)
│       ├── title: string
│       ├── slug: string
│       ├── summary: string (OG description thủ công)
│       ├── thumbnail: string
│       ├── content: string (Tiptap HTML - full content)
│       ├── excerpt: string (plain text excerpt, precomputed)
│       ├── readTime: number (minutes, precomputed)
│       ├── collectionIds: string[]
│       ├── topicIds: string[]
│       ├── isPinned: boolean
│       ├── orderMap: map { [contextId: string]: number }
│       ├── views: number
│       ├── visibility: "public" | "hidden" | "draft"
│       └── timestamps (map)
│           ├── createdAt: timestamp
│           └── updatedAt: timestamp
│
├── post_summaries (collection)  [Nguồn dữ liệu list/blog shell, tránh tải content nặng]
│   └── {postId} (doc)
│       ├── postId: string
│       ├── title: string
│       ├── slug: string
│       ├── summary: string
│       ├── thumbnail: string
│       ├── excerpt: string
│       ├── readTime: number
│       ├── collectionIds: string[]
│       ├── topicIds: string[]
│       ├── isPinned: boolean
│       ├── orderMap: map { [contextId: string]: number }
│       ├── views: number
│       ├── visibility: "public" | "hidden" | "draft"
│       └── timestamps (map)
│           ├── createdAt: timestamp
│           └── updatedAt: timestamp
│
├── hints (collection)
│   └── {hintId} (doc)
│       ├── title: string
│       ├── content: string (Tiptap HTML)
│       ├── type: "tip" | "hint" | "note"
│       ├── topicId: string (optional)
│       ├── postId: string (optional)
│       ├── order: number
│       ├── visibility: "public" | "hidden" | "draft"
│       └── timestamps (map)
│           ├── createdAt: timestamp
│           └── updatedAt: timestamp
│
├── conversations (collection)
│   └── {visitorId} (doc)
│       ├── userName: string
│       ├── lastMessage: string
│       ├── status: "unread" | "replied"
│       ├── updatedAt: timestamp
│       ├── fingerprint: string
│       ├── visitCount: number
│       ├── presence (map)
│       │   ├── online: boolean
│       │   ├── lastActive: timestamp
│       │   └── currentPage: string
│       ├── metadata (map)
│       │   ├── os: string
│       │   ├── browser: string
│       │   ├── device: string
│       │   ├── lastIp: string
│       │   └── lastReferrer: string
│       └── messages (subcollection)
│           └── {messageId} (doc)
│               ├── text: string
│               ├── sender: "user" | "admin"
│               └── createdAt: timestamp
│
└── analytics (collection)
    ├── global (doc)
    │   ├── home: number
    │   ├── blog: number
    │   └── certification: number
    └── daily_stats (doc)
        └── days (subcollection)
            └── {YYYYMMDD} (doc)
                ├── date: string
                ├── home: number
                ├── blog: number
                └── certification: number