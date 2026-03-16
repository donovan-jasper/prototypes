export const MODELS = {
  IMAGE_CLASSIFICATION: {
    name: 'mobilenet',
    inputShape: [224, 224, 3],
    labels: require('@/assets/models/mobilenet/labels.json'),
  },
  OCR: {
    name: 'ocr',
    inputShape: [32, 100, 1],
    vocab: require('@/assets/models/ocr/vocab.json'),
  },
  SUMMARIZATION: {
    name: 'summarization',
    inputShape: [512],
    vocab: require('@/assets/models/summarization/vocab.json'),
  },
};
