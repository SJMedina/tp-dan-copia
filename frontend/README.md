# Sistema de Gestión Hotelera - Frontend

Interfaz web completa para gestionar hoteles, habitaciones y reservas. Conecta con dos microservicios Spring Boot:

- **gestion-svc**: CRUD de hoteles, tipos de habitación, tarifas y habitaciones
- **reservas-svc**: Gestión de reservas, búsqueda avanzada, pagos, check-in/out, ratings

## 🚀 Instalación

### Opción 1: Proyectos Separados (Recomendado)

Mantén el frontend y backend como proyectos independientes:

```bash
# Estructura de carpetas
mi-proyecto/
├── gestion-svc/          # Tu servicio de gestión Spring Boot
├── reservas-svc/         # Tu servicio de reservas Spring Boot
└── frontend/             # Este proyecto Next.js
```

**Pasos:**

1. **Descarga el código**
   - Haz clic en el botón de descarga (tres puntos) → "Download ZIP"
   - Extrae los archivos en una carpeta `frontend`

2. **Instala dependencias**
   ```bash
   cd frontend
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   El frontend correrá en `http://localhost:3000`

4. **Inicia tus servicios Spring Boot**
   - **gestion-svc**: `http://localhost:8080`
   - **reservas-svc**: `http://localhost:8080` (o cambia el puerto si es necesario)

### Opción 2: Con diferentes puertos para cada servicio

Si tus servicios corren en diferentes puertos, edita `lib/api-config.ts`:

```typescript
export const API_ENDPOINTS = {
  GESTION: {
    BASE_URL: "http://localhost:8081", // Puerto del gestion-svc
    // ...
  },
  RESERVAS: {
    BASE_URL: "http://localhost:8082", // Puerto del reservas-svc
    // ...
  },
}
```

## ⚙️ Configuración de CORS en Spring Boot

**IMPORTANTE:** Debes habilitar CORS en ambos servicios Spring Boot:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 📋 Funcionalidades

### 1. Búsqueda Avanzada
- ✅ Búsqueda por fechas (check-in/check-out)
- ✅ Filtro por capacidad de huéspedes
- ✅ Rango de precios
- ✅ Categoría de hotel (estrellas)
- ✅ Amenities múltiples
- ✅ Ubicación geográfica (latitud, longitud, radio)
- ✅ Combinación de todos los criterios

### 2. Gestión de Reservas
- ✅ Crear nueva reserva (estado: REALIZADA)
- ✅ Registrar pagos (mínimo 50% para CONFIRMADA)
- ✅ Check-in (CONFIRMADA → EFECTUADA)
- ✅ Check-out con review opcional del host
- ✅ Agregar rating del cliente después del checkout
- ✅ Cancelar reservas
- ✅ Bloquear habitaciones temporalmente
- ✅ Cerrar habitaciones indefinidamente
- ✅ Ver historial de pagos y reviews

### 3. Gestión de Hoteles (CRUD)
- ✅ Crear, editar, eliminar hoteles
- ✅ Datos: nombre, CUIT, domicilio, coordenadas, teléfono, email, categoría

### 4. Gestión de Habitaciones (CRUD)
- ✅ Crear, editar, eliminar habitaciones
- ✅ Asignar a hotel y tipo de habitación
- ✅ Número, piso, información

### 5. Gestión de Tipos de Habitación (CRUD)
- ✅ Crear, editar, eliminar tipos (Suite, Standard, etc.)
- ✅ Nombre, descripción, capacidad

### 6. Gestión de Tarifas (CRUD)
- ✅ Crear, editar, eliminar tarifas por rango de fechas
- ✅ Asignar a tipo de habitación
- ✅ Precio por noche

## 🎯 Endpoints Cubiertos

### Servicio de Gestión (gestion-svc)
```
GET    /hoteles
GET    /hoteles/{id}
POST   /hoteles
PUT    /hoteles/{id}
DELETE /hoteles/{id}

GET    /tipos-habitacion
GET    /tipos-habitacion/{id}
POST   /tipos-habitacion
PUT    /tipos-habitacion/{id}
DELETE /tipos-habitacion/{id}

GET    /tarifas
GET    /tarifas/{id}
POST   /tarifas
PUT    /tarifas/{id}
DELETE /tarifas/{id}

GET    /habitaciones
GET    /habitaciones/{id}
POST   /habitaciones
PUT    /habitaciones/{id}
DELETE /habitaciones/{id}
```

### Servicio de Reservas (reservas-svc)
```
GET    /habitaciones
GET    /habitaciones/{id}
POST   /habitaciones/buscar

GET    /reservas
GET    /reservas/{id}
POST   /reservas
PUT    /reservas/{id}
DELETE /reservas/{id}
POST   /reservas/{id}/pago
POST   /reservas/{id}/check-in
POST   /reservas/{id}/check-out
POST   /reservas/{id}/rating
POST   /reservas/{id}/cancelar
POST   /reservas/bloquear
POST   /reservas/cerrar
```

## 🧪 Pruebas

Todas las pruebas de las colecciones Postman están cubiertas:
- ✅ **gestion-svc.postman_collection.json**: Todos los CRUD
- ✅ **reservas-svc.postman_collection.json**: Ciclo de vida completo de reservas

## 🛠️ Tecnologías

- **Next.js 16** con App Router
- **React 19** con Server Components
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** para componentes
- **Fetch API** para llamadas HTTP

## 📦 Estructura del Proyecto

```
frontend/
├── app/
│   ├── page.tsx              # Página principal con tabs
│   ├── layout.tsx            # Layout raíz
│   ├── loading.tsx           # Suspense boundary
│   └── globals.css           # Estilos globales
├── components/
│   ├── search-interface.tsx  # Búsqueda avanzada
│   ├── reservas-manager.tsx  # Gestión de reservas
│   ├── hoteles-manager.tsx   # CRUD de hoteles
│   ├── habitaciones-manager.tsx  # CRUD de habitaciones
│   ├── tipos-manager.tsx     # CRUD de tipos
│   ├── tarifas-manager.tsx   # CRUD de tarifas
│   └── ui/                   # Componentes de shadcn/ui
├── lib/
│   └── api-config.ts         # Configuración de endpoints
└── README.md
```

## 🚨 Solución de Problemas

### Error de CORS
```
Access to fetch at 'http://localhost:8080/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```
**Solución:** Asegúrate de tener la configuración de CORS en tus controllers Spring Boot (ver arriba).

### Los servicios no responden
- Verifica que ambos servicios Spring Boot estén corriendo
- Verifica los puertos en `lib/api-config.ts`
- Revisa la consola del navegador (F12) para ver los errores

### La búsqueda no devuelve resultados
- Asegúrate de tener datos de prueba en tu base de datos
- Verifica que el endpoint `/habitaciones/buscar` esté funcionando en Postman
- Los criterios de búsqueda son opcionales, puedes buscar sin llenar ningún campo

## 📝 Notas

- El diseño es funcional y profesional, sin imágenes decorativas
- Todos los estados de reserva están implementados según el flujo de negocio
- La interfaz es responsive y funciona en móvil, tablet y desktop
- Los formularios tienen validación básica
- Los toasts muestran feedback de todas las operaciones

## 🤝 Integración Completa

Para una integración exitosa:

1. ✅ Inicia **gestion-svc** en el puerto 8080 (o configura otro puerto)
2. ✅ Inicia **reservas-svc** en el puerto 8080 (o configura otro puerto diferente)
3. ✅ Configura CORS en ambos servicios
4. ✅ Inicia el frontend con `npm run dev`
5. ✅ Abre `http://localhost:3000` en tu navegador
6. ✅ Prueba cada tab: Búsqueda, Reservas, Hoteles, Habitaciones, Tipos, Tarifas

¡Listo! Ahora tienes una interfaz completa para gestionar tu sistema hotelero.
