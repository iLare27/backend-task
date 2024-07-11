import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { IParams, BalanceRequest } from '../interfaces/user.interface';

export default async function (fastify: FastifyInstance) {
    fastify.post(
        '/users/:id/balance',
        async function (
            request: FastifyRequest<{ Params: IParams; Body: BalanceRequest }>,
            reply: FastifyReply
        ) {
            const { id } = request.params;
            const { amount } = request.body;
            const client = await fastify.pg.connect();

            try {
                await client.query('BEGIN');

                const userRes = await client.query('SELECT balance FROM users WHERE id = $1', [id]);
                if (userRes.rowCount === 0) {
                    reply.status(404).send({ error: 'User not found' });
                    await client.query('ROLLBACK');
                    return;
                }

                const userBalance = userRes.rows[0].balance;
                const newBalance = userBalance - amount;

                if (newBalance < 0) {
                    reply.status(400).send({ error: 'Insufficient balance' });
                    await client.query('ROLLBACK');
                    return;
                }

                await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, id]);
                await client.query('COMMIT');
                reply.send({ balance: newBalance });
            } catch (error) {
                await client.query('ROLLBACK');
                console.error(error);
                reply.status(500).send({ error: 'Transaction failed' });
            } finally {
                client.release();
            }
        }
    );
}
