# ⚔️ Valhalla Gym — Frontend (React + Vite)

Interfaz de usuario construida con React 19 y Vite. Temática vikinga con glassmorphism, animaciones de partículas y diseño premium.

## Requisitos

- Node.js 18+

## Instalación

```bash
npm install
```

## Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_URL` | URL del backend API | `""` (vacío = usa proxy local) |

### Desarrollo Local
Deja `VITE_API_URL` vacío — el proxy de Vite redirige `/api` a `http://localhost:5000` automáticamente.

### Producción
Configura `VITE_API_URL` con la URL del backend desplegado:
```
VITE_API_URL=https://valhalla-api.onrender.com
```

## Desarrollo Local

```bash
npm run dev
```

> ⚠️ **Requiere** que el backend esté corriendo en el puerto 5000.

## Build de Producción

```bash
npm run build
```

Los archivos se generan en `dist/`.

## Despliegue (Vercel / Netlify)

### Vercel
1. Conecta tu repositorio
2. Configura **Root Directory** a `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Agrega la variable de entorno:
   - `VITE_API_URL` → URL de tu backend (ej: `https://valhalla-api.onrender.com`)

### Netlify
1. Conecta tu repositorio
2. Configura **Base directory** a `frontend`
3. **Build command**: `npm run build`
4. **Publish directory**: `frontend/dist`
5. Agrega la variable de entorno `VITE_API_URL`
6. Agrega un archivo `_redirects` en `public/` para SPA routing:
   ```
   /*    /index.html   200
   ```
