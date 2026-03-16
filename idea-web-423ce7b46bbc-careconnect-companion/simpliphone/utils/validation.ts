export const validatePhoneNumber = (phoneNumber) => {
  const regex = /^\+?[0-9]{10,15}$/;
  return regex.test(phoneNumber);
};

export const validateMedicationSchedule = (schedule) => {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(schedule);
};
