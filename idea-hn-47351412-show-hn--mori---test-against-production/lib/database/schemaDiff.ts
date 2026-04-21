import { getLocalSchema } from './snapshot';
import { getProductionSchema } from './adapters/postgres';

interface SchemaColumn {
  name: string;
  type: string;
}

interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

interface SchemaDiffItem {
  type: 'added' | 'removed';
  tableName: string;
  columns: SchemaColumn[];
}

const getSchemaDiff = async (snapshotId: string): Promise<SchemaDiffItem[]> => {
  try {
    const localSchema = await getLocalSchema(snapshotId);
    const productionSchema = await getProductionSchema();
    const diff: SchemaDiffItem[] = [];

    // Check for added or modified tables
    productionSchema.tables.forEach((prodTable: SchemaTable) => {
      const localTable = localSchema.tables.find((t: SchemaTable) => t.name === prodTable.name);

      if (!localTable) {
        // Table was added in production
        diff.push({
          type: 'added',
          tableName: prodTable.name,
          columns: prodTable.columns,
        });
      } else {
        // Check for added columns
        const addedColumns = prodTable.columns.filter((prodColumn) => {
          return !localTable.columns.find((localColumn) => localColumn.name === prodColumn.name);
        });

        if (addedColumns.length > 0) {
          diff.push({
            type: 'added',
            tableName: prodTable.name,
            columns: addedColumns,
          });
        }

        // Check for removed columns
        const removedColumns = localTable.columns.filter((localColumn) => {
          return !prodTable.columns.find((prodColumn) => prodColumn.name === localColumn.name);
        });

        if (removedColumns.length > 0) {
          diff.push({
            type: 'removed',
            tableName: prodTable.name,
            columns: removedColumns,
          });
        }
      }
    });

    // Check for removed tables
    localSchema.tables.forEach((localTable: SchemaTable) => {
      const prodTable = productionSchema.tables.find((t: SchemaTable) => t.name === localTable.name);

      if (!prodTable) {
        diff.push({
          type: 'removed',
          tableName: localTable.name,
          columns: localTable.columns,
        });
      }
    });

    return diff;
  } catch (error) {
    console.error('Error calculating schema diff:', error);
    throw new Error('Failed to calculate schema differences');
  }
};

export { getSchemaDiff };
