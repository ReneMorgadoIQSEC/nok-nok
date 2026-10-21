"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilitiesService = void 0;
const node_http_1 = require("node:http");
const node_https_1 = require("node:https");
const common_1 = require("@nestjs/common");
let UtilitiesService = class UtilitiesService {
    sendCodeEmail(email) {
        return this.post('/Utilities/SendCodeEmail', { email });
    }
    verifyCodeEmail(email, code) {
        return this.post('/Utilities/VerifyCodeEmail', { email, code });
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
                timeout: 20_000,
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
                reject(new common_1.BadGatewayException('No fue posible contactar el servicio de verificación'));
            });
            req.on('error', () => {
                reject(new common_1.BadGatewayException('No fue posible contactar el servicio de verificación'));
            });
            req.write(payload);
            req.end();
        });
    }
    toResult(raw) {
        const text = raw.trim();
        if (!text) {
            throw new common_1.BadGatewayException('El servicio de verificación respondió de forma inesperada');
        }
        let payload;
        try {
            payload = JSON.parse(text);
        }
        catch {
            throw new common_1.BadGatewayException('El servicio de verificación respondió de forma inesperada');
        }
        if (typeof payload === 'string' && payload.trim()) {
            const descripcion = payload.trim();
            return {
                success: false,
                statusCode: 0,
                message: descripcion,
                data: { estado: -1, descripcion },
            };
        }
        if (this.isUtilitiesResult(payload)) {
            return payload;
        }
        throw new common_1.BadGatewayException('El servicio de verificación respondió de forma inesperada');
    }
    isUtilitiesResult(payload) {
        if (!payload || typeof payload !== 'object') {
            return false;
        }
        const data = payload.data;
        return !!data && typeof data.estado === 'number';
    }
};
exports.UtilitiesService = UtilitiesService;
exports.UtilitiesService = UtilitiesService = __decorate([
    (0, common_1.Injectable)()
], UtilitiesService);
//# sourceMappingURL=utilities.service.js.map