//  Global Error Handling For All Req or Entire Application 

export function globalError(err, req, res, next){
    err.message = err.message || "Internal server Error !"
    err.statusCode = err.statusCode || 500
    if(err.isJoi == true){
        err.message = err.message 
        const [details] = err.details
        if(details.type =='string.pattern.base'){
            err.message =  `${details.path} Should be Valid !`
        }
        err.statusCode = 400
    }
    // console.log(err);

    if(err.code == 11000){
        err.statusCode = 400
        const values = Object.keys(err.keyValue)
        err.message = ` ${values[0]}  Already Exist !`  
    }
    
    res.status(err.statusCode).json({
        status : false , message : err.message
    })
}