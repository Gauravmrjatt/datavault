# DataVault

**DataVault** is a cloud storage solution that leverages Telegram as a backend storage provider. It provides unlimited storage by chunking files and storing them in Telegram channels, with a modern Next.js frontend and Express.js backend.

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        UI[User Interface]
        Auth[Auth Context]
        Upload[Upload Component]
        Files[File Manager]
    end
    
    subgraph "Backend - Express.js"
        API[REST API Server]
        AuthM[Auth Middleware]
        FileCtrl[File Controller]
        DriveCtrl[Drive Controller]
        FileService[File Service]
        TelegramService[Telegram Storage Service]
    end
    
    subgraph "Database - MongoDB"
        UserDB[(User Collection)]
        FileDB[(File Collection)]
        FolderDB[(Folder Collection)]
        SessionDB[(Upload Session)]
        ShareDB[(Share Links)]
    end
    
    subgraph "Storage - Telegram"
        Bot[Telegram Bot API]
        Channel[Storage Channel/Chat]
    end
    
    UI --> Auth
    Upload --> API
    Files --> API
    API --> AuthM
    AuthM --> FileCtrl
    AuthM --> DriveCtrl
    FileCtrl --> FileService
    DriveCtrl --> FileService
    FileService --> TelegramService
    FileService --> FileDB
    FileService --> SessionDB
    FileService --> UserDB
    TelegramService --> Bot
    Bot --> Channel
    
    style UI fill:#4f46e5
    style API fill:#10b981
    style FileDB fill:#f59e0b
    style Bot fill:#0088cc
```

## 📤 File Upload Flow (Chunking Process)

DataVault splits large files into chunks (default 19MB) and uploads them to Telegram. This allows bypassing Telegram's file size limits and provides efficient parallel uploads.

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant API as Backend API
    participant FS as File Service
    participant TS as Telegram Service
    participant DB as MongoDB
    participant TG as Telegram Bot API
    
    Note over Client,TG: 1. Initiate Upload
    Client->>API: POST /api/drive/files/initiate-upload<br/>{name, size, mimeType, folderId}
    API->>FS: initiateUpload()
    FS->>DB: Check user quota
    FS->>DB: Create File document (status: uploading)
    FS->>DB: Create UploadSession
    FS-->>Client: {fileId, uploadId, chunkSize, totalChunks}
    
    Note over Client,TG: 2. Upload Chunks (Parallel)
    loop For each chunk (0 to totalChunks-1)
        Client->>Client: Split file into chunk
        Client->>API: PUT /api/drive/files/:fileId/chunks/:chunkIndex<br/>Headers: X-Upload-Id<br/>Body: Binary chunk data
        API->>FS: uploadFileChunk()
        FS->>FS: Save chunk to tmp/uploads/:uploadId/:chunkIndex.part
        FS->>TS: uploadChunk()
        TS->>TS: Calculate SHA256 checksum
        TS->>TG: sendDocument(chatId, chunkPath)<br/>caption: {dv:1, fileId, chunkIndex, checksum}
        TG-->>TS: {message_id, document: {file_id, file_unique_id}}
        TS-->>FS: {chunkIndex, messageId, telegramFileId, size, checksum}
        FS->>DB: Update File.telegramRefs[]
        FS->>DB: Update UploadSession.receivedChunks[]
        FS->>FS: Delete tmp chunk file
        FS-->>Client: {chunkIndex, uploadedChunks, totalChunks}
    end
    
    Note over Client,TG: 3. Complete Upload
    Client->>API: POST /api/drive/files/:fileId/complete-upload<br/>{uploadId, checksum}
    API->>FS: completeUpload()
    FS->>DB: Verify all chunks received
    FS->>DB: Update File status: active
    FS->>DB: Update UploadSession status: completed
    FS->>DB: Increment User.usedBytes
    FS->>FS: Cleanup tmp directory
    FS-->>Client: {success: true, file}
```

### Chunk Structure

Each chunk uploaded to Telegram contains:

```json
{
  "caption": {
    "dv": 1,
    "fileId": "mongodb-object-id",
    "chunkIndex": 0,
    "originalName": "example.pdf",
    "checksum": "sha256-hash"
  },
  "document": {
    "file_id": "telegram-file-id",
    "file_unique_id": "unique-id",
    "file_size": 19922944
  }
}
```

## 📥 File Download Flow

When downloading, DataVault retrieves all chunks from Telegram, reassembles them, and streams the complete file to the client.

```mermaid
sequenceDiagram
    participant Client as Frontend Client
    participant API as Backend API
    participant FS as File Service
    participant TS as Telegram Service
    participant DB as MongoDB
    participant TG as Telegram Bot API
    
    Note over Client,TG: Download Request
    Client->>API: GET /api/drive/files/:fileId/download<br/>Headers: Range (optional)
    API->>FS: getFileForOwner()
    FS->>DB: Find File by ID and ownerId
    DB-->>FS: File document with telegramRefs[]
    
    FS->>FS: buildFileStreamData()
    FS->>FS: Parse Range header (if present)
    FS->>FS: Sort chunks by chunkIndex
    
    loop For each required chunk
        FS->>TS: getChunkBuffer(telegramFileId)
        TS->>TG: getFile(telegramFileId)
        TG-->>TS: {file_path}
        TS->>TG: Download from<br/>https://api.telegram.org/file/bot{token}/{file_path}
        TG-->>TS: Binary chunk data
        TS-->>FS: Buffer
        FS->>FS: Slice buffer if range requested
        FS->>FS: Append to buffers array
    end
    
    FS->>FS: Concat all buffers
    FS->>DB: Increment download count (optional)
    FS-->>API: {buffer, start, end, totalSize}
    API-->>Client: Stream file with headers<br/>Content-Type, Content-Disposition<br/>Content-Range (if partial)
```

### Range Request Support

DataVault supports HTTP Range requests for partial downloads and streaming:

- **Full Download**: `GET /api/drive/files/:fileId/download`
- **Partial Download**: `GET /api/drive/files/:fileId/download` with `Range: bytes=0-1000000`

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant API as Backend API
    participant Auth as Auth Controller
    participant DB as MongoDB
    
    Note over Client,DB: Registration
    Client->>API: POST /api/auth/register<br/>{email, password}
    API->>Auth: register()
    Auth->>Auth: Hash password (bcrypt)
    Auth->>DB: Create User document
    Auth->>Auth: Generate JWT token
    Auth-->>Client: {token, user}
    
    Note over Client,DB: Login
    Client->>API: POST /api/auth/login<br/>{email, password}
    API->>Auth: login()
    Auth->>DB: Find user by email
    Auth->>Auth: Verify password
    Auth->>Auth: Generate JWT token
    Auth-->>Client: {token, user}
    
    Note over Client,DB: Authenticated Requests
    Client->>API: Any protected endpoint<br/>Headers: Authorization: Bearer {token}
    API->>Auth: auth middleware
    Auth->>Auth: Verify JWT token
    Auth->>DB: Find user by ID from token
    Auth->>API: Attach req.user
    API->>API: Process request
```

## 🗂️ Database Schema

```mermaid
erDiagram
    User ||--o{ File : owns
    User ||--o{ Folder : owns
    User ||--o{ UploadSession : has
    User ||--o{ ShareLink : creates
    File ||--o{ ShareLink : "shared via"
    File }o--|| Folder : "belongs to"
    Folder }o--|| Folder : "parent of"
    File ||--|| UploadSession : "uploading via"
    
    User {
        ObjectId _id
        string email
        string passwordHash
        number quotaBytes
        number usedBytes
        object telegramConfig
        datetime createdAt
    }
    
    File {
        ObjectId _id
        ObjectId ownerId
        ObjectId folderId
        string name
        string extension
        string mimeType
        number size
        string checksum
        number chunkSize
        number chunksCount
        object telegramStorage
        array telegramRefs
        string status
        boolean isTrashed
        datetime trashedAt
        datetime deletedAt
    }
    
    Folder {
        ObjectId _id
        ObjectId ownerId
        ObjectId parentId
        string name
        boolean isTrashed
        datetime trashedAt
    }
    
    UploadSession {
        ObjectId _id
        ObjectId ownerId
        ObjectId fileId
        string uploadId
        number totalChunks
        array receivedChunks
        string status
        datetime expiresAt
    }
    
    ShareLink {
        ObjectId _id
        string token
        ObjectId ownerId
        ObjectId fileId
        string permission
        boolean isPublic
        datetime expiresAt
        datetime revokedAt
        number accessCount
    }
```

## 🛣️ API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login user | ❌ |
| GET | `/me` | Get current user | ✅ |

### Drive Routes (`/api/drive`)

#### File Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/items` | List files and folders | ✅ |
| POST | `/files/initiate-upload` | Start chunked upload | ✅ |
| PUT | `/files/:fileId/chunks/:chunkIndex` | Upload single chunk | ✅ |
| POST | `/files/:fileId/complete-upload` | Finalize upload | ✅ |
| POST | `/files/:fileId/abort-upload` | Cancel upload | ✅ |
| GET | `/files/:fileId/download` | Download file | ✅ |
| POST | `/files/:fileId/trash` | Move to trash | ✅ |
| POST | `/files/:fileId/restore` | Restore from trash | ✅ |
| DELETE | `/files/:fileId/permanent` | Permanently delete | ✅ |

#### Folder Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/folders` | Create folder | ✅ |
| PATCH | `/folders/:folderId/rename` | Rename folder | ✅ |
| PATCH | `/folders/:folderId/move` | Move folder | ✅ |
| DELETE | `/folders/:folderId` | Delete folder | ✅ |

#### Sharing

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/files/:fileId/share-links` | Create share link | ✅ |

#### Configuration

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/telegram-config` | Get Telegram config | ✅ |
| PUT | `/telegram-config` | Update Telegram config | ✅ |
| POST | `/reconstruct` | Reconstruct files from Telegram | ✅ |

### Share Routes (`/api/share`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/:token` | Access shared file | ❌ |
| GET | `/:token/download` | Download shared file | ❌ |

## 🔧 Technical Details

### Chunking Strategy

- **Default Chunk Size**: 19 MB (19 × 1024 × 1024 bytes)
- **Reason**: Telegram's file size limit is 20MB for bots; 19MB provides safety margin
- **Configurable**: Can be adjusted per upload
- **Parallel Upload**: Multiple chunks can be uploaded simultaneously

### Encryption & Security

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Signed with secret key
- **Telegram Bot Token**: Encrypted in database using AES encryption
- **File Checksums**: SHA256 for integrity verification

### Storage Optimization

- **Deduplication**: Files with same checksum can be referenced
- **Quota Management**: Per-user storage limits enforced
- **Temporary Cleanup**: Upload temp files automatically removed
- **Trash System**: Soft delete with restore capability

### Rate Limiting

- **Telegram API**: Automatic retry with exponential backoff
- **Max Retries**: 5 attempts per Telegram operation
- **API Rate Limit**: 800 requests per 15 minutes per IP

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB
- Telegram Bot Token
- Telegram Channel/Chat ID

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### Frontend Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### Environment Variables

#### Backend (`.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/datavault
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
ENCRYPTION_KEY=32-byte-hex-key
BOT_TOKEN=your-telegram-bot-token
CHANNEL_USERNAME=@your_storage_channel
```

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📊 File Upload Example (Client-Side)

```javascript
async function uploadFile(file) {
  const CHUNK_SIZE = 19 * 1024 * 1024; // 19MB
  
  // 1. Initiate upload
  const { fileId, uploadId, totalChunks } = await fetch('/api/drive/files/initiate-upload', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: file.name,
      size: file.size,
      mimeType: file.type
    })
  }).then(r => r.json());
  
  // 2. Upload chunks in parallel
  const uploadPromises = [];
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);
    
    uploadPromises.push(
      fetch(`/api/drive/files/${fileId}/chunks/${i}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `Bearer ${token}`,
          'X-Upload-Id': uploadId
        },
        body: chunk
      })
    );
  }
  
  await Promise.all(uploadPromises);
  
  // 3. Complete upload
  await fetch(`/api/drive/files/${fileId}/complete-upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ uploadId })
  });
}
```

## 🎯 Key Features

- ✅ **Unlimited Storage**: Leverage Telegram's infrastructure
- ✅ **Chunked Uploads**: Handle files of any size
- ✅ **Parallel Processing**: Fast upload/download speeds
- ✅ **Range Requests**: Stream large files efficiently
- ✅ **File Sharing**: Generate shareable links
- ✅ **Folder Organization**: Hierarchical file structure
- ✅ **Trash & Restore**: Recover deleted files
- ✅ **Quota Management**: Per-user storage limits
- ✅ **Encryption**: Secure storage of credentials
- ✅ **Modern UI**: Next.js with Tailwind CSS

## 📝 License

ISC

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

**Built with ❤️ using Next.js, Express, MongoDB, and Telegram**

```bash
PORT=XXX
JWT_SECRET=XXX
MONGODB_URI=XXX
BOT_TOKEN=XXX
CHANNEL_USERNAME=XXX
FRONTEND_URL=XXX
```