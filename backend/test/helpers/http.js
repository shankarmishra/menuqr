/** Minimal request/response doubles for calling route handlers directly. */

export function fakeResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    writeHead(status, headers = {}) {
      res.statusCode = status;
      Object.assign(res.headers, headers);
    },
    setHeader(key, value) {
      res.headers[key] = value;
    },
    end(data) {
      res.body = data ?? '';
    },
    json() {
      return JSON.parse(res.body);
    },
  };
  return res;
}

/** An async-iterable request like http.IncomingMessage, with an optional JSON body. */
export function fakeRequest({ method = 'GET', body, headers = {}, ip = '203.0.113.7' } = {}) {
  const payload = body === undefined ? null : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  return {
    method,
    headers,
    socket: { remoteAddress: ip },
    async *[Symbol.asyncIterator]() {
      if (payload) yield payload;
    },
  };
}

export function urlFor(pathname) {
  return new URL(`http://localhost${pathname}`);
}
