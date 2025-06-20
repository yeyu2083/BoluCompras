# Development Guide

## Configuración del Entorno de Desarrollo

### Requisitos Previos
- Node.js 18 o superior
- MongoDB
- Git

### Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd BoluCompras
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con:
```env
MONGODB_URI=tu_uri_de_mongodb
PORT=9002
```

4. Iniciar el servidor de desarrollo:
```bash
# Terminal 1 - Servidor Express
npm run server

# Terminal 2 - Frontend Next.js
npm run dev
```

## Estructura del Proyecto

```
BoluCompras/
├── docs/               # Documentación
├── server/            # Backend Express
│   ├── config/        # Configuración de BD
│   ├── models/        # Modelos Mongoose
│   └── routes/        # Rutas de API
├── src/               # Frontend Next.js
│   ├── app/          # App Router de Next.js
│   ├── components/   # Componentes React
│   └── hooks/        # Custom Hooks
└── test/             # Tests
```

## Convenciones de Código

### TypeScript
- Usar tipos explícitos para props y estados
- Evitar `any`
- Definir interfaces en `types/`

### React/Next.js
- Componentes funcionales con hooks
- Usar componentes de Shadcn/ui
- Nombres de archivos en PascalCase
- Props en camelCase

### API
- Rutas en kebab-case
- Respuestas JSON
- Manejo de errores consistente

## Testing

### Tests Unitarios
```bash
npm run test
```

### Tests E2E
```bash
npm run test:e2e
```

## Deployment

### Producción
1. Construir la aplicación:
```bash
npm run build
```

2. Iniciar en producción:
```bash
npm start
```

### Variables de Entorno en Producción
```env
NODE_ENV=production
MONGODB_URI=uri_produccion
PORT=9002
```

## Contribución

1. Crear una rama para la feature
2. Desarrollar y testear
3. Crear Pull Request
4. Code Review
