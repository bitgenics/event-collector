
const wrapper = (EventCollector) => {
  const createMiddleware = (meta) => {
    return (req, res, next) => {
      const req_meta = {
        hostname: req.hostname,
        url: req.url,
        method: req.method,
      };
      req.eventcollector = new EventCollector(req_meta);
      req.eventcollector.addMeta(meta);
      res.on('close', () => {
        const res_meta = {
            statusCode: res.statusCode,
        };
        req.eventcollector.end(res_meta);
        req.eventcollector.addError('The underlying connection was terminated before response.end() was called or able to flush.');
        console.log(JSON.stringify(req.eventcollector, null, 2));
      });
      res.on('finish', () => {
        const res_meta = {
            statusCode: res.statusCode,
            contentType: res.getHeader('content-type'),
            contentEncoding: res.getHeader('content-encoding')
            cacheHeader: res.getHeader('cache-control')
        };
        req.eventcollector.end(res_meta);
        console.log(JSON.stringify(req.eventcollector, null, 2));
      });
      next();
    }
  }
}

module.exports = wrapper;