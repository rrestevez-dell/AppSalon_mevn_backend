import { parse, formatISO, startOfDay, endOfDay, isValid } from "date-fns";
import Appointment from '../models/Appointment.js'
import { validateObjectId, handleNotFoundError, formatDate } from '../utils/utilsServiceController.js'
import { sendEmailNewAppointment, sendEmailUpdateAppointment, sendEmailCancelledAppointment } from '../emails/appointmentEmailService.js'

const createAppointment = async (req, res) => {
    const appointment = req.body
    
    // Ajustar formato UTC de fecha para coincidir con MongoDB
    const dateUTC = new Date(appointment.date);
    appointment.date = new Date(Date.UTC(dateUTC.getFullYear(), dateUTC.getMonth(), dateUTC.getDate()));
    
    // almacenar el usuario como string
    appointment.user = req.user._id.toString()

    try {
        // creando el objeto con el formato de la base de datos con el modelo
        const newAppointment = new Appointment(appointment)
        // guardado de objeto Appointment - cita en la DB
        const result = await newAppointment.save()
        
        // enviando email
        await sendEmailNewAppointment({
            date: formatDate(result.date),
            time: result.time
        })

        res.json({
            msg: 'Tu reservacion se realizo correctamente'
        })
    } catch (error) {
        console.log(error);
    }
}

const getAppointmentsByDate = async (req, res) => {
    const { date } = req.query
    
    const newDate = parse(date, 'dd/MM/yyyy', new Date())

    if (!isValid(newDate)) {
        const error = new Error('El formato de fecha no es valida, ej: 01/01/2024')
        return res.status(400).json({ msg: error.message })
    } 
    const isoDate = formatISO(newDate)

    // mongoDB = 2024-04-08T00:00:00.000+00:00  e isoDate = 2024-04-08T00:00:00+02:00
    // Buscando las citas desde el principio del dia hasta el final
    const appointment = await Appointment.find({ date: {
        $gte: startOfDay(new Date(isoDate)),
        $lte: endOfDay(new Date(isoDate))
    }}).select('time')

    res.json(appointment)
}

const getAppointmentById = async (req, res) => {
    const { id } = req.params

    // Validar por object id
    if (validateObjectId(id, res)) return
    
    // Validar que exista es Cita
    const appointment = await Appointment.findById(id).populate('services')
    if (!appointment) {
        return handleNotFoundError('La cita no existe', res)
    }

    // validar si el usuario de la cita es quieb la consulta
    if (appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('No tiene los permisos para esta consulta')
        return res.status(403).json({msg: error.message})
    }

    // Retornar la cita
    res.json(appointment)
}

const updateAppointment = async (req, res) => {
    const { id } = req.params

    // Validar por object id
    if (validateObjectId(id, res)) return
    
    // Validar que exista es Cita
    const appointment = await Appointment.findById(id).populate('services')
    if (!appointment) {
        return handleNotFoundError('La cita no existe', res)
    }

    // validar si el usuario de la cita es quieb la consulta
    if (appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('No tiene los permisos para esta consulta')
        return res.status(403).json({msg: error.message})
    }

    // Actualizacion
    const {date, time, totalAmount, services } = req.body
    appointment.date = date
    appointment.time = time
    appointment.totalAmount = totalAmount
    appointment.services = services

    try {
        const result = await appointment.save()

        await sendEmailUpdateAppointment({
            date: formatDate( result.date ),
            time: result.time
        })

        res.json({
            msg: 'Cita actualizada correctamente'
        })
    } catch (error) {
        console.log(error);
    }
}

const deleteAppointment = async (req, res) => {
    const { id } = req.params

    // Validar por object id
    if (validateObjectId(id, res)) return
    
    // Validar que exista es Cita
    const appointment = await Appointment.findById(id).populate('services')
    if (!appointment) {
        return handleNotFoundError('La cita no existe', res)
    }

    // validar si el usuario de la cita es quieb la consulta
    if (appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('No tiene los permisos para esta consulta')
        return res.status(403).json({msg: error.message})
    }

    // Eliminando cita
    try {
        await sendEmailCancelledAppointment({
            date: formatDate( appointment.date ),
            time: appointment.time
        })

        await appointment.deleteOne()

        res.json({msg: 'Cita cancelada exitosamente'})
    } catch (error) {
        console.log(error);
    }
}

export {
    createAppointment,
    getAppointmentsByDate,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
}