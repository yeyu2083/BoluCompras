# Bolucompras List

Bolucompras List es una aplicación diseñada para gestionar listas de compras mensuales de manera eficiente. La aplicación permite a los usuarios agregar productos, manejar duplicados y sincronizar los datos con un backend basado en n8n y una base de datos PostgreSQL.

## Características Principales

- **Entrada de Productos**: Permite a los usuarios ingresar nombres de productos mediante un campo de texto.
- **Agregar Productos**: Agrega productos a la lista mediante un botón o la tecla Enter.
- **Visualización de la Lista**: Muestra la lista de compras actual con nombres y cantidades de productos.
- **Manejo de Duplicados**: Solicita confirmación antes de incrementar la cantidad de un producto ya existente.
- **Integración con Backend**: Sincroniza los datos con un webhook de n8n conectado a una base de datos PostgreSQL.

## Tecnologías Utilizadas

### Frontend
- **Framework**: Next.js (App Router) con React y TypeScript.
- **Estilos**: Tailwind CSS y Shadcn/ui para componentes de interfaz de usuario.
- **Gestión de Estado**: Hooks de React (`useState`, `useEffect`).

### Backend
- **Automatización**: n8n para gestionar la lógica del backend.
- **Base de Datos**: PostgreSQL para almacenar productos y cantidades.
- **Webhooks**:
  - `GET http://localhost:5678/webhook-test/products`: Obtiene la lista de productos.
  - `POST http://localhost:5678/webhook-test/input`: Agrega o actualiza productos en la base de datos.

## Configuración del Proyecto

### Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en el puerto 9002.
- `npm run build`: Construye la aplicación para producción.
- `npm run start`: Inicia la aplicación en modo producción.
- `npm run lint`: Ejecuta el linter.
- `npm run typecheck`: Verifica los tipos de TypeScript.

### Dependencias Principales

- **React**: ^18.3.1
- **Next.js**: 15.2.3
- **Tailwind CSS**: ^3.4.1
- **Shadcn/ui**: Componentes basados en Radix UI.
- **n8n**: Para la lógica del backend.
- **PostgreSQL**: Base de datos para persistencia.

## Estructura del Proyecto

```
BoluCompras/
├── components.json
├── next.config.ts
├── package.json
├── README.md
├── tailwind.config.ts
├── tsconfig.json
├── docs/
│   └── blueprint.md
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── table.tsx
│   │       └── ...
│   ├── hooks/
│   │   └── use-toast.ts
│   └── lib/
│       └── utils.ts
```

## Cómo Empezar

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Notas Adicionales

- Asegúrate de tener n8n configurado y ejecutándose en `http://localhost:5678`.
- Configura la base de datos PostgreSQL según las necesidades del proyecto.

## Licencia

Este proyecto está bajo la licencia MIT.
