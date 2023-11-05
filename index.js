const querystring = require('node:querystring');

const getRequest = event => event.Records[0].cf.request;
const getMethod = event => get_request(event).method;
const getQuery = event => querystring.parse(get_request(event).querystring);
const getCustomHeader = event => header => get_request(event).origin?.s3?.customHeaders[header][0].value;

module.exports = ({ allowedMethods, event }) => new Promise(
  (resolve, reject) => allowedMethods.indexOf(getMethod(event)) === -1 ?
    reject({ statusCode: 405, error: `` }) :
    resolve({ request: getRequest(event), query: getQuery(event), getCustomHeader: getCustomHeader(event) })
);
