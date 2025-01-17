import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import runConversation from './api/OpenAi'
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyDXYcCNs4UkTIe77rP4T-mHhobNZ1fLMNw",
  authDomain: "chatapp-ec88e.firebaseapp.com",
  projectId: "chatapp-ec88e",
  storageBucket: "chatapp-ec88e.appspot.com",
  messagingSenderId: "780924077899",
  appId: "1:780924077899:web:5844079899d066ba0f4ace"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();
const AiPhotoUrl = "https://static.vecteezy.com/system/resources/previews/021/059/825/non_2x/chatgpt-logo-chat-gpt-icon-on-green-background-free-vector.jpg"

const userMessages = firestore.collection('userMessages');
const AiMessages = firestore.collection('AiMessages');

const userMessagesSnapshot = await firestore.collection('userMessages').orderBy("createdAt").get();

const AiMessagesSnapshot = await firestore.collection('AiMessages').orderBy("createdAt").get();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>ChatGPT</h1>
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
    <div className='signin'>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </div>
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

  const queryUserMessages = userMessages.where("uid", "==", uid).orderBy('createdAt').limit(25)

  const queryAiMessages = AiMessages.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(queryUserMessages, { idField: 'id' });
  const [AiMessagesQ] = useCollectionData(queryAiMessages, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    setFormValue('');

    await userMessages.add({
      role: "user",
      content: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid: uid,
      photoURL,
      isAi: false
    });

    sendAiMessage();

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const sendAiMessage = () => {
    runConversation(formValue).then(async (result) => {
      await AiMessages.add({
        role: "assistant",
        content: result,
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
          placeholder="Prompt"
        />
        <button onClick={sendMessage} type="submit" disabled={!formValue}>
          Send
        </button>
      </form>
    </>
  );
}



function ChatMessage(props) {
  const { content, uid, photoURL, isAi } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      {isAi ?
        <div className='ai'>
          <img src={photoURL} />
          <p>{content}</p>
          
        </div>
        :
        <div className='user'>
          <p>{content}</p>
          <img src={photoURL} />
        </div>
      }
    </div>
  </>)
}

export { userMessagesSnapshot, AiMessagesSnapshot }
export default App;