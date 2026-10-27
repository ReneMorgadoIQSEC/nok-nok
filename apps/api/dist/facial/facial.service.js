"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacialService = void 0;
const node_http_1 = require("node:http");
const node_https_1 = require("node:https");
const common_1 = require("@nestjs/common");
const COMPARE_TIMEOUT_MS = 60_000;
let FacialService = class FacialService {
    compareImages(images) {
        const url = process.env.FACIAL_API_URL?.trim();
        const apikey = process.env.FACIAL_API_KEY?.trim();
        if (!url || !apikey) {
            throw new common_1.ServiceUnavailableException('Faltan FACIAL_API_URL o FACIAL_API_KEY');
        }
        const payload = JSON.stringify({
            apikey,
            img_base64_ancla: images[0],
            imgs_base64: images,
            umbral_porcentaje: 0,
        });
        const target = new URL(url);
        const transport = target.protocol === 'http:' ? node_http_1.request : node_https_1.request;
        return new Promise((resolve, reject) => {
            const req = transport({
                protocol: target.protocol,
                hostname: target.hostname,
                port: target.port ? Number(target.port) : undefined,
                path: `${target.pathname}${target.search}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                    Connection: 'close',
                },
                timeout: COMPARE_TIMEOUT_MS,
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
                reject(new common_1.BadGatewayException('No fue posible contactar el servicio facial'));
            });
            req.on('error', () => {
                reject(new common_1.BadGatewayException('No fue posible contactar el servicio facial'));
            });
            req.write(payload);
            req.end();
        });
    }
    toResult(raw) {
        const text = raw.trim();
        if (!text) {
            throw new common_1.BadGatewayException('El servicio facial respondió de forma inesperada');
        }
        let payload;
        try {
            payload = JSON.parse(text);
        }
        catch {
            throw new common_1.BadGatewayException('El servicio facial respondió de forma inesperada');
        }
        if (!this.isCompareResult(payload)) {
            throw new common_1.BadGatewayException('El servicio facial respondió de forma inesperada');
        }
        return payload;
    }
    isCompareResult(payload) {
        if (!payload || typeof payload !== 'object') {
            return false;
        }
        const result = payload;
        return typeof result.estado === 'number' && typeof result.descripcion === 'string';
    }
};
exports.FacialService = FacialService;
exports.FacialService = FacialService = __decorate([
    (0, common_1.Injectable)()
], FacialService);
//# sourceMappingURL=facial.service.js.map