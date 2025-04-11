import { Table } from "./Table";

export default class TableFactory {
  static create<C extends string, PK extends C[]>(
    tableName: string,
    columns: C[],
    primary_key: PK
  ): Table<C, PK> {
    return { tableName, columns, primary_key };
  }
}