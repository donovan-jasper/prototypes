export const classifySleepState = ({ motion, sound, light }) => {
  const motionScore = motion < 0.05 ? 50 : 0;
  const soundScore = sound < 30 ? 30 : 0;
  const lightScore = light < 50 ? 20 : 0;

  const totalScore = motionScore + soundScore + lightScore;

  if (totalScore > 70) {
    return 'asleep';
  } else if (totalScore > 40) {
    return 'drowsy';
  } else {
    return 'awake';
  }
};
