import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuQB4IGFYwFzYP9501R6PQk15muf_6u64",
  authDomain: "condomanagment-2ccf3.firebaseapp.com",
  projectId: "condomanagment-2ccf3",
  storageBucket: "condomanagment-2ccf3.firebasestorage.app",
  messagingSenderId: "104399674720",
  appId: "1:104399674720:web:05874c5016bdeac3599205",
  measurementId: "G-LMMT2RMT2Q"
};

const app = initializeApp(firebaseConfig);
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log("Analytics could not be initialized", e);
}
const auth = getAuth(app);
const db = getFirestore(app);

// Secondary app for user creation without logging out current user
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getAuth(secondaryApp);

export { app, analytics, auth, db, secondaryApp, secondaryAuth };
