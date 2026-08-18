import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
  JWKS_URL: string;
}

import { cloudflareAccessAuth } from './middleware/auth';
import dashboardRoute from './routes/admin/dashboard';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: ['https://admin.bbqdocarioca.work', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key']
}));

// Healthcheck
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }));

// Protected Admin Routes
app.use('/admin/*', cloudflareAccessAuth);
app.route('/admin/dashboard', dashboardRoute);

export default app;
