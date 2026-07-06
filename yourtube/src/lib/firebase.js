// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth , GoogleAuthProvider}from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjropFq2_VzpiZLpJvJ3myus4Xs1lClzM",
  authDomain: "yourtube-42069.firebaseapp.com",
  projectId: "yourtube-42069",
  storageBucket: "yourtube-42069.firebasestorage.app",
  messagingSenderId: "775769120351",
  appId: "1:775769120351:web:a14b6303269d79c04c45ea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app);
const provider=new GoogleAuthProvider();
export {auth, provider};