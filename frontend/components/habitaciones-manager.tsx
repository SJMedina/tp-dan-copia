"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Bed } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getGestionUrl, API_ENDPOINTS } from "@/lib/api-config"

interface TipoHabitacion {
  id: number
  nombre: string
  descripcion: string
  capacidad: number
}

interface Hotel {
  id: number
  nombre: string
  categoria?: number
}

interface Habitacion {
  id?: number
  numero: number
  piso: number
  tipoHabitacion?: TipoHabitacion
  hotel?: Hotel
}

interface Tarifa {
  id: number
  fechaInicio: string
  fechaFin: string
  tipoHabitacion: TipoHabitacion
  precioNoche: number
}

export function HabitacionesManager() {
  const { toast } = useToast()
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([])
  const [hoteles, setHoteles] = useState<Hotel[]>([])
  const [tiposHabitacion, setTiposHabitacion] = useState<TipoHabitacion[]>([])
  const [tarifas, setTarifas] = useState<Tarifa[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabitacion, setEditingHabitacion] = useState<Habitacion | null>(null)
  const [formData, setFormData] = useState({
    numero: "",
    piso: "",
    hotelId: "",
    tipoHabitacionId: "",
  })

  useEffect(() => {
    fetchHabitaciones()
    fetchHoteles()
    fetchTiposHabitacion()
    fetchTarifas()
  }, [])

  const fetchTarifas = async () => {
    try {
      const response = await fetch(getGestionUrl(API_ENDPOINTS.GESTION.TARIFAS))
      if (!response.ok) throw new Error("Error")
      const data = await response.json()
      setTarifas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching tarifas:", error)
      setTarifas([])
    }
  }

  const getPrecioHabitacion = (tipoHabitacionId?: number): number | null => {
    if (!tipoHabitacionId) return null
    const today = new Date().toISOString().split('T')[0]
    const tarifa = tarifas.find(t =>
      t.tipoHabitacion?.id === tipoHabitacionId &&
      t.fechaInicio <= today &&
      t.fechaFin >= today
    )
    return tarifa?.precioNoche || null
  }

  const fetchHabitaciones = async () => {
    try {
      const response = await fetch(getGestionUrl(API_ENDPOINTS.GESTION.HABITACIONES))
      if (!response.ok) throw new Error("Error en la respuesta")
      const data = await response.json()
      setHabitaciones(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching habitaciones:", error)
      setHabitaciones([])
      toast({ title: "Error", description: "No se pudieron cargar las habitaciones", variant: "destructive" })
    }
  }

  const fetchHoteles = async () => {
    try {
      const response = await fetch(getGestionUrl(API_ENDPOINTS.GESTION.HOTELES))
      if (!response.ok) throw new Error("Error en la respuesta")
      const data = await response.json()
      setHoteles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching hoteles:", error)
      setHoteles([])
    }
  }

  const fetchTiposHabitacion = async () => {
    try {
      const response = await fetch(getGestionUrl(API_ENDPOINTS.GESTION.TIPOS_HABITACION))
      if (!response.ok) throw new Error("Error en la respuesta")
      const data = await response.json()
      setTiposHabitacion(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching tipos:", error)
      setTiposHabitacion([])
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        numero: Number.parseInt(formData.numero),
        piso: Number.parseInt(formData.piso),
        hotel: formData.hotelId ? { id: Number.parseInt(formData.hotelId) } : null,
        tipoHabitacion: formData.tipoHabitacionId ? { id: Number.parseInt(formData.tipoHabitacionId) } : null,
      }

      const url = editingHabitacion
        ? getGestionUrl(`${API_ENDPOINTS.GESTION.HABITACIONES}/${editingHabitacion.id}`)
        : getGestionUrl(API_ENDPOINTS.GESTION.HABITACIONES)

      const response = await fetch(url, {
        method: editingHabitacion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Error al guardar")

      toast({ title: "Éxito", description: `Habitación ${editingHabitacion ? "actualizada" : "creada"} correctamente` })
      setDialogOpen(false)
      resetForm()
      fetchHabitaciones()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la habitación", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta habitación?")) return

    try {
      await fetch(getGestionUrl(`${API_ENDPOINTS.GESTION.HABITACIONES}/${id}`), { method: "DELETE" })
      toast({ title: "Habitación eliminada correctamente" })
      fetchHabitaciones()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la habitación", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({
      numero: "",
      piso: "",
      hotelId: "",
      tipoHabitacionId: "",
    })
    setEditingHabitacion(null)
  }

  const openEditDialog = (habitacion: Habitacion) => {
    setEditingHabitacion(habitacion)
    setFormData({
      numero: habitacion.numero.toString(),
      piso: habitacion.piso.toString(),
      hotelId: habitacion.hotel?.id?.toString() || "",
      tipoHabitacionId: habitacion.tipoHabitacion?.id?.toString() || "",
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Habitaciones</h2>
          <p className="text-muted-foreground">Administra las habitaciones de los hoteles</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Habitación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingHabitacion ? "Editar" : "Nueva"} Habitación</DialogTitle>
              <DialogDescription>Completa los datos de la habitación</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número *</Label>
                  <Input
                    type="number"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Piso *</Label>
                  <Input
                    type="number"
                    value={formData.piso}
                    onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hotel *</Label>
                <Select
                  value={formData.hotelId}
                  onValueChange={(value) => setFormData({ ...formData, hotelId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hoteles.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id.toString()}>
                        {hotel.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Habitación *</Label>
                <Select
                  value={formData.tipoHabitacionId}
                  onValueChange={(value) => setFormData({ ...formData, tipoHabitacionId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposHabitacion.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id.toString()}>
                        {tipo.nombre} - Cap: {tipo.capacidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habitaciones.map((habitacion) => {
          const precio = getPrecioHabitacion(habitacion.tipoHabitacion?.id)
          return (
            <Card key={habitacion.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bed className="h-5 w-5" />
                  Habitación {habitacion.numero}
                </CardTitle>
                <CardDescription>{habitacion.hotel?.nombre || "Sin hotel asignado"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">Piso: {habitacion.piso}</p>
                {habitacion.tipoHabitacion && (
                  <>
                    <p className="text-sm font-medium">{habitacion.tipoHabitacion.nombre}</p>
                    <p className="text-sm text-muted-foreground">{habitacion.tipoHabitacion.descripcion}</p>
                    <p className="text-sm">Capacidad: {habitacion.tipoHabitacion.capacidad} personas</p>
                  </>
                )}
                {precio !== null ? (
                  <p className="text-lg font-bold text-green-600">${precio.toLocaleString()}/noche</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Sin tarifa vigente</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(habitacion)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => habitacion.id && handleDelete(habitacion.id)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
