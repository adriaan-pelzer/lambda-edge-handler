const querystring = require('node:querystring');

const getRequest = event => event.Records[0].cf.request;
const getMethod = event => getRequest(event).method;
const getQuery = event => querystring.parse(getRequest(event).querystring);
const getCustomHeader = event => header => getRequest(event).origin?.s3?.customHeaders[header][0].value;

module.exports = ({ allowedMethods, event }) => new Promise(
  (resolve, reject) => allowedMethods.indexOf(getMethod(event)) === -1 ?
    reject({
      statusCode: 405,
      error: `Only ${allowedMethods.map(method => `"${method}"`).join(', ')} method${allowedMethods.length === 1 ? '' : 's'} allowed`
    }) :
    resolve({
      request: getRequest(event),
      query: getQuery(event),
      getCustomHeader: getCustomHeader(event)
    })
);
