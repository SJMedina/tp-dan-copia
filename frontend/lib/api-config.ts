// Configuration for multiple backend services

export const API_ENDPOINTS = {
    // Servicio de Usuarios (user-svc)
    USER: {
        BASE_URL: "http://localhost:8081",
        USERS: "/users",
        USERS_HUESPED: "/users/huesped",
        USERS_PROPIETARIO: "/users/propietario",
        BANCOS: "/bancos",
    },

    // Servicio de Reservas (reservas-svc)
    RESERVAS: {
        BASE_URL: "http://localhost:8082",
        RESERVAS: "/reservas",
        HABITACIONES: "/habitaciones",
        HABITACIONES_BUSCAR: "/habitaciones/buscar",
    },

    // Servicio de Gestión (gestion-svc)
    GESTION: {
        BASE_URL: "http://localhost:8083",
        HOTELES: "/hoteles",
        TIPOS_HABITACION: "/tipos-habitacion",
        TARIFAS: "/tarifas",
        HABITACIONES: "/habitaciones",
    }
}

// Helper functions for API calls
export const getUserUrl = (endpoint: string) => `${API_ENDPOINTS.USER.BASE_URL}${endpoint}`
export const getReservasUrl = (endpoint: string) => `${API_ENDPOINTS.RESERVAS.BASE_URL}${endpoint}`
export const getGestionUrl = (endpoint: string) => `${API_ENDPOINTS.GESTION.BASE_URL}${endpoint}`
