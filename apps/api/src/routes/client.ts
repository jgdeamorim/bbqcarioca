import { Hono } from 'hono';
import { z } from 'zod';
import { turnstileValidator } from '../middleware/turnstile';

const app = new Hono<{ Bindings: { DB: D1Database; TURNSTILE_SECRET_KEY: string } }>();

const schema = z.object({
  service_type: z.string().min(1),
  intent: z.object({
    date: z.string().optional(),
    city: z.string().optional(),
    guests: z.string().optional(),
    grill: z.string().optional(),
    notes: z.string().optional()
  }),
  identity: z.object({
    full_name: z.string().min(2),
    email: z.string().email(),
    whatsapp_phone: z.string().min(5)
  }),
  correlationId: z.string().uuid()
});

app.post('/requests', turnstileValidator, async (c) => {
  const body = await c.req.json();
  const parsed = schema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.format() }, 400);
  }

  const data = parsed.data;
  const personId = crypto.randomUUID();
  const requestId = crypto.randomUUID();
  const auditId = crypto.randomUUID();
  
  const { DB } = c.env;

  try {
    // 1. Upsert Person (CUSTOMER) - simplistic approach for MVP
    await DB.prepare(
      `INSERT INTO persons (id, type, full_name, email, whatsapp_phone) 
       VALUES (?, 'CUSTOMER', ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET full_name = excluded.full_name, whatsapp_phone = excluded.whatsapp_phone`
    ).bind(personId, data.identity.full_name, data.identity.email, data.identity.whatsapp_phone).run();

    // To get the actual person ID if it existed, we query it back
    const person = await DB.prepare(`SELECT id FROM persons WHERE email = ?`).bind(data.identity.email).first<{id: string}>();
    const finalPersonId = person?.id || personId;

    // 2. Insert Service Request
    // Note: location_id and service_id are required by schema, but we don't have them cleanly yet from the intent.
    // In a real scenario we'd do a lookup or insert a location record. Using 'TODO' for MVP based on intent city.
    await DB.prepare(
      `INSERT INTO service_requests (id, customer_id, location_id, service_id, event_date, guests, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`
    ).bind(requestId, finalPersonId, data.intent.city || 'TBD', data.service_type, data.intent.date || 'TBD', parseInt(data.intent.guests || '0', 10)).run();

    // 3. Insert Audit Log
    await DB.prepare(
      `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, correlation_id) 
       VALUES (?, ?, 'CREATED_SERVICE_REQUEST', 'service_requests', ?, ?)`
    ).bind(auditId, finalPersonId, requestId, data.correlationId).run();

    // 4. Return handhshake token (Dummy JWT for Phase 3)
    const token = 'fake-jwt-token-customer-' + finalPersonId;

    return c.json({ success: true, requestId, token }, 201);
  } catch (err: any) {
    console.error(err);
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

export default app;
