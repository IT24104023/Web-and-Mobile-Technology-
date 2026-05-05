# Dent AI: Integrated Clinic Management System

## 🌟 Project Overview
**Dent AI** is a comprehensive, cross-platform MERN-stack application designed to bridge the gap between patients, healthcare providers, and clinical administrators. The system provides a seamless experience for managing dental and medical appointments, prescriptions, medication ordering, and emergency coordination through a unified Web and Mobile ecosystem.

---

## 🛠️ Technical Stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Web Frontend**: React.js, Tailwind CSS (Vanilla CSS & Modern UI Components)
- **Mobile App**: React Native, Expo, SecureStore
- **Authentication**: JSON Web Tokens (JWT), Bcrypt Password Hashing
- **Deployment**: Render (Backend & Static Hosting), Vercel (Web Frontend)

---

## 👥 User Roles & Features

### 1. Patient Experience (Web & Mobile)
Patients are provided with a "Smart Clinic" interface to manage their health journey autonomously.
- **Appointment Management**:
    - Real-time booking with 30-minute slot intervals.
    - View upcoming and past appointments.
    - Reschedule or cancel appointments within a 24-hour window.
- **Prescription & Pharmacy**:
    - Digital access to prescriptions issued by doctors.
    - Direct medication ordering based on active prescriptions.
    - Tracking order status (Pending, Fulfilled, etc.).
- **Safety & Profile**:
    - **Emergency Contacts**: Manage primary and secondary emergency contacts with real-time sync.
    - **Feedback System**: Submit reviews for app usability and clinical consultations.
    - **Account Management**: Update personal profiles, change passwords, and safely deactivate or delete accounts.

### 2. Doctor Portal (Web)
A specialized workspace for healthcare professionals to manage their practice efficiently.
- **Dashboard Overview**: Daily appointment stats and patient activity overview.
- **Clinical Management**:
    - **Confirm/Complete Appointments**: Direct control over the clinic schedule.
    - **Digital Prescriptions**: Create and issue prescriptions using the clinic's medicine inventory.
    - **Patient Records**: View patient history and emergency contact information for safety.
- **Interaction**: View patient feedback and provide doctor-replies to consultation reviews.

### 3. Administrator Dashboard (Web)
The central hub for managing system-wide operations and data integrity.
- **User Management**:
    - Control user statuses (Active/Inactive).
    - Manage doctor specializations and clinic details.
- **Inventory Management**:
    - Maintain the medicine database (Unit prices, default dosages, descriptions).
- **System Oversight**:
    - Global view of all appointments and clinical orders.
    - Comprehensive management of emergency contact records across the entire database.
    - Admin-level moderation of patient feedback.

---

## 🚀 Key System Features

### 🔄 Multi-Platform Sync
Changes made on the mobile app (e.g., updating an emergency contact) are instantly reflected on the web portal, ensuring data consistency across all devices.

### 🛡️ Security & Privacy
- **JWT Protection**: All sensitive API endpoints are protected by token-based authentication.
- **Cascade Deletion**: When a user deletes their account, the system automatically wipes all associated data (prescriptions, orders, feedback) to respect data privacy (GDPR compliance approach).
- **File Security**: Profile images are handled securely through a dedicated upload middleware.

### 🎨 Design Philosophy
The system follows a **Premium Teal-Themed** design system, utilizing "Plus Jakarta Sans" typography and modern UI principles like:
- **Glassmorphism** navigation elements.
- **Dynamic Micro-animations** for button interactions and loading states.
- **Dark Mode Compatibility** across the web interface.

---

## 📁 Repository Structure
- `/backend`: Express API server, MongoDB models, and business logic.
- `/frontend-web`: React application with Vite, organized by pages and reusable components.
- `/frontend-mobile`: Expo-based React Native application for iOS and Android.
- `/uploads`: Storage for profile images and clinical documents.
