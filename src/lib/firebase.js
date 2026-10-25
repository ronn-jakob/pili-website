import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDHN7y9e14KBeD0iSISjBpXXW8XGC1tjQo",
  authDomain: "pili-website.firebaseapp.com",
  projectId: "pili-website",
  storageBucket: "pili-website.firebasestorage.app",
  messagingSenderId: "574576031282",
  appId: "1:574576031282:web:8a91a748c34a21f7846e2b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
