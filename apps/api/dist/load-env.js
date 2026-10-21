"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function applyEnvFile(filePath) {
    const content = (0, node_fs_1.readFileSync)(filePath, 'utf8');
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }
        const separator = trimmed.indexOf('=');
        if (separator === -1) {
            continue;
        }
        const key = trimmed.slice(0, separator).trim();
        let value = trimmed.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    }
}
function loadEnv() {
    const candidates = [
        (0, node_path_1.join)(process.cwd(), '..', '..', '.env'),
        (0, node_path_1.join)(process.cwd(), '.env'),
        (0, node_path_1.join)(__dirname, '..', '..', '..', '.env'),
        (0, node_path_1.join)(__dirname, '..', '..', '.env'),
    ];
    const envFile = candidates.find((candidate) => (0, node_fs_1.existsSync)(candidate));
    if (envFile) {
        applyEnvFile(envFile);
    }
}
//# sourceMappingURL=load-env.js.map