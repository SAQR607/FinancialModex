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

See `.env.example` files in both `backend/` and `frontend/` directories.

## 🗄️ Database

All database tables are defined in `backend/database/schema.sql`. **DO NOT** use auto-sync in production.

## 📄 License

Proprietary - Modex Academy

