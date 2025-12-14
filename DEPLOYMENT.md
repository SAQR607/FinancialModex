# Deployment Guide - Modex Academy Competition Platform

## 🚀 Production Deployment on Hostinger

### Prerequisites
- Hostinger hosting account with Node.js support
- MySQL database access
- Domain or subdomain configured

### Step 1: Database Setup

1. **Create MySQL Database**
   - Log into Hostinger cPanel
   - Create a new MySQL database
   - Note the database name, username, and password

2. **Import Schema**
   ```bash
   mysql -h your_host -u your_user -p your_database < backend/database/schema.sql
   ```
   Or use phpMyAdmin to import `backend/database/schema.sql`

### Step 2: Backend Deployment

1. **Upload Backend Files**
   - Upload entire `backend/` folder to your server
   - Recommended location: `public_html/api` or `public_html/backend`

2. **Install Dependencies**
   ```bash
   cd backend
   npm install --production
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Required variables:
   ```env
   NODE_ENV=production
   PORT=3000
   DB_HOST=localhost
   DB_NAME=your_database
   DB_USER=your_db_user
   DB_PASS=your_db_password
   JWT_SECRET=your_very_secure_secret_key
   JWT_EXPIRES_IN=7d
   UPLOAD_DIR=./uploads
   FRONTEND_URL=https://yourdomain.com
   ```

4. **Create Uploads Directory**
   ```bash
   mkdir -p uploads
   chmod 755 uploads
   ```

5. **Start Backend (PM2 Recommended)**
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name modex-backend
   pm2 save
   pm2 startup
   ```

### Step 3: Frontend Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Copy Build to Backend**
   ```bash
   cp -r dist/* ../backend/public/
   ```

   OR serve from backend's public directory:
   - Backend serves static files from `backend/public/`
   - Frontend build should be in `backend/public/`

### Step 4: Server Configuration

1. **Nginx Configuration** (if using Nginx)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **Apache Configuration** (if using Apache)
   ```apache
   <VirtualHost *:80>
       ServerName yourdomain.com
       
       ProxyPreserveHost On
       ProxyPass / http://localhost:3000/
       ProxyPassReverse / http://localhost:3000/
       
       # WebSocket support
       RewriteEngine on
       RewriteCond %{HTTP:Upgrade} websocket [NC]
       RewriteCond %{HTTP:Connection} upgrade [NC]
       RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]
   </VirtualHost>
   ```

### Step 5: SSL Certificate

1. **Install Let's Encrypt SSL** (via Hostinger cPanel or Certbot)
2. **Update Frontend .env** with HTTPS URL
3. **Update Backend .env** with HTTPS FRONTEND_URL

### Step 6: File Permissions

```bash
chmod 755 backend
chmod 755 backend/uploads
chmod 644 backend/.env
```

### Step 7: Verify Deployment

1. **Check Backend Health**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Access Frontend**
   - Visit `https://yourdomain.com`
   - Test login functionality
   - Verify file uploads work

### Step 8: Monitoring

1. **PM2 Monitoring**
   ```bash
   pm2 monit
   pm2 logs modex-backend
   ```

2. **Database Monitoring**
   - Monitor via phpMyAdmin
   - Check connection pool usage

## 🔒 Security Checklist

- [ ] Environment variables are set correctly
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] Upload directory has proper permissions
- [ ] HTTPS is enabled
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled (if applicable)
- [ ] File upload size limits are set

## 🐛 Troubleshooting

### Backend won't start
- Check Node.js version: `node -v` (should be 18+)
- Check database connection
- Verify .env file exists and has correct values
- Check PM2 logs: `pm2 logs modex-backend`

### Database connection errors
- Verify database credentials in .env
- Check database host (may need IP instead of localhost)
- Ensure database user has proper permissions

### File uploads not working
- Check uploads directory permissions
- Verify UPLOAD_DIR path in .env
- Check file size limits in backend config

### WebSocket/Socket.IO issues
- Ensure proxy configuration supports WebSocket upgrades
- Check firewall settings
- Verify Socket.IO CORS configuration

## 📞 Support

For deployment issues, contact the development team.

