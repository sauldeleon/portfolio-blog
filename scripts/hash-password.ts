import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('Password: ', (password) => {
  rl.close()
  if (!password) {
    console.error('Password cannot be empty')
    process.exit(1)
  }
  bcrypt.hash(password, 12).then((hash) => {
    console.log(Buffer.from(hash).toString('base64'))
  })
})
