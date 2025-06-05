import { NextApiRequest, NextApiResponse } from 'next';
import { resend } from '@/lib/resend';
// import { readFileSync } from 'fs';
// import { join } from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, name, gift, location } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Correo requerido' });
  }

  try {
    // const emailHtmlPath = join(process.cwd(), 'src/pages/api/send-email/email.html');
    // const emailHtml = readFileSync(emailHtmlPath, 'utf8');

    const data = await resend.emails.send({
      from: 'Tecpoint Distribución <tecpointdistribucion@tecpoint.ws>',
      to: [email],
      subject: 'RASPA Y GANA CON TECPOINT',
      html: `
      <!DOCTYPE html>
    <html lang="es">

    <head>
    <meta charset="UTF-8" />
    <title>¡Ganaste un premio!</title>
    </head>

    <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px; color: #333;">
    <div
    style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 4px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);">
    
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://firebasestorage.googleapis.com/v0/b/tecpoint-2024.appspot.com/o/EMAIL%2Fbanner_sorteo_mes_mayo.webp?alt=media&token=880374d5-4f99-4cb3-9659-6721024a2236" alt="Logo" style="width: 100%; height: auto; border-radius: 10px;" />
    </div>

    <p style="color: #000;">Hola ${name}</p>

    <h1 style="color: #000;">🎉 ¡Felicidades! 🎉</h1>
    <p style="font-size: 16px;">🎉¡Felicidades! ¡Has ganado ${gift} 🎉</p>

    <p>Nos complace informarte que has sido seleccionado como ganador de un premio exclusivo de ${gift}
      Esta es nuestra manera de agradecerte por tu preferencia y por ser
      parte de nuestra comunidad.</p>

    <h3 style="color: #000;">¿Qué has ganado?</h3>
    <p>Un premio especial de un <strong>${gift}</strong>, listo para que lo disfrutes. 🎧✨</p>

    <h3 style="color: #000;">¿Qué debes hacer ahora?</h3>
    <p>Simplemente preséntate al punto de venta ${location}, y Presentar este Corrreo antes del <strong>Lunes 30 de Julio</strong> para realizar la
      entrega de tu premio.</p>

    <p>¡Gracias por confiar en nosotros!<br />
      Y prepárate… vienen más sorpresas muy pronto 😉</p>

      <div style="text-align: center; margin-top: 20px;">
      <a href="https://wa.me/50497157784" style="display: inline-block; background-color: #25D366; color: #fff; text-decoration: none; padding: 10px 50px; border-radius: 12px; font-size: 16px;">
        Contactar por WhatsApp
      </a>
      </div>

    <hr style="margin: 30px 0;" />

    <p style="text-align: center; font-weight: bold;">GRACIAS ${name} POR PARTICIPAR</p>

    <p style="font-size: 12px; color: #777;">
      Recibes este correo porque te suscribiste a través de nuestro sitio web.<br />
      ¿Deseas actualizar tus preferencias o dejar de recibir estos correos?<br />
      Haz clic aquí: <a href="https://tecpoint.ws" style="color: #09f;">tienda online Tecpoint</a>
    </p>

    <p style="font-size: 12px; color: #000;">
      <strong>Tecpoint City Mall, S.P.S</strong><br />
      Segundo nivel frente a tiendas Carrion<br />
      📞 +504 9520-0523
    </p>

    <p style="font-size: 12px; color: #000;">
      <strong>Tecpoint Plaza Carolina</strong><br />
      Plaza Carolina Boulevard Mackey, Segundo Nivel<br />
      📞 +504 9338-5732
    </p>

    <p style="font-size: 12px; color: #000;">
      <strong>Tecpoint Barrio el Benque</strong><br />
      9 avenida S.O. entre 5 y 6 calle a la par de BM Textiles<br />
      📞 +504 9715-7784
    </p>
    </div>
    </body>

    </html>
      `,
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ error: 'Error al enviar el correo' });
  }
}
