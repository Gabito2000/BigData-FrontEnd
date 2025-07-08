import { useState, useEffect } from "react"
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
  "Administrator",
  "DQ Expert"
]

// Privilegios de flujo (no longer used, flows are fetched from backend)


// API helpers
import {
  fetchUsers,
  fetchFlows,
  updateUserPermissions,
  addUser,
  type FlowApiType,
} from "@/lib/api";


// Types
type UserType = string;
type FlowPrivilege = string;
type User = {
  id: number | string;
  name?: string; // name is optional, fallback to id if missing
  email: string;
  userTypes: UserType[];
  flowPrivileges: FlowPrivilege[];
  password?: string;
};

export default function UserPermissions() {
  const [users, setUsers] = useState<User[]>([])
  const [flows, setFlows] = useState<FlowPrivilege[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUserTypes, setEditingUserTypes] = useState<UserType[]>([])
  const [editingPrivileges, setEditingPrivileges] = useState<FlowPrivilege[]>([])
  const [editingName, setEditingName] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingPassword, setEditingPassword] = useState('');
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState<{ name: string; email: string; userTypes: UserType[]; flowPrivileges: FlowPrivilege[]; password: string }>({ name: '', email: '', userTypes: [], flowPrivileges: [], password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchUsers(), fetchFlows()])
      .then(([usersData, flowsData]) => {
        setUsers(usersData)
        setFlows(flowsData.map((f: FlowApiType) => typeof f === 'string' ? f : f.id || f.name || ''))
      })
      .catch(() => setError('Error cargando datos'))
      .finally(() => setLoading(false))
  }, [])

  const openPermissionsModal = (user: User) => {
    setSelectedUser(user)
  }

  // Reset editing fields to selected user's values every time dialog opens
  useEffect(() => {
    if (selectedUser) {
      setEditingUserTypes(selectedUser.userTypes ? [...selectedUser.userTypes] : [])
      setEditingPrivileges(selectedUser.flowPrivileges ? [...selectedUser.flowPrivileges] : [])
      setEditingName(selectedUser.name || '')
      setEditingEmail(selectedUser.email || '')
      setEditingPassword('') // No mostramos la contraseña actual
    }
  }, [selectedUser])

  const handleUserTypeChange = (type: UserType) => {
    setEditingUserTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handlePrivilegeChange = (privilege: FlowPrivilege) => {
    setEditingPrivileges(prev =>
      prev.includes(privilege)
        ? prev.filter(p => p !== privilege)
        : [...prev, privilege]
    )
  }

  const savePermissions = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      // Send as JSON, not as form data
      const body = {
        userTypes: editingUserTypes,
        flowPrivileges: editingPrivileges,
        name: editingName,
        email: editingEmail,
        password: editingPassword
      };
      const res = await fetch(`http://localhost:8000/api/users/${selectedUser.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Error guardando permisos');
      setUsers(users.map(user =>
        user.id === selectedUser.id
          ? { ...user, userTypes: editingUserTypes, flowPrivileges: editingPrivileges, name: editingName, email: editingEmail }
          : user
      ));
      setSelectedUser(null);
    } catch {
      setError('Error guardando permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setLoading(true)
    setError('')
    try {
      const added = await addUser(newUser)
      setUsers([...users, added])
      setShowAddUser(false)
      setNewUser({ name: '', email: '', userTypes: [], flowPrivileges: [], password: '' })
    } catch {
      setError('Error agregando usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Administración de Permisos de Usuario</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <Button className="mb-4" onClick={() => setShowAddUser(true)}>Agregar Usuario</Button>
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
              <TableCell>{user.name || user.id}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.userTypes?.join(", ")}</TableCell>
              <TableCell>{user.flowPrivileges?.join(", ")}</TableCell>
              <TableCell>
                <Dialog open={selectedUser?.id === user.id} onOpenChange={open => !open && setSelectedUser(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => openPermissionsModal(user)}>
                      Editar Usuario
                    </Button>
                  </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Editar Usuario</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="edit-name">Nombre</Label>
                        <input
                          id="edit-name"
                          className="border rounded px-2 py-1"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                        />
                        <Label htmlFor="edit-email">Email</Label>
                        <input
                          id="edit-email"
                          className="border rounded px-2 py-1"
                          value={editingEmail}
                          onChange={e => setEditingEmail(e.target.value)}
                        />
                        <Label htmlFor="edit-password">Contraseña (dejar en blanco para no cambiar)</Label>
                        <input
                          id="edit-password"
                          type="password"
                          className="border rounded px-2 py-1"
                          value={editingPassword}
                          onChange={e => setEditingPassword(e.target.value)}
                        />
                        <h3 className="font-semibold mt-4">Tipos de Usuario</h3>
                        {userTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-type-${type}`}
                              checked={editingUserTypes.includes(type)}
                              onCheckedChange={() => handleUserTypeChange(type)}
                            />
                            <Label htmlFor={`edit-type-${type}`}>{type}</Label>
                          </div>
                        ))}
                        <h3 className="font-semibold mt-4">Privilegios de Flujo</h3>
                        {flows.map((privilege) => (
                          <div key={privilege} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-privilege-${privilege}`}
                              checked={editingPrivileges.includes(privilege)}
                              onCheckedChange={() => handlePrivilegeChange(privilege)}
                            />
                            <Label htmlFor={`edit-privilege-${privilege}`}>{privilege}</Label>
                          </div>
                        ))}
                      </div>
                      <Button onClick={savePermissions} disabled={loading}>Guardar Cambios</Button>
                    </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={open => !open && setShowAddUser(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="name">Nombre</Label>
            <input
              id="name"
              className="border rounded px-2 py-1"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            />
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
              className="border rounded px-2 py-1"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            />
            <Label htmlFor="password">Contraseña</Label>
            <input
              id="password"
              type="password"
              className="border rounded px-2 py-1"
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            />
            <h3 className="font-semibold">Tipos de Usuario</h3>
            {userTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`add-type-${type}`}
                  checked={newUser.userTypes.includes(type)}
                  onCheckedChange={() => {
                    setNewUser(nu => ({
                      ...nu,
                      userTypes: nu.userTypes.includes(type)
                        ? nu.userTypes.filter(t => t !== type)
                        : [...nu.userTypes, type]
                    }))
                  }}
                />
                <Label htmlFor={`add-type-${type}`}>{type}</Label>
              </div>
            ))}
            <h3 className="font-semibold mt-4">Privilegios de Flujo</h3>
            {flows.map((privilege) => (
              <div key={privilege} className="flex items-center space-x-2">
                <Checkbox
                  id={`add-privilege-${privilege}`}
                  checked={newUser.flowPrivileges.includes(privilege)}
                  onCheckedChange={() => {
                    setNewUser(nu => ({
                      ...nu,
                      flowPrivileges: nu.flowPrivileges.includes(privilege)
                        ? nu.flowPrivileges.filter(p => p !== privilege)
                        : [...nu.flowPrivileges, privilege]
                    }))
                  }}
                />
                <Label htmlFor={`add-privilege-${privilege}`}>{privilege}</Label>
              </div>
            ))}
          </div>
          <Button onClick={handleAddUser} disabled={loading}>Agregar</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}