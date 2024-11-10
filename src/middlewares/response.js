module.exports = (req, res, next) => {
     res.success = (data, message = "Success") => {
          res.status(200).json({
               status: 200,
               message,
               data,
               timestamp: new Date().toISOString(),
               path: req.originalUrl
          });
     };

     res.error = (statusCode, message, error = null) => {
          res.status(statusCode).json({
               status: statusCode,
               message,
               error,
               timestamp: new Date().toISOString(),
               path: req.originalUrl
          });
     };

     next();
};
