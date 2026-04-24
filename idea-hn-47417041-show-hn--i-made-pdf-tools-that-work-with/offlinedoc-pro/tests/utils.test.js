import { mergePDFs } from '../app/utils/pdfProcessor';

test('merges two PDFs correctly', () => {
  const pdf1 = new Uint8Array([/* PDF data */]);
  const pdf2 = new Uint8Array([/* PDF data */]);
  const result = mergePDFs([pdf1, pdf2]);
  expect(result).toBeInstanceOf(Uint8Array);
});
