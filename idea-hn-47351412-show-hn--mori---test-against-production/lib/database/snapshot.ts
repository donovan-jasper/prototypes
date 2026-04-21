import { getLocalSchema } from './schema';
import { getProductionSchema } from './adapters/postgres';
import { saveSnapshot } from '../storage/sqlite';

const createSnapshot = async (connection, options) => {
  const productionSchema = await getProductionSchema(connection);
  const localSchema = await getLocalSchema();
  const diff = await getSchemaDiff(productionSchema, localSchema);

  // Save snapshot logic
  await saveSnapshot(diff, options);
};

export { createSnapshot };
