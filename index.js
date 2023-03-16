import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import {render, html} from "lit-html";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyClwzQigSQ8LfdjBg7u_eG_gGdOkP1gqmw",
  authDomain: "quatrun-6d711.firebaseapp.com",
  projectId: "quatrun-6d711",
  storageBucket: "quatrun-6d711.appspot.com",
  messagingSenderId: "679167722805",
  appId: "1:679167722805:web:5dfc047bd1ed428974787c"
};
firebase.initializeApp(firebaseConfig);

// Use Firebase Authentication and Firestore
export const auth = firebase.auth();
export const db = firebase.firestore();

let scores = []

// const loginGoogle = document.getElementById('login-google');
// const loginAnonymous = document.getElementById('login-anonymous');

const pageContainer = document.getElementById("page-container")

const loginView = () => {
  return html`<div id="picture">
  <img width="300" src="images/cat_screen.PNG"></a>
</div>
<div id="login-screen">
  <h1>QuatRun</h1>
  <p>Log in with Google to save your high score</p>
  <br>
  <button @click=${()=>loginGoogle()} id="login-google">Log in with Google</button>
  <br><br>
  <button  @click=${()=>loginAnon()} id="login-anonymous">Log in anonymously</button>
</div>`
}

const gameView = () => {
  return html`
  <iframe src="sketch.html"></iframe>`
}

//<div id="score-container">${scores.map}</div>

async function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await firebase.auth().signInWithPopup(provider);
    console.log("Google signin");
    render(gameView(), pageContainer);
    getAllScores();
    //query for scores that exist, reference messaging example (getAllMessages)
    //rerender game view
  } catch (error) {
    console.error(error);
  }
}

async function loginAnon() {
  firebase.auth().signInAnonymously();
  console.log("Anon signin");
  render(gameView(), pageContainer);
}

render(loginView(), pageContainer)

async function getAllScores() {
  const querySnapshot = await getDocs(
    query(messagesRef, orderBy("score", "desc"))
  );
  querySnapshot.forEach((doc) => {
    let scoreData = doc.data();
    scores.push(scoreData);
  });
  render(gameView(), pageContainer);
}
