import { redisClient } from "./connection";
import { RedisClientType, createClient } from "redis";

export class CacheContainer {
    static cache: ReturnType<typeof createClient>;

    static async getInstance() {
        if (this.cache) return this.cache

        this.cache = await redisClient.connect()

        return this.cache
    }
}