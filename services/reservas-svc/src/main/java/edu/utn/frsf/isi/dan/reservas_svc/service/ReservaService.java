package edu.utn.frsf.isi.dan.reservas_svc.service;

import edu.utn.frsf.isi.dan.reservas_svc.model.EstadoReserva;
import edu.utn.frsf.isi.dan.reservas_svc.model.Habitacion;
import edu.utn.frsf.isi.dan.reservas_svc.model.Pago;
import edu.utn.frsf.isi.dan.reservas_svc.model.Reserva;
import edu.utn.frsf.isi.dan.reservas_svc.model.Review;
import edu.utn.frsf.isi.dan.reservas_svc.repository.ReservaRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Log4j2
public class ReservaService {
    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Reserva> findAll() {
        return reservaRepository.findAll();
    }

    public Optional<Reserva> findById(String id) {
        return reservaRepository.findById(id);
    }

    /**
     * Crea una nueva reserva con estado RESERVADA (sin pago aún)
     * y la agrega a la lista de reservas de la habitación
     */
    public Reserva save(Reserva reserva) {
        // Si es nueva reserva, establecer valores por defecto
        if (reserva.get_id() == null) {
            reserva.setEstadoReserva(EstadoReserva.RESERVADA); // Estado inicial: RESERVADA
            reserva.setStatus("RESERVADA");
            if (reserva.getPago() == null) {
                reserva.setPago(new ArrayList<>());
            }

            log.info("Creando nueva reserva en estado RESERVADA");
            Reserva nuevaReserva = reservaRepository.save(reserva);
            agregarReservaAHabitacion(nuevaReserva);

            return nuevaReserva;
        }

        log.info("Guardando reserva con estado: {}", reserva.getEstadoReserva());
        return reservaRepository.save(reserva);
    }

    /**
     * Agrega la reserva a la lista de reservas de la habitación
     */
    private void agregarReservaAHabitacion(Reserva reserva) {
        try {
            Query query = new Query(Criteria.where("_id").is(reserva.getIdHabitacion()));

            Habitacion.ReservaSimple reservaSimple = Habitacion.ReservaSimple.builder()
                    ._id(reserva.get_id())
                    .checkIn(reserva.getCheckIn())
                    .checkOut(reserva.getCheckOut())
                    .precioTotal(reserva.getPrecioTotal())
                    .estadoReserva(reserva.getEstadoReserva())
                    .build();

            Update update = new Update().addToSet("reservas", reservaSimple);
            mongoTemplate.updateFirst(query, update, Habitacion.class);

            log.info("Reserva {} agregada a habitación {}", reserva.get_id(), reserva.getIdHabitacion());
        } catch (Exception e) {
            log.error("Error al agregar reserva a habitación: {}", e.getMessage(), e);
        }
    }

    /**
     * Elimina la reserva de la lista de reservas de la habitación
     */
    private void eliminarReservaDeHabitacion(Reserva reserva) {
        try {
            Query query = new Query(Criteria.where("_id").is(reserva.getIdHabitacion()));
            Update update = new Update().pull("reservas", Query.query(Criteria.where("_id").is(reserva.get_id())));
            mongoTemplate.updateFirst(query, update, Habitacion.class);

            log.info("Reserva {} eliminada de habitación {}", reserva.get_id(), reserva.getIdHabitacion());
        } catch (Exception e) {
            log.error("Error al eliminar reserva de habitación: {}", e.getMessage(), e);
        }
    }

    /**
     * Actualiza el estado de la reserva en la lista de reservas de la habitación
     */
    private void actualizarEstadoReservaEnHabitacion(Reserva reserva) {
        try {
            Query query = new Query(
                    Criteria.where("_id").is(reserva.getIdHabitacion())
                            .and("reservas._id").is(reserva.get_id())
            );
            Update update = new Update().set("reservas.$.estadoReserva", reserva.getEstadoReserva());
            mongoTemplate.updateFirst(query, update, Habitacion.class);

            log.info("Estado de reserva {} actualizado en habitación {}", reserva.get_id(), reserva.getIdHabitacion());
        } catch (Exception e) {
            log.error("Error al actualizar estado de reserva en habitación: {}", e.getMessage(), e);
        }
    }

    /**
     * Registra un pago y actualiza el estado si corresponde
     * Si tiene al menos un pago aprobado, la reserva pasa a CONFIRMADA
     */
    public Reserva registrarPago(String reservaId, Pago pago) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada: " + reservaId));

        // Validar que la reserva esté en estado que permita pagos
        if (reserva.getEstadoReserva() == EstadoReserva.CANCELADA ||
                reserva.getEstadoReserva() == EstadoReserva.FINALIZADA) {
            throw new RuntimeException("No se pueden registrar pagos en reservas CANCELADAS o FINALIZADAS");
        }

        // Agregar el pago a la lista
        if (reserva.getPago() == null) {
            reserva.setPago(new ArrayList<>());
        }
        reserva.getPago().add(pago);

        // Si tiene al menos un pago aprobado, pasa a CONFIRMADA
        boolean tienePagoAprobado = reserva.getPago().stream()
                .anyMatch(p -> "APPROVED".equals(p.getStatus()));

        if (tienePagoAprobado && reserva.getEstadoReserva() == EstadoReserva.RESERVADA) {
            reserva.setEstadoReserva(EstadoReserva.CONFIRMADA);
            reserva.setStatus("CONFIRMADA");
            log.info("Reserva {} cambiada a CONFIRMADA (tiene al menos un pago)", reservaId);
        }

        Reserva reservaActualizada = reservaRepository.save(reserva);
        actualizarEstadoReservaEnHabitacion(reservaActualizada);

        return reservaActualizada;
    }

    /**
     * Registra el check-in del cliente
     * La reserva pasa de CONFIRMADA a EFECTUADA
     */
    public Reserva efectuarCheckIn(String reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada: " + reservaId));

        // Validar que la reserva esté en estado CONFIRMADA
        if (reserva.getEstadoReserva() != EstadoReserva.CONFIRMADA) {
            throw new RuntimeException("Solo se puede hacer check-in en reservas CONFIRMADAS");
        }

        reserva.setEstadoReserva(EstadoReserva.EFECTUADA);
        reserva.setStatus("EFECTUADA");
        log.info("Check-in efectuado para reserva {}", reservaId);

        Reserva reservaActualizada = reservaRepository.save(reserva);
        actualizarEstadoReservaEnHabitacion(reservaActualizada);

        return reservaActualizada;
    }

    /**
     * Registra el check-out del cliente
     * Requiere review del dueño (hostReview) y pago completo
     * Si falta alguno, pasa a ADEUDADA, sino a FINALIZADA
     */
    public Reserva efectuarCheckOut(String reservaId, Review hostReview) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada: " + reservaId));

        // Validar que la reserva esté en estado EFECTUADA
        if (reserva.getEstadoReserva() != EstadoReserva.EFECTUADA) {
            throw new RuntimeException("Solo se puede hacer check-out en reservas EFECTUADAS");
        }

        // Verificar si tiene review del dueño
        boolean tieneReviewDueno = hostReview != null && hostReview.getRating() > 0;

        // Verificar si el pago está completo
        double totalPagado = reserva.getPago() != null ? reserva.getPago().stream()
                .filter(p -> "APPROVED".equals(p.getStatus()))
                .mapToDouble(Pago::getAmount)
                .sum() : 0.0;
        boolean pagoCompleto = totalPagado >= reserva.getPrecioTotal();

        // Establecer el estado según las validaciones
        if (!tieneReviewDueno || !pagoCompleto) {
            reserva.setEstadoReserva(EstadoReserva.ADEUDADA);
            reserva.setStatus("ADEUDADA");
            log.warn("Check-out marca reserva {} como ADEUDADA. Review: {}, Pago completo: {}",
                    reservaId, tieneReviewDueno, pagoCompleto);
        } else {
            reserva.setEstadoReserva(EstadoReserva.FINALIZADA);
            reserva.setStatus("FINALIZADA");
            log.info("Check-out completado para reserva {} - FINALIZADA", reservaId);
        }

        // Guardar el review del dueño si se proporcionó
        if (tieneReviewDueno) {
            hostReview.setCreatedAt(Instant.now().toString());
            reserva.setHostReview(hostReview);
        }

        Reserva reservaActualizada = reservaRepository.save(reserva);
        actualizarEstadoReservaEnHabitacion(reservaActualizada);

        return reservaActualizada;
    }

    /**
     * Agrega un rating del cliente a la reserva después del checkout
     */
    public Reserva agregarRatingCliente(String reservaId, Review rating) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada: " + reservaId));

        // Validar que la reserva esté FINALIZADA o ADEUDADA
        if (reserva.getEstadoReserva() != EstadoReserva.FINALIZADA &&
                reserva.getEstadoReserva() != EstadoReserva.ADEUDADA) {
            throw new RuntimeException("Solo se puede agregar rating en reservas FINALIZADAS o ADEUDADAS");
        }

        // Validar que ya pasó la fecha de checkout
        if (Instant.now().isBefore(reserva.getCheckOut())) {
            throw new RuntimeException("Solo se puede agregar rating después de la fecha de check-out");
        }

        rating.setCreatedAt(Instant.now().toString());
        reserva.setClientReview(rating);
        log.info("Rating del cliente agregado a reserva {}: {} estrellas", reservaId, rating.getRating());

        return reservaRepository.save(reserva);
    }

    /**
     * Cancela una reserva
     * Solo se puede cancelar si NO tiene pagos
     * Al cancelar, se elimina de la lista de reservas de la habitación
     */
    public Reserva cancelarReserva(String reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada: " + reservaId));

        // Validar que no esté en estado que no se puede cancelar
        if (reserva.getEstadoReserva() == EstadoReserva.EFECTUADA ||
                reserva.getEstadoReserva() == EstadoReserva.FINALIZADA ||
                reserva.getEstadoReserva() == EstadoReserva.ADEUDADA) {
            throw new RuntimeException("No se puede cancelar una reserva EFECTUADA, FINALIZADA o ADEUDADA");
        }

        // Verificar que NO tenga pagos
        boolean tienePagos = reserva.getPago() != null && !reserva.getPago().isEmpty();
        if (tienePagos) {
            throw new RuntimeException("No se puede cancelar una reserva que ya tiene pagos registrados");
        }

        reserva.setEstadoReserva(EstadoReserva.CANCELADA);
        reserva.setStatus("CANCELADA");
        log.info("Reserva {} cancelada", reservaId);

        Reserva reservaCancelada = reservaRepository.save(reserva);

        // Eliminar la reserva de la lista de reservas de la habitación
        eliminarReservaDeHabitacion(reservaCancelada);

        return reservaCancelada;
    }

    /**
     * Bloquea una habitación creando una reserva en estado BLOQUEADA
     */
    public Reserva bloquearHabitacion(Reserva reserva) {
        reserva.setEstadoReserva(EstadoReserva.BLOQUEADA);
        reserva.setStatus("BLOQUEADA");

        Reserva reservaBloqueada = reservaRepository.save(reserva);
        agregarReservaAHabitacion(reservaBloqueada);

        log.info("Habitación {} bloqueada con reserva {}", reserva.getIdHabitacion(), reservaBloqueada.get_id());
        return reservaBloqueada;
    }

    /**
     * Cierra una habitación creando una reserva en estado CERRADA
     */
    public Reserva cerrarHabitacion(Reserva reserva) {
        reserva.setEstadoReserva(EstadoReserva.CERRADA);
        reserva.setStatus("CERRADA");

        Reserva reservaCerrada = reservaRepository.save(reserva);
        agregarReservaAHabitacion(reservaCerrada);

        log.info("Habitación {} cerrada con reserva {}", reserva.getIdHabitacion(), reservaCerrada.get_id());
        return reservaCerrada;
    }

    /**
     * Agrega un rating a la reserva (alias de agregarRatingCliente)
     */
    public Reserva agregarRating(String reservaId, Review rating) {
        return agregarRatingCliente(reservaId, rating);
    }

    public void deleteById(String id) {
        // Antes de eliminar, quitar de la lista de la habitación
        Optional<Reserva> reservaOpt = reservaRepository.findById(id);
        if (reservaOpt.isPresent()) {
            eliminarReservaDeHabitacion(reservaOpt.get());
        }
        reservaRepository.deleteById(id);
    }
}
