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

// const gameView = () => {
//   return html`
//   <iframe src="sketch.html"></iframe>`
// }

const gameView = () => {
  renderLeaderboard()
  return html`
    <iframe id="game-iframe" src="sketch.html"></iframe>
  `;
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

async function renderLeaderboard() {
  const querySnapshot = await db.collection('scores').orderBy('score', 'desc').limit(5).get();
  const leaderboard = [];
  querySnapshot.forEach(doc => {
    leaderboard.push(doc.data());
  });
  render(renderLeaderboardUI(leaderboard), document.getElementById("leaderboard-container"));
}

function renderLeaderboardUI(leaderboard) {
  return html`
    <div id="leaderboard">
      <h2>Leaderboard</h2>
      <ol>
        ${leaderboard.map(score => html`<li>${score.name}: ${score.score}</li>`)}
      </ol>
    </div>
  `;
}

// window.addEventListener('message', event => {
//   if (event.data.type === 'scoreSubmitted') {
//     const score = event.data.score;
//     db.collection('scores').add(scoreData);
//     // db.collection('scores').add(score);
//     renderLeaderboard();
//   }
// });

// window.addEventListener('message', event => {
//   if (event.data.type === 'scoreSubmitted') {
//     const scoreData = {
//       name: "player",
//       score: Math.round(event.data.score)
//     };
//     db.collection('scores').add(scoreData);
//     renderLeaderboard();
//   }
// });

window.addEventListener('message', event => {
  if (event.data.type === 'scoreSubmitted') {
    let name;
    if (firebase.auth().currentUser) {
      name = firebase.auth().currentUser.displayName;
      console.log(name);
    }
    if (name == null) {
      name = "Anonymous";
    }
    const scoreData = {
      name: name,
      score: Math.round(event.data.score)
    };
    db.collection('scores').add(scoreData);
    renderLeaderboard();
  }
});