"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Building2, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getGestionUrl, API_ENDPOINTS } from "@/lib/api-config"
import { Badge } from "@/components/ui/badge"

interface AmenityHotel {
  id: number
  amenity: string
}

interface Hotel {
  id?: number
  nombre: string
  cuit: string
  domicilio: string
  latitud?: number
  longitud?: number
  telefono?: string
  correoContacto?: string
  categoria: number
  amenities?: AmenityHotel[]
}

export function HotelesManager() {
  const { toast } = useToast()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [formData, setFormData] = useState<Omit<Hotel, 'id' | 'amenities'>>({
    nombre: "",
    cuit: "",
    domicilio: "",
    latitud: undefined,
    longitud: undefined,
    telefono: "",
    correoContacto: "",
    categoria: 3,
  })

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      const response = await fetch(getGestionUrl(API_ENDPOINTS.GESTION.HOTELES))
      if (!response.ok) throw new Error("Error en la respuesta")
      const data = await response.json()
      setHotels(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching hotels:", error)
      setHotels([])
      toast({
        title: "Error",
        description: "No se pudieron cargar los hoteles",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const url = editingHotel
        ? getGestionUrl(`${API_ENDPOINTS.GESTION.HOTELES}/${editingHotel.id}`)
        : getGestionUrl(API_ENDPOINTS.GESTION.HOTELES)

      const response = await fetch(url, {
        method: editingHotel ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al guardar")

      toast({
        title: "Éxito",
        description: `Hotel ${editingHotel ? "actualizado" : "creado"} correctamente`,
      })

      setDialogOpen(false)
      resetForm()
      fetchHotels()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el hotel",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este hotel?")) return

    try {
      await fetch(getGestionUrl(`${API_ENDPOINTS.GESTION.HOTELES}/${id}`), { method: "DELETE" })
      toast({ title: "Hotel eliminado correctamente" })
      fetchHotels()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el hotel",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      cuit: "",
      domicilio: "",
      latitud: undefined,
      longitud: undefined,
      telefono: "",
      correoContacto: "",
      categoria: 3,
    })
    setEditingHotel(null)
  }

  const openEditDialog = (hotel: Hotel) => {
    setEditingHotel(hotel)
    setFormData({
      nombre: hotel.nombre,
      cuit: hotel.cuit,
      domicilio: hotel.domicilio,
      latitud: hotel.latitud,
      longitud: hotel.longitud,
      telefono: hotel.telefono || "",
      correoContacto: hotel.correoContacto || "",
      categoria: hotel.categoria,
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Hoteles</h2>
          <p className="text-muted-foreground">Administra la información de los hoteles</p>
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
              Nuevo Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingHotel ? "Editar" : "Nuevo"} Hotel</DialogTitle>
              <DialogDescription>Completa los datos del hotel</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CUIT *</Label>
                <Input value={formData.cuit} onChange={(e) => setFormData({ ...formData, cuit: e.target.value })} placeholder="XX-XXXXXXXX-X" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Domicilio *</Label>
                <Input
                  value={formData.domicilio}
                  onChange={(e) => setFormData({ ...formData, domicilio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Latitud</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.latitud || ""}
                  onChange={(e) => setFormData({ ...formData, latitud: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>Longitud</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={formData.longitud || ""}
                  onChange={(e) => setFormData({ ...formData, longitud: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría (Estrellas) *</Label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Email de Contacto</Label>
                <Input
                  type="email"
                  value={formData.correoContacto}
                  onChange={(e) => setFormData({ ...formData, correoContacto: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.map((hotel) => (
          <Card key={hotel.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {hotel.nombre}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                {Array.from({ length: hotel.categoria }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{hotel.domicilio}</p>
              {hotel.cuit && <p className="text-sm text-muted-foreground">CUIT: {hotel.cuit}</p>}
              {hotel.telefono && <p className="text-sm">Tel: {hotel.telefono}</p>}
              {hotel.correoContacto && <p className="text-sm">{hotel.correoContacto}</p>}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {hotel.amenities.map((a) => (
                    <Badge key={a.id} variant="outline" className="text-xs">
                      {a.amenity.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(hotel)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => hotel.id && handleDelete(hotel.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
