import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async enviarVerificacion(destinatario: string, verificationUrl: string): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        `RESEND_API_KEY no configurado: no se envió el email de verificación a ${destinatario}. Link: ${verificationUrl}`,
      );
      return;
    }
    const from = this.config.get<string>('RESEND_FROM_EMAIL', 'onboarding@resend.dev');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Academia <${from}>`,
        to: [destinatario],
        subject: 'Confirmá tu cuenta',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Tu cuenta fue creada</h2>
            <p>Confirmá tu email para poder ingresar al panel:</p>
            <p><a href="${verificationUrl}" style="background:#d62828;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Confirmar cuenta</a></p>
            <p>Si el botón no funciona, copiá y pegá este link en tu navegador:</p>
            <p>${verificationUrl}</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(
        `No se pudo enviar el email de verificación a ${destinatario}: ${response.status} ${body}`,
      );
    }
  }
}
