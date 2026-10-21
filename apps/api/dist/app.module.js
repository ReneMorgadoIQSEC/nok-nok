"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const serve_static_1 = require("@nestjs/serve-static");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const utilities_controller_1 = require("./utilities/utilities.controller");
const utilities_service_1 = require("./utilities/utilities.service");
const isDev = process.env.NODE_ENV !== 'production';
function resolveAngularDist() {
    if (process.env.ANGULAR_DIST && (0, node_fs_1.existsSync)(process.env.ANGULAR_DIST)) {
        return process.env.ANGULAR_DIST;
    }
    const candidates = [
        (0, node_path_1.join)(__dirname, '..', '..', 'web', 'dist', 'web', 'browser'),
        (0, node_path_1.join)(process.cwd(), '..', 'web', 'dist', 'web', 'browser'),
        (0, node_path_1.join)(process.cwd(), 'apps', 'web', 'dist', 'web', 'browser'),
    ];
    const found = candidates.find((path) => (0, node_fs_1.existsSync)(path));
    if (!found && !isDev) {
        console.warn('[static] No se encontró el build de Angular. Define ANGULAR_DIST o ejecuta npm run build.');
    }
    return found ?? candidates[0];
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ...(isDev
                ? []
                : [
                    serve_static_1.ServeStaticModule.forRoot({
                        rootPath: resolveAngularDist(),
                        exclude: ['/api/(.*)'],
                    }),
                ]),
        ],
        controllers: [app_controller_1.AppController, utilities_controller_1.UtilitiesController],
        providers: [app_service_1.AppService, utilities_service_1.UtilitiesService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map