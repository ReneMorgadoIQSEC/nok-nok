"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    identity(email) {
        return this.authService.getIdentityByEmail(this.requireText(email, 'El correo es obligatorio'));
    }
    passkeyOptions(body) {
        return this.authService.passkeyLoginOptions({
            identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
            email: this.requireText(body?.email, 'El correo es obligatorio'),
        });
    }
    validatePasskey(body) {
        return this.authService.validatePasskey({
            credential: this.requireCredential(body?.credential),
            challenge: this.requireText(body?.challenge, 'El challenge es obligatorio'),
            identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
        });
    }
    login(body) {
        return this.authService.login(this.requireText(body?.identityId, 'La identidad es obligatoria'), this.requireSecret(body?.password, 'La contraseña es obligatoria'));
    }
    requireText(value, message) {
        if (typeof value !== 'string' || !value.trim()) {
            throw new common_1.BadRequestException(message);
        }
        return value.trim();
    }
    requireSecret(value, message) {
        if (typeof value !== 'string' || !value) {
            throw new common_1.BadRequestException(message);
        }
        return value;
    }
    requireCredential(value) {
        if (!value || typeof value !== 'object') {
            throw new common_1.BadRequestException('La credencial es obligatoria');
        }
        const credential = value;
        const response = credential.response;
        if (!response || typeof response !== 'object') {
            throw new common_1.BadRequestException('La credencial es obligatoria');
        }
        return {
            id: this.requireText(credential.id, 'La credencial es obligatoria'),
            rawId: this.requireText(credential.rawId, 'La credencial es obligatoria'),
            type: this.requireText(credential.type, 'La credencial es obligatoria'),
            response: {
                authenticatorData: this.requireText(response.authenticatorData, 'La credencial es obligatoria'),
                clientDataJSON: this.requireText(response.clientDataJSON, 'La credencial es obligatoria'),
                signature: this.requireText(response.signature, 'La credencial es obligatoria'),
            },
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('identity'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "identity", null);
__decorate([
    (0, common_1.Post)('passkey/options'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "passkeyOptions", null);
__decorate([
    (0, common_1.Post)('passkey'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "validatePasskey", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map