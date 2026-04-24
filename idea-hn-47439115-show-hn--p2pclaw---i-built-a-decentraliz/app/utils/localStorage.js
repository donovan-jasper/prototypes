import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateProof, verifyProof } from './crypto';
import { uploadToIPFS } from './ipfs';
import { submitToFirebase } from '../services/firebase';

const STORAGE_KEY = '@PeerVerse:submissionStatus';

export const saveSubmissionLocally = async (submissionData) => {
  try {
    const timestamp = new Date().toISOString();
    const localData = {
      ...submissionData,
      status: 'local_saved',
      timestamp
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
    return localData;
  } catch (error) {
    console.error('Local save failed:', error);
    throw error;
  }
};

export const retryFailedStep = async (submissionId) => {
  try {
    // Get current submission status
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!storedData) throw new Error('No submission found');

    const submission = JSON.parse(storedData);

    // Determine which step failed and retry
    switch (submission.status) {
      case 'local_saved':
        // Retry proof generation
        try {
          const proof = await generateProof(submission.content);
          submission.proof = proof;
          submission.status = 'proof_generated';
        } catch (error) {
          console.error('Proof generation failed:', error);
          throw new Error('Failed to generate proof');
        }
        break;

      case 'proof_generated':
        // Retry IPFS upload
        try {
          const ipfsHash = await uploadToIPFS(submission.content);
          submission.ipfsHash = ipfsHash;
          submission.status = 'ipfs_uploaded';
        } catch (error) {
          console.error('IPFS upload failed:', error);
          throw new Error('Failed to upload to IPFS');
        }
        break;

      case 'ipfs_uploaded':
        // Retry Firebase submission
        try {
          const firebaseResult = await submitToFirebase({
            content: submission.content,
            proof: submission.proof,
            ipfsHash: submission.ipfsHash
          });
          submission.firebaseId = firebaseResult.id;
          submission.status = 'completed';
        } catch (error) {
          console.error('Firebase submission failed:', error);
          throw new Error('Failed to submit to Firebase');
        }
        break;

      case 'completed':
        return submission; // Already completed

      default:
        throw new Error('Submission in unknown state');
    }

    // Update storage with new status
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(submission));
    return submission;

  } catch (error) {
    console.error('Retry failed:', error);
    throw error;
  }
};

export const getSubmissionStatus = async () => {
  try {
    const storedData = await AsyncStorage.getItem(STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Failed to get submission status:', error);
    return null;
  }
};
