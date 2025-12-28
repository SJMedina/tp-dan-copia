"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getUserUrl } from "@/lib/api-config"
import { Building2, Plus, Pencil, Trash2 } from "lucide-react"

export function BancosManager() {
    const [bancos, setBancos] = useState<any[]>([])
    const [editing, setEditing] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        nombre: "",
        cbu: "",
    })

    useEffect(() => {
        loadBancos()
    }, [])

    const loadBancos = async () => {
        try {
            const response = await fetch(getUserUrl("/bancos"))
            if (!response.ok) {
                console.error(`Error ${response.status}: ${response.statusText}`)
                setBancos([])
                return
            }
            const data = await response.json()
            setBancos(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error loading bancos:", error)
            setBancos([])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editing) {
                // Update existing
                const response = await fetch(getUserUrl(`/bancos/${editing}`), {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                })
                if (response.ok) {
                    alert("Banco actualizado")
                    setEditing(null)
                }
            } else {
                // Create new
                const response = await fetch(getUserUrl("/bancos"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                })
                if (response.ok) {
                    alert("Banco creado")
                }
            }

            setFormData({ nombre: "", cbu: "" })
            loadBancos()
        } catch (error) {
            console.error("Error saving banco:", error)
        }
    }

    const handleEdit = (banco: any) => {
        setEditing(banco.id)
        setFormData({
            nombre: banco.nombre,
            cbu: banco.cbu,
        })
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de eliminar este banco?")) return

        try {
            const response = await fetch(getUserUrl(`/bancos/${id}`), {
                method: "DELETE",
            })
            if (response.ok) {
                alert("Banco eliminado")
                loadBancos()
            }
        } catch (error) {
            console.error("Error deleting banco:", error)
        }
    }

    const handleCancel = () => {
        setEditing(null)
        setFormData({ nombre: "", cbu: "" })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        {editing ? "Editar Banco" : "Crear Banco"}
                    </CardTitle>
                    <CardDescription>
                        {editing ? "Modificar información del banco" : "Registrar un nuevo banco en el sistema"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre del Banco *</Label>
                                <Input
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Banco Nación"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>CBU *</Label>
                                <Input
                                    required
                                    value={formData.cbu}
                                    onChange={(e) => setFormData({ ...formData, cbu: e.target.value })}
                                    placeholder="1230001230001230001234"
                                    maxLength={22}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                                {editing ? "Actualizar Banco" : "Crear Banco"}
                            </Button>
                            {editing && (
                                <Button type="button" variant="outline" onClick={handleCancel}>
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Lista de Bancos ({bancos.length})
                    </CardTitle>
                    <CardDescription>Bancos registrados en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {bancos.map((banco) => (
                            <Card key={banco.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="font-semibold">{banco.nombre}</div>
                                        <div className="text-sm text-muted-foreground">CBU: {banco.cbu}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => handleEdit(banco)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(banco.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {bancos.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">No hay bancos registrados</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
