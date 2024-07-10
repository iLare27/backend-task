/// <reference types='node' />

import { FastifyPluginCallback } from 'fastify';

declare module 'fastify' {
    interface FastifyInstance {
        cache: fastifyCaching.AbstractCacheCompliantObject;
        cacheSegment: string;
        etagMaxLife: number | undefined;
    }

    interface FastifyReply {
        expires(date?: Date): this;
        etag(tag?: string, timeToLive?: number): this;
    }
}

type FastifyCaching = FastifyPluginCallback<fastifyCaching.FastifyCachingPluginOptions> & {
    privacy: fastifyCaching.Privacy;
};

type CacheResult<T> = {
    item: T,
    stored: number,
    ttl: number,
} | null;

declare namespace fastifyCaching {
    export interface AbstractCacheCompliantObject {
        get<T = unknown>(
            key: string | { id: string; segment: string },
            callback: (error: unknown, result: CacheResult<T>) => void
        ): void;
        get<T = unknown>(key: string | { id: string; segment: string }): Promise<CacheResult<T>>;
        set(
            key: string | { id: string; segment: string },
            value: unknown,
            timeToLive: number,
            callback?: (error: unknown, result: unknown) => void
        ): void;
    }

    export interface Privacy {
        NOCACHE: 'no-cache';
        PRIVATE: 'private';
        PUBLIC: 'public';
    }

    export interface FastifyCachingPluginOptions {
        cache?: AbstractCacheCompliantObject;
        cacheSegment?: string;
        etagMaxLife?: number;
        expiresIn?: number;
        privacy?: string;
        serverExpiresIn?: number;
    }

    export const privacy: Privacy;

    export const fastifyCaching: FastifyCaching;
    export { fastifyCaching as default };
}

declare function fastifyCaching(...params: Parameters<FastifyCaching>): ReturnType<FastifyCaching>
export = fastifyCaching;
