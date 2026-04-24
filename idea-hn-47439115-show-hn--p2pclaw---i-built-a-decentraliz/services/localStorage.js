import { openDatabase } from 'react-native-sqlite-storage';
import { create } from 'ipfs-http-client';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { generateProof } from '../utils/crypto';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize IPFS with proper error handling
let ipfs;
try {
  ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: 'Basic ' + Buffer.from('YOUR_INFURA_PROJECT_ID:YOUR_INFURA_PROJECT_SECRET').toString('base64')
    }
  });
} catch (error) {
  console.error('Failed to initialize IPFS client:', error);
  // Fallback to local IPFS node if Infura fails
  try {
    ipfs = create({
      host: 'localhost',
      port: 5001,
      protocol: 'http'
    });
  } catch (localError) {
    console.error('Failed to initialize local IPFS client:', localError);
  }
}

const database = openDatabase({ name: 'peerverse.db' });

export const processSubmissionQueue = async () => {
  try {
    // Get pending submissions from local DB
    const pendingSubmissions = await new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM submissions WHERE status = ?',
          ['pending'],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });

    for (const submission of pendingSubmissions) {
      try {
        // Check if IPFS is initialized
        if (!ipfs) {
          throw new Error('IPFS client not initialized');
        }

        // 1. Upload to IPFS
        const fileContent = submission.content;
        const fileName = `${submission.title.replace(/\s+/g, '_')}.txt`;

        const { cid } = await ipfs.add({
          path: fileName,
          content: fileContent
        });

        // 2. Generate proof
        const proof = generateProof(fileContent);

        // 3. Store in Firebase with proof
        const docRef = await addDoc(collection(db, 'submissions'), {
          cid: cid.toString(),
          proof: proof, // Include proof in Firebase submission
          title: submission.title,
          authors: submission.authors,
          timestamp: new Date().toISOString(),
          status: 'submitted',
          fileName: fileName,
          verificationStatus: 'pending' // Track verification status
        });

        // 4. Update local DB with proof
        await new Promise((resolve, reject) => {
          database.transaction(tx => {
            tx.executeSql(
              'UPDATE submissions SET status = ?, ipfs_cid = ?, firebase_id = ?, proof = ? WHERE id = ?',
              ['submitted', cid.toString(), docRef.id, proof, submission.id],
              () => resolve(),
              (_, error) => reject(error)
            );
          });
        });

        console.log(`Processed submission ${submission.id} with CID ${cid.toString()}`);
      } catch (error) {
        console.error(`Error processing submission ${submission.id}:`, error);

        // Update status to 'failed' for retry
        await new Promise((resolve, reject) => {
          database.transaction(tx => {
            tx.executeSql(
              'UPDATE submissions SET status = ? WHERE id = ?',
              ['failed', submission.id],
              () => resolve(),
              (_, error) => reject(error)
            );
          });
        });
      }
    }
  } catch (error) {
    console.error('Error processing submission queue:', error);
    throw error;
  }
};

// Initialize database tables
export const initializeDatabase = async () => {
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          authors TEXT,
          content TEXT,
          status TEXT DEFAULT 'pending',
          ipfs_cid TEXT,
          firebase_id TEXT,
          proof TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};
