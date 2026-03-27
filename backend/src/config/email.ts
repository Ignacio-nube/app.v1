import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Mueblería Centro Hogar" <noreply@centrohogar.com>',
    to,
    subject: 'Recuperación de contraseña - Mueblería Centro Hogar',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #FF6B00; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Mueblería Centro Hogar</h1>
        </div>
        <div style="background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2d3748; margin-top: 0;">Recuperación de contraseña</h2>
          <p style="color: #4a5568; line-height: 1.6;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            Si no realizaste esta solicitud, podés ignorar este correo.
          </p>
          <p style="color: #4a5568; line-height: 1.6;">
            Hacé clic en el botón de abajo para crear una nueva contraseña.
            El enlace es válido por <strong>1 hora</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="background: #FF6B00; color: white; padding: 14px 32px; text-decoration: none;
                      border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #718096; font-size: 14px;">
            Si el botón no funciona, copiá y pegá el siguiente enlace en tu navegador:
          </p>
          <p style="color: #718096; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
            Este correo fue enviado automáticamente. Por favor no respondas este mensaje.
          </p>
        </div>
      </div>
    `,
  });
}

export default transporter;
