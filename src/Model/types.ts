type Queryable<T = any> = {
  query: (sql: string, params?: string[]) => T;
};

export { Queryable }