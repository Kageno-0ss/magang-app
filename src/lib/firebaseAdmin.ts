// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), 
    // atau pakai service account JSON
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
