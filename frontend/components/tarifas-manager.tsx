"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, DollarSign } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TipoHabitacion {
  id: number
  nombre: string
  descripcion: string
  capacidad: number
}

interface Tarifa {
  id?: number
  fechaInicio: string
  fechaFin: string
  tipoHabitacion: TipoHabitacion
  precioNoche: number
}

export function TarifasManager() {
  const { toast } = useToast()
  const [tarifas, setTarifas] = useState<Tarifa[]>([])
  const [tiposHabitacion, setTiposHabitacion] = useState<TipoHabitacion[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTarifa, setEditingTarifa] = useState<Tarifa | null>(null)
  const [formData, setFormData] = useState<{
    fechaInicio: string
    fechaFin: string
    tipoHabitacionId: number | null
    precioNoche: number
  }>({
    fechaInicio: "",
    fechaFin: "",
    tipoHabitacionId: null,
    precioNoche: 0,
  })

  useEffect(() => {
    fetchTarifas()
    fetchTiposHabitacion()
  }, [])

  const fetchTiposHabitacion = async () => {
    try {
      const response = await fetch(getGestionUrl(API_ENDPOINTS.GESTION.TIPOS_HABITACION))
      if (!response.ok) throw new Error("Error")
      const data = await response.json()
      setTiposHabitacion(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching tipos:", error)
    }
  }

  const fetchTarifas = async () => {
    try {
      const response = await fetch(getGestionUrl(API_ENDPOINTS.GESTION.TARIFAS))
      if (!response.ok) throw new Error("Error en la respuesta")
      const data = await response.json()
      setTarifas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching tarifas:", error)
      setTarifas([])
      toast({ title: "Error", description: "No se pudieron cargar las tarifas", variant: "destructive" })
    }
  }

  const handleSubmit = async () => {
    if (!formData.tipoHabitacionId) {
      toast({ title: "Error", description: "Selecciona un tipo de habitación", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const url = editingTarifa
        ? getGestionUrl(`${API_ENDPOINTS.GESTION.TARIFAS}/${editingTarifa.id}`)
        : getGestionUrl(API_ENDPOINTS.GESTION.TARIFAS)

      const body = {
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        tipoHabitacion: { id: formData.tipoHabitacionId },
        precioNoche: formData.precioNoche,
      }

      const response = await fetch(url, {
        method: editingTarifa ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error("Error al guardar")

      toast({ title: "Éxito", description: `Tarifa ${editingTarifa ? "actualizada" : "creada"} correctamente` })
      setDialogOpen(false)
      resetForm()
      fetchTarifas()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar la tarifa", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta tarifa?")) return

    try {
      await fetch(getGestionUrl(`${API_ENDPOINTS.GESTION.TARIFAS}/${id}`), { method: "DELETE" })
      toast({ title: "Tarifa eliminada correctamente" })
      fetchTarifas()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la tarifa", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({ fechaInicio: "", fechaFin: "", tipoHabitacionId: null, precioNoche: 0 })
    setEditingTarifa(null)
  }

  const openEditDialog = (tarifa: Tarifa) => {
    setEditingTarifa(tarifa)
    setFormData({
      fechaInicio: tarifa.fechaInicio,
      fechaFin: tarifa.fechaFin,
      tipoHabitacionId: tarifa.tipoHabitacion?.id || null,
      precioNoche: tarifa.precioNoche,
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Tarifas</h2>
          <p className="text-muted-foreground">Administra las tarifas y precios especiales</p>
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
              Nueva Tarifa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTarifa ? "Editar" : "Nueva"} Tarifa</DialogTitle>
              <DialogDescription>Completa los datos de la tarifa</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Habitación *</Label>
                <Select
                  value={formData.tipoHabitacionId?.toString() || ""}
                  onValueChange={(value) => setFormData({ ...formData, tipoHabitacionId: parseInt(value) })}
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
              <div className="space-y-2">
                <Label>Precio por Noche *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.precioNoche}
                  onChange={(e) => setFormData({ ...formData, precioNoche: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Inicio *</Label>
                  <Input
                    type="date"
                    value={formData.fechaInicio}
                    onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha Fin *</Label>
                  <Input
                    type="date"
                    value={formData.fechaFin}
                    onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tarifas.map((tarifa) => (
          <Card key={tarifa.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {tarifa.tipoHabitacion?.nombre || "Sin tipo"}
              </CardTitle>
              <CardDescription className="text-xl font-bold">${tarifa.precioNoche.toLocaleString()}/noche</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {tarifa.tipoHabitacion?.descripcion && (
                <p className="text-sm text-muted-foreground">{tarifa.tipoHabitacion.descripcion}</p>
              )}
              {tarifa.tipoHabitacion?.capacidad && (
                <p className="text-sm">Capacidad: {tarifa.tipoHabitacion.capacidad} personas</p>
              )}
              <p className="text-sm">
                Vigencia: {new Date(tarifa.fechaInicio).toLocaleDateString()} -{" "}
                {new Date(tarifa.fechaFin).toLocaleDateString()}
              </p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(tarifa)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => tarifa.id && handleDelete(tarifa.id)}>
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
