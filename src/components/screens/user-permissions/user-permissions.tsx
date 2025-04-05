import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Tipos de usuario
const userTypes = [
  "Data Engineer",
  "Data Scientist",
  "Data Analyst",
  "Administrador",
  "DQ Expert"
]

// Privilegios de flujo
const flowPrivileges = ["Flujo1", "Flujo2", "Flujo3"]

// Datos mock de usuarios
const initialUsers = [
  { 
    id: 1, 
    name: "Ana García", 
    email: "ana@example.com", 
    userTypes: ["Data Analyst", "Data Scientist"], 
    flowPrivileges: ["Flujo1", "Flujo2"] 
  },
  { 
    id: 2, 
    name: "Carlos Rodríguez", 
    email: "carlos@example.com", 
    userTypes: ["Data Engineer"], 
    flowPrivileges: ["Flujo1", "Flujo2", "Flujo3"] 
  },
  { 
    id: 3, 
    name: "Elena Martínez", 
    email: "elena@example.com", 
    userTypes: ["Administrador", "DQ Expert"], 
    flowPrivileges: ["Flujo1", "Flujo2", "Flujo3"] 
  },
]

export default function UserPermissions() {
  const [users, setUsers] = useState(initialUsers)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingUserTypes, setEditingUserTypes] = useState([])
  const [editingPrivileges, setEditingPrivileges] = useState([])

  const openPermissionsModal = (user) => {
    setSelectedUser(user)
    setEditingUserTypes([...user.userTypes])
    setEditingPrivileges([...user.flowPrivileges])
  }

  const handleUserTypeChange = (type) => {
    setEditingUserTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handlePrivilegeChange = (privilege) => {
    setEditingPrivileges(prev =>
      prev.includes(privilege)
        ? prev.filter(p => p !== privilege)
        : [...prev, privilege]
    )
  }

  const savePermissions = () => {
    setUsers(users.map(user =>
      user.id === selectedUser.id 
        ? { ...user, userTypes: editingUserTypes, flowPrivileges: editingPrivileges } 
        : user
    ))
    setSelectedUser(null)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Administración de Permisos de Usuario</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Tipos de Usuario</TableHead>
            <TableHead>Privilegios de Flujo</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.userTypes.join(", ")}</TableCell>
              <TableCell>{user.flowPrivileges.join(", ")}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => openPermissionsModal(user)}>
                      Editar Permisos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Editar Permisos para {selectedUser?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <h3 className="font-semibold">Tipos de Usuario</h3>
                      {userTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={editingUserTypes.includes(type)}
                            onCheckedChange={() => handleUserTypeChange(type)}
                          />
                          <Label htmlFor={`type-${type}`}>{type}</Label>
                        </div>
                      ))}
                      <h3 className="font-semibold mt-4">Privilegios de Flujo</h3>
                      {flowPrivileges.map((privilege) => (
                        <div key={privilege} className="flex items-center space-x-2">
                          <Checkbox
                            id={`privilege-${privilege}`}
                            checked={editingPrivileges.includes(privilege)}
                            onCheckedChange={() => handlePrivilegeChange(privilege)}
                          />
                          <Label htmlFor={`privilege-${privilege}`}>{privilege}</Label>
                        </div>
                      ))}
                    </div>
                    <Button onClick={savePermissions}>Guardar Permisos</Button>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}