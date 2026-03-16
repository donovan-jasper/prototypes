import React, { useEffect } from 'react';
import { analyzeMotion } from '../services/motionAnalyzer';

const MotionDetector = ({ onThrowDetected }) => {
  useEffect(() => {
    const subscription = analyzeMotion((result) => {
      onThrowDetected(result);
    });

    return () => {
      subscription.remove();
    };
  }, [onThrowDetected]);

  return null;
};

export default MotionDetector;
