import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';

const {
  VUE_APP_FIREBASE_API_KEY,
  VUE_APP_FIREBASE_AUTH_DOMAIN,
  VUE_APP_FIREBASE_DATABASE_URL,
  VUE_APP_FIREBASE_PROJECT_ID,
  VUE_APP_FIREBASE_STORAGE_BUCKET,
  VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  VUE_APP_FIREBASE_APP_ID,
} = process.env;

const firebaseConfig = {
  apiKey: VUE_APP_FIREBASE_API_KEY,
  authDomain: VUE_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: VUE_APP_FIREBASE_DATABASE_URL,
  projectId: VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: VUE_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
