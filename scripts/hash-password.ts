import bcrypt from 'bcryptjs'

const password = process.argv[2]
if (!password) {
  console.error('Usage: yarn hash:password <password>')
  process.exit(1)
}

bcrypt.hash(password, 12).then((hash) => {
  console.log(hash)
})
