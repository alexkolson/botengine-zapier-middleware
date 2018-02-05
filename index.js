'use strict';

const request = require('request');

module.exports = function middleware(hook) {
  const {
    env: {
      BOTENGINE_VERIFICATION_TOKEN,
    },
    params,
    req: {
      headers: {
        'zapier-hook-url': zapierHookUrl,
      },
      method: reqMethod,
      body,
    },
    res,
  } = hook;

  const { token } = params;

  // botengine.ai invokes webhook verification requests with an HTTP GET method.
  if (reqMethod === 'GET') {
    const {
      challenge,
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
    message: 'Forwarding botengine.ai payload to zapier',
    botengineAIPayload: body,
  });

  request.post({
    url: zapierHookUrl,
    body,
    json: true,
  }, (err, zapRes, zapResBody) => {
    res.setHeader('Content-Type', 'application/json');
    if (err) {
      console.log({ err });
      res.statusCode = 500;
      return res.end(JSON.stringify(err));
    }

    if (!/^2/.test(zapRes.statusCode)) {
      const zapErr = new Error(`Error from zapier: ${zapRes.statusMessage}`);
      zapErr.statusCode = zapRes.statusCode;
      console.log({ zapErr });
      return res.end(JSON.stringify(zapErr));
    }

    console.log({
      message: 'Sending success message back to botengine.ai',
      zapResBody,
    });
    res.statusCode = 200;
    const response = {
      responses: [
        {
          type: 'text',
          elements: ['sucessful webhook! Hooray!']
        },
      ],
    };
    return res.end(JSON.stringify(response));
  });
}
