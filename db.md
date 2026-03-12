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
│       ├── thumbnail: string (URL ảnh — dùng làm og:image mặc định)
│       ├── description: string (mô tả — dùng làm og:description mặc định)
│       ├── collectionId: string (optional)
│       └── order: number
│
├── posts (collection)
│   └── {postId} (doc)
│       ├── title: string
│       ├── slug: string
│       ├── thumbnail: string
│       ├── content: string (Tiptap HTML)
│       ├── collectionIds: string[] (array of collection IDs)
│       ├── topicIds: string[] (array of topic IDs)
│       ├── isPinned: boolean
│       ├── orderMap: map { [contextId: string]: number }
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
│       ├── collectionId: string (bắt buộc thuộc collection hoặc topic)
│       ├── topicId: string (optional)
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