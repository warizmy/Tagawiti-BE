module.exports = function cookieParser() {
     return function (req, res, next) {
       const cookieHeader = req.headers.cookie;
   
       if (cookieHeader) {
         req.cookies = cookieHeader.split(';').reduce((cookies, cookie) => {
           const [key, value] = cookie.split('=');
           cookies[key.trim()] = decodeURIComponent(value);
           return cookies;
         }, {});
       } else {
         req.cookies = {};
       }
   
       next();
     };
   };
   