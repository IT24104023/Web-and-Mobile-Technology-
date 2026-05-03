# Dent AI - Smart Dental Clinic Management System

A premium, full-stack MERN application designed for modern dental clinic management. This system provides a unified platform for patients, doctors, and administrators with a focus on seamless scheduling, prescription management, and emergency care.

## 🚀 Deployment Status

- **Frontend (Web):** Deployed on **Vercel**
- **Backend (API):** Deployed on **Adaptable.io**
- **Mobile App:** Built with **React Native / Expo**

---

## ✨ Features

### 👤 Patient Portal
- **Smart Dashboard:** View upcoming appointments and health status.
- **Appointment Booking:** Real-time scheduling with automatic 24-hour cancellation rules.
- **Digital Prescriptions:** Access medical history and prescriptions on the go.
- **Feedback System:** Rate and review services to improve clinic quality.

### 👨‍⚕️ Doctor Dashboard
- **Patient Management:** Track patient history and ongoing treatments.
- **Prescription Issuer:** Generate and manage digital prescriptions.
- **Schedule Overview:** View daily appointments and availability.

### 🔑 Admin Panel
- **User Management:** Control access for doctors, staff, and patients.
- **System Analytics:** Monitor clinic performance and feedback.
- **Emergency Management:** Manage emergency contacts and protocols.

---

## 🛠 Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS (Modern UI/UX)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Mobile:** React Native, Expo
- **Authentication:** JSON Web Tokens (JWT) with secure password hashing.

---

## 📁 Project Structure

```text
├── backend/            # Express API Server
├── frontend-web/       # React Web Application
├── frontend-mobile/    # React Native Mobile App
├── api/                # Vercel Serverless Entry (Proxy)
├── package.json        # Root Workspace Configuration
└── vercel.json         # Vercel Deployment Settings
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js (v18+)
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
   # Start Backend
   npm start --workspace=backend

   # Start Web Frontend
   npm run dev --workspace=frontend-web
   ```

---

## 🌍 Hosting Configuration

### Backend (Adaptable.io)
The backend is configured to run from the root using the `npm start` command. 
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Frontend (Vercel)
The web frontend is deployed as a static site with an API proxy.
- **Build Command:** `npm run build --workspace=frontend-web`
- **Output Directory:** `frontend-web/dist`

---

## 📄 License
This project is part of the WMT (Web and Mobile Technology) Module. All rights reserved.
