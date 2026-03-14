"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorise = exports.authenticate = exports.errorHandler = void 0;
var error_middleware_1 = require("./error.middleware");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return error_middleware_1.errorHandler; } });
var auth_middleware_1 = require("./auth.middleware");
Object.defineProperty(exports, "authenticate", { enumerable: true, get: function () { return auth_middleware_1.authenticate; } });
var role_middleware_1 = require("./role.middleware");
Object.defineProperty(exports, "authorise", { enumerable: true, get: function () { return role_middleware_1.authorise; } });
//# sourceMappingURL=index.js.map