# Chat & Admin User Management — Test Plan

## 1. EyesCat Chat (User Side)

### 1.1 Open / Close
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 1 | Open chat | Click cat mascot | Chat panel opens with greeting bubble, name input focused |
| 2 | Close via ✕ | Click ✕ button | Panel closes, cat stays on screen |
| 3 | Close via backdrop | Click outside panel | Panel closes |
| 4 | NO auto-close on send | Send a message | Panel stays open, message appears in thread |
| 5 | Persist across reopen | Close then reopen | Previous messages visible (loaded from Firestore) |

### 1.2 Send Messages
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 6 | Send with empty name | Leave name blank, type msg, click send | Name input focused, no message sent |
| 7 | Send with empty message | Fill name, leave msg empty | Send button disabled |
| 8 | Send valid message | Fill name + message, click send | Message appears in chat body as "sent" bubble, input cleared |
| 9 | Send via Enter key | Press Enter (no Shift) | Message sends |
| 10 | Shift+Enter | Press Shift+Enter | New line in textarea, no send |
| 11 | Send button disabled while sending | Click send | Button disabled during async, re-enabled after |
| 12 | Multiple messages | Send 3 messages | All 3 appear in thread in order |

### 1.3 Real-time Messages
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 13 | Receive admin reply | Admin sends reply via admin panel | Reply appears in EyesCat chat as "received" bubble |
| 14 | Auto-scroll | Receive message when scrolled up | Chat scrolls to latest message |
| 15 | Message ordering | Send/receive multiple | Chronological order maintained |

### 1.4 Visitor Identity
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 16 | First visit | Clear localStorage, open chat | New visitorId created, messages start fresh |
| 17 | Return visit | Reopen page | Same visitorId, previous messages loaded |
| 18 | Conversation persistence | Send messages, refresh page, reopen chat | All previous messages still visible |

### 1.5 Settings in Chat Header
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 19 | Toggle theme | Click sun/moon icon | Theme switches |
| 20 | Switch language | Click locale button (VI/EN) | Language switches, chat panel text updates |

### 1.6 Mobile / Virtual Keyboard
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 21 | Mobile open | Tap cat on mobile | Chat opens centered |
| 22 | Keyboard offset | Focus textarea on mobile | Panel adjusts for virtual keyboard |
| 23 | iOS no zoom | Focus textarea on iOS | No auto-zoom (font-size >= 16px) |

## 2. Admin Messages Panel

### 2.1 Conversation List
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 24 | Load conversations | Open admin/messages | All conversations listed with names/browser info |
| 25 | Real-time updates | User sends new message | Conversation moves to top, badge appears |
| 26 | Select conversation | Click a conversation | Chat area shows that conversation's messages |
| 27 | Unread badge | User sends msg, admin hasn't read | Blue dot on conversation |
| 28 | Mark as read | Click conversation | Badge disappears |

### 2.2 Admin Reply
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 29 | Send reply | Type reply, click Send | Reply appears in chat, user sees it in EyesCat |
| 30 | Enter to send | Press Enter | Reply sends |
| 31 | Disabled while sending | Click send | Button disabled during send |

### 2.3 Edit User Name
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 32 | Click to edit | Click username in chat header | Inline input appears with current name |
| 33 | Save with ✓ | Type new name, click ✓ | Name updated in Firestore, shown in list + header |
| 34 | Save with Enter | Type new name, press Enter | Name saved |
| 35 | Cancel with ✕ | Click ✕ | Edit cancelled, original name shown |
| 36 | Cancel with Escape | Press Escape | Edit cancelled |
| 37 | Empty name rejected | Clear input, click ✓ | Nothing happens (empty name not saved) |
| 38 | Max length | Type >50 chars | Input truncated at 50 |

### 2.4 Delete Conversation
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 39 | Click delete | Click trash icon in header | Confirm bar appears: "Delete this conversation?" |
| 40 | Confirm delete | Click "Delete" button | Conversation + all messages removed, view returns to list |
| 41 | Cancel delete | Click "Cancel" | Confirm bar disappears, nothing deleted |
| 42 | Verify deletion | After delete, check Firestore | Conversation doc and messages subcollection gone |
| 43 | List updates | Delete conversation | Removed from conversation list immediately |

### 2.5 Info Panel
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 44 | Toggle info | Click ⓘ button | Info panel slides open/closed |
| 45 | Show metadata | Open info panel | Visitor ID, fingerprint, OS, browser, device, status, last active, message count |

### 2.6 Mobile Admin
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 46 | Mobile layout | Open on <768px | Single column, shows list or chat |
| 47 | Back button | Click back arrow | Returns to conversation list |

## 3. Edge Cases
| # | Case | Steps | Expected |
|---|------|-------|----------|
| 48 | Network error on send | Disconnect network, send msg | Error logged, button re-enabled |
| 49 | Rapid sends | Click send 5x fast | Only first sends (button disabled during send) |
| 50 | Very long message | Type 500 chars | Accepted (maxLength=500), wraps in bubble |
| 51 | XSS attempt | Send `<script>alert(1)</script>` | Rendered as text, not executed |
| 52 | Empty conversation list | No conversations in Firestore | "No messages" shown |
| 53 | Delete last conversation | Delete only remaining conversation | List empty, no chat area shown |

## Summary
- **Total test cases:** 53
- **Critical:** 1-8, 13, 32-43 (chat functionality + admin CRUD)
- **High:** 9-12, 16-18, 24-31, 44-47 (real-time + identity + admin UX)
- **Medium:** 19-23, 48-53 (settings, mobile, edge cases)
