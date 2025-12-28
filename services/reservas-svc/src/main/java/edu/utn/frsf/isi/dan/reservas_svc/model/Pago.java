package edu.utn.frsf.isi.dan.reservas_svc.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {
    private String method;
    private String transactionId;
    private Double amount;           // Monto pagado
    private String status;           // Estado del pago (APPROVED, PENDING, REJECTED)
    private Instant fecha;           // Fecha del pago
}
