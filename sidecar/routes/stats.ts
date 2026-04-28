import { Router } from 'express';
import Docker from 'dockerode';

const router = Router();
const isWindows = process.platform === 'win32';
const docker = new Docker(isWindows ? { socketPath: '//./pipe/docker_engine' } : { socketPath: '/var/run/docker.sock' });

// Mock data for development when Docker is unreachable
const getMockStats = () => [
  {
    id: 'mock-1',
    name: 'propoj.app',
    image: 'propoj-frontend:latest',
    state: 'running',
    status: 'Up 2 hours',
    cpu_percent: Math.random() * 5 + 2,
    memory_usage: 150 * 1024 * 1024,
    memory_limit: 1024 * 1024 * 1024,
    memory_percent: 14.6
  },
  {
    id: 'mock-2',
    name: 'propoj.sidecar',
    image: 'propoj-sidecar:latest',
    state: 'running',
    status: 'Up 2 hours',
    cpu_percent: Math.random() * 2 + 1,
    memory_usage: 85 * 1024 * 1024,
    memory_limit: 512 * 1024 * 1024,
    memory_percent: 16.2
  },
  {
    id: 'mock-3',
    name: 'appwrite',
    image: 'appwrite/appwrite:latest',
    state: 'running',
    status: 'Up 5 days',
    cpu_percent: Math.random() * 10 + 5,
    memory_usage: 450 * 1024 * 1024,
    memory_limit: 2048 * 1024 * 1024,
    memory_percent: 21.9
  }
];

router.get('/', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    
    const stats = await Promise.all(containers.map(async (containerInfo: any) => {
      try {
        const container = docker.getContainer(containerInfo.Id);
        const containerStats = await container.stats({ stream: false });
        
        // Calculate CPU percentage
        // (cpu_usage.total_usage - precpu_usage.total_usage) / (system_cpu_usage - presystem_cpu_usage) * online_cpus * 100.0
        const cpuDelta = containerStats.cpu_stats.cpu_usage.total_usage - containerStats.precpu_stats.cpu_usage.total_usage;
        const systemDelta = containerStats.cpu_stats.system_cpu_usage - containerStats.precpu_stats.system_cpu_usage;
        const onlineCpus = containerStats.cpu_stats.online_cpus || 1;
        const cpuPercent = systemDelta > 0 ? (cpuDelta / systemDelta) * onlineCpus * 100.0 : 0;

        // Memory usage
        const memUsage = containerStats.memory_stats.usage || 0;
        const memLimit = containerStats.memory_stats.limit || 1;

        return {
          id: containerInfo.Id,
          name: containerInfo.Names[0].replace('/', ''),
          image: containerInfo.Image,
          state: containerInfo.State,
          status: containerInfo.Status,
          cpu_percent: parseFloat(cpuPercent.toFixed(2)),
          memory_usage: memUsage,
          memory_limit: memLimit,
          memory_percent: parseFloat(((memUsage / memLimit) * 100).toFixed(2))
        };
      } catch (err) {
        // Container might have stopped/disappeared during stats call
        return {
          id: containerInfo.Id,
          name: containerInfo.Names[0].replace('/', ''),
          image: containerInfo.Image,
          state: containerInfo.State,
          status: containerInfo.Status,
          cpu_percent: 0,
          memory_usage: 0,
          memory_limit: 0,
          memory_percent: 0,
          error: 'Could not fetch stats'
        };
      }
    }));

    res.json(stats);
  } catch (error: any) {
    console.warn('Docker not reachable, using mock data for development');
    res.json(getMockStats());
  }
});

export default router;
