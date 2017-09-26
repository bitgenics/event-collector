
const wrapper = (EventCollector) => {
  return createMiddleware = (meta, onEnd) => {
    return (req, res, next) => {
      const req_meta = {
        req_hostname: req.hostname,
        req_url: req.url,
        req_method: req.method,
      };
      req.eventcollector = new EventCollector(req_meta);
      req.eventcollector.addMeta(meta);
      res.on('close', () => {
        const res_meta = {
          res_statusCode: res.statusCode,
          res_conn_status: 'connection terminated'
        };
        req.eventcollector.end(res_meta);
        onEnd(req.eventcollector, req, res);
      });
      res.on('finish', () => {
        const res_meta = {
          res_statusCode: res.statusCode,
          res_contentType: res.getHeader('content-type'),
          res_contentEncoding: res.getHeader('content-encoding'),
          res_cacheHeader: res.getHeader('cache-control')
        };
        req.eventcollector.end(res_meta);
        onEnd(req.eventcollector, req, res);
      });
      next();
    }
  }
}

module.exports = wrapper;