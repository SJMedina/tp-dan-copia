package edu.utn.frsf.isi.dan.reservas_svc.controller;

import edu.utn.frsf.isi.dan.reservas_svc.model.Pago;
import edu.utn.frsf.isi.dan.reservas_svc.model.Reserva;
import edu.utn.frsf.isi.dan.reservas_svc.model.Review;
import edu.utn.frsf.isi.dan.reservas_svc.service.ReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservas")
public class ReservaController {
    @Autowired
    private ReservaService reservaService;

    @GetMapping
    public List<Reserva> getAll() {
        return reservaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> getById(@PathVariable String id) {
        return reservaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crea una nueva reserva con estado REALIZADA
     */
    @PostMapping
    public Reserva create(@RequestBody Reserva reserva) {
        return reservaService.save(reserva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reserva> update(@PathVariable String id, @RequestBody Reserva reserva) {
        if (!reservaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        reserva.set_id(id);
        return ResponseEntity.ok(reservaService.save(reserva));
    }

    /**
     * Registra un pago para una reserva
     * Si se paga al menos el 50%, la reserva pasa a CONFIRMADA
     */
    @PostMapping("/{id}/pago")
    public ResponseEntity<?> registrarPago(@PathVariable String id, @RequestBody Pago pago) {
        try {
            Reserva reserva = reservaService.registrarPago(id, pago);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Efectúa el check-in del cliente
     * La reserva pasa de CONFIRMADA a EFECTUADA
     */
    @PostMapping("/{id}/check-in")
    public ResponseEntity<?> efectuarCheckIn(@PathVariable String id) {
        try {
            Reserva reserva = reservaService.efectuarCheckIn(id);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Efectúa el check-out del cliente
     */
    @PostMapping("/{id}/check-out")
    public ResponseEntity<?> efectuarCheckOut(@PathVariable String id, @RequestBody(required = false) Review hostReview) {
        try {
            Reserva reserva = reservaService.efectuarCheckOut(id, hostReview);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Agrega un rating a la reserva después del checkout
     */
    @PostMapping("/{id}/rating")
    public ResponseEntity<?> agregarRating(@PathVariable String id, @RequestBody Review rating) {
        try {
            Reserva reserva = reservaService.agregarRating(id, rating);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Cancela una reserva
     */
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarReserva(@PathVariable String id) {
        try {
            Reserva reserva = reservaService.cancelarReserva(id);
            return ResponseEntity.ok(reserva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Bloquea una habitación temporalmente
     */
    @PostMapping("/bloquear")
    public ResponseEntity<?> bloquearHabitacion(@RequestBody Reserva reserva) {
        try {
            Reserva reservaBloqueada = reservaService.bloquearHabitacion(reserva);
            return ResponseEntity.ok(reservaBloqueada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Cierra una habitación indefinidamente
     */
    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarHabitacion(@RequestBody Reserva reserva) {
        try {
            Reserva reservaCerrada = reservaService.cerrarHabitacion(reserva);
            return ResponseEntity.ok(reservaCerrada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!reservaService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        reservaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
