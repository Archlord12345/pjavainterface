import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface Grade {
  id: string;
  student: string;
  matricule: string;
  filiere: string;
  subject: string;
  type: "CC" | "TP" | "EXAMEN";
  value: number;
  status: "SAISIE" | "VALIDEE";
}

export default function TeacherDashboard() {
  const [grades, setGrades] = useState<Grade[]>([
    { id: "1", student: "Jean Nkomo", matricule: "23V2112", filiere: "ICT4D", subject: "Algorithme", type: "CC", value: 15, status: "SAISIE" },
    { id: "2", student: "Marie Djiep", matricule: "23V2113", filiere: "ICT4D", subject: "Algorithme", type: "EXAMEN", value: 18, status: "VALIDEE" },
    { id: "3", student: "Pierre Tsafack", matricule: "23V2114", filiere: "ICT4D", subject: "Algorithme", type: "TP", value: 16, status: "SAISIE" },
  ]);

  const [formData, setFormData] = useState({
    student: "",
    matricule: "",
    filiere: "",
    subject: "",
    type: "CC" as "CC" | "TP" | "EXAMEN",
    value: "",
  });

  const handleAddGrade = () => {
    if (formData.student && formData.matricule && formData.filiere && formData.subject && formData.value) {
      const newGrade: Grade = {
        id: Math.random().toString(),
        student: formData.student,
        matricule: formData.matricule,
        filiere: formData.filiere,
        subject: formData.subject,
        type: formData.type,
        value: parseFloat(formData.value),
        status: "SAISIE",
      };
      setGrades([...grades, newGrade]);
      setFormData({ student: "", matricule: "", filiere: "", subject: "", type: "CC", value: "" });
    }
  };

  const handleDeleteGrade = (id: string) => {
    setGrades(grades.filter((g) => g.id !== id));
  };

  const getStatusColor = (status: string) => {
    if (status === "VALIDEE") return "bg-green-100 text-green-800";
    return "bg-blue-100 text-blue-800";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "CC":
        return "bg-purple-100 text-purple-800";
      case "TP":
        return "bg-orange-100 text-orange-800";
      case "EXAMEN":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Saisie des Notes</h1>
        <p className="text-muted-foreground mt-1">Entrez les notes de vos étudiants par matière et type d'évaluation</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouvelle Note
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Étudiant (Nom Complet)</label>
              <Input
                placeholder="Ex: Jean Nkomo"
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Matricule</label>
              <Input
                placeholder="Ex: 23V2112"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filière</label>
              <Input
                placeholder="Ex: ICT4D"
                value={formData.filiere}
                onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Matière</label>
              <Select value={formData.subject} onValueChange={(val) => setFormData({ ...formData, subject: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une matière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Algorithme">Algorithme</SelectItem>
                  <SelectItem value="Bases de données">Bases de données</SelectItem>
                  <SelectItem value="Programmation Web">Programmation Web</SelectItem>
                  <SelectItem value="Réseaux">Réseaux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'évaluation</label>
              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Contrôle Continu</SelectItem>
                  <SelectItem value="TP">Travaux Pratiques</SelectItem>
                  <SelectItem value="EXAMEN">Examen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note (/20)</label>
              <Input
                type="number"
                placeholder="0"
                min="0"
                max="20"
                step="0.5"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>

            <Button onClick={handleAddGrade} className="w-full">
              Ajouter la note
            </Button>
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notes saisies ({grades.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Filière</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Note</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Aucune note saisie pour le moment
                      </TableCell>
                    </TableRow>
                  ) : (
                    grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell className="font-medium">{grade.student}</TableCell>
                        <TableCell className="text-sm">{grade.matricule}</TableCell>
                        <TableCell className="text-sm">{grade.filiere}</TableCell>
                        <TableCell>{grade.subject}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(grade.type)}>{grade.type}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{grade.value}/20</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(grade.status)}>
                            {grade.status === "SAISIE" ? "En saisie" : "Validée"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {grade.status === "SAISIE" && (
                            <button
                              onClick={() => handleDeleteGrade(grade.id)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{grades.length}</p>
              <p className="text-sm text-muted-foreground">Notes saisies</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{grades.filter((g) => g.status === "VALIDEE").length}</p>
              <p className="text-sm text-muted-foreground">Notes validées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{grades.filter((g) => g.status === "SAISIE").length}</p>
              <p className="text-sm text-muted-foreground">En attente de validation</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
