import { createTransport } from "../config/nodemailer.js";
import colors from 'colors/index.js'

export async function sendEmailVerification({ name, email, token }) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASSWORD
    )

    // Eniar el Email
    const info = await transporter.sendMail({
        from: 'App-Salon <cuentas@appsalon.com>',
        to: email,
        subject: 'AppSalon -- Confirma tu cuenta',
        text: 'AppSalon -- Esto es un mensaje automatico para confirmar su cuenta en nuestro slon. !! No responder a este correo...',
        html: `<p>Hola ${name}, confirma tu cuenta en AppSalon </p>
        <p>Tu cuenta esta casi lista solo debes confirmarla en el enlase:</p>
        <a href="${process.env.FRONTEND_URL}/auth/confirmar-cuenta/${token}">Confirmar cuanta</a>
        <p>Si no creaste esta cuenta, puedes ignorar este mensaje</p>`
    })

    console.log(colors.cyan(`Mensaje enviado --> ${info.messageId}`));
}

export async function sendEmailPasswordReset({name, email, token }) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASSWORD
    )

    // Enviar el email
    const info = await transporter.sendMail({
        from: 'AppSalon <cuentas@appsalon.com>',
        to: email,
        subject: "AppSalon - Reestablece tu password",
        text: "AppSalon - Reestablece tu password",
        html: `<p>Hola: ${name}, has solicitado reestablecer tu password</p>
            <p>Sigue el siguiente enlace para generar un nuevo password:</p>
            <a href="${process.env.FRONTEND_URL}/auth/olvide-password/${token}">Reestablecer Password</a>
            <p>Si tu no solicitaste esto, puedes ignorar este mensaje</p>
        `
    })

    console.log('Mensaje enviado', info.messageId)
}