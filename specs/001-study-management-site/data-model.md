# Phase 1 Data Model: Sleek Study Management Website

**Branch**: `001-study-management-site`  
**Date**: 2026-01-29

## Notes

- This is a conceptual data model mapped to MongoDB document collections.
- IDs are MongoDB `ObjectId` unless otherwise stated.

## Entities

### User

**Represents**: Account identity and authentication.

**Core fields**
- `email` (string, unique, required)
- `username` (string, unique, required)
- `passwordHash` (string, required)
- `role` (enum: `user` | `moderator` | `admin`, default `user`)
- `status` (enum: `active` | `disabled` | `deleted`, default `active`)
- `createdAt`, `updatedAt`

**Indexes**
- Unique index on `email`
- Unique index on `username`

**Validation rules**
- Email format; username length + allowed characters; password policy enforced at creation/reset.

**State transitions**
- `active` → `disabled` (admin action)
- `active` → `deleted` (self-service deletion)

---

### Profile

**Represents**: User-facing profile and privacy preferences.

**Core fields**
- `userId` (ref User, unique)
- `displayName` (string)
- `bio` (string)
- `visibility` (enum: `public` | `friends-only`, default `public`)
- `avatarUrl` (string, optional)
- `updatedAt`

---

### JournalEntry

**Represents**: Private journal content per user per day.

**Core fields**
- `userId` (ref User)
- `date` (string in ISO date form `YYYY-MM-DD`)
- `content` (string)
- `createdAt`, `updatedAt`

**Indexes**
- Unique compound index on `(userId, date)`

**Validation rules**
- Content length limits

---

### FriendRequest

**Represents**: Request from one user to another.

**Core fields**
- `requesterId` (ref User)
- `recipientId` (ref User)
- `status` (enum: `pending` | `accepted` | `declined` | `canceled`, default `pending`)
- `createdAt`, `updatedAt`

**Indexes**
- Unique compound index on `(requesterId, recipientId)` (prevents duplicates)

**State transitions**
- `pending` → `accepted` | `declined` | `canceled`

---

### Friendship

**Represents**: Confirmed relationship between two users.

**Core fields**
- `userAId` (ref User)
- `userBId` (ref User)
- `createdAt`

**Indexes**
- Unique compound index on `(min(userAId,userBId), max(userAId,userBId))` (enforced via application normalization)

---

### Chat

**Represents**: A direct or group conversation.

**Core fields**
- `type` (enum: `direct` | `group`)
- `name` (string, optional; required for group)
- `createdByUserId` (ref User)
- `createdAt`, `updatedAt`

---

### ChatMembership

**Represents**: Membership of a user in a chat.

**Core fields**
- `chatId` (ref Chat)
- `userId` (ref User)
- `role` (enum: `member` | `owner`, default `member`)
- `status` (enum: `active` | `left`, default `active`)
- `joinedAt`, `updatedAt`

**Indexes**
- Unique compound index on `(chatId, userId)`

---

### Message

**Represents**: Message sent in a chat.

**Core fields**
- `chatId` (ref Chat)
- `senderId` (ref User)
- `content` (string)
- `createdAt`

**Indexes**
- Index on `(chatId, createdAt)` for history retrieval

**Validation rules**
- Content length limit; sanitize text

---

### StudyAdviceItem

**Represents**: A curated study strategy.

**Core fields**
- `title` (string)
- `summary` (string)
- `category` (string)
- `steps` (array of strings)
- `createdAt`, `updatedAt`

**Indexes**
- Index on `category`

---

### Question

**Represents**: Q&A question.

**Core fields**
- `authorId` (ref User)
- `title` (string)
- `body` (string)
- `tags` (array of strings)
- `status` (enum: `open` | `closed` | `removed`, default `open`)
- `createdAt`, `updatedAt`

**Indexes**
- Text index on `title` and `body` (keyword search)

---

### Answer

**Represents**: Answer to a question.

**Core fields**
- `questionId` (ref Question)
- `authorId` (ref User)
- `body` (string)
- `status` (enum: `active` | `removed`, default `active`)
- `createdAt`, `updatedAt`

**Indexes**
- Index on `(questionId, createdAt)`

---

### Vote

**Represents**: A user vote on a question or answer.

**Core fields**
- `voterId` (ref User)
- `targetType` (enum: `question` | `answer`)
- `targetId` (ObjectId)
- `direction` (enum: `up` | `down`)
- `createdAt`

**Indexes**
- Unique compound index on `(voterId, targetType, targetId)`

---

### Report

**Represents**: Abuse report on a Q&A item.

**Core fields**
- `reporterId` (ref User)
- `targetType` (enum: `question` | `answer`)
- `targetId` (ObjectId)
- `reason` (string)
- `status` (enum: `open` | `reviewed` | `actioned`, default `open`)
- `createdAt`, `updatedAt`

**Indexes**
- Index on `status`

## Deletion / Retention

- If a user deletes their account:
  - Delete: `JournalEntry`, `FriendRequest`, `Friendship`, `ChatMembership` for that user.
  - Anonymize: authored `Question`/`Answer` (replace `authorId` with a tombstone user or remove direct identity), while retaining content unless removed for abuse.
  - Remove or redact: messages authored by the user based on product policy; default to retain message content but anonymize sender identity.
