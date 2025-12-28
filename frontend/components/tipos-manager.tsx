"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Tag } from "lucide-react"
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

interface TipoHabitacion {
  id?: number
  nombre: string
  descripcion?: string
}

export function TiposManager() {
  const { toast } = useToast()
  const [tipos, setTipos] = useState<TipoHabitacion[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoHabitacion | null>(null)
  const [formData, setFormData] = useState<TipoHabitacion>({ nombre: "", descripcion: "" })

  useEffect(() => {
    fetchTipos()
  }, [])

  const fetchTipos = async () => {
    try {
      const response = await fetch(getGestionUrl(API_ENDPOINTS.GESTION.TIPOS_HABITACION))
      if (!response.ok) throw new Error("Error en la respuesta")
      const data = await response.json()
      setTipos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching tipos:", error)
      setTipos([])
      toast({ title: "Error", description: "No se pudieron cargar los tipos", variant: "destructive" })
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const url = editingTipo
        ? getGestionUrl(`${API_ENDPOINTS.GESTION.TIPOS_HABITACION}/${editingTipo.id}`)
        : getGestionUrl(API_ENDPOINTS.GESTION.TIPOS_HABITACION)

      const response = await fetch(url, {
        method: editingTipo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al guardar")

      toast({ title: "Éxito", description: `Tipo ${editingTipo ? "actualizado" : "creado"} correctamente` })
      setDialogOpen(false)
      resetForm()
      fetchTipos()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo guardar el tipo", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este tipo?")) return

    try {
      await fetch(getGestionUrl(`${API_ENDPOINTS.GESTION.TIPOS_HABITACION}/${id}`), { method: "DELETE" })
      toast({ title: "Tipo eliminado correctamente" })
      fetchTipos()
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el tipo", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({ nombre: "", descripcion: "" })
    setEditingTipo(null)
  }

  const openEditDialog = (tipo: TipoHabitacion) => {
    setEditingTipo(tipo)
    setFormData(tipo)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tipos de Habitación</h2>
          <p className="text-muted-foreground">Define los tipos de habitaciones disponibles</p>
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
              Nuevo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTipo ? "Editar" : "Nuevo"} Tipo de Habitación</DialogTitle>
              <DialogDescription>Completa los datos del tipo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Suite, Standard, Deluxe"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tipos.map((tipo) => (
          <Card key={tipo.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="h-4 w-4" />
                {tipo.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tipo.descripcion && <p className="text-sm text-muted-foreground">{tipo.descripcion}</p>}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(tipo)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => tipo.id && handleDelete(tipo.id)}>
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
