import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
  JWKS_URL: string;
  TURNSTILE_SECRET_KEY: string;
}

import { cloudflareAccessAuth } from './middleware/auth';
import dashboardRoute from './routes/admin/dashboard';
import clientRoute from './routes/client';
import careersRoute from './routes/careers';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: ['https://portal.bbqcarioca.work', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key']
}));

// Healthcheck
app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }));

// Public Conversion Funnels
app.route('/v1/client', clientRoute);
app.route('/v1/careers', careersRoute);

// Protected Admin Routes
app.use('/admin/*', cloudflareAccessAuth);
app.route('/admin/dashboard', dashboardRoute);

export default app;
