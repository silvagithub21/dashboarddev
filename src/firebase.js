import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcvo15NPObrLgrmLLK5vQONwxeE9inLSs",
  authDomain: "flowboard-b426e.firebaseapp.com",
  projectId: "flowboard-b426e",
  storageBucket: "flowboard-b426e.firebasestorage.app",
  messagingSenderId: "902907243469",
  appId: "1:902907243469:web:200c76573e4b01a273b284",
  measurementId: "G-TYQ3NKRBKD"
};

const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY";

const app = isConfigured ? initializeApp(firebaseConfig) : null;

export const auth = isConfigured ? getAuth(app) : null;
export const db = isConfigured ? getFirestore(app) : null;
export const firebaseAvailable = isConfigured;
