import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

serve(async (req) => {
  try {
    const client = new Client(Deno.env.get("SUPABASE_DB_URL"));
    await client.connect();

    await client.queryArray(`
      create table if not exists waitlist (
        id uuid primary key default gen_random_uuid(),
        email text not null unique,
        created_at timestamptz default now()
      );

      alter table waitlist enable row level security;

      create policy "Enable insert for anon"
        on waitlist for insert
        to anon
        with check (true);

      create policy "Enable all for service_role"
        on waitlist for all
        to service_role
        using (true)
        with check (true);

      create policy "Enable read for service_role"
        on waitlist for select
        to service_role
        using (true);
    `);

    await client.end();

    return new Response(
      JSON.stringify({ message: "Table created successfully" }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
});
