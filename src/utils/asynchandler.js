const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            // console.log(" the error of asyncHandler :",err)
            return next(err)
        })
    }
}


export { asyncHandler }