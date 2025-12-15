# Comprehensive Codebase Audit Report
## Authentication & Registration System

---

## A. SUMMARY OF ALL DETECTED PROBLEMS

### Critical Issues (Blocking Registration/Login):
1. **Email Normalization Inconsistency** - Registration checks for existing user with non-normalized email, but creates with normalized email
2. **JWT_SECRET Not Validated in Middleware** - Auth middleware doesn't check if JWT_SECRET exists before using it
3. **Missing Error Context in Auth Middleware** - JWT verification errors don't provide clear context

### Medium Priority Issues:
4. **Duplicate Email Check Logic** - Email uniqueness check happens before normalization
5. **Error Handling in Auth Middleware** - Generic error message doesn't distinguish between missing secret and invalid token

### Low Priority Issues:
6. **Model-Schema Type Alignment** - BOOLEAN vs TINYINT(1) - Should work but worth verifying
7. **Password Comparison Edge Cases** - No explicit null/undefined checks (though bcrypt handles this)

---

## B. EXACT ROOT CAUSE OF FAILED REGISTRATION

### Primary Issue: Email Normalization Inconsistency

**Location**: `backend/src/services/authService.js` line 39

**Problem**:
```javascript
// Line 39: Checks with original email (case-sensitive)
const existingUser = await User.findOne({ where: { email } });

// Line 65: Creates with normalized email (lowercase)
email: email.trim().toLowerCase(),
```

**Impact**: 
- If user registers with "Test@Example.com", the duplicate check uses "Test@Example.com"
- But the user is created with "test@example.com"
- If another user tries "test@example.com", the check might miss the duplicate
- OR: If database is case-sensitive, duplicate check might fail incorrectly

**Root Cause**: Email normalization happens AFTER duplicate check, not before.

**Fix Required**: Normalize email BEFORE checking for duplicates.

---

## C. EXACT ROOT CAUSE OF FAILED LOGIN

### Primary Issue: JWT_SECRET Not Validated in Middleware

**Location**: `backend/src/middleware/auth.js` line 12

**Problem**:
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Impact**:
- If `JWT_SECRET` is undefined or empty, `jwt.verify()` will throw a cryptic error
- Error message "Invalid token" doesn't indicate the real problem (missing JWT_SECRET)
- Makes debugging extremely difficult

**Root Cause**: No validation that JWT_SECRET exists before using it in middleware.

**Fix Required**: Validate JWT_SECRET before attempting verification.

### Secondary Issue: Email Case Sensitivity in Login

**Location**: `backend/src/services/authService.js` line 140

**Current Code**:
```javascript
const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
```

**Status**: ✅ **CORRECT** - Login already normalizes email properly.

**However**: If user was registered with non-normalized email (due to bug in registration), login will fail.

---

## D. MODEL-SCHEMA MISMATCHES

### Users Table Comparison

| Schema (SQL) | Model (Sequelize) | Status |
|-------------|-------------------|--------|
| `id INT(11) UNSIGNED` | `INTEGER.UNSIGNED` | ✅ Match |
| `email VARCHAR(255) UNIQUE` | `STRING(255) unique: true` | ✅ Match |
| `password VARCHAR(255)` | `STRING(255)` | ✅ Match |
| `full_name VARCHAR(255)` | `STRING(255)` | ✅ Match |
| `role ENUM(...) DEFAULT 'TEAM_MEMBER'` | `ENUM(...) defaultValue: 'TEAM_MEMBER'` | ✅ Match |
| `is_qualified TINYINT(1) DEFAULT 0` | `BOOLEAN defaultValue: false` | ✅ Compatible* |
| `is_approved TINYINT(1) DEFAULT 0` | `BOOLEAN defaultValue: false` | ✅ Compatible* |
| `qualification_score INT(11) NULL` | `INTEGER allowNull: true` | ✅ Match |
| `created_at TIMESTAMP` | `timestamps: true` | ✅ Match |
| `updated_at TIMESTAMP` | `timestamps: true` | ✅ Match |

*Note: MySQL TINYINT(1) and Sequelize BOOLEAN are compatible. Sequelize maps BOOLEAN to TINYINT(1) in MySQL.

### Verification: All fields match correctly ✅

**No schema mismatches detected.**

---

## E. ENVIRONMENT VARIABLE PROBLEMS

### Required Variables Check:

| Variable | Status | Location Checked | Issue |
|----------|--------|------------------|-------|
| `DB_HOST` | ✅ Validated | `database.js:15` | None |
| `DB_USER` | ✅ Validated | `database.js:34` | None |
| `DB_PASSWORD` | ✅ Validated | `database.js:40` | Supports both DB_PASSWORD and DB_PASS |
| `DB_NAME` | ✅ Validated | `database.js:37` | None |
| `DB_PORT` | ✅ Has Default | `database.js:50` | Defaults to 3306 |
| `JWT_SECRET` | ⚠️ **PARTIAL** | `authService.js:6` | ✅ Validated in service<br>❌ **NOT validated in middleware** |

### Issues Found:

1. **JWT_SECRET Validation Missing in Middleware**
   - ✅ Validated in `authService.js` (generateToken)
   - ❌ **NOT validated in `auth.js` middleware** (authenticate function)
   - **Impact**: If JWT_SECRET is missing, middleware will fail with unclear error

2. **DB Connection Pool Configuration**
   - ✅ Properly configured in `database.js:53-58`
   - ✅ Uses environment variables correctly
   - **Status**: No issues

---

## F. COMPLETE FIXED CODE

### File 1: `backend/src/services/authService.js`

**Fix**: Normalize email BEFORE duplicate check

```javascript
const register = async (email, password, fullName) => {
  console.log('\n[REGISTER] ========================================');
  console.log('[REGISTER] Starting registration process');
  console.log('[REGISTER] Email:', email);
  console.log('[REGISTER] Full Name:', fullName);
  console.log('[REGISTER] Password length:', password?.length || 0);
  
  // Validate database connection
  if (!sequelize) {
    console.error('[REGISTER] CRITICAL: Database connection is not available');
    throw new Error('Database connection is not configured. Please check your environment variables.');
  }
  
  try {
    // Normalize email FIRST (before any database operations)
    const normalizedEmail = email.trim().toLowerCase();
    console.log('[REGISTER] Normalized email:', normalizedEmail);
    
    // Step 1: Check for existing user with NORMALIZED email
    console.log('[REGISTER] Step 1: Checking for existing user with email:', normalizedEmail);
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      console.log('[REGISTER] FAILED: User already exists with email:', normalizedEmail);
      throw new Error('Email already registered');
    }
    console.log('[REGISTER] Step 1: No existing user found, proceeding...');

    // Step 2: Validate input
    console.log('[REGISTER] Step 2: Validating input data');
    if (!normalizedEmail || normalizedEmail.length === 0) {
      throw new Error('Email is required');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!fullName || !fullName.trim()) {
      throw new Error('Full name is required');
    }
    console.log('[REGISTER] Step 2: Input validation passed');

    // Step 3: Create user (password will be hashed by beforeCreate hook)
    console.log('[REGISTER] Step 3: Creating new user in database...');
    console.log('[REGISTER] SQL Query: INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)');
    console.log('[REGISTER] Parameters: email=' + normalizedEmail + ', full_name=' + fullName.trim() + ', role=TEAM_MEMBER, password=[will be hashed]');
    
    const user = await User.create({
      email: normalizedEmail, // Use normalized email
      password: password, // Will be hashed by beforeCreate hook
      full_name: fullName.trim(),
      role: 'TEAM_MEMBER'
    });
    
    console.log('[REGISTER] Step 3: User created successfully');
    console.log('[REGISTER] User ID:', user.id);
    console.log('[REGISTER] User email:', user.email);
    console.log('[REGISTER] User role:', user.role);

    // Step 4: Generate JWT token
    console.log('[REGISTER] Step 4: Generating JWT token...');
    const token = generateToken(user.id);
    console.log('[REGISTER] Step 4: JWT token generated successfully');

    // Step 5: Prepare response
    const userJson = user.toJSON();
    console.log('[REGISTER] Step 5: Preparing response (password excluded)');
    console.log('[REGISTER] SUCCESS: Registration completed for user ID:', user.id);
    console.log('[REGISTER] ========================================\n');
    
    return { user: userJson, token };
  } catch (error) {
    console.error('[REGISTER] ERROR: Registration failed');
    console.error('[REGISTER] Error name:', error.name);
    console.error('[REGISTER] Error message:', error.message);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('[REGISTER] Database constraint violation: Email already exists');
      throw new Error('Email already registered');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('[REGISTER] Database error:', error.original?.message || error.message);
      console.error('[REGISTER] SQL State:', error.original?.sqlState);
      throw new Error('Database error occurred during registration');
    } else if (error.name === 'SequelizeValidationError') {
      console.error('[REGISTER] Validation error:', error.errors?.map(e => e.message).join(', '));
      throw new Error('Validation failed: ' + error.errors?.map(e => e.message).join(', '));
    } else if (error.message) {
      throw error; // Re-throw with original message
    } else {
      console.error('[REGISTER] Unknown error:', error);
      throw new Error('Registration failed due to an unexpected error');
    }
  }
};
```

### File 2: `backend/src/middleware/auth.js`

**Fix**: Add JWT_SECRET validation and better error handling

```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    // Validate JWT_SECRET exists before attempting verification
    if (!process.env.JWT_SECRET) {
      console.error('[AUTH MIDDLEWARE] CRITICAL: JWT_SECRET is not set in environment variables');
      return res.status(500).json({ error: 'Server configuration error: JWT_SECRET not configured' });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        console.warn('[AUTH MIDDLEWARE] User not found for userId:', decoded.userId);
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      // Distinguish between different JWT errors
      if (jwtError.name === 'JsonWebTokenError') {
        console.warn('[AUTH MIDDLEWARE] Invalid JWT token');
        return res.status(401).json({ error: 'Invalid token' });
      } else if (jwtError.name === 'TokenExpiredError') {
        console.warn('[AUTH MIDDLEWARE] JWT token expired');
        return res.status(401).json({ error: 'Token expired' });
      } else {
        console.error('[AUTH MIDDLEWARE] JWT verification error:', jwtError.message);
        return res.status(401).json({ error: 'Token verification failed' });
      }
    }
  } catch (error) {
    console.error('[AUTH MIDDLEWARE] Unexpected error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireQualified = (req, res, next) => {
  if (!req.user.is_qualified || !req.user.is_approved) {
    return res.status(403).json({ error: 'User must be qualified and approved' });
  }
  next();
};

module.exports = { authenticate, authorize, requireQualified };
```

---

## G. CORRECTED SQL TABLE CREATION STATEMENTS

### Verification: Current Schema is Correct ✅

The existing `schema.sql` file is **correct** and matches the Sequelize models. No changes needed.

**However**, if you need to ensure email uniqueness is case-insensitive, you can add:

```sql
-- Optional: Make email case-insensitive at database level
-- This is already handled in code, but this adds database-level enforcement
ALTER TABLE `users` MODIFY `email` VARCHAR(255) NOT NULL;
-- Note: MySQL's UNIQUE constraint is case-sensitive by default for VARCHAR
-- The code normalization handles this, but you could also use:
-- CREATE UNIQUE INDEX idx_email_lower ON users((LOWER(email)));
```

**Recommendation**: Keep current schema. Code-level normalization is sufficient and more flexible.

---

## H. FINAL CHECKLIST TO VERIFY THE PROJECT WORKS

### Pre-Deployment Checklist:

- [ ] **Environment Variables**
  - [ ] `DB_HOST` is set and correct
  - [ ] `DB_USER` is set and correct
  - [ ] `DB_PASSWORD` is set and correct
  - [ ] `DB_NAME` is set and correct
  - [ ] `JWT_SECRET` is set and is a strong random string
  - [ ] `JWT_EXPIRES_IN` is set (optional, defaults to '7d')
  - [ ] `NODE_ENV` is set to 'production' or 'development'

- [ ] **Database Setup**
  - [ ] Database exists
  - [ ] `schema.sql` has been imported
  - [ ] `users` table exists with correct structure
  - [ ] Database connection test passes (check startup logs)

- [ ] **Code Verification**
  - [ ] Email normalization fix applied in `authService.js`
  - [ ] JWT_SECRET validation added in `auth.js` middleware
  - [ ] All files saved and server restarted

### Testing Checklist:

- [ ] **Registration Test**
  ```bash
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
  ```
  - [ ] Returns 201 status
  - [ ] Returns user object (without password)
  - [ ] Returns JWT token
  - [ ] Check console logs for step-by-step process
  - [ ] Verify user exists in database with normalized email (lowercase)

- [ ] **Duplicate Email Test**
  ```bash
  # Try registering same email again
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
  ```
  - [ ] Returns 409 or 400 status
  - [ ] Error message: "Email already registered"

- [ ] **Case-Insensitive Email Test**
  ```bash
  # Try registering with different case
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"TEST@EXAMPLE.COM","password":"password123","full_name":"Test User"}'
  ```
  - [ ] Should be rejected as duplicate (after fix)

- [ ] **Login Test**
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}'
  ```
  - [ ] Returns 200 status
  - [ ] Returns user object (without password)
  - [ ] Returns JWT token
  - [ ] Check console logs for step-by-step process

- [ ] **Login with Different Case Email**
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"TEST@EXAMPLE.COM","password":"password123"}'
  ```
  - [ ] Should work (email normalized in login)

- [ ] **Invalid Credentials Test**
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
  ```
  - [ ] Returns 401 status
  - [ ] Error message: "Invalid credentials"

- [ ] **JWT Token Validation Test**
  ```bash
  # Use token from login response
  curl http://localhost:3000/api/auth/me \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```
  - [ ] Returns 200 status
  - [ ] Returns user object

- [ ] **Invalid Token Test**
  ```bash
  curl http://localhost:3000/api/auth/me \
    -H "Authorization: Bearer invalid_token"
  ```
  - [ ] Returns 401 status
  - [ ] Error message: "Invalid token"

- [ ] **Missing JWT_SECRET Test** (Development only)
  - [ ] Temporarily remove JWT_SECRET from .env
  - [ ] Restart server
  - [ ] Attempt registration
  - [ ] Should get clear error about JWT_SECRET missing

### Production Deployment Checklist:

- [ ] All environment variables set in production
- [ ] Database connection works in production
- [ ] Health endpoint `/api/health` shows all green
- [ ] Debug endpoint `/api/debug/env` shows all variables received
- [ ] Registration works in production
- [ ] Login works in production
- [ ] JWT tokens work in production

---

## SUMMARY OF FIXES APPLIED

1. ✅ **Fixed email normalization** - Normalize email BEFORE duplicate check
2. ✅ **Added JWT_SECRET validation** - Check in auth middleware before use
3. ✅ **Improved error handling** - Better error messages in auth middleware
4. ✅ **Verified schema matches** - All model fields match database schema
5. ✅ **Verified environment variables** - All required vars validated

**All critical issues have been identified and fixes provided.**

