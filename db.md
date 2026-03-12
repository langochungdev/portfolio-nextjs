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
│       ├── collectionId: string (optional)
│       └── order: number
│
├── posts (collection)
│   └── {postId} (doc)
│       ├── title: string
│       ├── slug: string
│       ├── thumbnail: string
│       ├── content: string (Tiptap HTML)
│       ├── collectionId: string
│       ├── topicId: string
│       ├── isPinned: boolean
│       ├── views: number
│       └── timestamps (map)
│           ├── createdAt: timestamp
│           └── updatedAt: timestamp
│
├── hints (collection) — [Dành cho Tips/Short-form Content]
│   └── {hintId} (doc)
│       ├── title: string (Tiêu đề ngắn)
│       ├── content: string (Tiptap HTML - Rich text)
│       ├── type: "tip" | "hint" | "note"
│       ├── topicId: string (optional - để trống nếu là tip chung)
│       ├── relatedPostId: string (optional - link tới bài viết dài)
│       ├── order: number
│       └── timestamps (map)
│           ├── createdAt: timestamp
│           └── updatedAt: timestamp
│
├── conversations (collection)
│   └── {visitorId} (doc) — [ID từ Fingerprint/LocalStorage]
│       ├── userName: string
│       ├── lastMessage: string
│       ├── status: "unread" | "replied"
│       ├── updatedAt: timestamp
│       ├── fingerprint: string
│       ├── visitCount: number — [Tăng +1 mỗi lần truy cập trang]
│       ├── presence (map) — [Heartbeat mỗi 30s]
│       │   ├── online: boolean
│       │   ├── lastActive: timestamp
│       │   └── currentPage: string — ["home" | "blog" | "certificates" | slug bài viết]
│       ├── metadata (map)
│       │   ├── os: string
│       │   ├── browser: string
│       │   ├── device: string
│       │   └── lastIp: string
│       └── messages (subcollection)
│           └── {messageId} (doc)
│               ├── text: string
│               ├── sender: "user" | "admin"
│               └── createdAt: timestamp
│
└── analytics (collection)
    ├── global (doc) — [Thống kê tổng]
    │   ├── home: number
    │   ├── blog: number
    │   └── certification: number
    └── daily_stats (doc) — [Anchor cho subcollection]
        └── days (subcollection)
            └── {YYYYMMDD} (doc)
                ├── date: string
                ├── home: number
                ├── blog: number
                └── certification: number