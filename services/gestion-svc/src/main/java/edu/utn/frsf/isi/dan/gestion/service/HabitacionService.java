package edu.utn.frsf.isi.dan.gestion.service;

import edu.utn.frsf.isi.dan.gestion.dao.HabitacionRepository;
import edu.utn.frsf.isi.dan.gestion.dao.HotelRepository;
import edu.utn.frsf.isi.dan.gestion.dao.TarifaRepository;
import edu.utn.frsf.isi.dan.gestion.dao.TipoHabitacionRepository;
import edu.utn.frsf.isi.dan.gestion.model.Habitacion;
import edu.utn.frsf.isi.dan.gestion.model.Hotel;
import edu.utn.frsf.isi.dan.gestion.model.Tarifa;
import edu.utn.frsf.isi.dan.gestion.model.TipoHabitacion;
import edu.utn.frsf.isi.dan.shared.HabitacionDTO;
import edu.utn.frsf.isi.dan.shared.HabitacionEvent;
import edu.utn.frsf.isi.dan.shared.HotelDTO;
import edu.utn.frsf.isi.dan.shared.TipoEvento;
import lombok.extern.log4j.Log4j2;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Log4j2
public class HabitacionService {

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Autowired
    private TarifaRepository tarifaRepository;

    @Autowired
    private TipoHabitacionRepository tipoHabitacionRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${rabbitmq.exchange:dan.exchange}")
    private String exchange;
    @Value("${rabbitmq.routingkey:dan.habitacion.event}")
    private String routingKey;

    public Habitacion save(Habitacion habitacion) {
        log.info("Guardando Habitacion: {}", habitacion);

        if (habitacion.getTipoHabitacion() == null || habitacion.getTipoHabitacion().getId() == null) {
            throw new RuntimeException("TipoHabitacion es requerido");
        }
        TipoHabitacion tipoHabitacion = tipoHabitacionRepository.findById(habitacion.getTipoHabitacion().getId())
                .orElseThrow(() -> new RuntimeException("TipoHabitacion no encontrado con ID: " + habitacion.getTipoHabitacion().getId()));
        habitacion.setTipoHabitacion(tipoHabitacion);

        if (habitacion.getHotel() != null && habitacion.getHotel().getId() != null) {
            Hotel hotel = hotelRepository.findById(habitacion.getHotel().getId())
                    .orElseThrow(() -> new RuntimeException("Hotel no encontrado con ID: " + habitacion.getHotel().getId()));
            habitacion.setHotel(hotel);
        } else {
            habitacion.setHotel(null);
        }

        try {
            boolean isNew = Objects.isNull(habitacion.getId());
            Habitacion newHabitacion = habitacionRepository.save(habitacion);
            enviarHabitacionJms(newHabitacion, isNew);
            return newHabitacion;
        } catch (Exception e) {
            log.error("Error guardando Habitacion", e);
            throw new RuntimeException("Error guardando Habitacion: " + e.getMessage(), e);
        }
    }

    public void deleteById(Integer id) {
        enviarHabitacionJms(id);
        habitacionRepository.deleteById(id);
    }

    public Optional<Habitacion> findById(Integer id) {
        return habitacionRepository.findById(id);
    }

    public List<Habitacion> findAll() {
        return habitacionRepository.findAll();
    }

    public void enviarHabitacionJms(Habitacion habitacion, boolean isNew) {
        try {
            TipoHabitacion tipoHabitacion = tipoHabitacionRepository.findById(habitacion.getTipoHabitacion().getId())
                    .orElseThrow(() -> new RuntimeException("TipoHabitacion no encontrado"));

            Hotel hotel = null;
            if (habitacion.getHotel() != null && habitacion.getHotel().getId() != null) {
                hotel = hotelRepository.findById(habitacion.getHotel().getId()).orElse(null);
            }

            Double precio = 0.0;
            Optional<Tarifa> tarifaOpt = tarifaRepository.findAll().stream()
                    .filter(t -> t.getTipoHabitacion().getId().equals(tipoHabitacion.getId()))
                    .filter(t -> (t.getFechaInicio() == null || !t.getFechaInicio().isAfter(LocalDate.now())) &&
                            (t.getFechaFin() == null || !t.getFechaFin().isBefore(LocalDate.now())))
                    .findFirst();

            if (tarifaOpt.isPresent()) {
                precio = tarifaOpt.get().getPrecioNoche();
            }

            HotelDTO hotelDto = null;
            List<String> amenities = new ArrayList<>();
            if (hotel != null) {
                hotelDto = HotelDTO.builder()
                        .id(hotel.getId())
                        .nombre(hotel.getNombre())
                        .cuit(hotel.getCuit())
                        .domicilio(hotel.getDomicilio())
                        .latitud(hotel.getLatitud())
                        .longitud(hotel.getLongitud())
                        .telefono(hotel.getTelefono())
                        .correoContacto(hotel.getCorreoContacto())
                        .categoria(hotel.getCategoria())
                        .build();

                if (hotel.getAmenities() != null) {
                    amenities = hotel.getAmenities().stream()
                            .map(a -> a.getAmenity().name())
                            .collect(Collectors.toList());
                }
            }

            HabitacionDTO dto = HabitacionDTO.builder()
                    .habitacionId(habitacion.getId().longValue())
                    .numero(habitacion.getNumero())
                    .tipoHabitacionId(tipoHabitacion.getId())
                    .tipoHabitacion(tipoHabitacion.getNombre())
                    .tipoHabitacionDescripcion(tipoHabitacion.getDescripcion())
                    .capacidad(tipoHabitacion.getCapacidad())
                    .precioNoche(precio)
                    .amenities(amenities)
                    .hotel(hotelDto)
                    .build();

            HabitacionEvent msgEvent = HabitacionEvent.builder()
                    .tipoEvento(isNew ? TipoEvento.CREAR : TipoEvento.ACTUALIZAR_DATOS)
                    .habitacion(dto)
                    .build();

            String msgToSend = objectMapper.writeValueAsString(msgEvent);
            log.debug("[RabbitMQ] Enviando mensaje: {}", msgToSend);
            rabbitTemplate.convertAndSend(exchange, routingKey, msgToSend);

        } catch (Exception e) {
            log.error("Error enviando mensaje RabbitMQ para Habitacion ID: " + habitacion.getId(), e);
        }
    }

    public void enviarHabitacionJms(Integer id) {
        HabitacionDTO dto = HabitacionDTO.builder()
                .habitacionId(id.longValue()).build();
        HabitacionEvent msgEvent = HabitacionEvent.builder()
                .tipoEvento(TipoEvento.ELIMINAR)
                .habitacion(dto)
                .build();
        try {
            String msgToSend = objectMapper.writeValueAsString(msgEvent);
            log.debug("[RabbitMQ] Enviando mensaje: {}", msgToSend);
            rabbitTemplate.convertAndSend(exchange, routingKey, msgToSend);
        } catch (Exception e) {
            log.error("Error enviando mensaje RabbitMQ para eliminacion de Habitacion ID: " + id, e);
        }
    }
}
