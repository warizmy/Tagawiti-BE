module.exports = (req, res, next) => {
     if (req.session) {
         req.session._garbage = Date();
         req.session.touch(); // Memperbarui waktu sesi
     }
     next();
 };
 