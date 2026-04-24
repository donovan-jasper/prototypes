import Tesseract from 'tesseract.js';

const recognizeText = async (imageUri) => {
  const result = await Tesseract.recognize(
    imageUri,
    'eng',
    { logger: m => console.log(m) }
  );
  return result.data.text;
};

export default recognizeText;
