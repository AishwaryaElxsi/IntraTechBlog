# IntraTech Blogger Monolithic Application

## Overview

The IntraTech Blogger Monolithic Application is a unified internal blogging platform incorporating user management, content management, engagement features (comments/reactions), search, administration, Company SSO integration, and internal email notifications—all accessible via a modern, visually appealing web interface.

## Features

- **User Management**: Profile, registration (via SSO), roles (admin/user), passwordless authentication.
- **Blog Content Management**: Create, edit, publish, and delete posts with rich-text formatting, image upload.
- **Engagement**: Comments, likes, reactions, internal notifications.
- **Search & Tags**: Full-text search, filter posts by tags/categories.
- **Administration**: User & post moderation, analytics dashboard.
- **SSO Integration**: Authenticate via Company Identity Provider.
- **Internal Email Integration**: Notification on events (posts, comments, admin actions).
- **Secure, Scalable Design**: Role-based permissions, modern frameworks, containerized for deployment.
- **Modern UI/UX**: Responsive design, accessible, attractive layouts, and typography.

## Tech Stack

- **Backend**: Node.js (Express), MongoDB (with Mongoose), JWT, SSO (OpenID Connect).
- **Frontend**: React, styled-components, Material UI, Axios, React Router.
- **DevOps**: Docker, docker-compose.
- **Testing**: Jest (backend & frontend).

---

## Quickstart

1. `docker-compose up --build`
2. Access the app at `http://localhost:3000` (frontend)
3. Backend API runs at `http://localhost:5000`

---

## Structure

```shell
/
├── backend/         # Node.js/Express API, business logic, MongoDB models
├── frontend/        # React UI, static assets
├── docker-compose.yml
├── Dockerfile       # Root Dockerfile (if needed)
└── README.md
```

---

Documentation for each component/module is provided in respective directories.
