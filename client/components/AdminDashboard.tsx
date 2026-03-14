import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Edit2, Lock, Unlock } from "lucide-react";

interface User {
  id: string;
  username: string;
  fullName: string;
  role: "enseignant" | "jury" | "admin";
  email: string;
  active: boolean;
  createdAt: string;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  coefficient: number;
  level: string;
  stream: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "prof1",
      fullName: "Dr. Messi",
      role: "enseignant",
      email: "messi@univ-yaounde.cm",
      active: true,
      createdAt: "2026-01-15",
    },
    {
      id: "2",
      username: "prof2",
      fullName: "Pr. Ngando",
      role: "enseignant",
      email: "ngando@univ-yaounde.cm",
      active: true,
      createdAt: "2026-01-20",
    },
    {
      id: "3",
      username: "jury1",
      fullName: "M. nkondock",
      role: "jury",
      email: "jury@univ-yaounde.cm",
      active: true,
      createdAt: "2026-02-01",
    },
    {
      id: "4",
      username: "admin",
      fullName: "Administrateur",
      role: "admin",
      email: "admin@univ-yaounde.cm",
      active: true,
      createdAt: "2026-01-01",
    },
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", code: "INF201", name: "Algorithme", coefficient: 2, level: "L2", stream: "Informatique" },
    { id: "2", code: "INF202", name: "Bases de données", coefficient: 2, level: "L2", stream: "Informatique" },
    { id: "3", code: "INF203", name: "Programmation Web", coefficient: 2.5, level: "L2", stream: "Informatique" },
    { id: "4", code: "INF204", name: "Réseaux", coefficient: 2, level: "L2", stream: "Informatique" },
    { id: "5", code: "INF301", name: "Systèmes d'exploitation", coefficient: 2.5, level: "L3", stream: "Informatique" },
  ]);

  const [newUser, setNewUser] = useState({ fullName: "", email: "", role: "enseignant" });
  const [newSubject, setNewSubject] = useState({ code: "", name: "", coefficient: "", level: "L2", stream: "Informatique" });
  const [activeTab, setActiveTab] = useState("users");

  const handleAddUser = () => {
    if (newUser.fullName && newUser.email) {
      const newUserId = Math.random().toString();
      const username = `user${newUserId.slice(-4)}`;

      setUsers([
        ...users,
        {
          id: newUserId,
          username,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role as any,
          active: true,
          createdAt: new Date().toISOString().split("T")[0],
        },
      ]);
      setNewUser({ fullName: "", email: "", role: "enseignant" });
    }
  };

  const handleToggleUserActive = (id: string) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const handleDeleteUser = (id: string) => {
    if (users.length > 1) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleAddSubject = () => {
    if (newSubject.code && newSubject.name && newSubject.coefficient) {
      setSubjects([
        ...subjects,
        {
          id: Math.random().toString(),
          code: newSubject.code,
          name: newSubject.name,
          coefficient: parseFloat(newSubject.coefficient),
          level: newSubject.level,
          stream: newSubject.stream,
        },
      ]);
      setNewSubject({ code: "", name: "", coefficient: "", level: "L2", stream: "Informatique" });
    }
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "enseignant":
        return <Badge className="bg-purple-100 text-purple-800">Enseignant</Badge>;
      case "jury":
        return <Badge className="bg-blue-100 text-blue-800">Jury</Badge>;
      case "admin":
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Administration</h1>
        <p className="text-muted-foreground mt-1">Gérez les utilisateurs, les matières et la configuration du système</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{users.length}</p>
              <p className="text-sm text-muted-foreground">Utilisateurs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">{subjects.length}</p>
              <p className="text-sm text-muted-foreground">Matières</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{users.filter((u) => u.active).length}</p>
              <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Gestion des utilisateurs</TabsTrigger>
          <TabsTrigger value="subjects">Gestion des matières</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ajouter un utilisateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Nom complet"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <Select value={newUser.role} onValueChange={(val) => setNewUser({ ...newUser, role: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enseignant">Enseignant</SelectItem>
                    <SelectItem value="jury">Jury</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddUser}>Ajouter</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Créé le</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <Badge className={user.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {user.active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{user.createdAt}</TableCell>
                        <TableCell className="text-center space-x-2 flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserActive(user.id)}
                            title={user.active ? "Désactiver" : "Activer"}
                          >
                            {user.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </Button>
                          {users.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Ajouter une matière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Input
                  placeholder="Code (ex: INF201)"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                />
                <Input
                  placeholder="Nom de la matière"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                />
                <Input
                  placeholder="Coefficient"
                  type="number"
                  step="0.5"
                  value={newSubject.coefficient}
                  onChange={(e) => setNewSubject({ ...newSubject, coefficient: e.target.value })}
                />
                <Select value={newSubject.level} onValueChange={(val) => setNewSubject({ ...newSubject, level: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L1">L1</SelectItem>
                    <SelectItem value="L2">L2</SelectItem>
                    <SelectItem value="L3">L3</SelectItem>
                    <SelectItem value="M1">M1</SelectItem>
                    <SelectItem value="M2">M2</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddSubject}>Ajouter</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liste des matières</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Code</TableHead>
                      <TableHead>Matière</TableHead>
                      <TableHead>Coefficient</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Filière</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.code}</TableCell>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell className="text-center">{subject.coefficient}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{subject.level}</Badge>
                        </TableCell>
                        <TableCell>{subject.stream}</TableCell>
                        <TableCell className="text-center space-x-2 flex justify-center">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSubject(subject.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
