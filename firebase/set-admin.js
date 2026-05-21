/**
 * Set the `admin: true` custom claim on a Firebase Auth user.
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
 *   node set-admin.js user@example.com
 */
import admin from 'firebase-admin'
import fs from 'node:fs'

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!credPath || !fs.existsSync(credPath)) {
  console.error('GOOGLE_APPLICATION_CREDENTIALS не задано або файл не існує')
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(fs.readFileSync(credPath, 'utf8'))),
})

const email = process.argv[2]
if (!email) {
  console.error('Вкажіть email: node set-admin.js admin@example.com')
  process.exit(1)
}

const user = await admin.auth().getUserByEmail(email)
await admin.auth().setCustomUserClaims(user.uid, { admin: true })
console.log(`✓ ${email} тепер адмін (uid=${user.uid}). Користувач має перевійти в акаунт.`)
process.exit(0)
