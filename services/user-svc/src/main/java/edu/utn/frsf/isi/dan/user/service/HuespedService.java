package edu.utn.frsf.isi.dan.user.service;

import edu.utn.frsf.isi.dan.user.dao.HuespedRepository;
import edu.utn.frsf.isi.dan.user.model.Huesped;
import edu.utn.frsf.isi.dan.user.model.TarjetaCredito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class HuespedService {
    @Autowired
    private HuespedRepository repository;

    public Huesped actualizarDatosHuesped(Long huespedId, Huesped datosActualizados) {
        Huesped huesped = repository.findById(huespedId)
                .orElseThrow(() -> new IllegalArgumentException("Huésped no encontrado"));
        huesped.setNombre(datosActualizados.getNombre());
        huesped.setEmail(datosActualizados.getEmail());
        huesped.setTelefono(datosActualizados.getTelefono());
        huesped.setDni(datosActualizados.getDni());
        huesped.setFechaNacimiento(datosActualizados.getFechaNacimiento());
        repository.save(huesped);
        return huesped;
    }

    public void borrarHuesped(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Huésped no encontrado");
        }
        repository.deleteById(id);
    }

    public Huesped agregarTarjetaCredito(Long huespedId, TarjetaCredito nuevaTarjeta) {
        Huesped huesped = repository.findById(huespedId)
                .orElseThrow(() -> new IllegalArgumentException("Huésped no encontrado"));
        nuevaTarjeta.setHuesped(huesped);

        if (Boolean.TRUE.equals(nuevaTarjeta.getEsPrincipal())) {
            for (TarjetaCredito tarjeta : huesped.getTarjetaCredito()) {
                tarjeta.setEsPrincipal(false);
            }
        }
        huesped.getTarjetaCredito().add(nuevaTarjeta);
        repository.save(huesped);
        return huesped;
    }

    public void eliminarTarjetaCredito(Long huespedId, Integer tarjetaId) {
        Huesped huesped = repository.findById(huespedId)
                .orElseThrow(() -> new IllegalArgumentException("Huésped no encontrado"));
        TarjetaCredito tarjeta = huesped.getTarjetaCredito()
                .stream()
                .filter(t -> t.getId().equals(tarjetaId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tarjeta no encontrada"));

        if (Boolean.TRUE.equals(tarjeta.getEsPrincipal())) {
            throw new IllegalStateException("No se puede eliminar la tarjeta principal");
        }
        huesped.getTarjetaCredito().remove(tarjeta);
        repository.save(huesped);
    }

    public void cambiarTarjetaPrincipal(Long huespedId, Integer tarjetaId) {
        Huesped huesped = repository.findById(huespedId)
                .orElseThrow(() -> new IllegalArgumentException("Huésped no encontrado"));

        TarjetaCredito tarjetaPrincipal = huesped.getTarjetaCredito()
                .stream()
                .filter(t -> t.getId().equals(tarjetaId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Tarjeta no encontrada"));

        for (TarjetaCredito tarjeta : huesped.getTarjetaCredito()) {
            tarjeta.setEsPrincipal(tarjeta.getId().equals(tarjetaId));
        }
        repository.save(huesped);
    }
}