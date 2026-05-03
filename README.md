# Dent AI - Smart Dental Clinic Management System

A premium, full-stack MERN application designed for modern dental clinic management. This system provides a unified platform for patients, doctors, and administrators with a focus on seamless scheduling, prescription management, and emergency care.

## 🚀 Deployment Status

- **Frontend (Web):** Deployed on **Vercel** or **Render**
- **Backend (API):** Deployed on **Render** (Unified) or **Adaptable.io**
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
