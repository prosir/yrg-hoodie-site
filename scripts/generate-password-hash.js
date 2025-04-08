const bcrypt = require("bcryptjs")

// Generate a hash for the password "password"
const password = "password"
const salt = bcrypt.genSaltSync(10)
const hash = bcrypt.hashSync(password, salt)

console.log(`Password: ${password}`)
console.log(`Hash: ${hash}`)

// Verify the hash
const isMatch = bcrypt.compareSync(password, hash)
console.log(`Verification: ${isMatch}`)
