"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, DollarSign, Star, Wifi } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getReservasUrl, API_ENDPOINTS } from "@/lib/api-config"

interface SearchCriteria {
  fechaCheckIn?: string
  fechaCheckOut?: string
  cantidadHuespedes?: number
  precioMinimo?: number
  precioMaximo?: number
  categoriaMinima?: number
  categoriaMaxima?: number
  amenities?: string[]
  latitud?: number
  longitud?: number
  distanciaMaximaMetros?: number
}

interface RoomResult {
  id: string
  habitacionId: number
  capacidad: number
  precioNoche: number
  tipoHabitacion?: string
  idTipoHabitacion?: number
  hotel?: {
    id: number
    nombre: string
    categoria: number
    domicilio: string
    ubicacion?: { x: number; y: number }
  }
  amenities?: string[]
}

export function SearchInterface() {
  const { toast } = useToast()
  const [criteria, setCriteria] = useState<SearchCriteria>({})
  const [results, setResults] = useState<RoomResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const amenitiesList = [
    "WiFi",
    "Aire Acondicionado",
    "Desayuno Incluido",
    "Piscina",
    "Gimnasio",
    "Spa",
    "Restaurant",
    "TV",
  ]

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const searchBody = {
        ...criteria,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      }

      // Remove undefined values
      Object.keys(searchBody).forEach(
        (key) =>
          searchBody[key as keyof SearchCriteria] === undefined && delete searchBody[key as keyof SearchCriteria],
      )

      const response = await fetch(getReservasUrl(API_ENDPOINTS.RESERVAS.HABITACIONES_BUSCAR), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchBody),
      })

      if (!response.ok) throw new Error("Error en la búsqueda")

      const data = await response.json()
      setResults(data)

      toast({
        title: "Búsqueda completada",
        description: `Se encontraron ${data.length} habitaciones disponibles`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la búsqueda",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda Avanzada de Habitaciones
          </CardTitle>
          <CardDescription>Encuentra la habitación perfecta usando múltiples criterios de búsqueda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dates and Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in</Label>
              <Input
                id="checkIn"
                type="datetime-local"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    fechaCheckIn: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out</Label>
              <Input
                id="checkOut"
                type="datetime-local"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    fechaCheckOut: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">Huéspedes</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                placeholder="Ej: 2"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    cantidadHuespedes: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Rango de Precio (por noche)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Precio mínimo"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    precioMinimo: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Precio máximo"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    precioMaximo: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          {/* Hotel Category */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Categoría del Hotel (Estrellas)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                min="1"
                max="5"
                placeholder="Mínimo"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    categoriaMinima: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  }))
                }
              />
              <Input
                type="number"
                min="1"
                max="5"
                placeholder="Máximo"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    categoriaMaxima: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Amenities
            </Label>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((amenity) => (
                <Badge
                  key={amenity}
                  variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleAmenity(amenity)}
                >
                  {amenity}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación Geográfica
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="number"
                step="0.01"
                placeholder="Latitud"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    latitud: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  }))
                }
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Longitud"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    longitud: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  }))
                }
              />
              <Input
                type="number"
                placeholder="Radio (metros)"
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    distanciaMaximaMetros: e.target.value ? Number.parseInt(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full" size="lg">
            {loading ? "Buscando..." : "Buscar Habitaciones"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de Búsqueda</CardTitle>
            <CardDescription>{results.length} habitaciones encontradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((room) => (
                <Card key={room.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{room.hotel?.nombre || "Hotel"}</CardTitle>
                    <CardDescription>
                      {room.hotel?.domicilio && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {room.hotel.domicilio}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Habitación #{room.habitacionId}</span>
                      {room.hotel?.categoria && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: room.hotel.categoria }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Capacidad: {room.capacidad} personas</span>
                      <span className="text-lg font-bold">${room.precioNoche}/noche</span>
                    </div>
                    {room.tipoHabitacion && <Badge variant="secondary">{room.tipoHabitacion}</Badge>}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {room.amenities.map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{amenity}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
