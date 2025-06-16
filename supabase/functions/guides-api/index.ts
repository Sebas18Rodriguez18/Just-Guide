/*
  Simplified Guides CRUD API
  Handles AI-generated plain language summaries and step-by-step explanations
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CreateGuideRequest {
  document_id: string;
  summary: string;
  step_by_step_explanation: string;
  reading_level?: string;
}

interface UpdateGuideRequest {
  summary?: string;
  step_by_step_explanation?: string;
  reading_level?: string;
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
    const guideId = pathParts[pathParts.length - 1];
    const documentId = url.searchParams.get('document_id');

    switch (method) {
      case 'POST':
        // Create guide
        const createData: CreateGuideRequest = await req.json();
        
        const { data: guide, error: createError } = await supabase
          .from('simplified_guides')
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
          JSON.stringify({ guide }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'GET':
        if (guideId && guideId !== 'guides-api') {
          // Get specific guide
          const { data: guide, error } = await supabase
            .from('simplified_guides')
            .select(`
              *,
              documents (
                title,
                document_type,
                language
              )
            `)
            .eq('id', guideId)
            .single();

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ guide }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get guides (optionally filtered by document)
          let query = supabase
            .from('simplified_guides')
            .select(`
              *,
              documents (
                title,
                document_type,
                language
              )
            `)
            .order('created_at', { ascending: false });

          if (documentId) {
            query = query.eq('document_id', documentId);
          }

          const { data: guides, error } = await query;

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ guides }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'PUT':
        // Update guide
        const updateData: UpdateGuideRequest = await req.json();
        
        const { data: updatedGuide, error: updateError } = await supabase
          .from('simplified_guides')
          .update(updateData)
          .eq('id', guideId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ guide: updatedGuide }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete guide
        const { error: deleteError } = await supabase
          .from('simplified_guides')
          .delete()
          .eq('id', guideId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'Guide deleted successfully' }),
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