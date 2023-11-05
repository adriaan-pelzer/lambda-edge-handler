const querystring = require('node:querystring');

const getRequest = event => event.Records[0].cf.request;
const getMethod = event => getRequest(event).method;
const getQuery = event => querystring.parse(getRequest(event).querystring);
const getCustomHeader = event => header => getRequest(event).origin?.s3?.customHeaders[header][0].value;

module.exports = ({
  allowedMethods, bodyIncluded, event
}) => new Promise((resolve, reject) => {
  const method = getMethod(event);
  const allowMethodsStr = allowedMethods.map(method => `"${method}"`).join(', ');
  const methodsPlural = `method${allowedMethods.length === 1 ? '' : 's'}`;
  const request = getRequest(event);
  const body = request.body;

  if (allowedMethods.indexOf(method) === -1) {
    return reject({
      statusCode: 405,
      error: ['Only', allowMethodsStr, methodsPlural, 'allowed'].join(' ')
    });
  }

  if (['HEAD', 'OPTIONS'].indexOf(method) !== -1) {
    return reject({
      statusCode: 200,
      includeBody: false
    });
  }

  if (bodyIncluded && (!body || !body.data)) {
    return reject({
      statusCode: 400,
      error: ['No', method, 'body', 'sent'].join(' ')
    });
  }

  return resolve({
    request, query: getQuery(event),
    body: bodyIncluded && Buffer.from(body.data, 'base64'),
    getCustomHeader: getCustomHeader(event)
  });
});
