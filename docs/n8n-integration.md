# n8n Integration Guide

## Overview
Este proyecto usa n8n como el cerebro principal para:
- IA/ChatGPT para sugerencias de productos
- Monitoreo de precios de supermercados
- Alertas de WhatsApp

## Workflows de n8n Requeridos

### 1. Smart Suggestions Workflow

**Webhook URL:** `/webhook/smart-suggestions`

**Input:**
```json
{
  "input": "leche",
  "currentProducts": ["pan", "huevos"],
  "context": "shopping_list",
  "timestamp": "2025-01-16T..."
}
```

**Proceso:**
1. **HTTP Request** → OpenAI/ChatGPT
   - Prompt: Analizar producto y generar sugerencias
   - Contexto: Lista actual de productos
   
2. **HTTP Request** → APIs de Supermercados
   - Buscar precios actuales
   - Detectar ofertas/descuentos
   
3. **Code Node** → Combinar datos
   - Fusionar sugerencias de IA + precios
   - Categorizar por tipo (variant/complement/recipe)

**Output:**
```json
{
  "suggestions": [
    {
      "name": "Leche descremada",
      "category": "Lácteos",
      "priority": 3,
      "reason": "Opción más saludable",
      "type": "variant",
      "price": 1250,
      "discount": 10,
      "store": "Jumbo"
    }
  ]
}
```

### 2. Price Monitor Workflow

**Trigger:** Scheduler (cada 6 horas)

**Proceso:**
1. **MongoDB** → Obtener productos activos
2. **HTTP Request** → APIs de supermercados
3. **Code Node** → Detectar cambios de precio
4. **IF Node** → ¿Precio bajó >10%?
5. **WhatsApp Node** → Enviar alerta

### 3. WhatsApp Alerts Workflow

**Webhook URL:** `/webhook/whatsapp-alert`

**Input:**
```json
{
  "type": "price_drop",
  "product": "Leche La Serenísima",
  "oldPrice": 1500,
  "newPrice": 1200,
  "discount": 20,
  "store": "Carrefour"
}
```

## APIs de Supermercados Sugeridas

### Argentina:
- **Jumbo:** Web scraping o API interna
- **Carrefour:** API pública o scraping
- **Coto:** Web scraping
- **Día:** API o scraping

### Estructura de datos:
```json
{
  "product": "Leche La Serenísima 1L",
  "price": 1250,
  "originalPrice": 1400,
  "discount": 10.7,
  "store": "jumbo",
  "availability": true,
  "lastUpdate": "2025-01-16T..."
}
```

## Configuración de WhatsApp

### Option 1: WhatsApp Business API
- Usar servicio como Twilio
- Más robusto pero requiere verificación

### Option 2: Baileys (WhatsApp Web)
- Usar biblioteca `@whiskeysockets/baileys`
- Más simple pero menos estable

## Deployment de n8n

### Self-hosted:
```bash
# Docker Compose
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Cloud:
- n8n.cloud (recomendado)
- Railway
- Heroku

## Environment Variables

```env
# En n8n
OPENAI_API_KEY=sk-...
WHATSAPP_TOKEN=...
MONGODB_URI=mongodb://...

# En Next.js
N8N_WEBHOOK_URL=https://tu-n8n.com/webhook
N8N_API_KEY=tu_api_key
```

## Testing

### 1. Test Smart Suggestions:
```bash
curl -X POST http://localhost:3000/api/smart-suggestions \
  -H "Content-Type: application/json" \
  -d '{"input":"leche","currentProducts":[]}'
```

### 2. Test n8n Webhook:
```bash
curl -X POST https://tu-n8n.com/webhook/smart-suggestions \
  -H "Content-Type: application/json" \
  -d '{"input":"leche","currentProducts":[]}'
```

## Próximos Pasos

1. **Configurar n8n instance**
2. **Crear los 3 workflows principales**
3. **Configurar APIs de supermercados**
4. **Setup WhatsApp Business**
5. **Test integración completa**
