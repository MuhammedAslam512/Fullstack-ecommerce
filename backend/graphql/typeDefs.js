// ─────────────────────────────────────────────────────────────
// GRAPHQL SCHEMA TYPE DEFINITIONS (TypeDefs)
// ─────────────────────────────────────────────────────────────
const typeDefs = `#graphql
  # Product Type
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
    brand: String
    ratings: Float
    numReviews: Int
    createdAt: String
  }

  # User Type
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    avatar: String
  }

  # Custom Response Payloads
  type ProductResponse {
    success: Boolean!
    count: Int
    data: [Product!]!
  }

  # ── QUERIES (Read Operations) ───────────────────────────────
  type Query {
    # Get all products (with optional search)
    products(search: String): [Product!]!
    
    # Get single product by ID
    product(id: ID!): Product

    # Get server health status
    graphqlHealth: String!
  }

  # ── MUTATIONS (Write/Modify Operations) ────────────────────
  input CreateProductInput {
    name: String!
    description: String!
    price: Float!
    stock: Int!
    brand: String
  }

  type Mutation {
    # Create new product
    createProduct(input: CreateProductInput!): Product!

    # Delete product by ID
    deleteProduct(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;