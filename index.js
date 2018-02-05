'use strict';

const request = require('request');

module.exports = function middleware(hook) {
  const {
    env: {
      BOTENGINE_VERIFICATION_TOKEN,
    },
    params,
    req: {
      headers,
      method: reqMethod,
      body,
    },
    res,
  } = hook;

  // botengine.ai invokes webhook verification requests with an HTTP GET method.
  if (reqMethod === 'GET') {
    const {
      challenge,
      token,
    } = params;

    console.log({
      message: 'Processing botengine.ai verification request.',
      challenge,
    });

    res.setHeader('Content-Type', 'text/plain');


    if (token !== BOTENGINE_VERIFICATION_TOKEN) {
      res.statusCode = 401;
      const error = '"Invalid botengine.ai verification token."';
      console.log({ error });
      return res.end(error);
    }

    res.statusCode = 200;

    const challengeResponse = `"${challenge}"`;

    console.log({
      message: 'Returning challenge response to botengine.ai',
      challengeResponse,
    });

    return res.end(challengeResponse);
  }

  // Request method is not GET, therefore this is not a verification request.
  // Thus, we forward the webhook payload to the zapier webhook url configured
  // in botengine.ai and passed to us as a header.
  console.log({
    params,
    body,
  });
  return res.end('"Death"');
}
