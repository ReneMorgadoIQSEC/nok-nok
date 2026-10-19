# Nok Nok

Monorepo con **NestJS** (webservices) y **Angular** (app web), Node `22.21.1`.

## Estructura

```
apps/
  api/        NestJS — endpoints bajo /api y sirve el front
  web/        Angular — estilos con Sass (SCSS)
certs/        Certificados HTTPS locales (generados, no se suben)
deploy/iis/   web.config y notas para producción en IIS
scripts/      generate-certs.mjs + start-dev.mjs
Dockerfile    Imagen para Railway / contenedores
railway.toml  Configuración de despliegue QA
```

## Requisitos

- Node `22.21.1` (`nvm use` lee `.nvmrc`)
- [mkcert](https://github.com/FiloSottile/mkcert) recomendado en local (fallback a openssl)

## Desarrollo local (HTTPS)

```bash
nvm use
npm install
npm run dev
```

Abre **https://localhost:3443**

| Recurso | URL |
|--------|-----|
| Web | https://localhost:3443/ |
| API | https://localhost:3443/api |
| Health | https://localhost:3443/api/health |

```bash
npm run certs   # solo regenerar certificados
```

En local Nest usa HTTPS para permisos del navegador (ubicación, cámara, etc.).

---

## QA — Railway

Railway termina TLS; la app corre en **HTTP** dentro del contenedor (`ENABLE_HTTPS=false`).

### 1. Subir el repo

```bash
git init   # si aún no hay git
git add .
git commit -m "chore: prepare Railway QA deploy"
```

En [railway.app](https://railway.app): **New Project → Deploy from GitHub repo** (o Railway CLI).

### 2. Servicio

- Builder: **Dockerfile** (ya definido en `railway.toml`)
- Healthcheck: `/api/health`
- Variables (Variables tab):

| Variable | Valor |
|----------|--------|
| `NODE_ENV` | `production` |
| `ENABLE_HTTPS` | `false` |

`PORT` lo asigna Railway automáticamente; no lo fijes a menos que sepas lo que haces.

### 3. CLI (alternativa)

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### 4. Dominio QA

En el servicio → **Settings → Networking → Generate domain**.  
Quedará algo como `https://nok-nok-qa.up.railway.app` (HTTPS público incluido).

### 5. Verificar

```text
https://<tu-dominio>/api/health
https://<tu-dominio>/
```

Build local de la imagen (opcional):

```bash
docker build -t nok-nok .
docker run --rm -p 3000:3000 -e NODE_ENV=production -e ENABLE_HTTPS=false nok-nok
```

---

## Producción — IIS (tentativo)

Detalle operativo en [`deploy/iis/README.md`](deploy/iis/README.md). Resumen:

1. En CI o servidor: `npm ci && npm run build`
2. Publicar el artefacto en el servidor Windows (Node `22.21.1` + HttpPlatformHandler)
3. Usar `deploy/iis/web.config` en la raíz del sitio
4. Binding **HTTPS** en IIS (certificado del dominio)
5. Node con `NODE_ENV=production` y `ENABLE_HTTPS=false` (IIS termina TLS)

Misma app: un solo proceso Nest sirve `/api` + el front Angular.

Si al final prod no es IIS (App Service, Linux, otro PaaS), el mismo `Dockerfile` / `npm start` aplica; solo cambia quién termina HTTPS.

---

## Scripts

| Script | Uso |
|--------|-----|
| `npm run dev` | Local HTTPS (Angular + Nest) |
| `npm run build` | Build web + api |
| `npm start` | Producción (sirve Angular estático + API) |
| `npm run certs` | Certificados locales |
| `npm run ng --workspace=@nok-nok/web -- generate component pages/home`  | Generar componentes en angular