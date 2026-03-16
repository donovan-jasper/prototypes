import { detectTimeContext } from './time';
import { detectLocationContext } from './location';

export const detectContext = async () => {
  const time = detectTimeContext();
  const location = await detectLocationContext();

  return { time, location };
};
