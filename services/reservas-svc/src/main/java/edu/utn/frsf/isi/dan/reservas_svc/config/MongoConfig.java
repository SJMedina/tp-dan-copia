package edu.utn.frsf.isi.dan.reservas_svc.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.index.GeospatialIndex;

import jakarta.annotation.PostConstruct;

/**
 * Configuración de MongoDB para crear índices geoespaciales.
 * Esta clase asegura que el índice 2dsphere esté creado en la colección de habitaciones
 * para permitir búsquedas geoespaciales eficientes basadas en la ubicación del hotel.
 */
@Configuration
public class MongoConfig {

    @Autowired
    private MongoTemplate mongoTemplate;

    @PostConstruct
    public void initIndexes() {
        mongoTemplate.indexOps("habitacion")
                .createIndex(
                        new GeospatialIndex("hotel.ubicacion")
                                .typed(GeoSpatialIndexType.GEO_2DSPHERE)
                );
    }
}
