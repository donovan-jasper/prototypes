import { getLocalSchema } from './snapshot';
import { getProductionSchema } from './adapters/postgres';

const getSchemaDiff = async (id: string) => {
  const localSchema = await getLocalSchema(id);
  const productionSchema = await getProductionSchema();
  const diff = [];

  // Calculate schema diff
  productionSchema.tables.forEach((table) => {
    const localTable = localSchema.tables.find((t) => t.name === table.name);
    if (!localTable) {
      diff.push({
        type: 'added',
        tableName: table.name,
        columns: table.columns,
      });
    } else {
      const addedColumns = table.columns.filter((column) => {
        return !localTable.columns.find((c) => c.name === column.name);
      });
      const removedColumns = localTable.columns.filter((column) => {
        return !table.columns.find((c) => c.name === column.name);
      });

      if (addedColumns.length > 0) {
        diff.push({
          type: 'added',
          tableName: table.name,
          columns: addedColumns,
        });
      }

      if (removedColumns.length > 0) {
        diff.push({
          type: 'removed',
          tableName: table.name,
          columns: removedColumns,
        });
      }
    }
  });

  localSchema.tables.forEach((table) => {
    const productionTable = productionSchema.tables.find((t) => t.name === table.name);
    if (!productionTable) {
      diff.push({
        type: 'removed',
        tableName: table.name,
        columns: table.columns,
      });
    }
  });

  return diff;
};

export { getSchemaDiff };
