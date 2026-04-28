import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import statsRouter from './routes/stats';
import terminalRouter from './routes/terminal';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT || 3001;

// Base middlewares
app.use(cors());
app.use(express.json());

// Health check (Public)
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api/stats', authMiddleware, statsRouter);
app.use('/api/terminal', authMiddleware, terminalRouter);

app.listen(port, () => {
  console.log(`Sidecar API listening at http://localhost:${port}`);
});
