export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateAge = (age) => {
  return age >= 18 || age >= 65;
};

export const validateName = (name) => {
  return name.length >= 2;
};
