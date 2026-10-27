"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const node_http_1 = require("node:http");
const node_https_1 = require("node:https");
const common_1 = require("@nestjs/common");
let AuthService = class AuthService {
    login(identityId, password) {
        return this.request('/Authentication/LoginWeb', 'POST', { identityId, password });
    }
    getIdentityByEmail(email) {
        return this.request(`/UserRegistration/GetIdentityIdByEmail/${encodeURIComponent(email)}`, 'GET');
    }
    passkeyLoginOptions(input) {
        return this.request('/Challenge/OptionsPassKeyLogin', 'POST', input);
    }
    validatePasskey(input) {
        return this.request('/Authentication/ValidatePassKey', 'POST', input);
    }
    request(path, method, body) {
        const baseUrl = process.env.UTILITIES_API_URL?.trim().replace(/\/$/, '');
        if (!baseUrl) {
            throw new common_1.ServiceUnavailableException('Falta la variable UTILITIES_API_URL');
        }
        const target = new URL(baseUrl);
        const payload = body === undefined ? undefined : JSON.stringify(body);
        const transport = target.protocol === 'http:' ? node_http_1.request : node_https_1.request;
        return new Promise((resolve, reject) => {
            const req = transport({
                protocol: target.protocol,
                hostname: target.hostname,
                port: target.port ? Number(target.port) : undefined,
                path,
                method,
                headers: {
                    Accept: 'application/json',
                    Connection: 'close',
                    ...(payload
                        ? {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(payload),
                        }
                        : {}),
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
                reject(new common_1.BadGatewayException('No fue posible contactar el servicio de acceso'));
            });
            req.on('error', () => {
                reject(new common_1.BadGatewayException('No fue posible contactar el servicio de acceso'));
            });
            if (payload) {
                req.write(payload);
            }
            req.end();
        });
    }
    toResult(raw) {
        const text = raw.trim();
        if (!text) {
            throw new common_1.BadGatewayException('El servicio de acceso respondió de forma inesperada');
        }
        let payload;
        try {
            payload = JSON.parse(text);
        }
        catch {
            throw new common_1.BadGatewayException('El servicio de acceso respondió de forma inesperada');
        }
        if (typeof payload === 'string' && payload.trim()) {
            return {
                success: false,
                statusCode: 0,
                message: payload.trim(),
                data: {},
            };
        }
        if (!this.isLoginResult(payload)) {
            throw new common_1.BadGatewayException('El servicio de acceso respondió de forma inesperada');
        }
        const data = payload.data;
        return {
            success: payload.success,
            statusCode: payload.statusCode,
            message: payload.message,
            data: data && typeof data === 'object' && !Array.isArray(data) ? data : {},
        };
    }
    isLoginResult(payload) {
        if (!payload || typeof payload !== 'object') {
            return false;
        }
        const candidate = payload;
        return (typeof candidate.success === 'boolean' &&
            typeof candidate.statusCode === 'number' &&
            typeof candidate.message === 'string');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map