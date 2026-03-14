interface EnvConfig {
    PORT: number;
    NODE_ENV: 'development' | 'production' | 'test';
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CLIENT_URL: string;
}
export declare const env: EnvConfig;
export {};
//# sourceMappingURL=env.d.ts.map