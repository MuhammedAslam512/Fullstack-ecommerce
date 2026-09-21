# 🛒 ShopNest — Production Fullstack E-Commerce Platform

A production-ready, feature-complete Fullstack E-Commerce Application & Microservices Ecosystem built with **React 18**, **Node.js**, **Express**, **MongoDB**, **PostgreSQL (Prisma ORM)**, **Redis**, **BullMQ**, **Docker**, and **Swagger UI**.

---

## 🌐 Live Production Links

- 🖥️ **Live Web Application (Vercel):** [https://donglify-app.vercel.app](https://donglify-app-git-main-muhammed-aslams-projects-5c73c935.vercel.app/)
- ⚙️ **Live REST API (Render):** [https://donglify-ecommerce-api.onrender.com](https://donglify-ecommerce-api.onrender.com)
- 📜 **Interactive Swagger API Docs:** [https://donglify-ecommerce-api.onrender.com/api-docs](https://donglify-ecommerce-api.onrender.com/api-docs)
- 🌐 **GraphQL Apollo Sandbox:** [https://donglify-ecommerce-api.onrender.com/graphql](https://donglify-ecommerce-api.onrender.com/graphql)
---

## 🛠️ Complete Tech Stack

### **Frontend (React)**
- **Framework:** React 18 (Vite)
- **Routing:** React Router DOM v6
- **State Management:** React Context API (`AuthContext`, `CartContext`, `SocketContext`)
- **HTTP Client:** Axios (Centralized with JWT Request/Response Interceptors)
- **Payments UI:** Stripe Elements (`@stripe/react-stripe-js`)
- **Real-Time:** Socket.io Client
- **Analytics:** Recharts (Area & Bar Charts)
- **Icons:** Lucide React

### **Backend (Node.js & Express)**
- **Runtime & Framework:** Node.js (v20) & Express.js
- **Databases:** 
  - **NoSQL:** MongoDB Atlas (Mongoose ODM)
  - **SQL:** PostgreSQL (Prisma ORM on Neon.tech Cloud)
- **Caching & Queues:** Upstash Cloud Redis & BullMQ Background Job Workers
- **Authentication:** JWT (JSON Web Tokens), Bcrypt.js, Passport.js (Google OAuth 2.0)
- **API Specs:** GraphQL (Apollo Server v4) & REST (OpenAPI 3.0 via Swagger UI)
- **Payments:** Stripe API (Payment Intents & Webhooks)
- **Real-Time:** Socket.io Engine (Live Order Alerts & Support Rooms)
- **Emails:** Nodemailer (SMTP / Gmail) & BullMQ Async Queue
- **File Uploads:** Multer (Disk Storage)
- **Security:** Helmet, CORS, Express-Rate-Limit, Express-Mongo-Sanitize, HPP

### **DevOps & Testing**
- **Containerization:** Docker & Docker Compose (Multi-container orchestration)
- **Automated Testing:** Jest & Supertest (Unit & Integration Tests)
- **In-Memory Testing DB:** `mongodb-memory-server`
- **CI/CD Pipeline:** GitHub Actions Automated Workflows

---

## 📅 30-Day Curriculum & Features Completed

| Week | Days | Key Modules & Accomplishments |
| :--- | :--- | :--- |
| **Week 1** | **Days 01–07** | Node.js Core, Express Architecture, MongoDB Atlas, JWT Auth, Multer File Uploads, Security (Helmet, CORS, Rate-Limiting), Full E-Commerce APIs, & Render Deployment. |
| **Week 2** | **Days 08–14** | Nodemailer Password Recovery, Google OAuth 2.0 (Passport.js), Stripe Card Payments & Webhooks, Socket.io WebSockets, PostgreSQL & Prisma ORM, Jest/Supertest Automated Testing, & Docker/Docker Compose. |
| **Week 3** | **Days 15–21** | Monorepo Setup (`backend/` + `frontend/`), Vite React SPA, Centralized Axios Client, Protected Route Guards, Product Catalog Filters, Shopping Cart DB Sync, Stripe UI Checkout, Customer Order Tracking, Star Reviews, & Vercel Deployment. |
| **Week 4** | **Days 22–30** | Full Admin Control Panel (Products, Orders, Categories, Users), MongoDB Aggregation & Recharts Sales Analytics, Redis Caching, BullMQ Background Job Workers, GraphQL Apollo Server, Microservices Architecture, GitHub Actions CI/CD Pipeline, Security Hardening (NoSQL Injection Defense), & OpenAPI 3.0 Swagger Docs (`/api-docs`). |

---

## 📁 Monorepo Project Structure

```text
Fullstack-ecommerce/
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 ci.yml            # GitHub Actions CI/CD Pipeline
│
├── 📁 backend/                  # Node.js + Express REST & GraphQL API
│   ├── 📁 config/               # DB, Redis, Passport, Socket & Swagger Setup
│   ├── 📁 controllers/          # Business logic for Auth, Users, Products, Cart, Orders, Payments, Reviews
│   ├── 📁 graphql/              # GraphQL TypeDefs & Resolvers
│   ├── 📁 middleware/           # Auth guards, Cache, Upload, Security Sanitizers
│   ├── 📁 models/               # Mongoose Schemas (User, Product, Cart, Order, Review, Category)
│   ├── 📁 queues/               # BullMQ Producer Queues
│   ├── 📁 routes/               # Express REST Endpoints
│   ├── 📁 utils/                # Nodemailer Helper
│   ├── 📁 workers/              # BullMQ Background Job Workers
│   ├── 📄 app.js                # Express App & Security Configuration
│   ├── 📄 server.js             # HTTP, WebSockets & BullMQ Listener
│   └── 📄 Dockerfile            # Production Docker Image Configuration
│
├── 📁 frontend/                 # React 18 + Vite SPA
│   ├── 📁 src/
│   │   ├── 📁 api/              # Centralized Axios Client
│   │   ├── 📁 components/       # Navbar, ProductCards, Modals, Admin Charts, Sidebar
│   │   ├── 📁 context/          # AuthContext, CartContext, SocketContext
│   │   ├── 📁 pages/            # Products, Cart, Checkout, Profile, Orders, Admin Panel
│   │   └── 📁 routes/           # ProtectedRoute & AdminRoute Guards
│   └── 📄 vercel.json           # Vercel SPA Routing Configuration
│
├── 📁 microservices-demo/       # Decoupled Auth (5001) & Order (5002) Services
├── 📄 docker-compose.yml        # Multi-Container Orchestration (API + Mongo + Postgres)
└── 📄 README.md                 # Master Repository Documentation