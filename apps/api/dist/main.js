"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const core_1 = require("@nestjs/core");
const express_1 = require("express");
const http_proxy_1 = require("http-proxy");
const app_module_1 = require("./app.module");
const load_env_1 = require("./load-env");
(0, load_env_1.loadEnv)();
const isDev = process.env.NODE_ENV !== 'production';
const port = Number(process.env.PORT ?? (isDev ? 3443 : 3000));
const webOrigin = process.env.WEB_ORIGIN ?? 'http://127.0.0.1:4200';
const host = process.env.HOST ?? '0.0.0.0';
function resolveCertPath(fileName) {
    const fromEnv = fileName.endsWith('key.pem')
        ? process.env.SSL_KEY
        : process.env.SSL_CERT;
    if (fromEnv) {
        return fromEnv;
    }
    const candidates = [
        (0, node_path_1.join)(process.cwd(), 'certs', fileName),
        (0, node_path_1.join)(process.cwd(), '..', '..', 'certs', fileName),
        (0, node_path_1.join)(__dirname, '..', '..', '..', 'certs', fileName),
    ];
    return candidates.find((candidate) => (0, node_fs_1.existsSync)(candidate));
}
function shouldUseHttps() {
    if (process.env.ENABLE_HTTPS === 'true') {
        return true;
    }
    if (process.env.ENABLE_HTTPS === 'false') {
        return false;
    }
    return isDev;
}
function loadHttpsOptions() {
    if (!shouldUseHttps()) {
        return undefined;
    }
    const certPath = resolveCertPath('localhost.pem');
    const keyPath = resolveCertPath('localhost-key.pem');
    if (!certPath || !keyPath) {
        throw new Error('HTTPS habilitado pero no hay certificados en certs/. Ejecuta "npm run certs" o define SSL_CERT/SSL_KEY.');
    }
    return {
        cert: (0, node_fs_1.readFileSync)(certPath),
        key: (0, node_fs_1.readFileSync)(keyPath),
    };
}
async function bootstrap() {
    const httpsOptions = loadHttpsOptions();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        httpsOptions,
        bodyParser: false,
    });
    app.use((0, express_1.json)({ limit: '20mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '20mb' }));
    app.setGlobalPrefix('api');
    app.enableCors({ origin: true, credentials: true });
    app.set('trust proxy', 1);
    if (isDev) {
        const proxy = (0, http_proxy_1.createProxyServer)({
            target: webOrigin,
            changeOrigin: true,
            ws: true,
        });
        proxy.on('error', (error, _req, res) => {
            console.error('[proxy]', error.message);
            if (res && 'writeHead' in res && typeof res.writeHead === 'function') {
                res.writeHead(502, { 'Content-Type': 'text/plain' });
                res.end('Angular aún no está disponible');
            }
        });
        const expressApp = app.getHttpAdapter().getInstance();
        expressApp.use((req, res, next) => {
            if (req.url?.startsWith('/api')) {
                return next();
            }
            proxy.web(req, res);
        });
        await app.init();
        const server = await app.listen(port, host);
        server.on('upgrade', (req, socket, head) => {
            if (req.url?.startsWith('/api')) {
                socket.destroy();
                return;
            }
            proxy.ws(req, socket, head);
        });
    }
    else {
        await app.listen(port, host);
    }
    const protocol = httpsOptions ? 'https' : 'http';
    console.log(`Nok Nok escuchando en ${protocol}://${host}:${port}`);
    console.log(`API: ${protocol}://${host}:${port}/api`);
}
void bootstrap();
//# sourceMappingURL=main.js.map