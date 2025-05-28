# IntraTech Blogger Monolithic Application

## Overview

IntraTech Blogger is an internal, all-in-one blogging platform for companies, focused on user management, blog content creation, engagement features (comments, reactions), search, administration, SSO integration, and internal email notifications. The application features a modern, responsive web interface and uses easy-to-understand, local file-based storage—no separate database or Docker setup required.

## Features

- **User Management:** SSO-based and local registration, profile, roles (admin/user), passwordless login.
- **Blog Management:** Rich-text editing, create/edit/delete/publish, image upload.
- **Engagement:** Comments, likes (“claps”), reactions/bookmarks, internal notifications.
- **Search & Tags:** Full-text search, filter by tags/categories.
- **Admin Tools:** Post/user moderation, analytics dashboard.
- **Company SSO Integration:** OpenID Connect support (optional/configurable).
- **Internal Email Notifications:** Events (comments, posts, admin actions) sent via company email.
- **Secure, Modern UI:** Role-based permissions, responsive and accessible design.

---

## Architecture and Data Storage

- **Backend:** Node.js (Express) REST API.  
  **Data is stored in a single JSON file** (`backend/data/db.json`) which persists all users, posts, comments, and notifications.  
  No MongoDB or external databases are required.
- **Frontend:** React with Material UI, styled-components, Axios, React Router.

---

## Application Structure

```
/
├── backend/         # Node.js Express backend (API, file storage, business logic)
│   ├── src/
│   ├── data/db.json # All persistent data lives here (auto-created on first run)
├── frontend/        # React SPA frontend
└── README.md
```

---

## Quick Start

### 1. Backend (API)

**Requirements:**  
- Node.js v18+  
- npm

**Setup & Run:**

```sh
cd backend
npm install
npm run dev     # Development (nodemon), or:
npm start       # Production

# API runs on http://localhost:5000 by default
```

- On first run, the backend auto-creates `backend/data/db.json` to persist all app data.
- **Data location:** `backend/data/db.json` (do not delete unless you want to wipe all application content).

**Environment:**
- By default, `.env` (optional) can be used to override:
    - `PORT` (default: 5000)
    - `JWT_SECRET` (default: "changeme-super-secret")
    - SSO/OpenID settings (see backend `.env.example` if present)

### 2. Frontend (Web App)

**Requirements:**  
- Node.js v16+  
- npm

**Setup & Run:**  
```sh
cd frontend
npm install
npm start   # Starts at http://localhost:3000
```

- The frontend expects the backend API at `http://localhost:5000`.
- You may adjust the API URL via `REACT_APP_API_URL` in a `.env` file inside `frontend/`, or by editing the proxy in the development setup as needed.

---

## Running Both Together

- **Development:** Start the backend and frontend in separate terminal windows (see above).
- **Data Persistence:** All user, blog, and comment data is stored in `backend/data/db.json` on the filesystem.

---

## Customization & Configuration

- **SSO Integration:**  
  - Configure company SSO details in backend `.env` (`OIDC_ISSUER`, `OIDC_CLIENT_ID`, etc).
  - For local tests, registration/login works without SSO.
- **Email Notifications:**  
  - Configure SMTP/mail settings in backend `.env` as required for real notifications.
- **Data Management:**  
  - **Backup:** Copy `backend/data/db.json` to make backups.
  - **Reset:** Delete `db.json` (will wipe all users/content/posts/comments).

---

## Deployment Notes

- **No Docker Required:**  
  - This setup is designed for simple development environments. No containerization or docker-compose is needed for local runs.
- **Production:**  
  - For containerized/cloud or staging deployments, you may still build a custom Dockerfile as needed. By default, the backend and frontend can be run as system processes or via Process Manager (PM2, systemd, etc).
  - **Storage:** The backend writes to the local filesystem—ensure persistent volumes or backups if running in containers or ephemeral environments.

---

## Data Location

- **File:** `backend/data/db.json`
- **Collections stored:**  
  - `users`  
  - `posts`  
  - `comments`  
  - `notifications`
- **File is automatically created and updated as the app is used.**

---

## Additional Documentation

- Each feature and module is documented in code comments and in source subdirectories.
- For major configuration or environment variable options, see backend `.env.example` (if present) or code comments in `backend/src`.

---

## Troubleshooting

- **Data Not Saving:**  
  - Ensure backend process has filesystem write permission to `backend/data/`.
- **Port Conflicts:**  
  - The frontend uses port 3000; backend uses 5000 by default. Adjust via `.env` as needed.
- **API Access Errors:**  
  - Ensure both apps run and the frontend is pointed at the correct backend API URL.

---

## License

This application is provided for internal company use. See individual source files for detailed license headers.
