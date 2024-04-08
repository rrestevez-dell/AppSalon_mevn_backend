import User from "../models/User.js";
import { sendEmailVerification, sendEmailPasswordReset } from "../emails/authEmailService.js";
import { generateJWT } from '../utils/utilsServiceController.js'
import { uniqueId } from "../utils/index.js";

const register = async (req, res) => {

    // Validando todos los campos
    if (Object.values(req.body).includes('')) {
        const error = new Error('todos los campos son obligatorios')
        return res.status(400).json({ msg: error.message })
    }

    const { email, password, name } = req.body

    // Validando registros duplicados
    const userExists = await User.findOne({ email })
    if (userExists) {
        const error = new Error('Este email ya ha sido registrado')
        return res.status(400).json({ msg: error.message })
    }

    // Validando la extencion del password
    const MIN_PASSWORD_LENGTH = 8
    if (password.trim().length < MIN_PASSWORD_LENGTH) {
        const error = new Error(`Password incorrecto, debe contener ${MIN_PASSWORD_LENGTH} caracteres`)
        return res.status(400).json({ msg: error.message })
    }


    try {
        const user = new User(req.body)
        const result = await user.save()

        const { name, email, token } = result
        sendEmailVerification({ name, email, token })

        res.json({
            msg: 'El Usuario se reguistro correctamente, revisa tu email'
        })
    } catch (error) {
        console.log(error);
    }
}

const verifyAccount = async (req, res) => {
    const { token } = req.params

    const user = await User.findOne({ token })

    // validando el token de usuario
    if (!user) {
        const error = new Error('token no valido')
        return res.status(401).json({msg: error.message})
    }

    // Confirmacion de cuenta si el usuario es valido
    try {
        user.verified = true
        user.token = ''
        await user.save()
        res.json({msg: 'Usuario confirmado correctamente'})
    } catch (error) {
       console.log(error); 
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    // Revisar que el usuario exista
    const user = await User.findOne({email})
    if (!user) {
        const error = new Error('El usiario no existe')
        return res.status(401).json({msg: error.message})
    }

    // Revisar si el usuario confirmo su cuenta
    if (!user.verified) {
        const error = new Error('La cuenta no ha sido verificada aun, revisa el correo')
        return res.status(401).json({msg: error.message})
    }
    
    // Comprobar el password
    if (await user.checkPassword(password)) {

        const token = generateJWT(user._id)

        res.json({token})
    } else {
        const error = new Error('El password es incorrecto')
        return res.status(401).json({msg: error.message})
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body
    console.log(email);
    // Comprobar si existe el usuario
    const user = await User.findOne({email})
    if(!user) {
        const error = new Error('El usuario no existe')
        return res.status(404).json({msg: error.message})
    }

    try {
        user.token = uniqueId()
        const result = await user.save()
        
        await sendEmailPasswordReset({
            name: result.name,
            email: result.email,
            token: result.token
        })
    
        res.json({
            msg: 'Hemos enviado un email con las instrucciones'
        })
    } catch (error) {
        console.log(error)
    }
}

const verifyPasswordResetToken = async (req, res) => {
    const { token } = req.params

    const isValidToken = await User.findOne({token})
    
    if(!isValidToken) {
        const error = new Error('Hubo un error, Token no válido')
        return res.status(400).json({msg: error.message})
    }

    res.json({msg: 'Token Válido'})
}

const updatePassword = async (req, res) => {

    const { token } = req.params
    const user = await User.findOne({token})
    if(!user) {
        const error = new Error('Hubo un error, Token no válido')
        return res.status(400).json({msg: error.message})
    }

    const { password } = req.body
    
    try {
        user.token = ''
        user.password = password
        await user.save()
        res.json({
            msg: 'Password modificado correctamente'
        })
    } catch (error) {
        console.log(error)
    }
}

const user = async (req, res) => {
    const { user } = req
    res.json({user})
}

const admin = async (req, res) => {
    const { user } = req
    
    if(!user.admin) {
        const error = new Error('Acción no válida')
        return res.status(403).json({msg: error.message})
    }

    res.json(
        user
    )
}

export {
    register,
    verifyAccount,
    login,
    forgotPassword,
    verifyPasswordResetToken,
    updatePassword,
    user,
    admin
}