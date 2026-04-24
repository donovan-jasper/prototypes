export const validateSubmission = (submission) => {
  if (!submission.type || !submission.file) {
    return false;
  }
  return true;
};
