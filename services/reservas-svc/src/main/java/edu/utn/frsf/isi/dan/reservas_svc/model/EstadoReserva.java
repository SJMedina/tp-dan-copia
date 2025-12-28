package edu.utn.frsf.isi.dan.reservas_svc.model;

public enum EstadoReserva {
    RESERVADA,      // Reserva creada, sin pago aún
    CONFIRMADA,     // Tiene al menos un pago
    EFECTUADA,      // Cliente hizo check-in
    FINALIZADA,     // Check-out realizado con review y pago completo
    ADEUDADA,       // Finalizada pero sin pago completo o sin review
    CANCELADA,      // Reserva cancelada (solo si no tiene pagos)
    BLOQUEADA,      // Habitación bloqueada (no se ofrece)
    CERRADA         // Habitación cerrada (no disponible)
}