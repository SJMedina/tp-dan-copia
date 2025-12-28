"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getUserUrl } from "@/lib/api-config"
import { Search, UserPlus, Building, CreditCard, Trash2 } from "lucide-react"

export function UsersManager() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [bancos, setBancos] = useState<any[]>([])

  // Form states
  const [huespedForm, setHuespedForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    fechaNacimiento: "",
    numeroCC: "",
    nombreTitular: "",
    fechaVencimientoCC: "",
    cvcCC: "",
    idBanco: 1,
  })

  const [propietarioForm, setPropietarioForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    idHotel: "",
    numeroCuenta: "",
    cbu: "",
    alias: "",
    idBanco: 1,
  })

  const loadBancos = async () => {
    try {
      const response = await fetch(getUserUrl("/bancos"))
      if (response.ok) {
        const data = await response.json()
        setBancos(data)
      }
    } catch (error) {
      console.error("Error loading bancos:", error)
    }
  }

  const searchByName = async (nombre: string) => {
    try {
      const response = await fetch(getUserUrl(`/users?nombre=${nombre}`))
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.content || [])
      }
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const searchByDni = async (dni: string) => {
    try {
      const response = await fetch(getUserUrl(`/users/dni/${dni}`))
      if (response.ok) {
        const user = await response.json()
        setSearchResults([user])
      } else if (response.status === 404) {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching by DNI:", error)
    }
  }

  const createHuesped = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(getUserUrl("/users/huesped"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...huespedForm,
          esPrincipalCC: true,
        }),
      })
      if (response.ok) {
        alert("Huésped creado exitosamente")
        setHuespedForm({
          nombre: "",
          email: "",
          telefono: "",
          fechaNacimiento: "",
          numeroCC: "",
          nombreTitular: "",
          fechaVencimientoCC: "",
          cvcCC: "",
          idBanco: 1,
        })
      }
    } catch (error) {
      console.error("Error creating huesped:", error)
    }
  }

  const createPropietario = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(getUserUrl("/users/propietario"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: propietarioForm.nombre,
          email: propietarioForm.email,
          telefono: propietarioForm.telefono,
          idHotel: propietarioForm.idHotel ? Number.parseInt(propietarioForm.idHotel) : null,
          cuentaBancaria: {
            numeroCuenta: propietarioForm.numeroCuenta,
            cbu: propietarioForm.cbu,
            alias: propietarioForm.alias,
            idBanco: propietarioForm.idBanco,
          },
        }),
      })
      if (response.ok) {
        alert("Propietario creado exitosamente")
        setPropietarioForm({
          nombre: "",
          email: "",
          telefono: "",
          idHotel: "",
          numeroCuenta: "",
          cbu: "",
          alias: "",
          idBanco: 1,
        })
      }
    } catch (error) {
      console.error("Error creating propietario:", error)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return

    try {
      const response = await fetch(getUserUrl(`/users/huesped/${id}`), {
        method: "DELETE",
      })
      if (response.ok) {
        alert("Usuario eliminado")
        setSearchResults(searchResults.filter((u) => u.id !== id))
        if (selectedUser?.id === id) setSelectedUser(null)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const addCard = async (userId: number, cardData: any) => {
    try {
      const response = await fetch(getUserUrl(`/users/huesped/${userId}/tarjeta`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      })
      if (response.ok) {
        alert("Tarjeta agregada")
        // Reload user details
      }
    } catch (error) {
      console.error("Error adding card:", error)
    }
  }

  const deleteCard = async (userId: number, cardId: number) => {
    try {
      const response = await fetch(getUserUrl(`/users/huesped/${userId}/tarjeta/${cardId}`), {
        method: "DELETE",
      })
      if (response.ok) {
        alert("Tarjeta eliminada")
      }
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Buscar Usuarios</TabsTrigger>
          <TabsTrigger value="create-guest">Crear Huésped</TabsTrigger>
          <TabsTrigger value="create-owner">Crear Propietario</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar Usuarios
              </CardTitle>
              <CardDescription>Buscar por nombre o DNI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Buscar por Nombre</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ingrese nombre"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          searchByName((e.target as HTMLInputElement).value)
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        searchByName(input.value)
                      }}
                    >
                      Buscar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Buscar por DNI Exacto</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ingrese DNI"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          searchByDni((e.target as HTMLInputElement).value)
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        searchByDni(input.value)
                      }}
                    >
                      Buscar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resultados ({searchResults.length})</Label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{user.nombre}</span>
                            {user.discriminator === "Huesped" && <Badge variant="secondary">Huésped</Badge>}
                            {user.discriminator === "Propietario" && <Badge variant="outline">Propietario</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Email: {user.email}</div>
                            <div>Teléfono: {user.telefono}</div>
                            {user.tarjetasCredito && user.tarjetasCredito.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <CreditCard className="h-4 w-4" />
                                {user.tarjetasCredito.length} tarjeta(s)
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                            Ver Detalles
                          </Button>
                          {user.discriminator === "Huesped" && (
                            <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No se encontraron usuarios</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-guest">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Crear Huésped
              </CardTitle>
              <CardDescription>Registrar un nuevo huésped con su tarjeta de crédito</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createHuesped} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo *</Label>
                    <Input
                      required
                      value={huespedForm.nombre}
                      onChange={(e) => setHuespedForm({ ...huespedForm, nombre: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      required
                      type="email"
                      value={huespedForm.email}
                      onChange={(e) => setHuespedForm({ ...huespedForm, email: e.target.value })}
                      placeholder="juan@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono *</Label>
                    <Input
                      required
                      value={huespedForm.telefono}
                      onChange={(e) => setHuespedForm({ ...huespedForm, telefono: e.target.value })}
                      placeholder="+54 9 342-555-1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Nacimiento *</Label>
                    <Input
                      required
                      type="date"
                      value={huespedForm.fechaNacimiento}
                      onChange={(e) => setHuespedForm({ ...huespedForm, fechaNacimiento: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Tarjeta de Crédito Principal
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número de Tarjeta *</Label>
                      <Input
                        required
                        value={huespedForm.numeroCC}
                        onChange={(e) => setHuespedForm({ ...huespedForm, numeroCC: e.target.value })}
                        placeholder="1234567890123456"
                        maxLength={16}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre del Titular *</Label>
                      <Input
                        required
                        value={huespedForm.nombreTitular}
                        onChange={(e) => setHuespedForm({ ...huespedForm, nombreTitular: e.target.value })}
                        placeholder="JUAN PEREZ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vencimiento (MM/AA) *</Label>
                      <Input
                        required
                        value={huespedForm.fechaVencimientoCC}
                        onChange={(e) => setHuespedForm({ ...huespedForm, fechaVencimientoCC: e.target.value })}
                        placeholder="12/25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVC *</Label>
                      <Input
                        required
                        value={huespedForm.cvcCC}
                        onChange={(e) => setHuespedForm({ ...huespedForm, cvcCC: e.target.value })}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Banco *</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        value={huespedForm.idBanco}
                        onChange={(e) => setHuespedForm({ ...huespedForm, idBanco: Number.parseInt(e.target.value) })}
                        onFocus={loadBancos}
                      >
                        <option value={1}>Banco 1</option>
                        {bancos.map((banco) => (
                          <option key={banco.id} value={banco.id}>
                            {banco.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Crear Huésped
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-owner">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Crear Propietario
              </CardTitle>
              <CardDescription>Registrar un nuevo propietario de hotel con cuenta bancaria</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createPropietario} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Completo *</Label>
                    <Input
                      required
                      value={propietarioForm.nombre}
                      onChange={(e) => setPropietarioForm({ ...propietarioForm, nombre: e.target.value })}
                      placeholder="María García"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      required
                      type="email"
                      value={propietarioForm.email}
                      onChange={(e) => setPropietarioForm({ ...propietarioForm, email: e.target.value })}
                      placeholder="maria@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono *</Label>
                    <Input
                      required
                      value={propietarioForm.telefono}
                      onChange={(e) => setPropietarioForm({ ...propietarioForm, telefono: e.target.value })}
                      placeholder="+54 9 342-555-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ID Hotel (opcional)</Label>
                    <Input
                      type="number"
                      value={propietarioForm.idHotel}
                      onChange={(e) => setPropietarioForm({ ...propietarioForm, idHotel: e.target.value })}
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-4">Cuenta Bancaria</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número de Cuenta *</Label>
                      <Input
                        required
                        value={propietarioForm.numeroCuenta}
                        onChange={(e) => setPropietarioForm({ ...propietarioForm, numeroCuenta: e.target.value })}
                        placeholder="123456789"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CBU *</Label>
                      <Input
                        required
                        value={propietarioForm.cbu}
                        onChange={(e) => setPropietarioForm({ ...propietarioForm, cbu: e.target.value })}
                        placeholder="1230001230001230001234"
                        maxLength={22}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Alias *</Label>
                      <Input
                        required
                        value={propietarioForm.alias}
                        onChange={(e) => setPropietarioForm({ ...propietarioForm, alias: e.target.value })}
                        placeholder="marigarcia"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Banco *</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                        value={propietarioForm.idBanco}
                        onChange={(e) =>
                          setPropietarioForm({ ...propietarioForm, idBanco: Number.parseInt(e.target.value) })
                        }
                        onFocus={loadBancos}
                      >
                        <option value={1}>Banco 1</option>
                        {bancos.map((banco) => (
                          <option key={banco.id} value={banco.id}>
                            {banco.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Crear Propietario
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
