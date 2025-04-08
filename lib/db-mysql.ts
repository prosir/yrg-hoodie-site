import mysql from "mysql2/promise"

// Database connection configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "motorcycle_club",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create a connection pool
const pool = mysql.createPool(dbConfig)

// Helper function to execute SQL queries
export async function query(sql: string, params?: any[]) {
  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Initialize database - create tables if they don't exist
export async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Create orders table
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        orderId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        color VARCHAR(50) NOT NULL,
        colorName VARCHAR(50),
        size VARCHAR(20) NOT NULL,
        delivery ENUM('pickup', 'shipping') NOT NULL,
        notes TEXT,
        price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        isCrew BOOLEAN DEFAULT FALSE,
        orderedFromSupplier BOOLEAN DEFAULT FALSE,
        trackingNumber VARCHAR(100),
        trackingSent BOOLEAN DEFAULT FALSE,
        quantity INT DEFAULT 1,
        INDEX (orderId)
      )
    `)

    // Create products table
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        categoryId VARCHAR(36) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        colorName VARCHAR(50),
        active BOOLEAN DEFAULT TRUE,
        featured BOOLEAN DEFAULT FALSE,
        createdAt VARCHAR(50) NOT NULL,
        updatedAt VARCHAR(50) NOT NULL,
        INDEX (categoryId),
        INDEX (slug)
      )
    `)

    // Create product_images table
    await query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId VARCHAR(36) NOT NULL,
        imageUrl VARCHAR(255) NOT NULL,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        INDEX (productId)
      )
    `)

    // Create product_sizes table
    await query(`
      CREATE TABLE IF NOT EXISTS product_sizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId VARCHAR(36) NOT NULL,
        name VARCHAR(50) NOT NULL,
        stock INT DEFAULT 0,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        INDEX (productId)
      )
    `)

    // Create product_colors table
    await query(`
      CREATE TABLE IF NOT EXISTS product_colors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        productId VARCHAR(36) NOT NULL,
        color VARCHAR(50) NOT NULL,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
        INDEX (productId)
      )
    `)

    // Create categories table
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        isClothing BOOLEAN DEFAULT FALSE,
        active BOOLEAN DEFAULT TRUE,
        createdAt VARCHAR(50) NOT NULL,
        updatedAt VARCHAR(50) NOT NULL,
        INDEX (slug)
      )
    `)

    // Create category_sizes table
    await query(`
      CREATE TABLE IF NOT EXISTS category_sizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        categoryId VARCHAR(36) NOT NULL,
        size VARCHAR(50) NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
        INDEX (categoryId)
      )
    `)

    // Create rides table
    await query(`
      CREATE TABLE IF NOT EXISTS rides (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        startLocation VARCHAR(255) NOT NULL,
        distance VARCHAR(50) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        spots INT NOT NULL,
        registered INT DEFAULT 0,
        active BOOLEAN DEFAULT TRUE,
        accessCode VARCHAR(50),
        requireAccessCode BOOLEAN DEFAULT FALSE,
        INDEX (date)
      )
    `)

    // Create participants table
    await query(`
      CREATE TABLE IF NOT EXISTS participants (
        id VARCHAR(36) PRIMARY KEY,
        rideId VARCHAR(36) NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        motorcycle VARCHAR(255) NOT NULL,
        comments TEXT,
        registeredAt VARCHAR(50) NOT NULL,
        FOREIGN KEY (rideId) REFERENCES rides(id) ON DELETE CASCADE,
        INDEX (rideId)
      )
    `)

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        INDEX (username)
      )
    `)

    // Create user_permissions table
    await query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        permission VARCHAR(50) NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX (userId)
      )
    `)

    // Create albums table
    await query(`
      CREATE TABLE IF NOT EXISTS albums (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        coverImage VARCHAR(255),
        createdAt VARCHAR(50) NOT NULL,
        updatedAt VARCHAR(50) NOT NULL
      )
    `)

    // Create album_images table
    await query(`
      CREATE TABLE IF NOT EXISTS album_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        albumId VARCHAR(36) NOT NULL,
        imageUrl VARCHAR(255) NOT NULL,
        FOREIGN KEY (albumId) REFERENCES albums(id) ON DELETE CASCADE,
        INDEX (albumId)
      )
    `)

    // Create site_config table
    await query(`
      CREATE TABLE IF NOT EXISTS site_config (
        id INT PRIMARY KEY DEFAULT 1,
        config JSON NOT NULL
      )
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

// Call this function when the app starts
export async function connectToDatabase() {
  try {
    // Test the connection
    await query("SELECT 1")
    console.log("Connected to MySQL database")

    // Initialize the database structure
    await initializeDatabase()

    return true
  } catch (error) {
    console.error("Failed to connect to MySQL database:", error)
    return false
  }
}
