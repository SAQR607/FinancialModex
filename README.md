# Modex Academy Competition Platform

A full-stack competition management platform for Modex Academy, featuring real-time communication, team collaboration, and comprehensive admin controls.

## 🚀 Features

- **Multi-role Authentication**: ADMIN, JUDGE, TEAM_LEADER, TEAM_MEMBER
- **Qualification System**: Admin-created questions with manual approval (100 qualified users)
- **Team Management**: Max 5 members per team with invite codes
- **Real-time Communication**: Global chat, team chat, file uploads, and WebRTC video/audio calls
- **Competition Management**: Multi-stage competitions with judge scoring
- **Admin Dashboard**: Complete control over competitions, users, and stages
- **Judge Dashboard**: Scoring interface for assigned teams

## 📁 Project Structure

```
modex-platform/
├── backend/          # Node.js + Express + MySQL backend
├── frontend/         # React + Vite frontend
├── README.md         # This file
└── DEPLOYMENT.md     # Deployment instructions
```

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MySQL (Hostinger compatible)
- Sequelize ORM
- JWT Authentication
- Socket.IO (real-time chat)
- WebRTC (peer-to-peer)

### Frontend
- React + Vite
- TailwindCSS
- Modern UI components

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd modex-platform
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

**Backend Environment Variables** (Required):
```env
# Database Configuration (REQUIRED)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# JWT Configuration (REQUIRED)
JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important Notes**:
- The `.env` file must be located in the `backend/` directory
- The system will automatically search for `.env` in multiple locations if not found
- All required variables must be set, or the server will log warnings
- Check startup logs to confirm which `.env` file was loaded
- Visit `/api/health` endpoint to verify all environment variables are loaded correctly

3. **Database Setup**
```bash
# Import the schema
mysql -u your_user -p your_database < database/schema.sql
```

4. **Frontend Setup**
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your API URL
```

5. **Run Development Servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## 📝 Environment Variables

### Backend Environment Variables

The backend requires the following environment variables. Copy `backend/.env.example` to `backend/.env` and fill in the values:

**Required Variables:**
- `DB_HOST` - MySQL database host (e.g., `localhost` or your Hostinger host)
- `DB_PORT` - MySQL port (default: `3306`)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - MySQL database name
- `JWT_SECRET` - Secret key for JWT token generation (use a strong random string)

**Optional Variables:**
- `JWT_EXPIRES_IN` - JWT token expiration (default: `7d`)
- `PORT` - Server port (default: `3000`)
- `NODE_ENV` - Environment mode (`development` or `production`)
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` - Email service configuration
- `FRONTEND_URL` - Frontend URL for CORS
- `SOCKET_CORS_ORIGIN` - Socket.IO CORS origin
- `UPLOAD_DIR` - File upload directory (default: `./uploads`)
- `MAX_FILE_SIZE` - Maximum file size in bytes (default: `10485760` = 10MB)
- `DEBUG` - Enable debug mode (default: `false`)

**Environment Variable Validation:**
- The server validates all required variables at startup
- Missing variables are logged with clear error messages
- Database connection is skipped if configuration is invalid
- Check `/api/health` endpoint to see missing variables and configuration status

**Production (Hostinger) Notes:**
- The system automatically detects `.env` file location
- If `.env` is not found in `backend/`, it searches:
  1. Project root directory
  2. Current working directory
  3. Nested backend directories
- Startup logs show which `.env` file was loaded: `✅ Loaded .env from: <path>`

### Frontend Environment Variables

See `.env.example` file in the `frontend/` directory.

## 🗄️ Database

All database tables are defined in `backend/database/schema.sql`. **DO NOT** use auto-sync in production.

## 📄 License

Proprietary - Modex Academy

