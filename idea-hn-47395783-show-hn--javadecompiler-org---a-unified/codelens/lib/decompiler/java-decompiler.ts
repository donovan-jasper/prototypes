import { Fernflower } from 'fernflower';

export const decompileJavaClass = async (bytecode) => {
  const fernflower = new Fernflower();
  const result = await fernflower.decompile(bytecode);
  return result;
};
