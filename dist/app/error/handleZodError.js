"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleZodError = void 0;
const handleZodError = (error) => {
    const errorSources = error.issues.map((issue) => {
        return {
            path: issue === null || issue === void 0 ? void 0 : issue.path[issue.path.length - 1],
            message: issue.message
        };
    });
    const statusCode = 400;
    return {
        statusCode,
        message: "Validation error",
        errorSources
    };
};
exports.handleZodError = handleZodError;
