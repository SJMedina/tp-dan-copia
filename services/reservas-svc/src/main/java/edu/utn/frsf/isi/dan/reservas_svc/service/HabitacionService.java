package edu.utn.frsf.isi.dan.reservas_svc.service;

import edu.utn.frsf.isi.dan.reservas_svc.dto.HabitacionSearchCriteria;
import edu.utn.frsf.isi.dan.reservas_svc.model.EstadoReserva;
import edu.utn.frsf.isi.dan.reservas_svc.model.Habitacion;
import edu.utn.frsf.isi.dan.reservas_svc.model.Hotel;
import edu.utn.frsf.isi.dan.reservas_svc.repository.HabitacionRepository;
import edu.utn.frsf.isi.dan.shared.HabitacionDTO;
import edu.utn.frsf.isi.dan.shared.HabitacionEvent;
import edu.utn.frsf.isi.dan.shared.HotelDTO;
import edu.utn.frsf.isi.dan.shared.TarifaDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HabitacionService {
    @Autowired
    private HabitacionRepository habitacionRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Habitacion> findAll() {
        return habitacionRepository.findAll();
    }

    public Optional<Habitacion> findById(String id) {
        return habitacionRepository.findById(id);
    }

    public Habitacion save(Habitacion habitacion) {
        return habitacionRepository.save(habitacion);
    }

    public void deleteById(String id) {
        habitacionRepository.deleteById(id);
    }

    
    public void handleEvent(HabitacionEvent event) {
        switch (event.getTipoEvento()) {
            case CREAR:
                save(mapFromHabitacion(event.getHabitacion()));
                break;
            case ACTUALIZAR_DATOS:
                updateByHabitacionId(event.getHabitacion().getHabitacionId(),mapFromHabitacion(event.getHabitacion()));
                break;
            case ACTUALIZAR_PRECIO:
                updatePreciosByTipoHabitacion(event.getTarifa());
                break;
            case ELIMINAR:
                deleteByHabitacionId(event.getHabitacion().getHabitacionId());
                break;
            default:
                throw new IllegalArgumentException("Tipo de evento desconocido: " + event.getTipoEvento());
        }
    }

    public Habitacion mapFromHabitacion(HabitacionDTO dto) {
        return Habitacion.builder()
                .habitacionId(dto.getHabitacionId())
                .idTipoHabitacion(dto.getTipoHabitacionId())
                .tipoHabitacion(dto.getTipoHabitacion())
                .precioNoche(dto.getPrecioNoche())
                .capacidad(dto.getCapacidad())
                .amenities(dto.getAmenities())
                .hotel(mapFromDto(dto.getHotel()))
                .build();
    }

    public Hotel mapFromDto(HotelDTO dto){
        if(dto == null) {
            return null;
        }
        return Hotel.builder()
                .id(dto.getId())
                .nombre(dto.getNombre())
                .domicilio(dto.getDomicilio())
                .categoria(dto.getCategoria())
                .ubicacion(new GeoJsonPoint(dto.getLatitud(), dto.getLongitud()))
                .build();
    }

    public Optional<Habitacion> findByHabitacionId(Long habitacionId) {
        Query query = new Query(Criteria.where("habitacionId").is(habitacionId));
        Habitacion habitacion = mongoTemplate.findOne(query, Habitacion.class);
        return Optional.ofNullable(habitacion);
    }

    public Habitacion updateByHabitacionId(Long habitacionId, Habitacion nuevaHabitacion) {
        Query query = new Query(Criteria.where("habitacionId").is(habitacionId));
        Update update = new Update()
                .set("precioNoche", nuevaHabitacion.getPrecioNoche())
                .set("capacidad", nuevaHabitacion.getCapacidad())
                .set("amenities", nuevaHabitacion.getAmenities());
        Habitacion actualizada = mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                Habitacion.class
        );
        if (actualizada == null) {
            throw new IllegalArgumentException("No se encontró la habitación con habitacionId: " + habitacionId);
        }
        return actualizada;
    }

    public void deleteByHabitacionId(Long habitacionId) {
        Query query = new Query(Criteria.where("habitacionId").is(habitacionId));
        mongoTemplate.remove(query, Habitacion.class);
    }

    public List<Habitacion> buscarHabitacionesDisponibles(HabitacionSearchCriteria criteria) {
        Query query = new Query();
        List<Criteria> criteriaList = new ArrayList<>();

        // Filtro por capacidad (cantidad de huéspedes)
        if (criteria.getCantidadHuespedes() != null) {
            criteriaList.add(Criteria.where("capacidad").gte(criteria.getCantidadHuespedes()));
        }

        // Filtro por rango de precio
        if (criteria.getPrecioMinimo() != null || criteria.getPrecioMaximo() != null) {
            Criteria precioCriteria = Criteria.where("precioNoche");
            if (criteria.getPrecioMinimo() != null) {
                precioCriteria = precioCriteria.gte(criteria.getPrecioMinimo());
            }
            if (criteria.getPrecioMaximo() != null) {
                precioCriteria = precioCriteria.lte(criteria.getPrecioMaximo());
            }
            criteriaList.add(precioCriteria);
        }

        // Filtro por categoría del hotel (estrellas)
        if (criteria.getCategoriaMinima() != null || criteria.getCategoriaMaxima() != null) {
            Criteria categoriaCriteria = Criteria.where("hotel.categoria");
            if (criteria.getCategoriaMinima() != null) {
                categoriaCriteria = categoriaCriteria.gte(criteria.getCategoriaMinima());
            }
            if (criteria.getCategoriaMaxima() != null) {
                categoriaCriteria = categoriaCriteria.lte(criteria.getCategoriaMaxima());
            }
            criteriaList.add(categoriaCriteria);
        }

        // Filtro por amenities (comodidades)
        if (criteria.getAmenities() != null && !criteria.getAmenities().isEmpty()) {
            // La habitación debe tener todos los amenities solicitados
            criteriaList.add(Criteria.where("amenities").all(criteria.getAmenities()));
        }

        // Filtro por distancia desde un punto de referencia
        if (criteria.getLatitud() != null &&
            criteria.getLongitud() != null &&
            criteria.getDistanciaMaximaMetros() != null) {

            Point punto = new Point(criteria.getLongitud(), criteria.getLatitud());
            Distance distancia = new Distance(criteria.getDistanciaMaximaMetros() / 1000.0, Metrics.KILOMETERS);

            criteriaList.add(Criteria.where("hotel.ubicacion")
                    .nearSphere(punto)
                    .maxDistance(distancia.getValue()));
        }

        // Filtro por disponibilidad de fechas
        // Excluir habitaciones que tengan reservas confirmadas/reservadas que se solapen con las fechas solicitadas
        if (criteria.getFechaCheckIn() != null && criteria.getFechaCheckOut() != null) {
            Criteria disponibilidadCriteria = new Criteria().orOperator(
                // No tiene reservas
                Criteria.where("reservas").exists(false),
                Criteria.where("reservas").size(0),
                // Todas las reservas que se solapan están canceladas o finalizadas
                // Excluye: CONFIRMADA, EFECTUADA, BLOQUEADA, CERRADA
                Criteria.where("reservas").not().elemMatch(
                    Criteria.where("estadoReserva").in(
                        EstadoReserva.CONFIRMADA,
                        EstadoReserva.EFECTUADA,
                        EstadoReserva.BLOQUEADA,
                        EstadoReserva.CERRADA
                    )
                        .and("checkIn").lt(criteria.getFechaCheckOut())
                        .and("checkOut").gt(criteria.getFechaCheckIn())
                )
            );
            criteriaList.add(disponibilidadCriteria);
        }

        // Combinar todos los criterios con AND
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, Habitacion.class);
    }

    public void updatePreciosByTipoHabitacion(TarifaDTO tarifa) {
        if (tarifa == null || tarifa.getTipoHabitacionId() == null || tarifa.getNuevoPrecio() == null) {
            throw new IllegalArgumentException("Tarifa inválida: debe contener tipoHabitacionId y nuevoPrecio");
        }

        Query query = new Query(Criteria.where("idTipoHabitacion").is(tarifa.getTipoHabitacionId()));

        Update update = new Update().set("precioNoche", tarifa.getNuevoPrecio());

        mongoTemplate.updateMulti(query, update, Habitacion.class);
    }
}
