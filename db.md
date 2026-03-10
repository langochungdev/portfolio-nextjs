📂 Firestore Tree Map - Hoang Huy CMS (Optimized)

Firestore Root

├── 📂 collections (collection)
│ └── {collectionId} (doc)
│ ├── name: string
│ └── order: number
│
├── 🏷️ topics (collection)
│ └── {topicId} (doc)
│ ├── name: string
│ ├── collectionId: string (optional)
│ └── order: number
│
├── 📄 posts (collection)
│ └── {postId} (doc)
│ ├── title: string
│ ├── slug: string
│ ├── thumbnail: string
│ ├── content: string (Tiptap HTML)
│ ├── collectionId: string
│ ├── topicId: string
│ ├── isPinned: boolean
│ ├── views: number
│ └── timestamps (map)
│ ├── createdAt: timestamp
│ └── updatedAt: timestamp
│
├── 💬 conversations (collection)
│ └── {visitorId} (doc) ← ID từ Fingerprint/LocalStorage
│ ├── userName: string  
│ ├── lastMessage: string
│ ├── status: "unread" | "replied"
│ ├── updatedAt: timestamp
│ ├── fingerprint: string  
│ ├── metadata (map)  
│ ├── os: string
│ ├── browser: string
│ ├── device: string
│ └── lastIp: string
│ └── messages (subcollection)
│ └── {messageId} (doc)
│ ├── text: string
│ ├── sender: "user" | "admin"
│ └── createdAt: timestamp
│
└── 📊 analytics (collection) ← Sửa lại phân cấp đúng chuẩn Firestore
├── global (doc) ← Document chứa tổng view (Field-based)
│ ├── home: number
│ ├── blog: number
│ └── certification: number
└── daily_stats (doc) ← Anchor document để chứa subcollection
└── days (subcollection) ← Subcollection chứa dữ liệu theo ngày
└── {YYYYMMDD} (doc)
├── date: string
├── home: number
├── blog: number
└── certification: number
