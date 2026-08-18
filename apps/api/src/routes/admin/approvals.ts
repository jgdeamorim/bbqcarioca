import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../../index';

const app = new Hono<{ Bindings: Env }>();

// GET /pending-requests
app.get('/pending-requests', async (c) => {
  const { DB } = c.env;
  try {
    const { results } = await DB.prepare(`
      SELECT r.*, p.full_name, p.email, p.whatsapp_phone
      FROM service_requests r
      JOIN persons p ON r.customer_id = p.id
      WHERE r.status = 'NEW'
      ORDER BY r.created_at DESC
    `).all();
    return c.json({ requests: results });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// GET /pending-talents
app.get('/pending-talents', async (c) => {
  const { DB } = c.env;
  try {
    const { results } = await DB.prepare(`
      SELECT t.*, p.full_name, p.email, p.whatsapp_phone, l.zip_code
      FROM talent_profiles t
      JOIN persons p ON t.person_id = p.id
      LEFT JOIN locations l ON t.location_id = l.id
      WHERE t.status = 'NEW'
      ORDER BY t.created_at DESC
    `).all();
    return c.json({ talents: results });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /quotes (Approve a service request and generate quote)
const quoteSchema = z.object({
  service_request_id: z.string().uuid(),
  total_price: z.number().positive(),
  staff_cost: z.number().positive(),
  margin: z.number().positive()
});

app.post('/quotes', async (c) => {
  const body = await c.req.json();
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: 'Invalid payload', details: parsed.error.format() }, 400);
  
  const { DB } = c.env;
  const data = parsed.data;
  const quoteId = crypto.randomUUID();

  try {
    const req = await DB.prepare(`SELECT * FROM service_requests WHERE id = ?`).bind(data.service_request_id).first();
    if (!req) return c.json({ error: 'Service Request not found' }, 404);

    await DB.batch([
      DB.prepare(
        `INSERT INTO quotes (id, service_request_id, total_price, staff_cost, margin, status) 
         VALUES (?, ?, ?, ?, ?, 'APPROVED')`
      ).bind(quoteId, data.service_request_id, data.total_price, data.staff_cost, data.margin),
      DB.prepare(
        `UPDATE service_requests SET status = 'QUOTED' WHERE id = ?`
      ).bind(data.service_request_id)
    ]);

    return c.json({ success: true, quoteId }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// POST /talent/:id/approve
app.post('/talent/:id/approve', async (c) => {
  const id = c.req.param('id');
  const { DB } = c.env;
  try {
    const res = await DB.prepare(
      `UPDATE talent_profiles SET status = 'AUTHORIZED' WHERE id = ?`
    ).bind(id).run();
    
    if (res.meta.changes === 0) return c.json({ error: 'Profile not found' }, 404);
    
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
