var server = require('./library/server');
var router = require('./library/router');
var requestHandlers = require('./library/requestHandlers');


//url mapping
var handle = {}
handle["/"] = requestHandlers.handleStaticFiles;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["static"] = requestHandlers.handleStaticFiles;

server.start(router.route, handle);
