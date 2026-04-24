import SQLite from 'react-native-sqlite-storage';
import { uploadToIPFS } from './ipfs';
import { generateProof, verifyProof } from '../utils/crypto';
import NetInfo from '@react-native-community/netinfo';

const db = SQLite.openDatabase({
  name: 'peerverse.db',
  location: 'default',
});

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          authors TEXT,
          abstract TEXT,
          content TEXT,
          proof TEXT,
          status TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        [],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

const saveSubmissionLocally = (paper) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO submissions (title, authors, abstract, content, status)
         VALUES (?, ?, ?, ?, ?)`,
        [paper.title, paper.authors, paper.abstract, JSON.stringify(paper), 'pending'],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

const getPendingSubmissions = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM submissions WHERE status = ?`,
        ['pending'],
        (_, result) => {
          const submissions = [];
          for (let i = 0; i < result.rows.length; i++) {
            submissions.push(result.rows.item(i));
          }
          resolve(submissions);
        },
        (_, error) => reject(error)
      );
    });
  });
};

const updateSubmissionStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE submissions SET status = ? WHERE id = ?`,
        [status, id],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

const processSubmissionQueue = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  const pendingSubmissions = await getPendingSubmissions();

  for (const submission of pendingSubmissions) {
    try {
      await updateSubmissionStatus(submission.id, 'processing');

      // Generate proof if not already done
      let proof = submission.proof;
      if (!proof) {
        proof = await generateProof(submission.content);
        // Update proof in database
        db.transaction(tx => {
          tx.executeSql(
            `UPDATE submissions SET proof = ? WHERE id = ?`,
            [proof, submission.id]
          );
        });
      }

      // Verify proof
      const isValid = await verifyProof(submission.content, proof);
      if (!isValid) {
        throw new Error('Proof verification failed');
      }

      // Upload to IPFS
      const cid = await uploadToIPFS(submission.content);

      // Update status to completed
      await updateSubmissionStatus(submission.id, 'completed');

      // Here you would also add to Firebase as in the original implementation
      // For now we'll just mark as completed
    } catch (error) {
      console.error('Error processing submission:', error);
      await updateSubmissionStatus(submission.id, 'failed');
    }
  }
};

// Set up network state listener
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    processSubmissionQueue();
  }
});

export {
  initializeDatabase,
  saveSubmissionLocally,
  getPendingSubmissions,
  processSubmissionQueue
};
