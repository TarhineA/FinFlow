// ─── FIREBASE SETUP ───
// Firebase web config is not a secret — access is controlled by Firestore
// security rules + email/password auth, not by hiding these values.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDraZhUNATv3eOE0TunJBSIOOgXJp5Z7j8",
  authDomain: "finflow-f443e.firebaseapp.com",
  projectId: "finflow-f443e",
  storageBucket: "finflow-f443e.firebasestorage.app",
  messagingSenderId: "420511332523",
  appId: "1:420511332523:web:d2f775880fddeca6215fee",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Offline persistence: app keeps working with no connection and syncs
// queued writes when it reconnects. Cache survives app restarts.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({}),
});

// Single-user synthetic identity. The passphrase is the password; this
// fixed email gives the same UID — and therefore the same data — on every device.
export const SYNC_EMAIL = "finflow@user.local";
