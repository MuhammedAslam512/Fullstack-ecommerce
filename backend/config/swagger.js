// ─────────────────────────────────────────────────────────────
// SWAGGER OPENAPI 3.0 CONFIGURATION
// ─────────────────────────────────────────────────────────────
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🛒 ShopNest E-Commerce REST API',
      version: '1.0.0',
      description: 'Production-ready interactive API documentation for ShopNest Fullstack E-Commerce backend.',
      contact: {
        name: 'Backend Engineering Team',
        email: 'support@shopnest.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server'
      },
      {
        url: 'https://fullstack-ecommerce-api.onrender.com/api',
        description: 'Production Render Cloud Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Token in the format: Bearer <TOKEN>'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Path to the API docs JSDoc comments inside routes
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger Interactive API Documentation mounted on /api-docs');
};

module.exports = setupSwagger;