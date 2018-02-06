# Botengine Zapier Middleware
This code is intended to be used as a webhook mediator between botengine and zapier. It performs the webhook verification handshake as required by botengine, and then passes through the webhook payload to the zapier webhook url on all subsequent requests.

This code as written is indented to be run on [hook.io](https://hook.io), but could easily be modified to run as a microservice anywhere you like.
