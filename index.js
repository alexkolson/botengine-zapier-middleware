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
      body: botengineAIPayload,
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

  const {
    result,
    sessionId,
    timestamp,
  } = botengineAIPayload;
  const {
    source,
    storyId,
    interaction,
    contexts,
    parameters,
  } = result;
  const emailSubject = `New webhook execution from botengine.ai in story: ${storyId}`;
  const emailIntro = 'Hello there! A user recently interacted with your chat bot and triggered this webhook execution.';
  const storyInfo = `This webhook execution was triggered from the following story: ${storyId}`;
  const storyPathIntro = 'The user took the following path through the story to trigger the interaction:';
  const storyPath = contexts.reverse().reduce((path, context, index) => {
    const {
      name: contextName,
      parameters: contextParameters,
    } = context;

    return `${path}
    ${contextName}`;
  }, '');
  const timeInfo = `Webhook was triggered at: ${new Date(timestamp).toString()}`;

  const emailBody = `
    ${emailIntro}
    ${storyInfo}
    ${storyPathIntro}
    ${storyPath}
    ${timeInfo}
  `;

  request.post({
    url: 'https://requestb.in/1cai2hq1',
    body: zapBody,
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
          elements: ['webhook success! Hooray!']
        },
      ],
    };
    return res.end(JSON.stringify(response));
  });
}
