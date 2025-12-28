import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchInterface } from "@/components/search-interface"
import { ReservasManager } from "@/components/reservas-manager"
import { HotelesManager } from "@/components/hoteles-manager"
import { HabitacionesManager } from "@/components/habitaciones-manager"
import { TiposManager } from "@/components/tipos-manager"
import { TarifasManager } from "@/components/tarifas-manager"
import { UsersManager } from "@/components/users-manager"
import { BancosManager } from "@/components/bancos-manager"
import { Building2, Users, CalendarCheck } from "lucide-react"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card">
                <div className="container mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-foreground">Sistema de Gestión Hotelera</h1>
                    <p className="text-muted-foreground mt-1">Arquitectura de Microservicios - 3 Servicios Independientes</p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Tabs defaultValue="user" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8 h-auto">
                        <TabsTrigger value="user" className="flex flex-col items-center gap-2 py-4">
                            <Users className="h-5 w-5" />
                            <div className="text-center">
                                <div className="font-semibold">User Service</div>
                                <div className="text-xs text-muted-foreground">Usuarios y Bancos</div>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="gestion" className="flex flex-col items-center gap-2 py-4">
                            <Building2 className="h-5 w-5" />
                            <div className="text-center">
                                <div className="font-semibold">Gestión Service</div>
                                <div className="text-xs text-muted-foreground">Hoteles y Habitaciones</div>
                            </div>
                        </TabsTrigger>
                        <TabsTrigger value="reservas" className="flex flex-col items-center gap-2 py-4">
                            <CalendarCheck className="h-5 w-5" />
                            <div className="text-center">
                                <div className="font-semibold">Reservas Service</div>
                                <div className="text-xs text-muted-foreground">Búsqueda y Reservas</div>
                            </div>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="user" className="space-y-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-2">User Service - Puerto 8081</h2>
                            <p className="text-sm text-muted-foreground">Gestión de usuarios (huéspedes y propietarios) y bancos</p>
                        </div>

                        <Tabs defaultValue="users" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="users">Usuarios</TabsTrigger>
                                <TabsTrigger value="bancos">Bancos</TabsTrigger>
                            </TabsList>

                            <TabsContent value="users">
                                <UsersManager />
                            </TabsContent>

                            <TabsContent value="bancos">
                                <BancosManager />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="gestion" className="space-y-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-2">Gestión Service - Puerto 8083</h2>
                            <p className="text-sm text-muted-foreground">
                                Gestión de hoteles, tipos de habitación, habitaciones y tarifas
                            </p>
                        </div>

                        <Tabs defaultValue="hoteles" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="hoteles">Hoteles</TabsTrigger>
                                <TabsTrigger value="habitaciones">Habitaciones</TabsTrigger>
                                <TabsTrigger value="tipos">Tipos</TabsTrigger>
                                <TabsTrigger value="tarifas">Tarifas</TabsTrigger>
                            </TabsList>

                            <TabsContent value="hoteles">
                                <HotelesManager />
                            </TabsContent>

                            <TabsContent value="habitaciones">
                                <HabitacionesManager />
                            </TabsContent>

                            <TabsContent value="tipos">
                                <TiposManager />
                            </TabsContent>

                            <TabsContent value="tarifas">
                                <TarifasManager />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>

                    <TabsContent value="reservas" className="space-y-4">
                        <div className="bg-card border border-border rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-2">Reservas Service - Puerto 8082</h2>
                            <p className="text-sm text-muted-foreground">
                                Búsqueda avanzada de habitaciones y gestión del ciclo de vida de reservas
                            </p>
                        </div>

                        <Tabs defaultValue="busqueda" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="busqueda">Búsqueda Avanzada</TabsTrigger>
                                <TabsTrigger value="reservas">Gestión de Reservas</TabsTrigger>
                            </TabsList>

                            <TabsContent value="busqueda">
                                <SearchInterface />
                            </TabsContent>

                            <TabsContent value="reservas">
                                <ReservasManager />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
