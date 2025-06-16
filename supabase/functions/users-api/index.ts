/*
  Users CRUD API
  Handles user registration, authentication, and profile management
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  language?: string;
  literacy_level?: string;
}

interface UpdateUserRequest {
  name?: string;
  language?: string;
  literacy_level?: string;
  uploaded_documents?: any[];
  history?: object;
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
    const userId = pathParts[pathParts.length - 1];

    switch (method) {
      case 'POST':
        // Create user (registration)
        const createData: CreateUserRequest = await req.json();
        
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: createData.email,
          password: createData.password,
          email_confirm: true,
        });

        if (authError) {
          return new Response(
            JSON.stringify({ error: authError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            name: createData.name,
            email: createData.email,
            hashed_password: 'handled_by_auth',
            language: createData.language || 'en',
            literacy_level: createData.literacy_level || 'basic',
          })
          .select()
          .single();

        if (userError) {
          return new Response(
            JSON.stringify({ error: userError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ user, auth_user: authUser.user }),
          { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'GET':
        if (userId && userId !== 'users-api') {
          // Get specific user
          const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, language, literacy_level, uploaded_documents, history, created_at, updated_at')
            .eq('id', userId)
            .single();

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ user }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Get all users (admin functionality)
          const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, language, literacy_level, created_at, updated_at')
            .order('created_at', { ascending: false });

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          return new Response(
            JSON.stringify({ users }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'PUT':
        // Update user
        const updateData: UpdateUserRequest = await req.json();
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ user: updatedUser }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // Delete user
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ message: 'User deleted successfully' }),
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