import fs from "fs/promises"
import path from "path"
import { connectToDatabase, query } from "../lib/db-mysql"

// Paths to JSON files
const JSON_PATHS = {
  orders: path.join(process.cwd(), "data", "orders.json"),
  products: path.join(process.cwd(), "data", "products.json"),
  categories: path.join(process.cwd(), "data", "categories.json"),
  rides: path.join(process.cwd(), "data", "rides.json"),
  participants: path.join(process.cwd(), "data", "participants.json"),
  users: path.join(process.cwd(), "data", "users.json"),
  albums: path.join(process.cwd(), "data", "albums.json"),
  siteConfig: path.join(process.cwd(), "data", "site-config.json"),
}

// Helper function to read JSON file
async function readJsonFile(filePath: string) {
  try {
    const data = await fs.readFile(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
    return []
  }
}

// Migrate orders
async function migrateOrders() {
  console.log("Migrating orders...")
  const orders = await readJsonFile(JSON_PATHS.orders)

  if (orders.length === 0) {
    console.log("No orders to migrate")
    return
  }

  // Clear existing orders
  await query("TRUNCATE TABLE orders")

  // Insert orders
  for (const order of orders) {
    const sql = `
      INSERT INTO orders (
        id, orderId, name, email, phone, address, color, colorName, 
        size, delivery, notes, price, status, date, isCrew, 
        orderedFromSupplier, trackingNumber, trackingSent, quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await query(sql, [
      order.id,
      order.orderId,
      order.name,
      order.email,
      order.phone,
      order.address,
      order.color,
      order.colorName || null,
      order.size,
      order.delivery,
      order.notes || null,
      order.price,
      order.status,
      order.date,
      order.isCrew || false,
      order.orderedFromSupplier || false,
      order.trackingNumber || null,
      order.trackingSent || false,
      order.quantity || 1,
    ])
  }

  console.log(`Migrated ${orders.length} orders`)
}

// Migrate products
async function migrateProducts() {
  console.log("Migrating products...")
  const products = await readJsonFile(JSON_PATHS.products)

  if (products.length === 0) {
    console.log("No products to migrate")
    return
  }

  // Clear existing products and related tables
  await query("SET FOREIGN_KEY_CHECKS = 0")
  await query("TRUNCATE TABLE product_images")
  await query("TRUNCATE TABLE product_sizes")
  await query("TRUNCATE TABLE product_colors")
  await query("TRUNCATE TABLE products")
  await query("SET FOREIGN_KEY_CHECKS = 1")

  // Insert products
  for (const product of products) {
    // Insert product
    const productSql = `
      INSERT INTO products (
        id, name, slug, description, categoryId, price, 
        colorName, active, featured, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await query(productSql, [
      product.id,
      product.name,
      product.slug,
      product.description,
      product.categoryId,
      product.price,
      product.colorName || null,
      product.active,
      product.featured,
      product.createdAt,
      product.updatedAt,
    ])

    // Insert product images
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        await query("INSERT INTO product_images (productId, imageUrl) VALUES (?, ?)", [product.id, image])
      }
    }

    // Insert product sizes
    if (product.sizes && product.sizes.length > 0) {
      for (const size of product.sizes) {
        await query("INSERT INTO product_sizes (productId, name, stock) VALUES (?, ?, ?)", [
          product.id,
          size.name,
          size.stock,
        ])
      }
    }

    // Insert product colors
    if (product.colors && product.colors.length > 0) {
      for (const color of product.colors) {
        await query("INSERT INTO product_colors (productId, color) VALUES (?, ?)", [product.id, color])
      }
    }
  }

  console.log(`Migrated ${products.length} products`)
}

// Migrate categories
async function migrateCategories() {
  console.log("Migrating categories...")
  const categories = await readJsonFile(JSON_PATHS.categories)

  if (categories.length === 0) {
    console.log("No categories to migrate")
    return
  }

  // Clear existing categories and related tables
  await query("SET FOREIGN_KEY_CHECKS = 0")
  await query("TRUNCATE TABLE category_sizes")
  await query("TRUNCATE TABLE categories")
  await query("SET FOREIGN_KEY_CHECKS = 1")

  // Insert categories
  for (const category of categories) {
    // Insert category
    const categorySql = `
      INSERT INTO categories (
        id, name, slug, description, isClothing, 
        active, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    await query(categorySql, [
      category.id,
      category.name,
      category.slug,
      category.description || null,
      category.isClothing,
      category.active,
      category.createdAt,
      category.updatedAt,
    ])

    // Insert category sizes
    if (category.sizes && category.sizes.length > 0) {
      for (const size of category.sizes) {
        await query("INSERT INTO category_sizes (categoryId, size) VALUES (?, ?)", [category.id, size])
      }
    }
  }

  console.log(`Migrated ${categories.length} categories`)
}

// Migrate rides
async function migrateRides() {
  console.log("Migrating rides...")
  const rides = await readJsonFile(JSON_PATHS.rides)

  if (rides.length === 0) {
    console.log("No rides to migrate")
    return
  }

  // Clear existing rides
  await query("TRUNCATE TABLE rides")

  // Insert rides
  for (const ride of rides) {
    const sql = `
      INSERT INTO rides (
        id, title, date, time, startLocation, distance, 
        description, image, spots, registered, active, 
        accessCode, requireAccessCode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await query(sql, [
      ride.id,
      ride.title,
      ride.date,
      ride.time,
      ride.startLocation,
      ride.distance,
      ride.description,
      ride.image,
      ride.spots,
      ride.registered || 0,
      ride.active,
      ride.accessCode || null,
      ride.requireAccessCode || false,
    ])
  }

  console.log(`Migrated ${rides.length} rides`)
}

// Migrate participants
async function migrateParticipants() {
  console.log("Migrating participants...")
  const participants = await readJsonFile(JSON_PATHS.participants)

  if (participants.length === 0) {
    console.log("No participants to migrate")
    return
  }

  // Clear existing participants
  await query("TRUNCATE TABLE participants")

  // Insert participants
  for (const participant of participants) {
    const sql = `
      INSERT INTO participants (
        id, rideId, firstName, lastName, email, 
        phone, motorcycle, comments, registeredAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await query(sql, [
      participant.id,
      participant.rideId,
      participant.firstName,
      participant.lastName,
      participant.email,
      participant.phone,
      participant.motorcycle,
      participant.comments || null,
      participant.registeredAt,
    ])
  }

  console.log(`Migrated ${participants.length} participants`)
}

// Migrate users
async function migrateUsers() {
  console.log("Migrating users...")
  const users = await readJsonFile(JSON_PATHS.users)

  if (users.length === 0) {
    console.log("No users to migrate")
    return
  }

  // Clear existing users and permissions
  await query("SET FOREIGN_KEY_CHECKS = 0")
  await query("TRUNCATE TABLE user_permissions")
  await query("TRUNCATE TABLE users")
  await query("SET FOREIGN_KEY_CHECKS = 1")

  // Insert users
  for (const user of users) {
    // Insert user
    const userSql = `
      INSERT INTO users (
        id, username, passwordHash, name
      ) VALUES (?, ?, ?, ?)
    `

    await query(userSql, [user.id, user.username, user.passwordHash, user.name])

    // Insert user permissions
    if (user.permissions && user.permissions.length > 0) {
      for (const permission of user.permissions) {
        await query("INSERT INTO user_permissions (userId, permission) VALUES (?, ?)", [user.id, permission])
      }
    }
  }

  console.log(`Migrated ${users.length} users`)
}

// Migrate albums
async function migrateAlbums() {
  console.log("Migrating albums...")
  const albums = await readJsonFile(JSON_PATHS.albums)

  if (albums.length === 0) {
    console.log("No albums to migrate")
    return
  }

  // Clear existing albums and images
  await query("SET FOREIGN_KEY_CHECKS = 0")
  await query("TRUNCATE TABLE album_images")
  await query("TRUNCATE TABLE albums")
  await query("SET FOREIGN_KEY_CHECKS = 1")

  // Insert albums
  for (const album of albums) {
    // Insert album
    const albumSql = `
      INSERT INTO albums (
        id, title, description, category, date, 
        coverImage, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `

    await query(albumSql, [
      album.id,
      album.title,
      album.description || null,
      album.category,
      album.date,
      album.coverImage || null,
      album.createdAt,
      album.updatedAt,
    ])

    // Insert album images
    if (album.images && album.images.length > 0) {
      for (const image of album.images) {
        await query("INSERT INTO album_images (albumId, imageUrl) VALUES (?, ?)", [album.id, image])
      }
    }
  }

  console.log(`Migrated ${albums.length} albums`)
}

// Migrate site config
async function migrateSiteConfig() {
  console.log("Migrating site config...")
  const siteConfig = await readJsonFile(JSON_PATHS.siteConfig)

  if (!siteConfig) {
    console.log("No site config to migrate")
    return
  }

  // Clear existing site config
  await query("TRUNCATE TABLE site_config")

  // Insert site config
  await query("INSERT INTO site_config (id, config) VALUES (1, ?)", [JSON.stringify(siteConfig)])

  console.log("Migrated site config")
}

// Main migration function
async function migrateAll() {
  try {
    console.log("Starting migration to MySQL...")

    // Connect to the database
    const connected = await connectToDatabase()
    if (!connected) {
      console.error("Failed to connect to the database. Migration aborted.")
      process.exit(1)
    }

    // Migrate all data
    await migrateCategories()
    await migrateProducts()
    await migrateOrders()
    await migrateRides()
    await migrateParticipants()
    await migrateUsers()
    await migrateAlbums()
    await migrateSiteConfig()

    console.log("Migration completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

// Run the migration
migrateAll()
