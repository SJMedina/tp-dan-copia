"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, XCircle, Star, DollarSign, UserCheck, UserX, Lock, Ban, Plus } from "lucide-react"
import { getReservasUrl, API_ENDPOINTS } from "@/lib/api-config"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface HotelInfo {
  id: number
  nombre: string
  categoria: number
  domicilio: string
}

interface HabitacionDisponible {
  id: string
  habitacionId: number
  capacidad: number
  precioNoche: number
  tipoHabitacion: string
  hotel: HotelInfo | null
}

interface Huesped {
  idUsuario: string
  nombreApellido: string
  email: string
}

interface Pago {
  method: string
  transactionId?: string
  amount: number
  status: string
  fecha: string
}

interface Review {
  rating: number
  comment: string
  createdAt?: string
}

interface Reserva {
  _id?: string
  idHabitacion: string
  hotelId: number
  createdAt?: string
  checkIn: string
  checkOut: string
  precioNoche: number
  precioTotal: number
  status: string
  huesped: Huesped
  pago?: Pago[]
  clientReview?: Review
  hostReview?: Review
  estadoReserva: string
}

export function ReservasManager() {
  const { toast } = useToast()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState<HabitacionDisponible[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null)
  const [formData, setFormData] = useState<{
    idHabitacion: string
    checkIn: string
    checkOut: string
    huesped: {
      idUsuario: string
      nombreApellido: string
      email: string
    }
  }>({
    idHabitacion: "",
    checkIn: "",
    checkOut: "",
    huesped: {
      idUsuario: "",
      nombreApellido: "",
      email: "",
    },
  })
  const [paymentAmount, setPaymentAmount] = useState("")
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")

  useEffect(() => {
    fetchReservas()
    fetchHabitacionesDisponibles()
  }, [])

  const fetchHabitacionesDisponibles = async () => {
    try {
      const response = await fetch(getReservasUrl(API_ENDPOINTS.RESERVAS.HABITACIONES))
      if (!response.ok) throw new Error("Error")
      const data = await response.json()
      setHabitacionesDisponibles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching habitaciones:", error)
      setHabitacionesDisponibles([])
    }
  }

  const getSelectedHabitacion = () => {
    return habitacionesDisponibles.find(h => h.id === formData.idHabitacion)
  }

  const calcularPrecioTotal = () => {
    const habitacion = getSelectedHabitacion()
    if (!habitacion || !formData.checkIn || !formData.checkOut) return 0

    const checkIn = new Date(formData.checkIn)
    const checkOut = new Date(formData.checkOut)
    const noches = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    return noches > 0 ? noches * habitacion.precioNoche : 0
  }

  const fetchReservas = async () => {
    setLoading(true)
    try {
      const response = await fetch(getReservasUrl(API_ENDPOINTS.RESERVAS.RESERVAS))
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error ${response.status}: ${errorText}`)
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      // Asegurar que siempre sea un array
      setReservas(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching reservas:", error)
      setReservas([]) // Establecer array vacío en caso de error
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar las reservas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    const habitacion = getSelectedHabitacion()
    if (!habitacion) {
      toast({ title: "Error", description: "Selecciona una habitación", variant: "destructive" })
      return
    }

    try {
      const reservaData = {
        idHabitacion: formData.idHabitacion,
        hotelId: habitacion.hotel?.id,
        checkIn: new Date(formData.checkIn).toISOString(),
        checkOut: new Date(formData.checkOut).toISOString(),
        precioNoche: habitacion.precioNoche,
        precioTotal: calcularPrecioTotal(),
        huesped: formData.huesped,
        estadoReserva: "RESERVADA",
      }

      const response = await fetch(getReservasUrl(API_ENDPOINTS.RESERVAS.RESERVAS), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservaData),
      })

      if (!response.ok) throw new Error("Error al crear reserva")

      toast({ title: "Éxito", description: "Reserva creada correctamente" })
      setDialogOpen(false)
      resetForm()
      fetchReservas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la reserva",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      idHabitacion: "",
      checkIn: "",
      checkOut: "",
      huesped: {
        idUsuario: "",
        nombreApellido: "",
        email: "",
      },
    })
  }

  const handlePayment = async () => {
    if (!selectedReserva?._id) return

    try {
      const pago = {
        amount: Number.parseFloat(paymentAmount),
        fecha: new Date().toISOString(),
        method: "TARJETA",
        status: "APPROVED",
      }

      const response = await fetch(getReservasUrl(`${API_ENDPOINTS.RESERVAS.RESERVAS}/${selectedReserva._id}/pago`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pago),
      })

      if (!response.ok) throw new Error("Error al procesar pago")

      toast({ title: "Éxito", description: "Pago registrado correctamente" })
      setPaymentDialogOpen(false)
      setPaymentAmount("")
      fetchReservas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el pago",
        variant: "destructive",
      })
    }
  }

  const handleCheckIn = async (id: string) => {
    try {
      const response = await fetch(getReservasUrl(`${API_ENDPOINTS.RESERVAS.RESERVAS}/${id}/check-in`), {
        method: "POST",
      })

      if (!response.ok) throw new Error("Error al hacer check-in")

      toast({ title: "Éxito", description: "Check-in realizado correctamente" })
      fetchReservas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar el check-in",
        variant: "destructive",
      })
    }
  }

  const handleCheckOut = async (id: string, withReview = false) => {
    try {
      const review = withReview
        ? {
            rating: reviewRating,
            comment: reviewComment,
            createdAt: new Date().toISOString(),
          }
        : null

      const response = await fetch(getReservasUrl(`${API_ENDPOINTS.RESERVAS.RESERVAS}/${id}/check-out`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      })

      if (!response.ok) throw new Error("Error al hacer check-out")

      toast({ title: "Éxito", description: "Check-out realizado correctamente" })
      setReviewDialogOpen(false)
      setReviewComment("")
      setReviewRating(5)
      fetchReservas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo realizar el check-out",
        variant: "destructive",
      })
    }
  }

  const handleAddRating = async () => {
    if (!selectedReserva?._id) return

    try {
      const rating = {
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString(),
      }

      const response = await fetch(getReservasUrl(`${API_ENDPOINTS.RESERVAS.RESERVAS}/${selectedReserva._id}/rating`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rating),
      })

      if (!response.ok) throw new Error("Error al agregar rating")

      toast({ title: "Éxito", description: "Rating agregado correctamente" })
      setReviewDialogOpen(false)
      setReviewComment("")
      setReviewRating(5)
      fetchReservas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el rating",
        variant: "destructive",
      })
    }
  }

  const handleCancel = async (id: string) => {
    try {
      const response = await fetch(getReservasUrl(`${API_ENDPOINTS.RESERVAS.RESERVAS}/${id}/cancelar`), {
        method: "POST",
      })

      if (!response.ok) throw new Error("Error al cancelar reserva")

      toast({ title: "Éxito", description: "Reserva cancelada correctamente" })
      fetchReservas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        variant: "destructive",
      })
    }
  }

  const handleBlock = async () => {
    try {
      const response = await fetch(getReservasUrl(`${API_ENDPOINTS.RESERVAS.RESERVAS}/bloquear`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al bloquear habitación")

      toast({ title: "Éxito", description: "Habitación bloqueada correctamente" })
      setDialogOpen(false)
      resetForm()
      fetchReservas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo bloquear la habitación",
        variant: "destructive",
      })
    }
  }

  const handleClose = async () => {
    try {
      const response = await fetch(getReservasUrl(`${API_ENDPOINTS.RESERVAS.RESERVAS}/cerrar`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al cerrar habitación")

      toast({ title: "Éxito", description: "Habitación cerrada correctamente" })
      setDialogOpen(false)
      resetForm()
      fetchReservas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la habitación",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      REALIZADA: { color: "bg-blue-500", label: "Realizada" },
      CONFIRMADA: { color: "bg-green-500", label: "Confirmada" },
      EFECTUADA: { color: "bg-purple-500", label: "Efectuada" },
      FINALIZADA: { color: "bg-gray-500", label: "Finalizada" },
      ADEUDADA: { color: "bg-orange-500", label: "Adeudada" },
      CANCELADA: { color: "bg-red-500", label: "Cancelada" },
      BLOQUEADA: { color: "bg-yellow-500", label: "Bloqueada" },
      CERRADA: { color: "bg-black", label: "Cerrada" },
    }

    const statusInfo = variants[status] || { color: "bg-gray-500", label: status }
    return <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestión de Reservas</CardTitle>
            <CardDescription>Administra el ciclo de vida completo de las reservas</CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Reserva
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nueva Reserva</DialogTitle>
                  <DialogDescription>Completa los datos para crear una nueva reserva</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Habitación *</Label>
                    <Select
                      value={formData.idHabitacion}
                      onValueChange={(value) => setFormData({ ...formData, idHabitacion: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una habitación" />
                      </SelectTrigger>
                      <SelectContent>
                        {habitacionesDisponibles.filter(h => h.hotel).map((hab) => (
                          <SelectItem key={hab.id} value={hab.id}>
                            #{hab.habitacionId} - {hab.hotel?.nombre} - {hab.tipoHabitacion} - ${hab.precioNoche?.toLocaleString()}/noche
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {getSelectedHabitacion() && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Habitación seleccionada:</p>
                      <p className="text-sm">Hotel: {getSelectedHabitacion()?.hotel?.nombre}</p>
                      <p className="text-sm">Tipo: {getSelectedHabitacion()?.tipoHabitacion}</p>
                      <p className="text-sm">Capacidad: {getSelectedHabitacion()?.capacidad} personas</p>
                      <p className="text-sm font-medium text-green-600">Precio: ${getSelectedHabitacion()?.precioNoche?.toLocaleString()}/noche</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Check-in *</Label>
                      <Input
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out *</Label>
                      <Input
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                      />
                    </div>
                  </div>

                  {formData.checkIn && formData.checkOut && getSelectedHabitacion() && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm font-medium">Resumen de precio:</p>
                      <p className="text-sm">
                        {Math.ceil((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} noches x ${getSelectedHabitacion()?.precioNoche?.toLocaleString()}
                      </p>
                      <p className="text-lg font-bold text-green-600">Total: ${calcularPrecioTotal().toLocaleString()}</p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Datos del Huésped</p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>ID Usuario</Label>
                        <Input
                          value={formData.huesped.idUsuario}
                          onChange={(e) =>
                            setFormData({ ...formData, huesped: { ...formData.huesped, idUsuario: e.target.value } })
                          }
                          placeholder="ID del usuario en el sistema"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nombre y Apellido *</Label>
                        <Input
                          value={formData.huesped.nombreApellido}
                          onChange={(e) =>
                            setFormData({ ...formData, huesped: { ...formData.huesped, nombreApellido: e.target.value } })
                          }
                          placeholder="Nombre completo del huésped"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={formData.huesped.email}
                          onChange={(e) =>
                            setFormData({ ...formData, huesped: { ...formData.huesped, email: e.target.value } })
                          }
                          placeholder="email@ejemplo.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate}>Crear Reserva</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                setDialogOpen(true)
              }}
            >
              <Lock className="h-4 w-4 mr-2" />
              Bloquear Habitación
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                setDialogOpen(true)
              }}
            >
              <Ban className="h-4 w-4 mr-2" />
              Cerrar Habitación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Cargando reservas...</p>
          ) : (
            <div className="space-y-4">
              {reservas.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No hay reservas registradas</p>
              ) : (
                reservas.map((reserva) => (
                  <Card key={reserva._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {reserva.huesped?.nombreApellido || "Sin huésped"} - Habitación {reserva.idHabitacion}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {new Date(reserva.checkIn).toLocaleDateString()} -{" "}
                            {new Date(reserva.checkOut).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {getStatusBadge(reserva.estadoReserva || reserva.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="text-sm font-medium">{reserva.huesped?.email || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Precio/Noche</p>
                          <p className="text-sm font-medium">${reserva.precioNoche?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-sm font-medium text-green-600">${reserva.precioTotal?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Hotel ID</p>
                          <p className="text-sm font-medium">{reserva.hotelId}</p>
                        </div>
                      </div>

                      {reserva.pago && reserva.pago.length > 0 && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Pagos registrados:</p>
                          {reserva.pago.map((pago, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground">
                              ${pago.amount?.toLocaleString()} - {new Date(pago.fecha).toLocaleDateString()} ({pago.method}) - {pago.status}
                            </p>
                          ))}
                        </div>
                      )}

                      {(reserva.clientReview || reserva.hostReview) && (
                        <div className="mb-4 p-3 bg-muted rounded-lg space-y-2">
                          {reserva.clientReview && (
                            <div>
                              <p className="text-sm font-medium">Review del Cliente:</p>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{reserva.clientReview.rating}/5</span>
                                <span className="text-sm text-muted-foreground">- {reserva.clientReview.comment}</span>
                              </div>
                            </div>
                          )}
                          {reserva.hostReview && (
                            <div>
                              <p className="text-sm font-medium">Review del Host:</p>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{reserva.hostReview.rating}/5</span>
                                <span className="text-sm text-muted-foreground">- {reserva.hostReview.comment}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {(reserva.estadoReserva === "RESERVADA" || reserva.status === "REALIZADA") && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedReserva(reserva)
                                setPaymentDialogOpen(true)
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Registrar Pago
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => reserva._id && handleCancel(reserva._id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}

                        {(reserva.estadoReserva === "CONFIRMADA" || reserva.status === "CONFIRMADA") && (
                          <>
                            <Button size="sm" onClick={() => reserva._id && handleCheckIn(reserva._id)}>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Check-in
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => reserva._id && handleCancel(reserva._id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}

                        {(reserva.estadoReserva === "EFECTUADA" || reserva.status === "EFECTUADA") && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedReserva(reserva)
                              setReviewDialogOpen(true)
                            }}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Check-out
                          </Button>
                        )}

                        {(reserva.estadoReserva === "FINALIZADA" || reserva.status === "FINALIZADA") && !reserva.clientReview && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReserva(reserva)
                              setReviewDialogOpen(true)
                            }}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Agregar Rating
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
            <DialogDescription>Ingresa el monto del pago a registrar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input
                type="number"
                placeholder="Ej: 24000"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            {selectedReserva && (
              <p className="text-sm text-muted-foreground">
                Total de la reserva: ${selectedReserva.precioTotal?.toLocaleString() || 0}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handlePayment}>Registrar Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review/Check-out Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedReserva?.estadoReserva === "EFECTUADA" ? "Check-out y Review del Host" : "Agregar Rating del Cliente"}
            </DialogTitle>
            <DialogDescription>
              {selectedReserva?.estadoReserva === "EFECTUADA"
                ? "Opcionalmente puedes agregar una review del comportamiento del huésped"
                : "Agrega tu valoración de la estadía"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                step="0.5"
                value={reviewRating}
                onChange={(e) => setReviewRating(Number.parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Comentario</Label>
              <Textarea
                placeholder="Escribe tu opinión..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            {selectedReserva?.estadoReserva === "EFECTUADA" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => selectedReserva._id && handleCheckOut(selectedReserva._id, false)}
                >
                  Check-out sin Review
                </Button>
                <Button onClick={() => selectedReserva._id && handleCheckOut(selectedReserva._id, true)}>
                  Check-out con Review
                </Button>
              </>
            ) : (
              <Button onClick={handleAddRating}>Agregar Rating</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
