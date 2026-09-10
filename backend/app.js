const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

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
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();

// Security Middleware (CSP disabled for Apollo Sandbox UI)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Body parser for REST API
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Logger
app.use(logger);

// Home route
app.get(['/', '/api'], (req, res) => {
  res.json({
    success: true,
    message: '🛒 E-Commerce API v1.0',
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
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }) // Enables Apollo Sandbox in browser
    ]
  });

  await apolloServer.start();

  // 1. Mount /graphql FIRST
  app.use(
    '/graphql',
    cors(),
    express.json(),
    // 👇 Fix: ensures req.body is defined on GET requests so Apollo doesn't throw 500
    (req, res, next) => {
      if (req.body === undefined) {
        req.body = {};
      }
      next();
    },
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        token: req.headers.authorization || ''
      })
    })
  );

  console.log('⚡ GraphQL Apollo Server mounted on /graphql');

  // 2. Mount Error Handlers LAST (After /graphql!)
  app.use(notFound);
  app.use(errorHandler);
};

module.exports = { app, setupGraphQLAndErrors };