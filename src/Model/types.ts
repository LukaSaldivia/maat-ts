type Queryable<T = any> = {
  query: (sql: string, params?: string[]) => T;
};

type DebugResult = { query: string, values: string[] | undefined, sql: string }

export { Queryable, DebugResult }