/*
  Legal Frameworks CRUD API
  Handles management of legal frameworks and jurisdictions
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CreateFrameworkRequest {
  country: string;
  region?: string;
  legal_system_type: string;
  supported_document_types?: string[];
  notes?: string;
  official_sources?: string[];
}

interface UpdateFrameworkRequest {
  country?: string;
  region?: string;
  legal_system_type?: string;
  supported_document_types?: string[];
  notes?: string;
  official_sources?: string[];
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
    const frameworkId = pathParts[pathParts.length - 1];
    const country = url.searchParams.get('country');
    const legalSystemType = url.searchParams.get('legal_system_type');

    switch (method) {
      case 'POST':
        // Create framework
        const createData: CreateFrameworkRequest = await req.json();
        
        const { data: framework, error: createError } = await supabase
          .from('legal_frameworks')
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
          JSON.stringify({ framework }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'GET':
        if (frameworkId && frameworkId !== 'legal-frameworks-api') {
          // Get specific framework
          const { data: framework, error } = await supabase
            .from('legal_frameworks')
            .select('*')
            .eq('id', frameworkId)
            .single();

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ framework }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get frameworks (optionally filtered)
          let query = supabase
            .from('legal_frameworks')
            .select('*')
            .order('country', { ascending: true });

          if (country) {
            query = query.eq('country', country);
          }
          if (legalSystemType) {
            query = query.eq('legal_system_type', legalSystemType);
          }

          const { data: frameworks, error } = await query;

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ frameworks }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'PUT':
        // Update framework
        const updateData: UpdateFrameworkRequest = await req.json();
        
        const { data: updatedFramework, error: updateError } = await supabase
          .from('legal_frameworks')
          .update(updateData)
          .eq('id', frameworkId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ framework: updatedFramework }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete framework
        const { error: deleteError } = await supabase
          .from('legal_frameworks')
          .delete()
          .eq('id', frameworkId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'Legal framework deleted successfully' }),
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