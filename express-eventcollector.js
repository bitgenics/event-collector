
const wrapper = (EventCollector) => {
  return createMiddleware = (meta, onEnd) => {
    return (req, res, next) => {
      const req_meta = {
        req_hostname: req.hostname,
        req_url: req.url,
        req_method: req.method,
        req_useragent: req.headers['user-agent'];
      };
      req.eventcollector = new EventCollector(req_meta);
      req.eventcollector.addMeta(meta);
      res.on('close', () => {
        const res_meta = {
            res_statusCode: res.statusCode,
            res_conn_status: 'connection terminated'
        };
        req.eventcollector.end(res_meta);
        onEnd(req.eventcollector);
      });
      res.on('finish', () => {
        const res_meta = {
            res_statusCode: res.statusCode,
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