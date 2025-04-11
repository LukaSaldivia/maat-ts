type Table<C extends string, PK extends C[]> = {
  tableName: string
  columns: C[]
  primary_key: PK
}

export { Table }