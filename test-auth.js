import { initializeApp } from "firebase/app";
import { getFirestore, doc, runTransaction } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2YulXZka3Yk8ptvtOmCSf0xyILjGGqrI",
  authDomain: "mhd-hospital.firebaseapp.com",
  projectId: "mhd-hospital",
  storageBucket: "mhd-hospital.firebasestorage.app",
  messagingSenderId: "292842587519",
  appId: "1:292842587519:web:1f000fcae0908fc121864a",
  measurementId: "G-69946641V2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  try {
    const userCred = await createUserWithEmailAndPassword(auth, "testuser12345@example.com", "password123");
    console.log("User created:", userCred.user.uid);
    
    const counterRef = doc(db, 'system', 'counters');
    const newIdString = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      let newCount = 1;

      if (!counterDoc.exists()) {
        transaction.set(counterRef, { patient: 1 });
      } else {
        const data = counterDoc.data();
        newCount = (data.patient || 0) + 1;
        transaction.update(counterRef, { patient: newCount });
      }
      return `P-${newCount}`;
    });
    console.log("New ID:", newIdString);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
test();
