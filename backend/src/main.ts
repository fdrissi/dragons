import {CONFIG} from './configuration/index';
import {buildFastify} from './fastify';

const {port} = CONFIG.get('server');
const server = await buildFastify();
await server.listen({host: '0.0.0.0', port});
console.log(`Server running on :${port}`);
