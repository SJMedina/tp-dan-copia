package edu.utn.frsf.isi.dan.reservas_svc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitacionSearchCriteria {
    // Fechas de disponibilidad
    private Instant fechaCheckIn;
    private Instant fechaCheckOut;

    // Capacidad
    private Integer cantidadHuespedes;

    // Rango de precio
    private Double precioMinimo;
    private Double precioMaximo;

    // Categoría del hotel (estrellas)
    private Integer categoriaMinima;
    private Integer categoriaMaxima;

    // Amenities (comodidades)
    private List<String> amenities;

    // Ubicación geográfica
    private Double latitud;
    private Double longitud;
    private Double distanciaMaximaMetros;  // Distancia en metros
}

