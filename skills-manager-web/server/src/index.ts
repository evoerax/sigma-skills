import Fastify from 'fastify';
import cors from '@fastify/cors';
import { scanTools, scanSkills, getSkillContent, deleteSkill, getFolders, addFolder, removeFolder } from './scanner.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });

fastify.get('/api/tools', async () => {
  return scanTools();
});

fastify.get('/api/skills', async (request) => {
  const tool = request.query.tool as string | undefined;
  return scanSkills(tool);
});

fastify.get('/api/skills/:id/content', async (request) => {
  const { id } = request.params as { id: string };
  return getSkillContent(decodeURIComponent(id));
});

fastify.delete('/api/skills/:id', async (request) => {
  const { id } = request.params as { id: string };
  return deleteSkill(decodeURIComponent(id));
});

fastify.get('/api/folders', async () => {
  return getFolders();
});

fastify.post('/api/folders', async (request) => {
  const { path } = request.body as { path: string };
  return addFolder(path);
});

fastify.delete('/api/folders/:path', async (request) => {
  const { path } = request.params as { path: string };
  return removeFolder(decodeURIComponent(path));
});

const DEFAULT_PORT = 3001;
const MAX_PORT = 3010;

async function findAvailablePort(startPort: number): Promise<number> {
  const net = await import('net');
  
  for (let port = startPort; port <= MAX_PORT; port++) {
    const available = await new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port, '0.0.0.0');
    });
    if (available) return port;
  }
  throw new Error('No available port found');
}

const start = async () => {
  const port = await findAvailablePort(DEFAULT_PORT);
  await fastify.listen({ port, host: '0.0.0.0' });
  fastify.log.info(`Server listening on port ${port}`);
};

start();
