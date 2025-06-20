# API Reference

## Endpoints

### Products

#### GET /api/products
Obtiene la lista de productos con paginación.

**Query Parameters:**
- `page` (number): Número de página (default: 1)
- `limit` (number): Productos por página (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "quantity": "number",
      "purchased": "boolean",
      "categoria": "string",
      "prioridad": "number",
      "precio": "number | null",
      "cantidad_predeterminada": "number",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "page": "number",
  "totalPages": "number",
  "total": "number"
}
```

#### POST /api/products
Crea un nuevo producto.

**Body:**
```json
{
  "name": "string",
  "categoria": "string",
  "prioridad": "number",
  "quantity": "number",
  "precio": "number?",
  "cantidad_predeterminada": "number?"
}
```

**Response:**
- 201: Producto creado exitosamente
- 400: Error de validación o producto duplicado

#### PATCH /api/products/:id
Actualiza un producto existente.

**Parameters:**
- `id`: ID del producto

**Body:**
```json
{
  "quantity": "number?",
  "purchased": "boolean?",
  "categoria": "string?",
  "prioridad": "number?"
}
```

**Response:**
- 200: Producto actualizado exitosamente
- 404: Producto no encontrado
- 400: Error de validación

#### DELETE /api/products/:id
Elimina un producto.

**Parameters:**
- `id`: ID del producto

**Response:**
- 200: Producto eliminado exitosamente
- 404: Producto no encontrado
