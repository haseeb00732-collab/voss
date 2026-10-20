import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import { createSocialHandler, authorizeOwner } from './handler.mjs';

// The gateway JWT check is disabled for modern publishable-key compatibility.
// Every data request explicitly verifies the user's JWT and approved owner role.
const env = (name: string) => Deno.env.get(name);
Deno.serve(createSocialHandler({
  env,
  authorize: (request: Request) => authorizeOwner(request, { env, createClient }),
}));
