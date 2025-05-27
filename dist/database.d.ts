export declare class Database {
    private db;
    constructor(dbPath?: string);
    private initTables;
    upsert(tableName: string, record: any, uniqueKeys: string[]): Promise<{
        inserted: boolean;
    }>;
    query(sql: string, params?: any[]): Promise<any[]>;
    queryOne(sql: string, params?: any[]): Promise<any>;
    close(): void;
}
//# sourceMappingURL=database.d.ts.map