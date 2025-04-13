import { Table } from "../Table/Table";
import { Queryable } from "./types";

export default class Model<C extends string, PK extends C[], SQLResult> {

  table: Table<C, PK>
  database: Queryable<SQLResult>

  constructor(table: Table<C, PK>, database: Queryable<SQLResult>) {
    this.table = table
    this.database = database
  }

  create(data: Record<C, string | number>) {
    let cols = Object.keys(data)
    let placeholders = new Array(cols.length).fill('?')

    let query = `INSERT INTO ${this.table.tableName} (${cols.join(',')}) VALUES (${placeholders.join(',')})`

    return this.executeQuery(query, Object.values(data))
  }

  createBundle(arr: Record<C, string | number>[]) {
    let fields = Object.keys(arr[0])
    let query = "INSERT INTO " + this.table.tableName + `(${fields.join(',')}) VALUES `
    let placeholders = arr.map(_ => `(${new Array(fields.length).fill('?').join(',')})`).join(', ')
    query += placeholders
    let values = arr.map<string[]>(obj => Object.values(obj)).flat()

    return this.executeQuery(query, values)

  }

  edit(data: Record<C, string | number>, pk: Record<PK[number], string>) {

    let updates = Object.keys(data).map(col => `${col} = ?`).join(", ");

    const { conditions, values } = this.buildPK(pk)

    let query = `UPDATE ${this.table.tableName} SET ${updates} WHERE ${conditions}`;

    return this.executeQuery(query, [...Object.values(data), ...values] as string[]);

  }

  delete(pk: Record<PK[number], string>) {

    const { conditions, values } = this.buildPK(pk)
    const query = `DELETE FROM ${this.table.tableName} WHERE ${conditions}`
    return this.executeQuery(query, values)

  }

  get(pk: Record<PK[number], string>) {
    const { conditions, values } = this.buildPK(pk)
    const query = `SELECT * FROM ${this.table.tableName} WHERE ${conditions}`
    return this.executeQuery(query, values)
  }

  search(){
    // TODO
  }



  executeQuery(query: string, values?: string[]) {
    let res = this.database.query(query, values)
    return res
  }

  private buildPK(pk: Record<PK[number], string>) {
    const keys = Object.keys(pk)
    const conditions = keys.map(key => `${key} = ?`).join(" AND ")
    const values = keys.map(key => pk[key as PK[number]])
    return { conditions, values }
  }


}