# SnapLink - URL Shortener with Analytics

A full-stack URL Shortener application where users can create short links for long URLs and track basic analytics such as click count, creation date, and recent visits.

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account or local MongoDB

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd url-shortener
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://gopika2302047_db_user:x5zV0naL4PVkYvsk@cluster0.7gbb5aa.mongodb.net/urlshortener
JWT_SECRET=your_secret_key_here
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173` in your browser.

---

## Assumptions Made

1. Each user can only view and manage their own shortened URLs — no shared or admin view.
2. Short codes are 7 characters long by default, generated using nanoid. Custom aliases support letters, numbers, hyphens, and underscores only.
3. Deleting a URL also deletes all its associated click records.
4. Expired links remain visible on the dashboard but redirect visitors to a branded "Link Expired" page.
5. Click analytics store IP address, user agent, and referer directly from HTTP request headers — no external geolocation service is used.
6. Passwords are hashed using bcryptjs with 10 salt rounds before storing in the database.
7. JWT tokens expire after 7 days. On expiry the user is automatically redirected to the login page.
8. The `BASE_URL` environment variable controls what the full short URL looks like in API responses.

---

## Planning Document

### App Planning

The application was planned in the following stages:

**Stage 1 — Feature Breakdown**

Mandatory features identified:
- User authentication (signup, login, protected routes)
- URL shortening with unique short code generation
- Server-side redirect handling
- User dashboard (view, delete, copy links)
- Analytics tracking (click count, timestamps, recent visits)

Bonus features identified:
- Custom alias for short URLs
- QR code generation with download
- Expiry date for links
- 7-day click trend chart
- Edit destination URL
- Search/filter links

**Stage 2 — Data Modeling**

Three MongoDB collections were designed:

- `users` — stores name, email, hashed password
- `urls` — stores original URL, short code, owner reference, click counter, custom alias, expiry date, active status
- `clicks` — one document per redirect event, stores timestamp, IP, user agent, referer

**Stage 3 — API Design**

REST API grouped by resource:
- `/api/auth` — signup, login, get current user
- `/api/urls` — create, list, delete, update URLs
- `/api/analytics` — summary stats, per-link analytics with 7-day aggregation
- `/:shortCode` — redirect route mounted last to avoid conflicts

**Stage 4 — Frontend Architecture**

- React Context for global authentication state
- Axios interceptor to automatically attach JWT token to every request
- Automatic redirect to login on 401 response
- Page components: Dashboard, Analytics
- Reusable components: Navbar, UrlCard, QRModal
- Recharts AreaChart for the 7-day click trend visualization

**Stage 5 — Security**

- Passwords hashed with bcryptjs (10 salt rounds) in Mongoose pre-save hook
- JWT signed with secret key, expires in 7 days
- All URL and analytics routes protected with auth middleware
- Every database query filters by `user: req.user._id` so users can only access their own data
- URL validation on both frontend (regex) and backend (validator.isURL)
- Custom alias validated with regex to prevent injection

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  BROWSER  (React + Vite)                     │
│                                                              │
│   Login / Signup   Dashboard   Analytics Page   QR Modal    │
│                                                              │
│   AuthContext — JWT stored in localStorage                   │
│   Axios — auto-injects Bearer token on every request         │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP REST
┌──────────────────────────▼───────────────────────────────────┐
│               EXPRESS SERVER  (Node.js)                      │
│                                                              │
│  /api/auth          /api/urls         /api/analytics         │
│  POST /signup       POST /            GET /summary           │
│  POST /login        GET /             GET /:shortCode        │
│  GET  /me           DELETE /:id                              │
│                     PUT /:id                                 │
│                                                              │
│  GET /:shortCode  (redirect — mounted last)                  │
│  → lookup → check expiry → record click → res.redirect()    │
│                                                              │
│  authMiddleware — jwt.verify() on all protected routes       │
└──────────────────────────┬───────────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼───────────────────────────────────┐
│                      MONGODB                                 │
│                                                              │
│   users            urls                clicks               │
│   ─────            ────                ──────               │
│   _id              _id                 _id                  │
│   name             user (ref)          url (ref)            │
│   email            originalUrl         shortCode            │
│   password         shortCode (unique)  clickedAt            │
│   createdAt        customAlias         userAgent            │
│                    totalClicks         ipAddress            │
│                    expiresAt           referer              │
│                    isActive                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## Demo Video

https://www.loom.com/share/fa197b115c5149cd8a04735819fbae13

---
## Sample Output

### Login Page


![Login](./screenshot/login.png)



### Sign In Page


![Signup](./screenshot/signin.png)



### Dashboard


![Dashboard](./screenshot/dashboard.png)



### Analytics Page


![Analytics](./screenshot/analytics.png)



### QR Code


![QR Code](./screenshot/Qr.png)



### Frontend


![Frontend](./screenshot/frontend.png)



### Backend Logs


![Backend](./screenshot/backend%20.png)



### URLs Database


![URLs DB](./screenshot/urldb.png)



### Users Database


![Users DB](./screenshot/userdb.png)



### Clicks Database


![Clicks DB](./screenshot/clicksdb.png)

This project is a part of a hackathon run by https://katomaran.com
