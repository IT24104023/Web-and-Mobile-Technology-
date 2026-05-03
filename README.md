# Dent AI - Smart Dental Clinic Management System

A premium, full-stack MERN application designed for modern dental clinic management. This system provides a unified platform for patients, doctors, and administrators with a focus on seamless scheduling, prescription management, and emergency care.

## 🚀 Deployment Status

- **Web Portal (Render):** [Live Site on Render](https://web-and-mobile-technology.onrender.com/)
- **Web Portal (Vercel):** [Live Site on Vercel](https://web-and-mobile-technology.vercel.app/login)
- **Mobile App:** Built with **React Native / Expo**

---

## ✨ Features

### 👤 Patient Portal
- **Smart Dashboard:** View upcoming appointments and health status.
- **Appointment Booking:** Real-time scheduling with automatic 24-hour cancellation rules.
- **Digital Prescriptions:** Access medical history and prescriptions on the go.
- **Emergency Care:** Rapid access to emergency contacts and clinic details.

### 👨‍⚕️ Doctor Dashboard
- **Patient Management:** Track patient history and ongoing treatments.
- **Prescription Issuer:** Generate and manage digital prescriptions.
- **Schedule Overview:** View daily appointments and availability.

### 🔑 Admin Panel
- **User Management:** Control access for doctors, staff, and patients.
- **Clinic Inventory:** Manage medicines and medical supplies.
- **System Analytics:** Monitor clinic performance and feedback.

---

## 🛠 Tech Stack

- **Frontend:** React.js, Vite, Vanilla CSS (Premium Aesthetics)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Mobile:** React Native, Expo
- **Authentication:** JWT (JSON Web Tokens)

---

## 📁 Project Structure

```text
├── backend/            # Express API Server
├── frontend-web/       # React Web Application (Vite)
├── frontend-mobile/    # React Native Mobile App (Expo)
├── render.yaml         # Render Deployment Blueprint
├── vercel.json         # Vercel Deployment Settings
└── package.json        # Root Workspace Configuration
```

---

## 🛠 Quick Deployment Guide (For New Users)

If you have downloaded this project as a **ZIP file**, follow these steps to deploy it to your own accounts:

### 1. Database Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Database Access** and create a user with "Read and Write to any database" permissions.
3. Go to **Network Access** and add IP address `0.0.0.0/0` (Allow access from anywhere).
4. Get your **Connection String** (e.g., `mongodb+srv://...`).

### 2. Deployment to Render (Recommended)
1. Push your code to a **GitHub Repository**.
2. Log in to [Render](https://render.com/).
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` file. Click **Create New Resources**.
6. In the Render Dashboard, go to your Web Service > **Environment**.
7. Add the following **Environment Variables**:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A random strong string (e.g., `my_ultra_secure_secret`).
   - `PORT`: `10000`
   - `NODE_ENV`: `production`

### 3. Deployment to Vercel (Alternative)
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Vercel will detect the `vercel.json` and root configuration.
5. In **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Your secret key.
6. Click **Deploy**.

---

## ⚙️ Local Development

### Prerequisites
- Node.js (v20+)
- MongoDB Atlas Account

### Setup
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/IT24104023/Web-and-Mobile-Technology-.git
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```

4. **Run the Application:**
   ```bash
   # Start everything (Workspaces)
   npm run dev
   ```

---

## 🌍 Hosting Configuration

### Unified Deployment (Render - Recommended)
The project is optimized for a unified deployment where the backend serves the frontend.
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `./`

### Frontend (Vercel)
- **Build Command:** `npm run build --workspace=frontend-web`
- **Output Directory:** `frontend-web/dist`

---

## 📄 License
This project is part of the WMT (Web and Mobile Technology) Module. All rights reserved.
