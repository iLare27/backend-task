import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import { Item } from '../interfaces/item.interface';

export default async function (fastify: FastifyInstance) {
    fastify.get('/items', async function (request: FastifyRequest, reply: FastifyReply) {
        const cacheKey = 'items_cache';

        try {
            const cached = await fastify.cache.get<Item[]>(cacheKey);

            if (cached?.item) {
                fastify.log.info('Cache hit');
                reply.send(cached.item);
                return;
            }

            fastify.log.info('Cache miss, fetching items from API');

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

            await fastify.cache.set(cacheKey, items, 3600); // Кешируем на 1 час
            reply.send(items);
        } catch (error) {
            fastify.log.error('Failed to fetch items:', error);
            reply.status(500).send({ error: 'Failed to fetch items' });
        }
    });
}
