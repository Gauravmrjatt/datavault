# DataVault Backend (Telegram Storage Engine)

## Core capabilities
- JWT auth (`/api/auth/signup`, `/api/auth/login`, `/api/auth/me`)
- Per-user Telegram credentials (`GET/PUT /api/drive/telegram-config`)
- Folder tree CRUD (`/api/drive/folders`)
- Chunked upload lifecycle (`initiate-upload`, `chunks`, `complete-upload`, `abort-upload`)
- Reassembled and resumable file download (`Range` support)
- Trash + permanent delete lifecycle
- Public share links with expiry/permission
- Telegram reconstruction (`/api/drive/reconstruct`) from encoded chunk captions

## Environment variables
```bash
PORT=5100
MONGODB_URI=mongodb://datavault:datavault_password@localhost:27018/datavault?authSource=admin
JWT_SECRET=change-me
TELEGRAM_TOKEN_ENCRYPTION_KEY=change-me-too
# Optional global fallback only when user has not configured their own Telegram details:
BOT_TOKEN=
TELEGRAM_STORAGE_CHAT_ID=
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Start
```bash
cd backend
npm install
npm start
```

## Data model
- `User`: identity, password hash, quota/usage, encrypted Telegram credentials
- `Folder`: owner, nested path, trashed state
- `File`: metadata, chunk map, telegram refs, status/trash lifecycle
- `UploadSession`: resumable chunk session and expiry
- `ShareLink`: public tokenized access control

## Notes
- Telegram Bot API is used as storage transport.
- Users can set their own bot token/chat id in Settings; credentials are encrypted at rest.
