import { Context, Next } from 'hono';

export async function cloudflareAccessAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const jwt = authHeader?.replace('Bearer ', '');

  if (!jwt) {
    return c.text('Unauthorized: Missing JWT', 401);
  }

  try {
    const JWKS_URL = c.env.JWKS_URL as string;
    if (!JWKS_URL) {
      return c.text('Internal Server Error: JWKS_URL not configured', 500);
    }

    // In a production scenario, we would use a library like `jose` to parse 
    // and cryptographically verify the JWT against the Cloudflare Access JWKS endpoint.
    // For this boilerplate/Fase 1, we simulate the validation middleware.
    
    // Example:
    // const jwks = await createRemoteJWKSet(new URL(JWKS_URL))
    // const { payload } = await jwtVerify(jwt, jwks, {
    //   issuer: 'https://<your-team-name>.cloudflareaccess.com',
    //   audience: '<your-policy-aud>'
    // })

    // Simulate validation pass
    const isValid = true; 
    
    if (!isValid) {
      return c.text('Unauthorized: Invalid Signature', 401);
    }

    await next();
  } catch (e: unknown) {
    void e; // Adsentice SOP: no empty catch blocks
    return c.text('Unauthorized: Validation Failed', 401);
  }
}
