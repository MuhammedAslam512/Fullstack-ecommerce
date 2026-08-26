# 🛒 E-Commerce API

Complete backend API for e-commerce store with authentication,
products, cart, orders, and reviews.

## 🌐 Live URL
https://your-app.onrender.com

## 🛠️ Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt (password hashing)
- Multer (file upload)
- Helmet, CORS (security)

## 📋 Features
- ✅ User Authentication (JWT)
- ✅ Role-based Access (User/Admin)
- ✅ Product Management (CRUD)
- ✅ Categories
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Product Reviews & Ratings
- ✅ Image Upload
- ✅ Pagination & Filtering
- ✅ Search functionality

## 🚀 API Endpoints

### Auth
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get logged in user 🔐
- POST `/api/auth/upload-avatar` - Upload profile pic 🔐

### Categories
- GET `/api/categories` - Get all
- GET `/api/categories/:id` - Get one
- POST `/api/categories` - Create 🔐👨‍💼
- PUT `/api/categories/:id` - Update 🔐👨‍💼
- DELETE `/api/categories/:id` - Delete 🔐👨‍💼

### Products
- GET `/api/products` - Get all (with pagination, filter, search)
- GET `/api/products/:id` - Get single
- POST `/api/products` - Create 🔐👨‍💼
- PUT `/api/products/:id` - Update 🔐👨‍💼
- DELETE `/api/products/:id` - Delete 🔐👨‍💼
- POST `/api/products/:id/images` - Upload images 🔐👨‍💼

### Cart
- GET `/api/cart` - Get my cart 🔐
- POST `/api/cart` - Add to cart 🔐
- PUT `/api/cart/:productId` - Update quantity 🔐
- DELETE `/api/cart/:productId` - Remove item 🔐
- DELETE `/api/cart` - Clear cart 🔐

### Orders
- POST `/api/orders` - Place order 🔐
- GET `/api/orders/my` - My orders 🔐
- GET `/api/orders/:id` - Get order 🔐
- GET `/api/orders` - All orders 🔐👨‍💼
- PUT `/api/orders/:id/status` - Update status 🔐👨‍💼

### Reviews
- GET `/api/reviews/product/:id` - Get reviews
- POST `/api/reviews/product/:id` - Create review 🔐
- DELETE `/api/reviews/:id` - Delete review 🔐

🔐 = Authentication required
👨‍💼 = Admin only

## 📦 Installation (Local Setup)

\`\`\`bash
# Clone repo
git clone https://github.com/username/backend-bootcamp

# Go to project
cd backend-bootcamp/day-06

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your MongoDB URI and JWT secret

# Run
npm run dev
\`\`\`

## 🔑 Environment Variables

\`\`\`
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
\`\`\`

## 📝 Sample Requests

### Register:
\`\`\`json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "john1234"
}
\`\`\`

### Login:
\`\`\`json
POST /api/auth/login
{
  "email": "john@gmail.com",
  "password": "john1234"
}
\`\`\`

### Add to Cart:
\`\`\`json
POST /api/cart
Headers: Authorization: Bearer TOKEN
{
  "productId": "PRODUCT_ID",
  "quantity": 2
}
\`\`\`

## 👤 Author
Your Name - [GitHub](https://github.com/username)

## 📄 License
MIT

## 📮 Postman Collection

Import our Postman collection to test all endpoints:

1. Download: `E-Commerce-API.json`
2. Open Postman
3. Click Import
4. Select the file
5. All endpoints ready to use!