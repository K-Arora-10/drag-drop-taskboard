# 🧠 Smart Task Board

A full-stack real-time collaborative task board built using the MERN stack. It allows users to create, assign, drag & drop, and manage tasks live — with features like smart assignment, conflict resolution, activity logging, and custom UI.


---

## 🌐 Live App & Demo

- 🔗 **Live App (Frontend):** [https://drag-drop-taskboard.vercel.app](https://drag-drop-taskboard.vercel.app)
- 🔗 **Backend API:** [https://drag-drop-taskboard-4erz.onrender.com](https://drag-drop-taskboard-4erz.onrender.com)
- 🎥 **Demo Video:** [https://link-to-your-demo-video](https://link-to-your-demo-video)

---

## 🛠 Tech Stack

### 🧩 Frontend
- React (Vite)
- React Router
- React Beautiful DnD
- Tailwind CSS
- Socket.IO Client

### ⚙️ Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (authentication)
- Socket.IO Server

---

## 📦 Setup & Installation

### 🔧 Prerequisites
- Node.js v18+
- MongoDB (Atlas or Local)
- Git

---

### 🚀 Run Locally

#### 1. Clone the Repo

```bash
git clone https://github.com/your-username/smart-task-board.git
cd smart-task-board
```

#### 2. Setup Backend

```bash
cd backend
npm install
```

Create `.env` in `backend/`:

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

---

#### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create `.env` in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Now open `http://localhost:5173` in your browser.

---

## 🧩 Features & Usage Guide

| Feature                        | Description |
|-------------------------------|-------------|
| 🔐 Authentication             | Users can register/login securely via JWT |
| 🧠 Smart Assign               | Auto-assigns task to the user with least active tasks |
| 📋 Create / Edit / Delete     | Task management within a dashboard |
| 🪄 Drag & Drop Columns        | Move tasks between Todo, In Progress, Done |
| 🔁 Real-time Sync             | All changes sync across users live via Socket.IO |
| 📜 Activity Log               | Shows last 20 actions by all users |
| ⚔️ Conflict Handling         | Detects simultaneous task updates and alerts user |
| 🚪 Logout                     | Securely logs the user out |
| 📱 Responsive UI              | Optimized for desktop & mobile |

---

## 🧠 Smart Assign Logic

Each task can be manually assigned or auto-assigned using **Smart Assign**.

> Smart Assign selects the user who currently has the **least number of active (non-done) tasks**.

### Logic Steps:
1. Count how many tasks each user has where `status !== 'done'`.
2. Find the user with the lowest count.
3. Assign the task to them automatically.

This ensures **balanced workload distribution** in teams.

---

## ⚔️ Conflict Handling Logic

If two users try to update the same task at the same time:

1. Backend compares incoming `updatedAt` timestamp with DB’s `updatedAt`.
2. If there's a mismatch:
   - A `409 Conflict` response is returned.
   - Frontend alerts the user:  
     _“Conflict detected — someone else updated this task”_.

This prevents **silent overwrites** in collaborative environments.

---

## 📂 Project Structure

```
smart-task-board/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── server.js
├── frontend/
│   ├── pages/
│   ├── context/
│   ├── api/
│   └── App.jsx
```

---

## 📝 License

This project is for educational and evaluation purposes only.
