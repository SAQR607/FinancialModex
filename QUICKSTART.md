# Quick Start Guide - Modex Academy Competition Platform

## 🚀 Quick Setup (Development)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE modex_competition;

# Import schema
mysql -u root -p modex_competition < database/schema.sql
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env if needed (default should work)
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health

## 👤 First Admin User

After importing the schema, create your first admin user:

```sql
INSERT INTO users (email, password, full_name, role, is_qualified, is_approved) 
VALUES ('admin@modex.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'ADMIN', 1, 1);
```

Or register through the UI and manually update the database:

```sql
UPDATE users SET role = 'ADMIN', is_qualified = 1, is_approved = 1 WHERE email = 'your@email.com';
```

## 📋 Key Features

✅ **Authentication**: JWT-based with role management  
✅ **Qualification System**: Admin creates questions, users answer, admin approves (max 100)  
✅ **Team Management**: Create teams, invite codes, max 5 members  
✅ **Real-time Chat**: Global chat and team chat via Socket.IO  
✅ **File Uploads**: PDF and Excel files in team rooms  
✅ **WebRTC**: Video/audio call signaling (UI ready, implementation needed)  
✅ **Admin Dashboard**: User approval, competition management, judge assignment  
✅ **Judge Dashboard**: Score teams, submit scores with notes  
✅ **Competition Flow**: Multi-stage competitions with stage management  

## 🔧 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_NAME=modex_competition
DB_USER=root
DB_PASS=your_password
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## 📝 Important Notes

1. **Database**: DO NOT use auto-sync in production. Always use the schema.sql file.
2. **File Uploads**: Files are stored in `backend/uploads/`
3. **Frontend Build**: Run `npm run build` in frontend, files go to `backend/public/`
4. **Socket.IO**: Requires WebSocket support in production (configure proxy)
5. **User Approval**: Maximum 100 users can be approved per competition

## 🐛 Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in .env
- Ensure database exists

### Socket.IO Not Connecting
- Check CORS settings
- Verify token is being sent
- Check browser console for errors

### File Upload Fails
- Ensure `backend/uploads/` directory exists
- Check file size limits (default 10MB)
- Verify file type (PDF/Excel only)

## 📚 Next Steps

1. Create your first competition via Admin Dashboard
2. Add qualification questions
3. Register test users
4. Approve users (max 100)
5. Test team creation and collaboration

For detailed deployment instructions, see `DEPLOYMENT.md`.

