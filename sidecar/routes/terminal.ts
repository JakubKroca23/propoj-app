import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const router = Router();

// Safety whitelist of commands
const WHITELIST = ['ls', 'docker', 'uptime', 'date', 'whoami', 'df', 'free', 'node -v', 'npm -v'];

router.post('/', async (req, res) => {
  const { command } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  // Basic security check: command must start with a whitelisted base
  const baseCommand = command.split(' ')[0];
  if (!WHITELIST.includes(baseCommand)) {
    return res.status(403).json({ 
      error: `Security Protocol Violation: Command '${baseCommand}' is restricted.` 
    });
  }

  try {
    // Execute command with a timeout of 5 seconds
    const { stdout, stderr } = await execPromise(command, { timeout: 5000 });
    
    res.json({
      stdout,
      stderr,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Execution Failure',
      details: error.message,
      stderr: error.stderr
    });
  }
});

export default router;
