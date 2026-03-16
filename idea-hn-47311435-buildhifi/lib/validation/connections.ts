export const validateConnections = (outputTypes, inputTypes) => {
  const compatible = outputTypes.some(outputType =>
    inputTypes.includes(outputType)
  );

  if (!compatible) {
    return 'incompatible';
  }

  return 'compatible';
};
