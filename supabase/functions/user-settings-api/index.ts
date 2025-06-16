/*
  User Settings CRUD API
  Handles user preferences including legal framework, language, and literacy level
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CreateSettingsRequest {
  user_id: string;
  preferred_country?: string;
  preferred_region?: string;
  legal_framework_id?: string;
  language?: string;
  legal_literacy_level?: string;
}

interface UpdateSettingsRequest {
  preferred_country?: string;
  preferred_region?: string;
  legal_framework_id?: string;
  language?: string;
  legal_literacy_level?: string;
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
    const settingsId = pathParts[pathParts.length - 1];
    const userId = url.searchParams.get('user_id');

    switch (method) {
      case 'POST':
        // Create or upsert settings
        const createData: CreateSettingsRequest = await req.json();
        
        const { data: settings, error: createError } = await supabase
          .from('user_settings')
          .upsert(createData)
          .select(`
            *,
            legal_frameworks (
              country,
              region,
              legal_system_type,
              supported_document_types,
              notes
            )
          `)
          .single();

        if (createError) {
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ settings }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'GET':
        if (settingsId && settingsId !== 'user-settings-api') {
          // Get specific settings
          const { data: settings, error } = await supabase
            .from('user_settings')
            .select(`
              *,
              legal_frameworks (
                country,
                region,
                legal_system_type,
                supported_document_types,
                notes
              )
            `)
            .eq('id', settingsId)
            .single();

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ settings }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (userId) {
          // Get settings by user ID
          const { data: settings, error } = await supabase
            .from('user_settings')
            .select(`
              *,
              legal_frameworks (
                country,
                region,
                legal_system_type,
                supported_document_types,
                notes
              )
            `)
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') { // Not found is OK
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ settings: settings || null }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({ error: 'user_id parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'PUT':
        // Update settings
        const updateData: UpdateSettingsRequest = await req.json();
        
        const { data: updatedSettings, error: updateError } = await supabase
          .from('user_settings')
          .update(updateData)
          .eq('id', settingsId)
          .select(`
            *,
            legal_frameworks (
              country,
              region,
              legal_system_type,
              supported_document_types,
              notes
            )
          `)
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ settings: updatedSettings }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete settings
        const { error: deleteError } = await supabase
          .from('user_settings')
          .delete()
          .eq('id', settingsId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'Settings deleted successfully' }),
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