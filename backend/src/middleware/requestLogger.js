import env from '../config/env.js';

export function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    if (env.isDev) {
      console[logLevel](`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    } else {
      console[logLevel](JSON.stringify(logData));
    }
  });

  next();
}

export default requestLogger;
