import multer from "multer";

const storage = multer.diskStorage(
  {
    // multer needs functions (destinations,filename)
    // multer itself creates cb(callback) function
    // multer hamara func run karega and it gives its callback func 
    // - as paramter ,  so we in this funcn, run its callback and hence 
    // - give the paths , if error->null and if no error-> folder 
    destination: function(req,res,cb) {
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }

  });

  export const upload = multer({
    storage,
  });