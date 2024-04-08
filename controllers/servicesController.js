import Services from '../models/Services.js'
import { validateObjectId, handleNotFoundError } from '../utils/utilsServiceController.js'
import { typeMessage } from '../utils/utilsMessages.js'

// Creando accciones para un nuevo servicios
const createServices = async (req, res) => {
    if (Object.values(req.body).includes('')) {
        const error = new Error('todos los campos son obligatorios')
        return res.status(400).json({
            msg: error.message
        })
    }
    try {
        const service = new Services(req.body)
        await service.save()

        res.status(201)
        res.json(typeMessage(res.statusCode, req.method))
    } catch (error) {
        console.log(error)
    }
}

// Creando acciones pata obtener todos los servicios
const getServices = async (req, res) => {
    try {
        const services = await Services.find()
        res.json(services)
    } catch (error) {
        console.log(error)
    }
}

// Creando acciones para obtener un servicio por su ID
const getServiceById = async (req,res) => {
    const { id } = req.params
    // Validar un ObjectId
    if (validateObjectId(id, res)) return
    // Validar que existe
    const service = await Services.findById(id)
    if (!service) {
        return handleNotFoundError('El servicio no existe', res)
    }
    // Mostrar el servicio
    res.json(service)
}

// Creando acciones para actualizar un servicio
const updateService = async (req,res) => {
    const { id } = req.params
    // Validar un ObjectId
    if (validateObjectId(id, res)) return

    // Validar que existe
    const service = await Services.findById(id)
    if (!service) {
        return handleNotFoundError('El servicio no existe', res)
    }
    // Escribimos en el objeto los valores nuevos
    service.name = req.body.name || service.name
    service.price = req.body.price || service.price
    // Acualizar el servicio
    try {
        await service.save()
        res.json(typeMessage(res.statusCode, req.method))
    } catch (error) {
        console.log(error)
    }
}

const deleteService = async (req, res) =>  {
    const { id } = req.params
    // Validar un ObjectId
    if (validateObjectId(id, res)) return

    // Validar que existe
    const service = await Services.findById(id)
    if (!service) {
        return handleNotFoundError('El servicio no existe', res)
    }
    // Eliminando el servicio
    try {
        await service.deleteOne()
        res.json(typeMessage(res.statusCode, req.method))
    } catch (error) {
        console.log(error)
    }
}

export {
    createServices,
    getServices,
    getServiceById,
    updateService,
    deleteService
}