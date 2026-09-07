# 🛒 ShopNest — Production Fullstack E-Commerce Web Application

A feature-complete, responsive E-Commerce application built with **React 18**, **Node.js**, **Express**, **MongoDB**, **Stripe Payments**, and **WebSockets**.

---

## 🌐 Live Application Links

- 🖥️ **Live Web Application (Vercel):** [https://shopnest-app.vercel.app](https://your-app.vercel.app)
- ⚙️ **Live REST API (Render):** [https://shopnest-api.onrender.com](https://your-api.onrender.com)

---

## 🛠️ Fullstack Tech Stack

### **Frontend (React)**
- **Framework:** React 18 (Vite)
- **Routing:** React Router DOM v6
- **State Management:** React Context API (`AuthContext`, `CartContext`, `SocketContext`)
- **HTTP Client:** Axios (with automatic JWT Interceptors)
- **Payments UI:** Stripe Elements (`@stripe/react-stripe-js`)
- **Real-Time:** Socket.io Client
- **Icons:** Lucide React

### **Backend (Node.js & Express)**
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens), Bcrypt.js, Passport.js (Google OAuth 2.0)
- **Payments:** Stripe API (Payment Intents & Webhooks)
- **Real-Time:** Socket.io Engine (Live Order Alerts & Chat Rooms)
- **File Uploads:** Multer
- **Security:** Helmet, CORS, Express-Rate-Limit

---

## ✨ Core Key Features

- 🔐 **Authentication & Security:** JWT-based user login, registration, password hashing, and Google OAuth 2.0 SSO.
- 🛍️ **Product Catalog & Controls:** Server-side pagination, multi-field category filtering, search, and price range filters.
- 🛒 **Persistent Shopping Cart:** Fully synchronized with MongoDB for logged-in users, featuring quantity adjustments and subtotal calculation.
- 💳 **Stripe Payment Gateway:** Integrated Checkout flow using Stripe Payment Intents, test card processing, and order confirmation.
- 📦 **Order Tracking & Management:** Order history dashboard for customers with status tracking (`Pending`, `Processing`, `Shipped`, `Delivered`).
- ⭐️ **Product Reviews & Ratings:** Star-rating submission system (1-5 stars) with customer review listings.
- ⚡ **Real-Time WebSockets:** Live order notification alerts for admins and real-time support chat room capabilities.

---

## 📁 Monorepo Project Structure

```text
Fullstack-ecommerce/
├── 📁 backend/                # Node.js + Express REST API & WebSockets
│   ├── 📁 config/             # DB, Passport & Socket setup
│   ├── 📁 controllers/        # Business logic for Auth, Products, Cart, Orders, Payments
│   ├── 📁 middleware/         # Auth guards, Multer upload, Rate limits
│   ├── 📁 models/             # Mongoose schemas (User, Product, Cart, Order, Review)
│   ├── 📁 routes/             # Express REST endpoints
│   ├── 📄 app.js              # Express configuration
│   └── 📄 server.js           # Server listener
│
├── 📁 frontend/               # React + Vite Single Page Application
│   ├── 📁 src/
│   │   ├── 📁 api/            # Centralized Axios client
│   │   ├── 📁 components/     # Reusable UI components (Navbar, ProductCard, Modals)
│   │   ├── 📁 context/        # Auth, Cart, and Socket context providers
│   │   ├── 📁 pages/          # Products, Cart, Checkout, Profile, Orders
│   │   ├── 📁 routes/         # ProtectedRoute & AdminRoute guards
│   │   └── 📄 App.jsx         # Main router configuration
│   └── 📄 vercel.json         # Vercel SPA routing configuration
│
└── 📄 README.md               # Master documentation