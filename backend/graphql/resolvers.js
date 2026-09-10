// ─────────────────────────────────────────────────────────────
// GRAPHQL RESOLVERS (CONNECTED TO MONGOOSE MODELS)
// ─────────────────────────────────────────────────────────────
const Product = require('../models/Product');
const User = require('../models/User');

const resolvers = {
  // ── 1. QUERIES (GET equivalent) ───────────────────────────
  Query: {
    // Fetch all products (optional search)
    products: async (_, { search }) => {
      let filter = { isActive: true };
      if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [{ name: regex }, { brand: regex }];
      }
      return await Product.find(filter).sort('-createdAt');
    },

    // Fetch single product by ID
    product: async (_, { id }) => {
      return await Product.findById(id);
    },

    // Health check
    graphqlHealth: () => '⚡ GraphQL Apollo Server is Active & Healthy!'
  },

  // ── 2. MUTATIONS (POST/PUT/DELETE equivalent) ──────────────
  Mutation: {
    // Create Product
    createProduct: async (_, { input }) => {
      const product = await Product.create(input);
      return product;
    },

    // Delete Product
    deleteProduct: async (_, { id }) => {
      const result = await Product.findByIdAndDelete(id);
      return !!result;
    }
  },

  // ── 3. FIELD RESOLVERS (Maps MongoDB _id to GraphQL id) ───
  Product: {
    id: (parent) => parent._id.toString()
  },
  User: {
    id: (parent) => parent._id.toString()
  }
};

module.exports = resolvers;