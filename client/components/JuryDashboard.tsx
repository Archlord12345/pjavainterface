import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, Search } from "lucide-react";

interface Grade {
  id: string;
  student: string;
  subject: string;
  type: "CC" | "TP" | "EXAMEN";
  value: number;
  originalValue?: number;
  status: "SAISIE" | "MODIFIEE" | "VALIDEE";
  comment?: string;
  teacher: string;
}

export default function JuryDashboard() {
  const [grades, setGrades] = useState<Grade[]>([
    {
      id: "1",
      student: "Jean Nkomo",
      subject: "Algorithme",
      type: "CC",
      value: 15,
      status: "SAISIE",
      teacher: "Prof. Messi",
    },
    {
      id: "2",
      student: "Marie Djiep",
      subject: "Algorithme",
      type: "EXAMEN",
      originalValue: 18,
      value: 19,
      status: "MODIFIEE",
      comment: "Correction suite révision",
      teacher: "Prof. Messi",
    },
    {
      id: "3",
      student: "Pierre Tsafack",
      subject: "Bases de données",
      type: "TP",
      value: 16,
      status: "VALIDEE",
      teacher: "Prof. Messi",
    },
    {
      id: "4",
      student: "Sophie Njioguop",
      subject: "Programmation Web",
      type: "EXAMEN",
      value: 14,
      status: "SAISIE",
      teacher: "Prof. Ngando",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "SAISIE" | "MODIFIEE" | "VALIDEE">("all");
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [modifyValue, setModifyValue] = useState("");
  const [modifyComment, setModifyComment] = useState("");

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || grade.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleValidate = (gradeId: string) => {
    setGrades(
      grades.map((g) =>
        g.id === gradeId
          ? { ...g, status: "VALIDEE" }
          : g
      )
    );
    setSelectedGrade(null);
  };

  const handleModifyAndValidate = (gradeId: string) => {
    if (!modifyValue) return;

    const newValue = parseFloat(modifyValue);
    if (isNaN(newValue) || newValue < 0 || newValue > 20) return;

    setGrades(
      grades.map((g) =>
        g.id === gradeId
          ? {
              ...g,
              originalValue: g.value,
              value: newValue,
              status: "MODIFIEE",
              comment: modifyComment,
            }
          : g
      )
    );
    setSelectedGrade(null);
    setModifyValue("");
    setModifyComment("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SAISIE":
        return <Badge className="bg-blue-100 text-blue-800">En saisie</Badge>;
      case "MODIFIEE":
        return <Badge className="bg-amber-100 text-amber-800">Modifiée</Badge>;
      case "VALIDEE":
        return <Badge className="bg-green-100 text-green-800">Validée</Badge>;
      default:
        return null;
    }
  };

  const pendingCount = grades.filter((g) => g.status !== "VALIDEE").length;

  return (
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Validation des Notes</h1>
        <p className="text-muted-foreground mt-1">Consultez, modifiez et validez toutes les notes saisies par les enseignants</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{grades.length}</p>
              <p className="text-sm text-muted-foreground">Total des notes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{grades.filter((g) => g.status === "SAISIE").length}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">{grades.filter((g) => g.status === "MODIFIEE").length}</p>
              <p className="text-sm text-muted-foreground">Modifiées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{grades.filter((g) => g.status === "VALIDEE").length}</p>
              <p className="text-sm text-muted-foreground">Validées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-4">
            <CardTitle>Liste des notes</CardTitle>

            {/* Search and Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Chercher par étudiant, matière ou enseignant..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {["all", "SAISIE", "MODIFIEE", "VALIDEE"].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status as any)}
                  >
                    {status === "all" ? "Tous" : status === "SAISIE" ? "En saisie" : status === "MODIFIEE" ? "Modifiées" : "Validées"}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Enseignant</TableHead>
                    <TableHead className="text-center">Note</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucune note trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGrades.map((grade) => (
                      <TableRow key={grade.id} className={grade.status === "VALIDEE" ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{grade.student}</TableCell>
                        <TableCell>{grade.subject}</TableCell>
                        <TableCell className="text-sm">{grade.type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{grade.teacher}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {grade.originalValue && <span className="line-through text-muted-foreground">{grade.originalValue}</span>}
                            <span className="font-bold">{grade.value}/20</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(grade.status)}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGrade(grade)}
                            disabled={grade.status === "VALIDEE"}
                          >
                            {grade.status === "VALIDEE" ? "✓" : "..."}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        {selectedGrade ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{selectedGrade.student}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 pb-4 border-b">
                <p className="text-sm text-muted-foreground">Matière</p>
                <p className="font-medium">{selectedGrade.subject}</p>
              </div>

              <div className="space-y-2 pb-4 border-b">
                <p className="text-sm text-muted-foreground">Type d'évaluation</p>
                <p className="font-medium">{selectedGrade.type}</p>
              </div>

              <div className="space-y-2 pb-4 border-b">
                <p className="text-sm text-muted-foreground">Enseignant</p>
                <p className="font-medium">{selectedGrade.teacher}</p>
              </div>

              <div className="space-y-2 pb-4 border-b">
                <p className="text-sm text-muted-foreground">Note actuelle</p>
                <p className="text-2xl font-bold text-primary">{selectedGrade.value}/20</p>
              </div>

              {selectedGrade.status !== "VALIDEE" && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Modifier la note (si nécessaire)</label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      placeholder={selectedGrade.value.toString()}
                      value={modifyValue}
                      onChange={(e) => setModifyValue(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Commentaire de justification</label>
                    <Textarea
                      placeholder="Laissez vide si pas de modification"
                      value={modifyComment}
                      onChange={(e) => setModifyComment(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 flex-col">
                    <Button
                      onClick={() => handleValidate(selectedGrade.id)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Valider
                    </Button>
                    {modifyValue && (
                      <Button
                        onClick={() => handleModifyAndValidate(selectedGrade.id)}
                        variant="outline"
                        className="w-full"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Modifier et valider
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => setSelectedGrade(null)} className="w-full">
                      Annuler
                    </Button>
                  </div>
                </div>
              )}

              {selectedGrade.status === "MODIFIEE" && selectedGrade.comment && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-amber-900">Commentaire de modification</p>
                  <p className="text-sm text-amber-800">{selectedGrade.comment}</p>
                </div>
              )}

              {selectedGrade.status === "VALIDEE" && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">✓ Note validée</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p>Sélectionnez une note pour voir les détails</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
