/*
  Legal Entities CRUD API
  Handles management of legal institutions and entities
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CreateEntityRequest {
  name: string;
  type: string;
  city: string;
  contact_email?: string;
  submission_url?: string;
}

interface UpdateEntityRequest {
  name?: string;
  type?: string;
  city?: string;
  contact_email?: string;
  submission_url?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const method = req.method;
    const pathParts = url.pathname.split('/').filter(Boolean);
    const entityId = pathParts[pathParts.length - 1];
    const type = url.searchParams.get('type');
    const city = url.searchParams.get('city');

    switch (method) {
      case 'POST':
        // Create entity
        const createData: CreateEntityRequest = await req.json();
        
        const { data: entity, error: createError } = await supabase
          .from('legal_entities')
          .insert(createData)
          .select()
          .single();

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ entity }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'GET':
        if (entityId && entityId !== 'legal-entities-api') {
          // Get specific entity
          const { data: entity, error } = await supabase
            .from('legal_entities')
            .select('*')
            .eq('id', entityId)
            .single();

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ entity }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get entities (optionally filtered)
          let query = supabase
            .from('legal_entities')
            .select('*')
            .order('name', { ascending: true });

          if (type) {
            query = query.eq('type', type);
          }
          if (city) {
            query = query.eq('city', city);
          }

          const { data: entities, error } = await query;

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ entities }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'PUT':
        // Update entity
        const updateData: UpdateEntityRequest = await req.json();
        
        const { data: updatedEntity, error: updateError } = await supabase
          .from('legal_entities')
          .update(updateData)
          .eq('id', entityId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ entity: updatedEntity }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete entity
        const { error: deleteError } = await supabase
          .from('legal_entities')
          .delete()
          .eq('id', entityId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'Entity deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});