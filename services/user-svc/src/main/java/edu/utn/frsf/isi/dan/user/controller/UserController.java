package edu.utn.frsf.isi.dan.user.controller;

import edu.utn.frsf.isi.dan.user.dto.HuespedRecord;
import edu.utn.frsf.isi.dan.user.dto.PropietarioRecord;
import edu.utn.frsf.isi.dan.user.service.UserService;
import edu.utn.frsf.isi.dan.user.service.HuespedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.utn.frsf.isi.dan.user.model.Usuario;
import edu.utn.frsf.isi.dan.user.model.Huesped;
import edu.utn.frsf.isi.dan.user.model.TarjetaCredito;
import edu.utn.frsf.isi.dan.user.model.Propietario;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@Tag(name = "User Controller", description = "Operaciones para la gestión de usuarios")
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private HuespedService huespedService;

    @Operation(summary = "Crear usuario huesped", 
                description = "Crea un nuevo usuario de tipo huesped",
                responses = {
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Usuario huesped creado exitosamente"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Error en la solicitud"),
                    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")}
    )
    @PostMapping("/huesped")
    public ResponseEntity<Void> crearUsuarioHuesped(@RequestBody HuespedRecord huespedRecord) {
        userService.crearUsuarioHuesped(huespedRecord);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar datos de usuario huesped", description = "Actualiza los datos de un usuario huesped existente",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Datos actualizados correctamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Usuario huesped no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos inválidos")
        }
    )
    @PutMapping("/huesped/{id}")
    public ResponseEntity<Huesped> actualizarDatosHuesped(
            @PathVariable Long id,
            @RequestBody Huesped datosActualizados) {
        Huesped huesped = huespedService.actualizarDatosHuesped(id, datosActualizados);
        return ResponseEntity.ok(huesped);
    }

    @Operation(summary = "Borrar usuario huesped", description = "Elimina un usuario huesped por su ID",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Usuario huesped eliminado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Usuario huesped no encontrado")
        }
    )
    @DeleteMapping("/huesped/{id}")
    public ResponseEntity<Void> borrarHuesped(@PathVariable Long id) {
        huespedService.borrarHuesped(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Agregar tarjeta de crédito a usuario huesped", description = "Agrega una tarjeta de crédito a un usuario huesped",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tarjeta agregada correctamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Usuario huesped no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Datos de tarjeta inválidos")
        }
    )
    @PostMapping("/huesped/{id}/tarjeta")
    public ResponseEntity<Huesped> agregarTarjetaCredito(
            @PathVariable Long id,
            @RequestBody TarjetaCredito tarjetaCredito) {
        Huesped huesped = huespedService.agregarTarjetaCredito(id, tarjetaCredito);
        return ResponseEntity.ok(huesped);
    }

    @Operation(summary = "Eliminar tarjeta de crédito de usuario huesped", description = "Elimina una tarjeta de crédito de un usuario huesped",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Tarjeta eliminada correctamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Usuario huesped o tarjeta no encontrada")
        }
    )
    @DeleteMapping("/huesped/{id}/tarjeta/{tarjetaId}")
    public ResponseEntity<Void> eliminarTarjetaCredito(
            @PathVariable Long id,
            @PathVariable Integer tarjetaId) {
        huespedService.eliminarTarjetaCredito(id, tarjetaId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Cambiar tarjeta principal de usuario huesped", description = "Cambia la tarjeta principal de un usuario huesped",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204", description = "Tarjeta principal cambiada correctamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Usuario huesped o tarjeta no encontrada")
        }
    )
    @PutMapping("/huesped/{id}/tarjeta/{tarjetaId}/principal")
    public ResponseEntity<Void> cambiarTarjetaPrincipal(
            @PathVariable Long id,
            @PathVariable Integer tarjetaId) {
        huespedService.cambiarTarjetaPrincipal(id, tarjetaId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Crear usuario propietario", description = "Crea un nuevo usuario de tipo propietario",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Usuario propietario creado exitosamente"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Error en la solicitud"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
        }
    )
    @PostMapping("/propietario")
    public ResponseEntity<Void> crearUsuarioPropietario(@RequestBody @Valid PropietarioRecord propietarioRecord) {
        userService.crearUsuarioPropietario(propietarioRecord);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @Operation(summary = "Buscar usuarios por nombre", description = "Busca usuarios por nombre (paginado)",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lista de usuarios encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
        }
    )
    @GetMapping
    public Page<Usuario> buscarUsuariosPorNombre(@RequestParam(required = false) String nombre, Pageable pageable) {
        if (nombre == null || nombre.isEmpty()) {
            return userService.buscarPorNombre("", pageable);
        }
        return userService.buscarPorNombre(nombre, pageable);
    }

    @Operation(summary = "Buscar usuario por DNI exacto", description = "Busca un usuario por su DNI exacto",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
        }
    )
    @GetMapping("/dni/{dni}")
    public ResponseEntity<Usuario> buscarUsuarioPorDni(@PathVariable String dni) {
        Usuario usuario = userService.buscarPorDniExacto(dni);
        if (usuario == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(usuario);
    }

    @Operation(summary = "Buscar usuarios por DNI", description = "Busca usuarios por coincidencia de DNI (paginado)",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lista de usuarios encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Solicitud inválida"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Error interno del servidor")
        }
    )
    @GetMapping("/buscar-dni")
    public Page<Usuario> buscarUsuariosPorDni(@RequestParam String dni, Pageable pageable) {
        return userService.buscarPorDni(dni, pageable);
    }
}