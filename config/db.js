import mongoose from "mongoose";
import colors from 'colors'

export const db = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_URI)
        const conectdb = {
            host: db.connection.host,
            port: db.connection.port
        }
        console.log(colors.green(`Se conecto corectamente a la BD con:
            \n host: ${colors.yellow(`${conectdb.host}`)}
            \n port: ${colors.yellow(`${conectdb.port}`)}`))
    } catch (error) {
        console.log(colors.bgWhite.red(`Error: ${error}`))
        process.exit(1)
    }
}