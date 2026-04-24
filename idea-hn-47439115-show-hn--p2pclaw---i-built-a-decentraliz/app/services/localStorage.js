import { openDatabase } from 'react-native-sqlite-storage';
import { generateSubmissionProof, verifySubmissionProof } from '../utils/crypto';
import { firebase } from './firebase';

const database = openDatabase({ name: 'peerverse.db' });

export const getSubmissions = () => {
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM submissions ORDER BY createdAt DESC',
        [],
        (_, { rows }) => resolve(rows.raw()),
        (_, error) => reject(error)
      );
    });
  });
};

export const processSubmissionQueue = async () => {
  try {
    const submissions = await getSubmissions();

    for (const submission of submissions) {
      if (submission.status === 'pending') {
        try {
          // Update status to processing
          await new Promise((resolve, reject) => {
            database.transaction(tx => {
              tx.executeSql(
                'UPDATE submissions SET status = ? WHERE id = ?',
                ['processing', submission.id],
                () => resolve(),
                (_, error) => reject(error)
              );
            });
          });

          // Verify the proof
          const isValid = await verifySubmissionProof(
            submission.content,
            JSON.parse(submission.proof)
          );

          if (!isValid) {
            throw new Error('Proof verification failed');
          }

          // Submit to Firebase
          const submissionRef = firebase.firestore().collection('submissions').doc();
          await submissionRef.set({
            title: submission.title,
            authors: submission.authors,
            abstract: submission.content,
            proof: submission.proof,
            status: 'submitted',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            ipfsHash: submission.ipfsHash || null
          });

          // Update status to completed
          await new Promise((resolve, reject) => {
            database.transaction(tx => {
              tx.executeSql(
                'UPDATE submissions SET status = ?, ipfsHash = ? WHERE id = ?',
                ['completed', submissionRef.id, submission.id],
                () => resolve(),
                (_, error) => reject(error)
              );
            });
          });
        } catch (error) {
          console.error(`Failed to process submission ${submission.id}:`, error);

          // Update status to failed
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
    }
  } catch (error) {
    console.error('Failed to process submission queue:', error);
    throw error;
  }
};

export const retrySubmission = async (submissionId) => {
  try {
    const submission = await new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM submissions WHERE id = ?',
          [submissionId],
          (_, { rows }) => resolve(rows.item(0)),
          (_, error) => reject(error)
        );
      });
    });

    if (!submission) {
      throw new Error('Submission not found');
    }

    // Update status to pending
    await new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          'UPDATE submissions SET status = ? WHERE id = ?',
          ['pending', submissionId],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });

    // Process the queue again
    await processSubmissionQueue();
  } catch (error) {
    console.error('Failed to retry submission:', error);
    throw error;
  }
};
