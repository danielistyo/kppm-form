import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAaLdbiRcofVLfyRQtQpYOthzVwrz9Zplk',
  authDomain: 'forml-397fa.firebaseapp.com',
  databaseURL: 'https://forml-397fa.firebaseio.com',
  projectId: 'forml-397fa',
  storageBucket: 'forml-397fa.appspot.com',
  messagingSenderId: '960207641468',
  appId: '1:960207641468:web:b530cec03777dced6f62f9',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
