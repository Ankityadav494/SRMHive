# SyncNest (React + Vite + Node.js)

A collaboration platform for posting/team-building projects with realtime chat and notifications.

## Key Features

- User auth (register/login) with JWT
- Project CRUD (create, list, view detail, delete)
- Application workflow (apply, owner accept/reject)
- Realtime notifications using Socket.io
- Realtime team chat with persistent message history
- Backend data persistence with MongoDB
- API-first architecture (client uses backend endpoints directly, no localStorage state)
- Error handling and UX states (loading/submitting/empty)

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Socket.io-client
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.io, JSON Web Token, bcrypt

## Folder Structure

- `Client/` - React app
- `server/` - Express API app

## Setup

1. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
2. Create `.env` in `server/`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/devconnect
   JWT_SECRET=supersecretkey
   ```
3. Start backend:
   ```bash
   npm run dev
   ```
4. Install frontend dependencies:
   ```bash
   cd ../Client
   npm install
   ```
5. Start frontend:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/auth/register` (name, email, password)
- `POST /api/auth/login` (email, password)
- `GET /api/auth/profile` (authenticated)
- `PUT /api/auth/profile` (authenticated)

- `GET /api/projects`
- `POST /api/projects` (authenticated)
- `GET /api/projects/:id`
- `DELETE /api/projects/:id` (authenticated, owner)

- `POST /api/applications/:projectId` (authenticated)
- `GET /api/applications/me` (authenticated)
- `GET /api/applications/project/:projectId` (authenticated)
- `PUT /api/applications/:id` (authenticated)

- `GET /api/notifications` (authenticated)
- `PUT /api/notifications/:id` (authenticated)

- `GET /api/messages/project/:projectId` (authenticated)
- `POST /api/messages/project/:projectId` (authenticated)

## Socket.io Events

- `joinProject` - join a project chat room
- `receiveMessage` - incoming real-time message
- `joinUser` - join notification channel for user
- `newNotification` - incoming real-time notification

## UI/UX Notes

- Navbar updates notification count in real-time
- Team chat loads history from DB, appends live messages
- Error messages displayed via inline alert text
- Loading & submitting states are present for API actions

## Screenshots

*(Add your own screenshots of dashboard, project listing, team chat, notifications here)*

## Notes

- All previous localStorage usage has been removed in favor of backend-driven state
- Clear separation between server and client folders enables focused dev workflows
