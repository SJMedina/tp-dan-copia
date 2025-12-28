package edu.utn.frsf.isi.dan.reservas_svc.controller;

import edu.utn.frsf.isi.dan.reservas_svc.dto.HabitacionSearchCriteria;
import edu.utn.frsf.isi.dan.reservas_svc.model.Habitacion;
import edu.utn.frsf.isi.dan.reservas_svc.service.HabitacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Nota: En producción, las habitaciones se sincronizan automáticamente desde
 * gestion-svc mediante mensajes RabbitMQ. Los endpoints POST, PUT y DELETE
 * están disponibles únicamente para testing y pruebas con Postman.
 */
@RestController
@RequestMapping("/habitaciones")
public class HabitacionController {
    @Autowired
    private HabitacionService habitacionService;

    @GetMapping
    public List<Habitacion> getAll() {
        return habitacionService.findAll();
    }

    @GetMapping("/{habitacionId}")
    public ResponseEntity<Habitacion> getByHabitacionId(@PathVariable Long habitacionId) {
        return habitacionService.findByHabitacionId(habitacionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{habitacionId}")
    public ResponseEntity<Habitacion> updateByHabitacionId(@PathVariable Long habitacionId, @RequestBody Habitacion habitacion) {
        return habitacionService.findByHabitacionId(habitacionId)
                .map(existing -> {
                    habitacion.setId(existing.getId());
                    habitacion.setHabitacionId(habitacionId);
                    return ResponseEntity.ok(habitacionService.save(habitacion));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{habitacionId}")
    public ResponseEntity<Void> deleteByHabitacionId(@PathVariable Long habitacionId) {
        return habitacionService.findByHabitacionId(habitacionId)
                .map(existing -> {
                    habitacionService.deleteById(existing.getId());
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Habitacion> create(@RequestBody Habitacion habitacion) {
        Habitacion saved = habitacionService.save(habitacion);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/buscar")
    public ResponseEntity<List<Habitacion>> buscarDisponibles(@RequestBody HabitacionSearchCriteria criteria) {
        List<Habitacion> habitaciones = habitacionService.buscarHabitacionesDisponibles(criteria);
        return ResponseEntity.ok(habitaciones);
    }

}
