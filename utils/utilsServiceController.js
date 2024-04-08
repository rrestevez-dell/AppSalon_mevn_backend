import mongoose from "mongoose"
import jwt from 'jsonwebtoken'
import { format } from 'date-fns'


function validateObjectId(id, res) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error('El id no es valido')
        return res.status(400).json({
            msg: error.message
        })
    }
}

function handleNotFoundError(message, res) {
    const error = new Error(message)
    return res.status(404).json({
        msg: error.message
    })
}

const generateJWT = (id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '30d'
    })
    
    return token
}

function formatDate(date) {
    return format(date, 'PPPP')
}

export {
    validateObjectId,
    handleNotFoundError,
    generateJWT,
    formatDate
}