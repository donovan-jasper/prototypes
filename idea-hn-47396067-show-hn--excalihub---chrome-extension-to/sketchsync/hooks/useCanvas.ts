import { useRef } from 'react';
import { Skia } from '@shopify/react-native-skia';

export const useCanvas = () => {
  const canvasRef = useRef(null);
  const pathRef = useRef(Skia.Path.Make());

  const startDrawing = (x: number, y: number) => {
    pathRef.current.moveTo(x, y);
  };

  const continueDrawing = (x: number, y: number) => {
    pathRef.current.lineTo(x, y);
  };

  const endDrawing = () => {
    pathRef.current = Skia.Path.Make();
  };

  return {
    canvasRef,
    pathRef,
    startDrawing,
    continueDrawing,
    endDrawing,
  };
};
