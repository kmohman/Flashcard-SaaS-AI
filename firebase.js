// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOfpZOCpx6MhYTW03gtf83XnRPV1RV6YU",
  authDomain: "flashcardsaas-1af13.firebaseapp.com",
  projectId: "flashcardsaas-1af13",
  storageBucket: "flashcardsaas-1af13.appspot.com",
  messagingSenderId: "360484755399",
  appId: "1:360484755399:web:ed13f29a789cbd65b0ebe2",
  measurementId: "G-VMNF7TGFHM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export {db}