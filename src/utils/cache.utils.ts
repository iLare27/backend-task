import { FastifyInstance } from 'fastify';
import axios from 'axios';
import { Item } from '../interfaces/item.interface';

const cacheKey = 'items_cache';

export async function getCachedItems(fastify: FastifyInstance): Promise<Item[] | null> {
    const cached = await fastify.redis.get(cacheKey);
    if (cached) {
        fastify.log.info('Cache hit for items');
        return JSON.parse(cached);
    }
    fastify.log.info('Cache miss for items');
    return null;
}

export async function fetchAndCacheItems(fastify: FastifyInstance): Promise<Item[]> {
    const tradableResponse = await axios.get('https://api.skinport.com/v1/items', {
        params: {
            app_id: 730,
            currency: 'EUR',
            tradable: 1
        }
    });

    const nonTradableResponse = await axios.get('https://api.skinport.com/v1/items', {
        params: {
            app_id: 730,
            currency: 'EUR',
            tradable: 0
        }
    });

    const tradableItems: Item[] = tradableResponse.data;
    const nonTradableItems: Item[] = nonTradableResponse.data;

    const items = tradableItems.map(tradableItem => {
        const nonTradableItem = nonTradableItems.find(item => item.market_hash_name === tradableItem.market_hash_name);
        return {
            ...tradableItem,
            min_tradable_price: tradableItem.min_price,
            min_non_tradable_price: nonTradableItem ? nonTradableItem.min_price : null
        };
    });

    await fastify.redis.set(cacheKey, JSON.stringify(items), 'EX', 3600); // Кешируем на 1 час
    fastify.log.info('Items cached');
    return items;
}
