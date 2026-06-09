export function createReq({ method = 'GET', query = {}, body = {}, params = {} } = {}) {
  return { method, query, body, params };
}

export function createRes() {
  const res = {
    headers: {},
    statusCode: 200,
    body: undefined,
    ended: false,
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      this.ended = true;
      return this;
    },
    end(body) {
      this.body = body;
      this.ended = true;
      return this;
    },
  };

  return res;
}
