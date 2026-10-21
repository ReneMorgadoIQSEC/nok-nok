"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationService = void 0;
const node_http_1 = require("node:http");
const node_https_1 = require("node:https");
const common_1 = require("@nestjs/common");
let RegistrationService = class RegistrationService {
    createIdentity(input) {
        return this.post('/UserRegistration/CreateIndentityWeb', input);
    }
    registerUser(input) {
        return this.post('/UserRegistration/RegisterWeb', input);
    }
    passkeyOptions(input) {
        return this.post('/Challenge/OptionsPassKey', input);
    }
    registerPasskey(input) {
        return this.post('/Authentication/RegisterPassKey', input);
    }
    post(path, body) {
        const baseUrl = process.env.UTILITIES_API_URL?.trim().replace(/\/$/, '');
        if (!baseUrl) {
            throw new common_1.ServiceUnavailableException('Falta la variable UTILITIES_API_URL');
        }
        const target = new URL(baseUrl);
        const payload = JSON.stringify(body);
        const transport = target.protocol === 'http:' ? node_http_1.request : node_https_1.request;
        return new Promise((resolve, reject) => {
            const req = transport({
                protocol: target.protocol,
                hostname: target.hostname,
                port: target.port ? Number(target.port) : undefined,
                path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                    Connection: 'close',
                },
                timeout: 30_000,
            }, (res) => {
                const chunks = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => {
                    try {
                        resolve(this.toResult(Buffer.concat(chunks).toString('utf8')));
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
            req.on('timeout', () => {
                req.destroy();
                reject(new common_1.BadGatewayException('No fue posible contactar el servicio de registro'));
            });
            req.on('error', () => {
                reject(new common_1.BadGatewayException('No fue posible contactar el servicio de registro'));
            });
            req.write(payload);
            req.end();
        });
    }
    toResult(raw) {
        const text = raw.trim();
        if (!text) {
            throw new common_1.BadGatewayException('El servicio de registro respondió de forma inesperada');
        }
        let payload;
        try {
            payload = JSON.parse(text);
        }
        catch {
            throw new common_1.BadGatewayException('El servicio de registro respondió de forma inesperada');
        }
        if (typeof payload === 'string' && payload.trim()) {
            return {
                success: false,
                statusCode: 0,
                message: payload.trim(),
                data: {},
            };
        }
        if (!this.isUpstreamResult(payload)) {
            throw new common_1.BadGatewayException('El servicio de registro respondió de forma inesperada');
        }
        return {
            success: payload.success,
            statusCode: payload.statusCode,
            message: payload.message,
            data: this.asRecord(payload.data),
        };
    }
    asRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return {};
        }
        return value;
    }
    isUpstreamResult(payload) {
        if (!payload || typeof payload !== 'object') {
            return false;
        }
        const candidate = payload;
        return (typeof candidate.success === 'boolean' &&
            typeof candidate.statusCode === 'number' &&
            typeof candidate.message === 'string');
    }
};
exports.RegistrationService = RegistrationService;
exports.RegistrationService = RegistrationService = __decorate([
    (0, common_1.Injectable)()
], RegistrationService);
//# sourceMappingURL=registration.service.js.map