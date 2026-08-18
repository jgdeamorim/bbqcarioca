import { Hono } from 'hono';
import { z } from 'zod';
import { turnstileValidator } from '../middleware/turnstile';

const app = new Hono<{ Bindings: { DB: D1Database; TURNSTILE_SECRET_KEY: string } }>();

const schema = z.object({
  identity: z.object({
    full_name: z.string().min(2),
    email: z.string().email(),
    whatsapp_phone: z.string().min(5)
  }),
  skills: z.array(z.string()).min(1),
  logistics: z.object({
    zip_code: z.string().min(4),
    max_travel_miles: z.number().positive()
  }),
  correlationId: z.string().uuid()
});

app.post('/apply', turnstileValidator, async (c) => {
  const body = await c.req.json();
  const parsed = schema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.format() }, 400);
  }

  const data = parsed.data;
  const personId = crypto.randomUUID();
  const talentProfileId = crypto.randomUUID();
  const locationId = crypto.randomUUID();
  const auditId = crypto.randomUUID();
  
  const { DB } = c.env;

  try {
    // Transactional sequence using batch
    
    // 1. Upsert Location first
    const stmts = [];
    stmts.push(DB.prepare(
      `INSERT INTO locations (id, location_type, zip_code) VALUES (?, 'CANDIDATE', ?)`
    ).bind(locationId, data.logistics.zip_code));

    // 2. Upsert Person (CANDIDATE)
    stmts.push(DB.prepare(
      `INSERT INTO persons (id, type, full_name, email, whatsapp_phone) 
       VALUES (?, 'CANDIDATE', ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET full_name = excluded.full_name, whatsapp_phone = excluded.whatsapp_phone`
    ).bind(personId, data.identity.full_name, data.identity.email, data.identity.whatsapp_phone));

    // To properly link the talent profile, we'll execute the person insertion and fetch ID first.
    // For D1, ON CONFLICT DO UPDATE doesn't easily return the final ID in a batch unless returning is supported.
    // D1 supports RETURNING now. Let's do it directly.
    const personRes = await DB.prepare(
      `INSERT INTO persons (id, type, full_name, email, whatsapp_phone) 
       VALUES (?, 'CANDIDATE', ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET full_name = excluded.full_name, whatsapp_phone = excluded.whatsapp_phone
       RETURNING id`
    ).bind(personId, data.identity.full_name, data.identity.email, data.identity.whatsapp_phone).first<{id: string}>();
    
    const finalPersonId = personRes?.id || personId;

    // 3. Insert Talent Profile
    await DB.prepare(
      `INSERT INTO locations (id, location_type, zip_code) VALUES (?, 'CANDIDATE', ?)`
    ).bind(locationId, data.logistics.zip_code).run();

    await DB.prepare(
      `INSERT INTO talent_profiles (id, person_id, location_id, status, work_authorization_status, experience_years) 
       VALUES (?, ?, ?, 'NEW', 'AUTHORIZED', 0)`
    ).bind(talentProfileId, finalPersonId, locationId).run();

    // 4. Insert Audit Log
    await DB.prepare(
      `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, correlation_id) 
       VALUES (?, ?, 'CREATED_TALENT_PROFILE', 'talent_profiles', ?, ?)`
    ).bind(auditId, finalPersonId, talentProfileId, data.correlationId).run();

    // 5. Return handhshake token (Dummy JWT for Phase 3)
    const token = 'fake-jwt-token-talent-' + finalPersonId;

    return c.json({ success: true, talentProfileId, token }, 201);
  } catch (err: any) {
    console.error(err);
    return c.json({ error: 'Database error', details: err.message }, 500);
  }
});

export default app;
