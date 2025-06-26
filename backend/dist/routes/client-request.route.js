"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRequestRoute = void 0;
const express_1 = __importDefault(require("express"));
const client_request_controller_1 = require("../controllers/client-request.controller");
const router = express_1.default.Router();
exports.clientRequestRoute = router;
router.post("/", client_request_controller_1.createNewClientRequest);
