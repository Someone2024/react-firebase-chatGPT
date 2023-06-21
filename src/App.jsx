import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import Chat from './api/OpenAi'

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
apiKey: "AIzaSyAKQpdM_rQenTlrNtpeF1M1FMN8KcJtH7A",
  authDomain: "library-app-38a33.firebaseapp.com",
  projectId: "library-app-38a33",
  storageBucket: "library-app-38a33.appspot.com",
  messagingSenderId: "950037249157",
  appId: "1:950037249157:web:34927f5a8bd4738cbfbdec"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();
const AiPhotoUrl ="https://static.vecteezy.com/system/resources/previews/021/059/825/non_2x/chatgpt-logo-chat-gpt-icon-on-green-background-free-vector.jpg"


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
const { uid, photoURL } = auth.currentUser;
  const dummy = useRef();
  const userMessages = firestore.collection('userMessages');
  const AiMessages = firestore.collection('AiMessages');
  const queryUserMessages = userMessages
  .orderBy('createdAt')
  .limit(25)
  .where('uid', '==', uid)

  const queryAiMessages = AiMessages.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(queryUserMessages, { idField: 'id' });
  const [AiMessagesQ] = useCollectionData(queryAiMessages, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    setFormValue('');

    await userMessages.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      photoURL,
      isAi:false
    });

    sendAiMessage();

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const sendAiMessage = () => {
    Chat(formValue).then(async (result) => {
      await AiMessages.add({
        text: result,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: uid,
        photoURL: AiPhotoUrl,
        isAi: true
      });
    });
  };

  // Merge and sort the messages
  const allMessages = [...(messages || []), ...(AiMessagesQ || [])].sort(
    (a, b) => a.createdAt?.toDate() - b.createdAt?.toDate()
  );

  return (
    <>
      <main>
        {allMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <span ref={dummy}></span>
      </main>

      <form>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />
        <button onClick={sendMessage} type="submit" disabled={!formValue}>
          ➡️
        </button>
      </form>
    </>
  );
}



function ChatMessage(props) {
  const { text, uid, photoURL, isAi } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
    {isAi ? 
    <>
<p>{text}</p>
      <img src={photoURL} />
      </>
      :
      <>
      
      
<img src={photoURL} />
      <p>{text}</p>
      </>
    }
    </div>
  </>)
}


export default App;