# 🚀 Configuración Paso a Paso de n8n para BoluCompras

## Opción 1: n8n Cloud (Recomendado - Más Fácil)

### 1. Crear cuenta en n8n.cloud
1. Ve a [n8n.cloud](https://n8n.cloud)
2. Crea una cuenta gratuita
3. Crear un nuevo workflow

### 2. Obtener URL de Webhook
- En n8n cloud, crea un workflow
- Agrega nodo "Webhook"
- Copia la URL (ej: `https://tu-instancia.app.n8n.cloud/webhook/abc123`)

## Opción 2: n8n Self-Hosted (Docker)

### 1. Instalar con Docker
```bash
# Crear directorio para n8n
mkdir n8n-data

# Ejecutar n8n
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/n8n-data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

### 2. Acceder a n8n
- Abre http://localhost:5678
- Crea tu cuenta de administrador

## 📋 Workflows a Crear

### Workflow 1: Smart Suggestions
**Webhook URL**: `/webhook/smart-suggestions`

#### Nodos necesarios:
1. **Webhook** (Trigger)
2. **OpenAI Node** (Chat)
3. **HTTP Request** (APIs Supermercados)
4. **Code Node** (Procesar datos)
5. **Respond to Webhook**

#### Configuración OpenAI Node:
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "Eres un asistente de compras inteligente para Argentina. Para el input '{{ $json.input }}' y productos actuales {{ $json.currentProducts }}, sugiere productos complementarios, variantes o ingredientes. Responde SOLO en JSON con este formato: {\"suggestions\": [{\"name\": \"string\", \"category\": \"string\", \"priority\": number, \"reason\": \"string\", \"type\": \"variant|complement|recipe\"}]}"
    },
    {
      "role": "user", 
      "content": "{{ $json.input }}"
    }
  ]
}
```

### Workflow 2: Chat Assistant  
**Webhook URL**: `/webhook/chat-assistant`

#### Nodos necesarios:
1. **Webhook** (Trigger)
2. **OpenAI Node** (Chat conversacional)
3. **Code Node** (Generar sugerencias)
4. **Respond to Webhook**

#### Configuración OpenAI Node:
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "Eres un asistente de compras amigable para Argentina. El usuario tiene estos productos: {{ $json.currentProducts.join(', ') }}. Ayúdalo con su lista de compras, sugiere productos cuando sea relevante, y mantén conversación natural."
    },
    {
      "role": "user",
      "content": "{{ $json.message }}"
    }
  ]
}
```

### Workflow 3: Price Monitor
**Trigger**: Scheduler (cada 6 horas)

#### Nodos necesarios:
1. **Schedule** (Trigger)
2. **MongoDB** (Obtener productos activos)
3. **HTTP Request** (APIs supermercados)
4. **Code Node** (Detectar cambios)
5. **WhatsApp Node** (Enviar alertas)

## 🔌 APIs de Supermercados Argentina

### Jumbo
```javascript
// En Code Node de n8n
const response = await fetch('https://www.jumbo.com.ar/api/catalog_system/pub/products/search', {
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0...'
  }
});
```

### Carrefour  
```javascript
const response = await fetch('https://www.carrefour.com.ar/api/catalog_system/pub/products/search', {
  method: 'GET'
});
```

### Coto
```javascript
// Web scraping - más complejo
const response = await fetch('https://www.cotodigital3.com.ar/sitios/cdigi/browse', {
  method: 'POST',
  body: searchData
});
```

## 📱 Configuración WhatsApp

### Opción 1: WhatsApp Business API (Twilio)
```javascript
// En HTTP Request Node
{
  "url": "https://api.twilio.com/2010-04-01/Accounts/{{$env.TWILIO_SID}}/Messages.json",
  "method": "POST",
  "headers": {
    "Authorization": "Basic {{$env.TWILIO_AUTH}}"
  },
  "body": {
    "From": "whatsapp:+14155238886",
    "To": "whatsapp:+5491234567890", 
    "Body": "🛒 ¡Oferta! {{$json.product}} bajó a ${{$json.newPrice}} (antes ${{$json.oldPrice}})"
  }
}
```

### Opción 2: WhatsApp Web (Baileys)
```javascript
// Más complejo pero gratuito
const { makeWASocket } = require('@whiskeysockets/baileys');
```

## 🧪 Testing

### 1. Test Smart Suggestions
```bash
curl -X POST https://tu-n8n.cloud/webhook/smart-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "input": "leche",
    "currentProducts": ["pan", "huevos"],
    "context": "shopping_list"
  }'
```

### 2. Test Chat Assistant
```bash
curl -X POST https://tu-n8n.cloud/webhook/chat-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "message": "ayuda con mi lista",
    "currentProducts": ["leche", "pan"],
    "context": "shopping_assistant"
  }'
```

## 🔐 Variables de Entorno en n8n

En n8n Settings > Environment Variables:
```
OPENAI_API_KEY=sk-tu_key_aqui
TWILIO_SID=tu_twilio_sid
TWILIO_AUTH=tu_twilio_auth
MONGODB_URI=mongodb://tu_conexion
```

## 📊 Estructura de Respuesta Esperada

### Smart Suggestions Response:
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
      "store": "jumbo"
    }
  ]
}
```

### Chat Response:
```json
{
  "message": "¡Hola! Veo que tienes leche y pan. ¿Te gustaría que te sugiera algunos productos complementarios?",
  "suggestions": [
    {
      "name": "Mantequilla",
      "category": "Lácteos",
      "priority": 2,
      "reason": "Va perfecto con el pan"
    }
  ]
}
```

## ⚡ Próximos Pasos

1. **Elegir opción** (Cloud vs Self-hosted)
2. **Crear workflows** según las configuraciones de arriba
3. **Configurar APIs** de supermercados
4. **Setup WhatsApp** para alertas
5. **Testear integración** completa

¿Con cuál opción empezamos? ¿n8n Cloud o self-hosted?
