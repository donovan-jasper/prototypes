import SQLite from 'react-native-sqlite-storage';
import { uploadToIPFS } from './ipfs';
import { generateProof, verifyProof } from '../utils/crypto';
import { db } from './firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';

const localDb = SQLite.openDatabase({
  name: 'peerverse.db',
  location: 'default',
});

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    localDb.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT,
          authors TEXT,
          abstract TEXT,
          content TEXT,
          proof TEXT,
          status TEXT,
          firebase_id TEXT,
          ipfs_cid TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          retry_count INTEGER DEFAULT 0,
          last_error TEXT
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
    localDb.transaction(tx => {
      tx.executeSql(
        `INSERT INTO submissions (title, authors, abstract, content, proof, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          paper.title,
          paper.authors,
          paper.abstract,
          paper.content,
          paper.proof,
          paper.status,
          paper.createdAt
        ],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

const getPendingSubmissions = () => {
  return new Promise((resolve, reject) => {
    localDb.transaction(tx => {
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

const getProcessingSubmissions = () => {
  return new Promise((resolve, reject) => {
    localDb.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM submissions WHERE status = ?`,
        ['processing'],
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

const getCompletedSubmissions = () => {
  return new Promise((resolve, reject) => {
    localDb.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM submissions WHERE status = ?`,
        ['completed'],
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

const getFailedSubmissions = () => {
  return new Promise((resolve, reject) => {
    localDb.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM submissions WHERE status = ?`,
        ['failed'],
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

const updateLocalSubmissionStatus = (id, status, ipfsCid = null, error = null) => {
  return new Promise((resolve, reject) => {
    localDb.transaction(tx => {
      if (ipfsCid && error) {
        tx.executeSql(
          `UPDATE submissions SET status = ?, ipfs_cid = ?, last_error = ?, retry_count = retry_count + 1 WHERE id = ?`,
          [status, ipfsCid, error, id],
          () => resolve(),
          (_, error) => reject(error)
        );
      } else if (ipfsCid) {
        tx.executeSql(
          `UPDATE submissions SET status = ?, ipfs_cid = ? WHERE id = ?`,
          [status, ipfsCid, id],
          () => resolve(),
          (_, error) => reject(error)
        );
      } else if (error) {
        tx.executeSql(
          `UPDATE submissions SET status = ?, last_error = ?, retry_count = retry_count + 1 WHERE id = ?`,
          [status, error, id],
          () => resolve(),
          (_, error) => reject(error)
        );
      } else {
        tx.executeSql(
          `UPDATE submissions SET status = ? WHERE id = ?`,
          [status, id],
          () => resolve(),
          (_, error) => reject(error)
        );
      }
    });
  });
};

const updateFirebaseSubmissionStatus = async (firebaseId, status) => {
  try {
    const submissionRef = doc(db, 'submissions', firebaseId);
    await updateDoc(submissionRef, {
      status: status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating Firebase submission status:', error);
    throw error;
  }
};

const processSubmissionQueue = async () => {
  try {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      return;
    }

    const pendingSubmissions = await getPendingSubmissions();

    for (const submission of pendingSubmissions) {
      try {
        await updateLocalSubmissionStatus(submission.id, 'processing');

        // Step 1: Verify proof
        const isValid = await verifyProof(submission.content, submission.proof);
        if (!isValid) {
          throw new Error('Proof verification failed');
        }

        // Step 2: Upload to IPFS if not already done
        let ipfsHash = submission.ipfs_cid;
        if (!ipfsHash) {
          ipfsHash = await uploadToIPFS(submission.content);
          if (!ipfsHash) {
            throw new Error('IPFS upload failed');
          }
          await updateLocalSubmissionStatus(submission.id, 'processing', ipfsHash);
        }

        // Step 3: Submit to Firebase
        const firebaseResult = await submitToFirebase({
          title: submission.title,
          authors: submission.authors,
          abstract: submission.abstract,
          content: submission.content,
          proof: submission.proof,
          ipfsHash: ipfsHash,
          status: 'published',
          createdAt: submission.created_at
        });

        if (!firebaseResult || !firebaseResult.id) {
          throw new Error('Firebase submission failed');
        }

        // Update local and Firebase status
        await updateLocalSubmissionStatus(submission.id, 'completed', ipfsHash);
        await updateFirebaseSubmissionStatus(firebaseResult.id, 'completed');
      } catch (error) {
        console.error('Error processing submission:', error);
        await updateLocalSubmissionStatus(submission.id, 'failed', submission.ipfs_cid, error.message);
      }
    }
  } catch (error) {
    console.error('Error processing submission queue:', error);
  }
};

const retryFailedStep = async () => {
  try {
    const failedSubmissions = await getFailedSubmissions();

    for (const submission of failedSubmissions) {
      try {
        await updateLocalSubmissionStatus(submission.id, 'pending');
      } catch (error) {
        console.error('Error resetting failed submission:', error);
      }
    }

    // Trigger queue processing
    await processSubmissionQueue();
  } catch (error) {
    console.error('Error retrying failed submissions:', error);
    throw error;
  }
};

export {
  initializeDatabase,
  saveSubmissionLocally,
  getPendingSubmissions,
  getProcessingSubmissions,
  getCompletedSubmissions,
  getFailedSubmissions,
  updateLocalSubmissionStatus,
  updateFirebaseSubmissionStatus,
  processSubmissionQueue,
  retryFailedStep
};
