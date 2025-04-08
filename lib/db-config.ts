// Database configuration
export const DB_CONFIG = {
  // In production, use environment variables for database connection
  // In development, use JSON files
  useDatabase: process.env.NODE_ENV === "production",

  // Database connection details (for production)
  // These should be set as environment variables
  databaseUrl: process.env.DATABASE_URL,

  // Paths for JSON files (for development)
  jsonPaths: {
    orders: "data/orders.json",
    products: "data/products.json",
    categories: "data/categories.json",
    rides: "data/rides.json",
    users: "data/users.json",
    albums: "data/albums.json",
    siteConfig: "data/site-config.json",
    participants: "data/participants.json",
  },
}
