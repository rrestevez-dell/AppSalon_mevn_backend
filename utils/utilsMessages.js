
const message = [
    {code: 404, method: 'GET', msg: 'El servicio no existe'},
    {code: 200, method: 'GET', msg: 'El servicio se obtuvo correctamente'},
    {code: 201, method: 'POST', msg: 'El servicio se creó correctamente'},
    {code: 200, method: 'PUT', msg: 'El servicio se actualizó correctamente'},
    {code: 200, method: 'DELETE', msg: 'El servicio se eliminó corectamente'}
]

export function typeMessage(cod, method) {
    const elemento = message.find(message => message.code === cod && message.method === method); // Filtrar el elemento que cumple con la condición
    return {
        msg: elemento.msg
    }
}
