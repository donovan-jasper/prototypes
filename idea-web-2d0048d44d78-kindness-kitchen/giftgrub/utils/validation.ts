export const validateRecipient = (name) => {
  return name.length >= 2 && name.length <= 50;
};

export const validateMessage = (message) => {
  return message.length >= 1 && message.length <= 500;
};

export const validateAmount = (amount) => {
  return amount > 0 && amount <= 1000;
};
