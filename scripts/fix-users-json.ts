import fs from "fs/promises"
import path from "path"
import crypto from "crypto"

const USERS_FILE = path.join(process.cwd(), "data", "users.json")

// Generate a default password hash
function generateDefaultPasswordHash() {
  // This creates a hash for the password "ChangeMe123!"
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.pbkdf2Sync("ChangeMe123!", salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

async function fixUsersJson() {
  try {
    console.log("Reading users.json file...")
    const data = await fs.readFile(USERS_FILE, "utf8")
    const users = JSON.parse(data)

    console.log(`Found ${users.length} users`)
    let fixedCount = 0

    // Fix each user
    for (const user of users) {
      if (!user.passwordHash) {
        console.log(`User ${user.username} is missing passwordHash, adding default`)
        user.passwordHash = generateDefaultPasswordHash()
        fixedCount++
      }
    }

    if (fixedCount > 0) {
      console.log(`Fixed ${fixedCount} users, writing back to file`)
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8")
      console.log("Users file updated successfully")
    } else {
      console.log("No users needed fixing")
    }
  } catch (error) {
    console.error("Error fixing users.json:", error)
  }
}

fixUsersJson()
