class apiResponse{
    constructor( statusCode, message, data ){
        this.statusCode = statusCode,
        this.data = data
        this.message = message,
        this.success = this.statusCode < 400 ? true : false
    }
}

export { apiResponse } 