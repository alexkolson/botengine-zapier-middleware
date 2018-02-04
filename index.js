'use strict';

const request = require('request');

module.exports = function middleware(hook) {
  const {
    env: {
      BOTENGINE_VERIFICATION_TOKEN,
    },
    params: {
      challenge,
      token,
    },
    req: {
      headers,
    },
    res,
  } = hook;

  if (challenge && token) {
    res.setHeader('Content-Type', 'text/plain');
    if (token !== BOTENGINE_VERIFICATION_TOKEN) {
      res.statusCode = 401;
      const message = '"Invalid botengine.ai verification token."';
      console.log(message);
      return res.end(message);
    }

    res.statusCode = 200;
    console.log('returning challenge to botengine.ai');
    const challengeResponse = `"${challenge}"`;
    console.log({
      challengeResponse,
    });
    return res.end(challengeResponse);
  }
}
