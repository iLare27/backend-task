import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getCachedItems, fetchAndCacheItems } from '../utils/cache.utils';

export default async function (fastify: FastifyInstance) {
    fastify.get('/items', async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            const cachedItems = await getCachedItems(fastify);
            if (cachedItems) {
                reply.send(cachedItems);
                return;
            }

            fastify.log.info('Fetching items from API');
            const items = await fetchAndCacheItems(fastify);
            reply.send(items);
        } catch (error) {
            fastify.log.error('Failed to fetch items:', error);
            reply.status(500).send({ error: 'Failed to fetch items' });
        }
    });
}
