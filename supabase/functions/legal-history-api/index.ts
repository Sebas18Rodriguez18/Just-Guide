/*
  Legal History CRUD API
  Handles tracking user legal interactions and procedures
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CreateHistoryRequest {
  user_id: string;
  procedure_type: string;
  result: string;
  date?: string;
}

interface UpdateHistoryRequest {
  procedure_type?: string;
  result?: string;
  date?: string;
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
    const historyId = pathParts[pathParts.length - 1];
    const userId = url.searchParams.get('user_id');

    switch (method) {
      case 'POST':
        // Create history entry
        const createData: CreateHistoryRequest = await req.json();
        
        const { data: history, error: createError } = await supabase
          .from('legal_history')
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
          JSON.stringify({ history }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'GET':
        if (historyId && historyId !== 'legal-history-api') {
          // Get specific history entry
          const { data: history, error } = await supabase
            .from('legal_history')
            .select(`
              *,
              users (
                name,
                email
              )
            `)
            .eq('id', historyId)
            .single();

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ history }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get history entries (optionally filtered by user)
          let query = supabase
            .from('legal_history')
            .select(`
              *,
              users (
                name,
                email
              )
            `)
            .order('date', { ascending: false });

          if (userId) {
            query = query.eq('user_id', userId);
          }

          const { data: histories, error } = await query;

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ histories }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'PUT':
        // Update history entry
        const updateData: UpdateHistoryRequest = await req.json();
        
        const { data: updatedHistory, error: updateError } = await supabase
          .from('legal_history')
          .update(updateData)
          .eq('id', historyId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ history: updatedHistory }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete history entry
        const { error: deleteError } = await supabase
          .from('legal_history')
          .delete()
          .eq('id', historyId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'History entry deleted successfully' }),
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