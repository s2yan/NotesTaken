class apiErrorResponse extends Error{
    constructor(statuscode = 500 , message, data=null){
        super(message);
        this.statusCode = statuscode;
        this.data = data;
        this.success = false;

        Error.captureStackTrace(this, this.constructor);
    }
}

export { apiErrorResponse }