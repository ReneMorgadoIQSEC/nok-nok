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
exports.RegistrationController = void 0;
const common_1 = require("@nestjs/common");
const registration_service_1 = require("./registration.service");
let RegistrationController = class RegistrationController {
    registrationService;
    constructor(registrationService) {
        this.registrationService = registrationService;
    }
    createIdentity(body) {
        return this.registrationService.createIdentity({
            browserName: this.requireText(body?.browserName, 'El navegador es obligatorio'),
            browserVersion: this.requireText(body?.browserVersion, 'La versión del navegador es obligatoria'),
            os: this.requireText(body?.os, 'El sistema operativo es obligatorio'),
        });
    }
    registerUser(body) {
        return this.registrationService.registerUser({
            identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
            fullName: this.requireText(body?.fullName, 'El nombre es obligatorio'),
            email: this.requireText(body?.email, 'El correo es obligatorio'),
            phoneNumber: typeof body?.phoneNumber === 'string' ? body.phoneNumber.trim() : '',
            password: this.requireSecret(body?.password, 'La contraseña es obligatoria'),
            deviceId: this.requireText(body?.deviceId, 'El dispositivo es obligatorio'),
        });
    }
    passkeyOptions(body) {
        return this.registrationService.passkeyOptions({
            identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
            email: this.requireText(body?.email, 'El correo es obligatorio'),
            displayName: this.requireText(body?.displayName, 'El nombre es obligatorio'),
        });
    }
    registerPasskey(body) {
        return this.registrationService.registerPasskey({
            credential: this.requireCredential(body?.credential),
            challenge: this.requireText(body?.challenge, 'El challenge es obligatorio'),
            identityId: this.requireText(body?.identityId, 'La identidad es obligatoria'),
        });
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
                attestationObject: this.requireText(response.attestationObject, 'La credencial es obligatoria'),
                clientDataJSON: this.requireText(response.clientDataJSON, 'La credencial es obligatoria'),
            },
        };
    }
};
exports.RegistrationController = RegistrationController;
__decorate([
    (0, common_1.Post)('identity'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "createIdentity", null);
__decorate([
    (0, common_1.Post)('user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "registerUser", null);
__decorate([
    (0, common_1.Post)('passkey/options'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "passkeyOptions", null);
__decorate([
    (0, common_1.Post)('passkey'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegistrationController.prototype, "registerPasskey", null);
exports.RegistrationController = RegistrationController = __decorate([
    (0, common_1.Controller)('registration'),
    __metadata("design:paramtypes", [registration_service_1.RegistrationService])
], RegistrationController);
//# sourceMappingURL=registration.controller.js.map