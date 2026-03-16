export const calculateImpedanceLoad = (speakers) => {
  let totalImpedance = 0;
  speakers.forEach(speaker => {
    totalImpedance += 1 / speaker.impedance;
  });
  return 1 / totalImpedance;
};

export const calculateTotalPower = (speakers) => {
  let totalPower = 0;
  speakers.forEach(speaker => {
    totalPower += speaker.power * speaker.count;
  });
  return totalPower;
};

export const calculateHeadroom = (receiver, speakers) => {
  const totalPower = calculateTotalPower(speakers);
  return receiver.power / totalPower;
};
