import { Table } from "./Table";

/**
 * Factory class to create Table instances.
 */
export default class TableFactory {

  /**
 * Creates a new Table instance with the given table name, columns, and primary key.
 *
 * @template C - The union type representing column names.
 * @template PK - The tuple type representing the primary key columns.
 * @param {string} tableName - The name of the table.
 * @param {C[]} columns - An array of column names.
 * @param {PK} primaryKey - A tuple containing the primary key column(s).
 * @returns {Table<C, PK>} A Table object with the specified structure.
 */
  static create<C extends string, PK extends C[]>(
    tableName: string,
    columns: C[],
    primaryKey: PK
  ): Table<C, PK> {
    return { tableName, columns, primaryKey };
  }
}