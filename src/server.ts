import Fastify from 'fastify';
import fastifyPostgres from '@fastify/postgres';
import fastifyCaching from '@fastify/caching';
import * as dotenv from 'dotenv';
import userRoutes from './routes/users.route';
import itemRoutes from './routes/items.route';

dotenv.config();

const fastify = Fastify({
    logger: true
});

fastify.register(fastifyPostgres, {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
});

fastify.register(fastifyCaching, {
    privacy: 'public',
    expiresIn: 3600 // Кешируем на 1 час
});

fastify.get('/api/users', function (req, reply) {
    fastify.pg.query('SELECT * FROM users', function onResult(err, result) {
        reply.send(err || result);
    });
});

fastify.register(userRoutes, { prefix: '/api' });
fastify.register(itemRoutes, { prefix: '/api' });

try {
    fastify.listen({ port: 3002 }, (err, address) => {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
        fastify.log.info(`Server listening at ${address}`);
    });
} catch (error) {
    fastify.log.error(error);
    process.exit(1);
}
