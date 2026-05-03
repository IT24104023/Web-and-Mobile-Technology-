🦷 Smart Clinic – AI-Powered Dental System
Y2S2 · Group: WE.AI.01.02.G14
A full-stack AI-powered smart clinic system for managing patient records, dental diagnostics, appointments, prescriptions, and medical services.
________________________________________
🔗 GitHub Repository
👉 https://github.com/IT24100022/Y2S2.WE.AI.01.02.G14_Smart_Clinic.git
________________________________________
👨‍💻 Team
Student ID	Name	Module
IT24104023	Zakee M.N.M	User Profile Management
IT24103679	Kumarasiri A.Y.D	Doctor’s Digital Prescription
IT24101772	Thathsala I.G.D	Medication Ordering & E-Payment
IT24100052	Ahamed M. S. A	Medical Resource & History Vault
IT24100022	Pavesh T.	Feedback & Rating
IT24103679	Ilham M. H. M	Appointment Scheduling
IT24103652	Jayasooriya G.D.R.M	Emergency Contact Management
________________________________________
📌 Project Overview
This system is a comprehensive AI-powered dental clinic platform that integrates:
•	Patient management
•	Medical record storage
•	AI-based dental diagnostics
•	Appointment scheduling
•	Prescription handling
•	Medication ordering & payment simulation
•	Emergency contact management
It supports multiple roles:
•	Patient
•	Doctor
•	Admin
________________________________________
🏗️ Project Structure
smart-clinic/
│
├── client/                     # React frontend (Vite / React Native)
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   └── services/
│
├── server/                     # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
└── ai/                         # AI modules (Python)
    ├── predictiveAnalytics.py
    └── treatmentSimulation.py
________________________________________
⚙️ Tech Stack
Layer	Technology
Frontend	React / React Native
Backend	Node.js + Express
Database	MongoDB Atlas
Authentication	JWT + bcrypt
AI/ML	Python (Diagnostic Engine)
API	RESTful HTTP APIs
File Upload	Multer
________________________________________
🚀 Core Features
🔐 Authentication & User Management
•	Register, login, update profile
•	JWT-based authentication
•	Role-based access (Patient / Doctor / Admin)
________________________________________
🧠 AI Dental Diagnostic Engine
•	Upload X-rays or dental images
•	Detect:
o	Caries
o	Malocclusion
o	Oral wounds
o	Calculus
•	Generate reports with treatment suggestions
________________________________________
📁 Medical Resource & History Vault
•	Store:
o	X-rays
o	Photos
o	Reports
o	Schedules
•	Soft-delete system (no permanent data loss)
________________________________________
📅 Appointment Scheduling
•	Book doctor appointments
•	Prevent double bookings
•	View history & reschedule
________________________________________
💊 Digital Prescription System
•	Doctors create prescriptions
•	Editable drafts
•	Linked with medication orders
________________________________________
💳 Medication Ordering & Payment
•	Order medicines from prescriptions
•	Payment simulation (no real gateway)
•	Admin verification workflow
________________________________________
⭐ Feedback & Rating
•	Rate doctors (1–5 stars)
•	Write reviews
•	View doctor rating summaries
________________________________________
🚨 Emergency Contact Management
•	Add/update emergency contacts
•	Set primary contact
•	Quick access during emergencies
________________________________________

⚡ Installation & Setup
1. Clone Repository
git clone https://github.com/IT24100022/Y2S2.WE.AI.01.02.G14_Smart_Clinic.git
cd Y2S2.WE.AI.01.02.G14_Smart_Clinic
________________________________________
2. Backend Setup
cd server
npm install
npm run dev
Create .env file:
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
________________________________________

3. Frontend Setup
cd client
npm install
npm run dev
________________________________________
🔄 System Workflow
User Uploads Dental Image
        ↓
AI Diagnostic Engine
        ↓
Detection Results Generated
        ↓
Stored in Medical Vault
        ↓
Doctor Reviews & Creates Prescription
        ↓
Patient Orders Medication
        ↓
Admin Verifies Payment
        ↓
Order Confirmed
________________________________________


👥 User Roles
Role	Access
Patient	Book appointments, view records, order meds
Doctor	Diagnose, prescribe, manage patients
Admin	Manage system, verify payments, oversee data
________________________________________
📌 Notable Highlights
•	AI-powered multi-condition diagnosis
•	Secure JWT authentication
•	Full CRUD operations across all modules
•	Soft-delete data protection
•	Realistic payment simulation
•	Modular scalable architecture
________________________________________
📄 License
This project is developed for academic purposes (Y2S2 – SLIIT IT2021 AIML) and is not intended for commercial use.

