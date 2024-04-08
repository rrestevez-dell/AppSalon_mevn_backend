import express from 'express' //La sintaxis de ESM (ECMAScript Modules)
import dotenv from 'dotenv'
import colors from 'colors/index.js'
import cors from 'cors'
import { db } from './config/db.js'
import servicesRoutes from './router/servicesRoutes.js'
import authRoutes from './router/authRoutes.js'
import appointmentRoutes from './router/appointmentRoutes.js'
import useRoutes from './router/useRoutes.js'

// VAriables de entorno
dotenv.config()

// Configurar la aplicacion
const app = express()

// abilitar Lee datos via body
app.use(express.json())

// Conectar a Base de Datos
db()

// Configurar CORS

// const whitelist = process.argv[2] === '--postman' ? [process.env.FRONTEND_URL, undefined] : [process.env.FRONTEND_URL]
const whitelist = [process.env.FRONTEND_URL]

// Habilitar postman una vez que habilitamos y configuramos CROS
if (process.argv[2] === '--postman') {
    whitelist.push(undefined)
}

// Habilitar CROS
const corsOptions = {
    origin: function(origin, callback) {
       if (whitelist.includes(origin)) {
        // Permite la conexion
        callback(null, true)
       } else {
        //No permitir la conexion
        callback(new Error('Error de CORS'))
       }
    }
}
app.use(cors(corsOptions))

// Definir una ruta (Arquitectura MVC)
app.use('/api/services', servicesRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/users', useRoutes)

// Definir un puerto
const PORT = process.env.PORT || 4000

// Arrancar la app
app.listen(PORT, () => {
    console.log(colors.blue('El Servidor se esta ejecutando en el puerto: '), PORT)
})
