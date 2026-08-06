// basically , we get a function fn(like users.find() or database something related) and we return a new function
// how ? we know,that every async function returns a promise, so we can use promise.resolve() and .catch()
// how ? we run the function with the req,res,next parameters and if it runs well , resolve the promise
// if it fails, catch the error and pass it to the next middleware aka error handler middleware!
// basically , we are using this asyncHandler only to catch the error! and hence either use Promises or Try-Catch
// here , we use Promises!


const asyncHandler = (fn) => {
    return (req,res,next) => {
        Promise.resolve(fn(req,res,next)).catch(next);
    }
}



export  { asyncHandler };
