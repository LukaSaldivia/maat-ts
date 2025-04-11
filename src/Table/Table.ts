type Table<C extends string, PK extends C[]> = {
  tableName: string
  columns: C[]
  primaryKey: PK
}

export { Table }