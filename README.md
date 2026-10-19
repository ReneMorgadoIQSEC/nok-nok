# NokNok

Monorepo con **NestJS** (API + static hosting) y **Angular** (app web).

```
apps/
  api/   NestJS — API, proxy a servicios externos y sirve el build de Angular
  web/   Angular — frontend
```

## Requisitos

- Node.js `22.21.1` (ver `.nvmrc`)
- npm 10+

```bash
nvm use
```

## Instalación

```bash
npm install
cp apps/api/.env.example apps/api/.env
```


Configura en `apps/api/.env` la URL del proveedor externo (`EXTERNAL_FIDO_BASE_URL`) y, si aplica, `EXTERNAL_API_KEY`.

## Desarrollo

En dos terminales:

```bash
# API en http://localhost:3000
npm run start:api

# Angular en http://localhost:4200 (proxy /fido y /api → Nest)
npm run start:web
```

O solo la API (útil cuando ya tienes el frontend en watch):

```bash
npm run start:api
```

## Producción

Compila Angular y Nest, luego sirve todo desde Nest en el puerto `3000`:

```bash
npm run build
npm run start:prod
```

La API queda en `/fido`, `/health`, etc., y el resto de rutas sirven la SPA de Angular.

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/fido/register-request` | Inicio de registro passkey (proxy externo) |
| `POST` | `/fido/register-response` | Completar registro passkey (proxy externo) |
| `POST` | `/utilities/send-code-email` | Envía OTP → IQSEC `Utilities/SendCodeEmail` |
| `POST` | `/utilities/verify-code-email` | Verifica OTP → IQSEC `Utilities/VerifyCodeEmail` |

Configura `EXTERNAL_UTILITIES_BASE_URL` (por defecto apunta a investigación IQSEC). Sin `EXTERNAL_FIDO_BASE_URL`, los endpoints FIDO responden con stub local.
