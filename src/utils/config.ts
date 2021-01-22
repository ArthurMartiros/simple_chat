export const CONFIG = () => ({
    port: parseInt(process.env.PORT , 10) || 9999,
    channel_prefix: process.env.CHANNEL_PREFIX || 'CHANNEL_',
    isDevEnvironment: () => {
        return process.env.NODE_ENV === "dev"
    },
    db: {
        dialect: process.env.DB_DIALECT || 'mongodb',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 27017,
        database: process.env.DB_DATABASE || 'chat'
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    }
});