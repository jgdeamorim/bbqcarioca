import { Context, Next } from 'hono';

export async function turnstileValidator(c: Context, next: Next) {
  const body = (await c.req.parseBody().catch(() => ({}))) as Record<string, any>;
  const json = (await c.req.json().catch(() => ({}))) as Record<string, any>;
  
  const token = body.turnstileToken || json.turnstileToken;

  if (!token) {
    return c.json({ error: 'Turnstile token missing', code: 'MISSING_TOKEN' }, 400);
  }

  const secretKey = c.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not defined in the environment bindings.");
    return c.json({ error: 'Internal Server Error' }, 500);
  }

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const data: any = await response.json();

    if (!data.success) {
      console.warn("Turnstile validation failed:", data['error-codes']);
      return c.json({ error: 'Invalid Turnstile token', code: 'INVALID_TOKEN' }, 403);
    }

    // Pass the validation, proceed to the handler
    await next();
  } catch (err) {
    console.error("Error connecting to Turnstile API:", err);
    return c.json({ error: 'Failed to validate CAPTCHA', code: 'VERIFICATION_FAILED' }, 500);
  }
}
