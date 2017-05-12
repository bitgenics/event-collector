
const wrapper = (EventCollector) => {
  return createMiddleware = (onEnd, meta) => {
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
        onEnd(req.eventcollector);
      });
      res.on('finish', () => {
        const res_meta = {
            statusCode: res.statusCode,
            res_contentType: res.getHeader('content-type'),
            res_contentEncoding: res.getHeader('content-encoding'),
            res_cacheHeader: res.getHeader('cache-control')
        };
        req.eventcollector.end(res_meta);
        onEnd(req.eventcollector);
      });
      next();
    }
  }
}

module.exports = wrapper;