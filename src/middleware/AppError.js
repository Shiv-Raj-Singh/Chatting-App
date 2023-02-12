//  Error Pass Class inside next 
export default class AppError extends Error {
    constructor(message , statusCode){
        super(message)
        this.statusCode = statusCode 
        this.message = message
        this.status = false
    }
}


