// setRole.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "QHyYIDrIsiNGQn3dKiBZBgLr8BE2"; // ganti UID sesuai user
const role = "admin"; // bisa "admin" atau "user"

admin
  .auth()
  .setCustomUserClaims(uid, { role })
  .then(() => {
    console.log(`Role '${role}' berhasil diset untuk UID: ${uid}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error setting role:", error);
    process.exit(1);
  });
