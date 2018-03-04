# Botengine Zapier Middleware
This code is intended to be used as a webhook mediator between botengine and zapier. It performs the webhook verification handshake as required by botengine, and then passes through the webhook payload to the zapier webhook url on all subsequent requests.

This code as written is intended to be run on [hook.io](https://hook.io), but could easily be modified to run as a microservice anywhere you like.

## Hook.IO usage
Copy [config.example.json](config.example.json) to `config.json`. Fill in the `"stories"` object with your story ids and related configuration parameters.

Use [index.js](index.js) as your microservice source file. Invoke the service via GET. Add a query parameter named `config` containing the base64 encoded contents of [config.json](config.json). The service is now ready to be invoked from botengine.ai.
