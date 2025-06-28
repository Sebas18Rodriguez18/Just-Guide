/*
  Account Notification API
  Sends email notifications for account-related events like deletion and registration
*/

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface EmailRequest {
  to: string;
  subject?: string;
  message?: string;
  language?: string;
  type: 'account_deletion' | 'welcome' | 'password_reset';
}

// Email templates for different notification types
const emailTemplates = {
  account_deletion: {
    en: {
      subject: 'Your JustGuide Account Has Been Deleted',
      message: (registerUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #3E5641;">
          <div style="background-color: #264027; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">JustGuide</h1>
            <p style="margin: 5px 0 0;">Your Legal Document Assistant</p>
          </div>
          <div style="background-color: #F5F3F0; padding: 20px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #264027;">Account Deleted Successfully</h2>
            <p>Hello,</p>
            <p>Your JustGuide account has been successfully deleted as requested. All your personal data and documents have been removed from our systems.</p>
            <p>If you deleted your account by mistake or wish to use our services again in the future, you can register a new account using the same email address.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registerUrl}" style="background-color: #A6A15E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Register New Account</a>
            </div>
            <p>Thank you for using JustGuide. We hope our service was helpful to you.</p>
            <p>Best regards,<br>The JustGuide Team</p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #6B7280;">
            <p>© 2025 JustGuide. All rights reserved.</p>
          </div>
        </div>
      `
    },
    es: {
      subject: 'Tu Cuenta de JustGuide Ha Sido Eliminada',
      message: (registerUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #3E5641;">
          <div style="background-color: #264027; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">JustGuide</h1>
            <p style="margin: 5px 0 0;">Tu Asistente de Documentos Legales</p>
          </div>
          <div style="background-color: #F5F3F0; padding: 20px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #264027;">Cuenta Eliminada Exitosamente</h2>
            <p>Hola,</p>
            <p>Tu cuenta de JustGuide ha sido eliminada exitosamente según lo solicitado. Todos tus datos personales y documentos han sido eliminados de nuestros sistemas.</p>
            <p>Si eliminaste tu cuenta por error o deseas utilizar nuestros servicios nuevamente en el futuro, puedes registrar una nueva cuenta utilizando la misma dirección de correo electrónico.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${registerUrl}" style="background-color: #A6A15E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Registrar Nueva Cuenta</a>
            </div>
            <p>Gracias por utilizar JustGuide. Esperamos que nuestro servicio te haya sido útil.</p>
            <p>Saludos cordiales,<br>El Equipo de JustGuide</p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #6B7280;">
            <p>© 2025 JustGuide. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    }
  },
  welcome: {
    en: {
      subject: 'Welcome to JustGuide!',
      message: (loginUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #3E5641;">
          <div style="background-color: #264027; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">JustGuide</h1>
            <p style="margin: 5px 0 0;">Your Legal Document Assistant</p>
          </div>
          <div style="background-color: #F5F3F0; padding: 20px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #264027;">Welcome to JustGuide!</h2>
            <p>Hello,</p>
            <p>Thank you for registering with JustGuide. We're excited to help you simplify and understand legal documents.</p>
            <p>With JustGuide, you can:</p>
            <ul>
              <li>Upload legal documents for AI-powered analysis</li>
              <li>Get plain language explanations of complex legal terms</li>
              <li>Receive step-by-step guides tailored to your documents</li>
              <li>Access your documents and guides anytime, anywhere</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #A6A15E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Sign In to Your Account</a>
            </div>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The JustGuide Team</p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #6B7280;">
            <p>© 2025 JustGuide. All rights reserved.</p>
          </div>
        </div>
      `
    },
    es: {
      subject: '¡Bienvenido a JustGuide!',
      message: (loginUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #3E5641;">
          <div style="background-color: #264027; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">JustGuide</h1>
            <p style="margin: 5px 0 0;">Tu Asistente de Documentos Legales</p>
          </div>
          <div style="background-color: #F5F3F0; padding: 20px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #264027;">¡Bienvenido a JustGuide!</h2>
            <p>Hola,</p>
            <p>Gracias por registrarte en JustGuide. Estamos emocionados de ayudarte a simplificar y entender documentos legales.</p>
            <p>Con JustGuide, puedes:</p>
            <ul>
              <li>Subir documentos legales para análisis con IA</li>
              <li>Obtener explicaciones en lenguaje sencillo de términos legales complejos</li>
              <li>Recibir guías paso a paso adaptadas a tus documentos</li>
              <li>Acceder a tus documentos y guías en cualquier momento y lugar</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="background-color: #A6A15E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Iniciar Sesión en tu Cuenta</a>
            </div>
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a nuestro equipo de soporte.</p>
            <p>Saludos cordiales,<br>El Equipo de JustGuide</p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #6B7280;">
            <p>© 2025 JustGuide. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    }
  },
  password_reset: {
    en: {
      subject: 'Reset Your JustGuide Password',
      message: (resetUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #3E5641;">
          <div style="background-color: #264027; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">JustGuide</h1>
            <p style="margin: 5px 0 0;">Your Legal Document Assistant</p>
          </div>
          <div style="background-color: #F5F3F0; padding: 20px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #264027;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your JustGuide account password. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #A6A15E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
            </div>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you're having trouble with the button above, copy and paste the following URL into your browser:</p>
            <p style="word-break: break-all; font-size: 12px; color: #6B7280;">${resetUrl}</p>
            <p>Best regards,<br>The JustGuide Team</p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #6B7280;">
            <p>© 2025 JustGuide. All rights reserved.</p>
          </div>
        </div>
      `
    },
    es: {
      subject: 'Restablece tu Contraseña de JustGuide',
      message: (resetUrl: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #3E5641;">
          <div style="background-color: #264027; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">JustGuide</h1>
            <p style="margin: 5px 0 0;">Tu Asistente de Documentos Legales</p>
          </div>
          <div style="background-color: #F5F3F0; padding: 20px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #264027;">Solicitud de Restablecimiento de Contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de JustGuide. Si no realizaste esta solicitud, puedes ignorar este correo electrónico.</p>
            <p>Para restablecer tu contraseña, haz clic en el botón a continuación:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #A6A15E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Restablecer Contraseña</a>
            </div>
            <p>Este enlace caducará en 24 horas por razones de seguridad.</p>
            <p>Si tienes problemas con el botón anterior, copia y pega la siguiente URL en tu navegador:</p>
            <p style="word-break: break-all; font-size: 12px; color: #6B7280;">${resetUrl}</p>
            <p>Saludos cordiales,<br>El Equipo de JustGuide</p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #6B7280;">
            <p>© 2025 JustGuide. Todos los derechos reservados.</p>
          </div>
        </div>
      `
    }
  }
};

// Function to send email notification
async function sendEmailNotification(request: EmailRequest): Promise<{ success: boolean; message: string }> {
  try {
    // In a real implementation, this would use a service like SendGrid, Mailgun, etc.
    // For demo purposes, we'll just log the email details
    
    console.log('Sending email notification:');
    console.log(`To: ${request.to}`);
    console.log(`Type: ${request.type}`);
    
    // Get the base URL for links
    const baseUrl = Deno.env.get('PUBLIC_URL') || 'https://justguide.com';
    
    // Determine language to use
    const lang = request.language === 'es' ? 'es' : 'en';
    
    // Get template based on notification type
    const template = emailTemplates[request.type][lang];
    
    // Use template subject if not provided
    const subject = request.subject || template.subject;
    
    let emailContent = '';
    
    // Generate email content based on type
    switch (request.type) {
      case 'account_deletion':
        const registerUrl = `${baseUrl}/register`;
        emailContent = template.message(registerUrl);
        break;
      case 'welcome':
        const loginUrl = `${baseUrl}/login`;
        emailContent = template.message(loginUrl);
        break;
      case 'password_reset':
        const resetUrl = `${baseUrl}/reset-password`;
        emailContent = template.message(resetUrl);
        break;
      default:
        emailContent = request.message || '';
    }
    
    // In a real implementation, you would send the email here
    // For example, using SendGrid:
    /*
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: request.to }] }],
        from: { email: 'notifications@justguide.com', name: 'JustGuide' },
        subject: subject,
        content: [{ type: 'text/html', value: emailContent }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`);
    }
    */
    
    return { success: true, message: 'Email notification sent successfully' };
    
  } catch (error) {
    console.error('Error sending email notification:', error);
    return { success: false, message: error.message };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const requestData: EmailRequest = await req.json();
    
    if (!requestData.to || !requestData.type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const result = await sendEmailNotification(requestData);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: result.message }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});