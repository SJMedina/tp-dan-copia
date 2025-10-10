package edu.utn.frsf.isi.dan.gestion.controller;

import edu.utn.frsf.isi.dan.gestion.model.Hotel;
import edu.utn.frsf.isi.dan.gestion.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "Hotel Controller", description = "Operaciones para la gestión de hoteles")
@RestController
@RequestMapping("/hoteles")
public class HotelController {
    @Autowired
    private HotelService hotelService;

    @Operation(summary = "Crear hotel", description = "Crea un nuevo hotel",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Hotel creado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno")
        }
    )
    @PostMapping
    public ResponseEntity<Void> create(@RequestBody @Valid Hotel hotel) {
        hotelService.save(hotel);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @Operation(summary = "Obtener hotel por ID", description = "Devuelve un hotel por su identificador",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Hotel encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Hotel no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "ID inválido")
        }
    )
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getById(@PathVariable Integer id) {
        return hotelService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Listar hoteles", description = "Lista todos los hoteles",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Listado obtenido"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno")
        }
    )
    @GetMapping
    public List<Hotel> getAll() {
        return hotelService.findAll();
    }

    @Operation(summary = "Actualizar hotel", description = "Actualiza un hotel existente",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Hotel actualizado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Hotel no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos")
        }
    )
    @PutMapping("/{id}")
    public ResponseEntity<Hotel> update(@PathVariable Integer id, @RequestBody @Valid Hotel hotel) {
        if (hotelService.findById(id).isEmpty()) return ResponseEntity.notFound().build();
        hotel.setId(id);
        return ResponseEntity.ok(hotelService.save(hotel));
    }

    @Operation(summary = "Eliminar hotel", description = "Elimina un hotel por su identificador",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Hotel eliminado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Hotel no encontrado")
        }
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrarHotel(@PathVariable Integer id) {
        if (hotelService.findById(id).isEmpty()) return ResponseEntity.notFound().build();
        hotelService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
