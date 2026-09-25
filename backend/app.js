const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize'); //  NEW: NoSQL Injection Defense
const hpp = require('hpp');                               //  NEW: Parameter Pollution Defense
const path = require('path');
const setupSwagger = require('./config/swagger')
const cookieParser = require('cookie-parser');

const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const morganMiddleware = require('./middleware/morganLogger')

// Import all routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

// GraphQL Imports
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();

// ------------------------------------------
//  SECURITY HARDENING MIDDLEWARES
// ------------------------------------------

// 1. Helmet: Secure HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Apollo Sandbox & Swagger UI
    crossOriginEmbedderPolicy: false
  })
);

// 2. CORS Hardening
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://studio.apollographql.com',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        process.env.NODE_ENV === 'development' ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

// 3. Rate Limiters (Blocks spam early before processing body)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);


//4. Body Parsers 
app.use(express.json({ limit: '10mb' })); // Limit body size to prevent memory overload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 5. SANITIZERS (Now req.body is parsed and ready to be cleaned safely!)
//  Node 22 Compatible In-Place NoSQL Injection Sanitizer
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

// 6. HTTP Parameter Pollution Defense
app.use(
  hpp({
    whitelist: ['price', 'ratings', 'category', 'brand', 'stock'] // Allowed duplicate parameters for filtering
  })
);


// Static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Logger
app.use(morganMiddleware);

// Home route
app.get(['/', '/api'], (req, res) => {
  res.json({
    success: true,
    message: ' E-Commerce API v1.0 (Security Hardened)',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      reviews: '/api/reviews',
      graphql: '/graphql'
    }
  });
});

// Mount REST routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Function to setup GraphQL AND Error Handlers in correct order
const setupGraphQLAndErrors = async (app) => {

  setupSwagger(app)

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    (req, res, next) => {
      if (!req.body) req.body = {};
      next();
    },
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        token: req.headers.authorization || ''
      })
    })
  );

  console.log(' GraphQL Apollo Server mounted on /graphql');

  // Error Handlers MUST be last
  app.use(notFound);
  app.use(errorHandler);
};

module.exports = { app, setupGraphQLAndErrors };