# 5Star Cinematography — Production Full-Stack Platform

> **"Every Moment, A Timeless Story."**  
> Complete full-stack photography and cinematography platform built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB Atlas, and GridFS binary media persistence.

---

## Architecture Overview

```
5star-project/
├── client/                     # Frontend (React 19 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── assets/            # High-res SVG logos (Dark, Light, Icon)
│   │   ├── components/        # Navbar, Footer, SocialIcons
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── pages/             # Home, Packages, Portfolio, Live QR, Booking, Auth, etc.
│   │   │   └── admin/         # Admin Dashboard, Bookings, Calendar, Live Event, etc.
│   │   └── services/          # Axios API client & GridFS streaming helpers
│   ├── .env.example           # Frontend environment template
│   ├── .env                   # Frontend connection configuration
│   └── package.json
│
├── server/                     # Backend API (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/            # MongoDB Atlas connection & GridFSBucket setup
│   │   ├── models/            # User, Package, Booking, Gallery, LiveEvent, LivePhoto, etc.
│   │   ├── controllers/       # Auth, Packages, Bookings, Galleries, LiveEvents, Media, Contact
│   │   ├── routes/            # REST API route handlers
│   │   ├── middleware/        # JWT auth, Role authorization, Multer memory storage
│   │   ├── services/          # GridFS streaming, Archiver ZIP, Nodemailer SMTP
│   │   └── utils/             # JWT tokens, QR code generator
│   ├── scripts/
│   │   ├── createAdmin.js     # Creates initial administrator with hashed password
│   │   └── seed.js            # Seeds sample packages, galleries, testimonials, and settings
│   ├── .env.example           # Backend environment template
│   ├── .env                   # Backend connection configuration
│   └── package.json
│
├── package.json               # Root monorepo scripts
├── .gitignore
└── README.md
```

---

## 1. Separate Environment Connection Files

As requested, separate environment connection files are provided for the server and client:

### Backend: `server/.env`
```env
# Server Port & Environment
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection URI
# Replace with your actual MongoDB Atlas cluster connection string:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/5star_cinematography?retryWrites=true&w=majority

# JWT Authentication Secret & Expiration
JWT_SECRET=cinematic_5star_super_secret_jwt_key_2026_xyz987_prod_secure
JWT_EXPIRES_IN=7d

# Frontend Client URL (for CORS and QR link resolution)
CLIENT_URL=http://localhost:5173

# Nodemailer / SMTP Configuration for Transactional Emails & Password Reset OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="5Star Cinematography" <contact@5starcinematography.com>
ADMIN_NOTIFICATION_EMAIL=admin@5starcinematography.com

# Initial Default Administrator Setup Credentials
ADMIN_INITIAL_NAME="5Star Studio Director"
ADMIN_INITIAL_EMAIL=admin@5star.com
ADMIN_INITIAL_PASSWORD=Admin@5Star2026!
ADMIN_INITIAL_MOBILE=+91 9876543210
```

### Frontend: `client/.env`
```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Public Live Event & QR URL Host
VITE_SITE_URL=http://localhost:5173
```

---

## 2. Quick Start Guide

### Step 1: Install Dependencies
From the root workspace:
```bash
# In client:
cd client
npm install

# In server:
cd ../server
npm install
```

### Step 2: Configure MongoDB Atlas
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a free cluster (M0) or use an existing cluster.
3. Under **Database Access**, create a user with read and write permissions (e.g. `admin`).
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** -> **Connect your application** -> Copy the connection URI:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/5star_cinematography?retryWrites=true&w=majority
   ```
6. Paste your connection URI into `server/.env` under `MONGODB_URI`.

### Step 3: Seed Database & Create Admin Account
```bash
# In server directory:
cd server

# 1. Seed sample photography packages, sample galleries, and testimonials:
node scripts/seed.js

# 2. Initialize default administrator account:
node scripts/createAdmin.js
```
The initial admin credentials created:
- **Email:** `admin@5star.com`
- **Password:** `Admin@5Star2026!`
- **Role:** `ADMIN`

### Step 4: Run the Application Locally
Open two terminal windows (or use root scripts):

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server running at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client running at http://localhost:5173
```

---

## 3. Key Feature Walkthroughs

### 1. Permanent QR Code & Live Event Photo Distribution
- **One Permanent QR Code:** Routes permanently to `/live`. The QR code is printed on wedding guest table cards and never changes between events.
- **Single Active Event Enforcement:** Only one live event can broadcast at a time. Starting a new event in the Admin Dashboard automatically archives any previous event.
- **Sequential Photo Numbers:** Every photo uploaded receives an atomic sequential number (`000001`, `000002`, `000003`...).
- **Guest Access without Login:** Guests scan the table QR code and can view photos in real-time, preview in high-resolution, download individual originals without resizing, or click **Download All (ZIP)** to receive an on-the-fly generated ZIP archive.
- **End Event & Archiving:** When the event concludes, clicking **End Event** marks it as Archived in MongoDB Atlas. All photos remain preserved, the active feed clears, and the permanent QR code is immediately ready for the next celebration.

### 2. Camera QR Scanner (`/scan`)
- Dedicated **Scan & Download Photos** page.
- Direct device camera scanning using `html5-qrcode`.
- Fallback QR image upload option.
- Safety check: If a scanned QR points to an external destination, prompts confirmation before navigation.

### 3. Photography Packages & Booking Engine
- 4 editable default packages in Indian Rupees (`₹`):
  1. *Photography Only* (₹45,000)
  2. *Photography + Videography* (₹85,000)
  3. *Trailer + Photography + Videography* (₹1,35,000)
  4. *Premium Wedding Package (Royal Luxe)* (₹2,10,000)
- Customers log in to submit bookings with detailed venue, timing, guest count, and add-on selections.
- Generates unique reference code (e.g. `5STAR-BK-2026-A1B2C`).
- Prevents past event dates.
- Sends instant email confirmation to customer and notification to studio admin.
- Admin calendar detects concurrent scheduling conflicts on the same date.

### 4. Portfolio Galleries (Public & Private)
- Categorized folders: Wedding Photography, Reception, Pre-Wedding Shoot, Cinematic Trailers, etc.
- Video support with HTTP 206 Partial Content Range streaming.
- **Private Galleries:** Accessible only via cryptographically unguessable token (`/gallery/private/:token`). Not listed in public indexes. Admin can regenerate or revoke tokens at any time.

### 5. Secure 5-Minute OTP Password Reset
- Customers enter their registered email address.
- Backend generates random 6-digit verification code, stores only a SHA-256 hash in MongoDB with a 5-minute TTL auto-expiration index.
- Dispatched via Nodemailer SMTP.
- Prevents account enumeration and brute-force attempts (maximum 5 attempts).

---

## 4. API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Customer registration (No OTP)
- `POST /api/auth/login` — Authentication & JWT issue
- `POST /api/auth/logout` — Session termination
- `GET /api/auth/me` — Current user profile
- `PUT /api/auth/profile` — Update user profile & password
- `POST /api/auth/forgot-password` — Send 5-min OTP email
- `POST /api/auth/verify-reset-otp` — Verify OTP code
- `POST /api/auth/reset-password` — Set new password

### Packages
- `GET /api/packages` — Public active packages
- `GET /api/packages/:id` — Package details
- `POST /api/packages/admin` — Create package (Admin)
- `PUT /api/packages/admin/:id` — Update package (Admin)
- `DELETE /api/packages/admin/:id` — Delete package (Admin)

### Bookings
- `POST /api/bookings` — Submit event booking inquiry
- `GET /api/bookings/my` — Customer's own bookings
- `GET /api/bookings/:id` — Single booking details
- `GET /api/bookings/admin/all` — All bookings with search & filters (Admin)
- `PATCH /api/bookings/admin/:id/status` — Update status (Pending, Confirmed, etc.)
- `PATCH /api/bookings/admin/:id/notes` — Save internal admin notes
- `GET /api/bookings/admin/calendar` — Calendar with conflict warnings
- `GET /api/bookings/admin/dashboard/stats` — KPI metrics & analytics

### Live Event & Permanent QR
- `GET /api/live/active` — Active live event status (Public)
- `GET /api/live/photos` — Photos of active event (Public)
- `GET /api/live/photos/:photoId/download` — Download original photo (Public)
- `GET /api/live/photos/download-all` — Download ZIP of all photos (Public)
- `GET /api/live/permanent-qr` — Permanent QR data URL & SVG (Public)
- `POST /api/live/admin/start` — Start new event (Admin)
- `POST /api/live/admin/upload` — Batch upload photos with sequential IDs (Admin)
- `POST /api/live/admin/end` — End and archive event (Admin)
- `GET /api/live/admin/archives` — List archived events (Admin)
- `GET /api/live/admin/archives/:eventId` — Archived event photos (Admin)

### Galleries
- `GET /api/galleries/public` — Public gallery folders
- `GET /api/galleries/:id` — Single gallery with media
- `GET /api/gallery/private/:token` — Private gallery by token
- `GET /api/galleries/:id/download-zip` — Download gallery as ZIP
- `POST /api/galleries/admin` — Create folder (Admin)
- `PUT /api/galleries/admin/:id` — Update folder (Admin)
- `DELETE /api/galleries/admin/:id` — Delete folder & GridFS files (Admin)
- `POST /api/galleries/admin/:id/media` — Upload media to GridFS (Admin)
- `DELETE /api/galleries/admin/:id/media/:mediaId` — Delete media item (Admin)
- `POST /api/galleries/admin/:id/regenerate-token` — Regenerate private token (Admin)

### Media Streaming (GridFS)
- `GET /api/media/:fileId` — Stream image or video with range support
- `GET /api/media/:fileId/download` — Download original binary file

### Contact & Reviews
- `POST /api/contact` — Submit inquiry
- `GET /api/contact/admin` — View inquiries (Admin)
- `GET /api/testimonials` — Public reviews

---

## 5. Deployment Guide (Vercel & Render/Railway)

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. In Vercel, click **New Project** and select the repository.
3. Set **Root Directory** to `client`.
4. Configure Environment Variables in Vercel:
   - `VITE_API_BASE_URL` = `https://your-backend-service.com/api`
   - `VITE_SITE_URL` = `https://your-frontend-domain.vercel.app`
5. Click **Deploy**.

### Backend Deployment (Render, Railway, or AWS EC2)
1. Set **Root Directory** to `server`.
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Configure all environment variables from `server/.env.example` in your host settings.
5. Run `node scripts/seed.js` and `node scripts/createAdmin.js` once in the deployment shell.

---
&copy; 5Star Cinematography. Timeless Wedding Photography & Films.
