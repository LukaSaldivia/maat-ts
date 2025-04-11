import { Table } from "./Table";

export default class TableFactory {
  static create<C extends string, PK extends C[]>(
    tableName: string,
    columns: C[],
    primaryKey: PK
  ): Table<C, PK> {
    return { tableName, columns, primaryKey };
  }
}