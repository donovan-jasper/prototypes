import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

export const uploadToIPFS = async (content) => {
  const { cid } = await ipfs.add(content);
  return cid.toString();
};

export const getFromIPFS = async (cid) => {
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
};
