/*
  Assisted Responses CRUD API
  Handles user responses to document fields filled with AI assistance
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CreateResponseRequest {
  document_id: string;
  user_id: string;
  answers?: object;
  completion_status?: string;
}

interface UpdateResponseRequest {
  answers?: object;
  completion_status?: string;
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
    const responseId = pathParts[pathParts.length - 1];
    const userId = url.searchParams.get('user_id');
    const documentId = url.searchParams.get('document_id');

    switch (method) {
      case 'POST':
        // Create response
        const createData: CreateResponseRequest = await req.json();
        
        const { data: response, error: createError } = await supabase
          .from('assisted_responses')
          .upsert(createData)
          .select()
          .single();

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ response }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'GET':
        if (responseId && responseId !== 'responses-api') {
          // Get specific response
          const { data: response, error } = await supabase
            .from('assisted_responses')
            .select(`
              *,
              documents (
                title,
                document_type
              ),
              users (
                name,
                email
              )
            `)
            .eq('id', responseId)
            .single();

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ response }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get responses (filtered by user or document)
          let query = supabase
            .from('assisted_responses')
            .select(`
              *,
              documents (
                title,
                document_type
              ),
              users (
                name,
                email
              )
            `)
            .order('created_at', { ascending: false });

          if (userId) {
            query = query.eq('user_id', userId);
          }
          if (documentId) {
            query = query.eq('document_id', documentId);
          }

          const { data: responses, error } = await query;

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ responses }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'PUT':
        // Update response
        const updateData: UpdateResponseRequest = await req.json();
        
        const { data: updatedResponse, error: updateError } = await supabase
          .from('assisted_responses')
          .update(updateData)
          .eq('id', responseId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ response: updatedResponse }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete response
        const { error: deleteError } = await supabase
          .from('assisted_responses')
          .delete()
          .eq('id', responseId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'Response deleted successfully' }),
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