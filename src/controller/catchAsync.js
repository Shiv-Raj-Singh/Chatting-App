
//  Try Catch Block -- For Every Controller Function 

export default function catchAsync(controller){
    return function(req,res,next){
        return Promise.resolve(controller(req,res,next)).catch(next)
    }
}

