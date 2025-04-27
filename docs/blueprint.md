# **App Name**: Bolucompras List (antes Monthly Shopping List)

## Core Features:

- **Product Input**: Allow users to enter product names via an input field.
- **Add Product**: Add entered products to a list using a button or the Enter key.
- **Product List Display**: Display the current shopping list, showing product names and quantities.
- **Duplicate Handling**: If a user tries to add a product already on the list, prompt for confirmation via a modal before incrementing the quantity.
- **Backend Integration (n8n)**:
    - Fetch the initial product list from an n8n webhook connected to a database.
    - Send requests to an n8n webhook to add new products or increment quantities in the database.

## Style Guidelines:

- **Primary color**: Shades of blue (`text-blue-800`, `text-blue-700`, gradient `to-blue-200`/`to-blue-500`/`to-blue-600`).
- **Accent color**: Turquoise/Cyan (`border-cyan-300`, gradient `from-sky-100`/`from-cyan-100`/`from-cyan-500`/`from-cyan-600`).
- **Font**: Default sans-serif font provided by Tailwind/Next.js.
- **Layout**: Centered card layout using Shadcn/ui `Card` components for input and list display. `Table` component for the product list.
- **Components**: Utilizes Shadcn/ui components (`Button`, `Input`, `Card`, `Table`, `AlertDialog`, `Skeleton`, `Toast`).

## Implementación Técnica:

- **Frontend**: Next.js (App Router) con React y TypeScript.
- **UI**: Construida con [Shadcn/ui](https://ui.shadcn.com/) sobre Tailwind CSS.
- **Gestión de Estado**: Componente funcional (`src/app/page.tsx`) utilizando hooks de React (`useState`, `useEffect`) para gestionar el nombre del producto ingresado, la lista de productos, estados de carga y la visibilidad del modal de confirmación.
- **Backend y Base de Datos (gestionado por n8n)**:
    - El backend real y la lógica de base de datos residen en flujos de trabajo de **n8n**.
    - Una base de datos **PostgreSQL** (gestionada a través de n8n) almacena la lista de productos y sus cantidades.
    - **n8n Webhooks**:
        - `GET http://localhost:5678/webhook-test/products`: Endpoint de n8n para obtener la lista actual de productos desde la base de datos PostgreSQL. El frontend llama a este endpoint al cargar la página.
        - `POST http://localhost:5678/webhook-test/input`: Endpoint de n8n que recibe el nombre de un producto (`{ "product": "NombreDelProducto" }`). Este flujo de n8n es responsable de:
            - Verificar si el producto ya existe en la base de datos PostgreSQL.
            - Insertar el producto con cantidad 1 si es nuevo.
            - Incrementar la cantidad del producto si ya existe.
- **Lógica Frontend (`src/app/page.tsx`)**:
    - **Carga Inicial**: `useEffect` llama a `fetchProducts` para obtener la lista desde el webhook `/products`. Se muestra un `Skeleton` durante la carga.
    - **Agregar Producto**:
        - La función `handleAddProductClick` valida la entrada.
        - Compara (insensible a mayúsculas/minúsculas) el producto ingresado con la lista local (`products`).
        - Si el producto existe, abre un `AlertDialog` (`isModalOpen`).
        - Si no existe o si se confirma en el modal, llama a `proceedWithAddingProduct`.
    - **`proceedWithAddingProduct`**:
        - Realiza una solicitud `POST` al webhook `/input`.
        - Realiza una **actualización optimista** de la UI (agrega o incrementa en el estado local `products`) *antes* de que la llamada al webhook termine, para una respuesta más rápida.
        - Muestra notificaciones `toast` para éxitos o errores.
        - Limpia el campo de entrada y cierra el modal al finalizar.

## Original User Request:
hola quiero crear una interfaz bonita con detalles en azules y turquezas, en ella quiero agregar a una lista de productos , lo que enviare a diario para mi compra mensual. esta interfaz sera utiliza con los agentes de n8n , te pasare mi webhook:http://localhost:5678/webhook-test/input
