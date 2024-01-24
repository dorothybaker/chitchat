import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAkMA1NUJd8BKG5dhI8WOrVpyUXYu1Weh4",
  authDomain: "chitchat-a8256.firebaseapp.com",
  projectId: "chitchat-a8256",
  storageBucket: "chitchat-a8256.appspot.com",
  messagingSenderId: "158805817491",
  appId: "1:158805817491:web:27b2ab840c1ca607dbf566",
  measurementId: "G-1PCCR23W9E",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };
