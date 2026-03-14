import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

// Types pour les entités
export interface User {
  id: number;
  username: string;
  password_hash: string;
  full_name: string;
  email: string | null;
  role: "jury" | "enseignant";
  active: number;
  created_at: string;
  updated_at: string;
}

export interface Etudiant {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  date_naissance: string | null;
  lieu_naissance: string | null;
  email: string | null;
  telephone: string | null;
  filiere_id: number | null;
  niveau_id: number | null;
  actif: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  etudiant_id: number;
  ue_id: number;
  type_evaluation_id: number;
  enseignant_id: number;
  valeur: number;
  valeur_sur_bareme: number;
  commentaire: string | null;
  statut: "SAISIE" | "MODIFIEE" | "VALIDEE";
  date_saisie: string;
  date_validation: string | null;
  valide_par: number | null;
  modifie_par: number | null;
  valeur_originale: number | null;
  motif_modification: string | null;
  created_at: string;
  updated_at: string;
}

export interface UniteEnseignement {
  id: number;
  code: string;
  nom: string;
  coefficient: number;
  credits: number;
  filiere_id: number | null;
  niveau_id: number | null;
  semestre_id: number | null;
  responsable_id: number | null;
  created_at: string;
}

export interface TypeEvaluation {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  bareme_max: number;
  created_at: string;
}

export interface DecisionJury {
  id: number;
  etudiant_id: number;
  ue_id: number;
  semestre_id: number;
  total: number;
  decision: "CA" | "CANT" | "NC" | "EL";
  mention: string | null;
  commentaire: string | null;
  decide_par: number;
  date_decision: string;
}

export interface ProcesVerbal {
  id: number;
  ue_id: number;
  semestre_id: number;
  annee_academique: string;
  date_generation: string;
  genere_par: number;
  fichier_pdf: Buffer | null;
  nom_fichier: string | null;
  effectif_total: number;
  effectif_ca: number;
  effectif_cant: number;
  effectif_nc: number;
  effectif_el: number;
  pourcentage_ca: number;
  pourcentage_cant: number;
  pourcentage_nc: number;
  pourcentage_el: number;
  statut: "BROUILLON" | "VALIDE" | "SIGNE";
  created_at: string;
}

export interface Semestre {
  id: number;
  numero: number;
  annee_academique: string;
  date_debut: string | null;
  date_fin: string | null;
  actif: number;
  created_at: string;
}

export interface Filiere {
  id: number;
  code: string;
  nom: string;
  description: string | null;
  created_at: string;
}

export interface Niveau {
  id: number;
  code: string;
  nom: string;
  ordre: number;
  created_at: string;
}

// Instance de la base de données
let db: Database.Database | null = null;

/**
 * Initialise la connexion à la base de données
 */
export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = join(process.cwd(), "data", "gestion_notes.db");
    db = new Database(dbPath);
    
    // Activer les foreign keys
    db.pragma("foreign_keys = ON");
    
    // Initialiser le schéma si nécessaire
    initializeSchema(db);
  }
  return db;
}

/**
 * Initialise le schéma de la base de données
 */
function initializeSchema(database: Database.Database): void {
  const schemaPath = join(process.cwd(), "server", "database", "schema.sql");
  try {
    const schema = readFileSync(schemaPath, "utf-8");
    database.exec(schema);
    console.log("✅ Schéma de base de données initialisé");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du schéma:", error);
    throw error;
  }
}

/**
 * Ferme la connexion à la base de données
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log("✅ Connexion à la base de données fermée");
  }
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - UTILISATEURS
// ============================================

export function findUserByUsername(username: string): User | undefined {
  const stmt = getDatabase().prepare("SELECT * FROM users WHERE username = ?");
  return stmt.get(username) as User | undefined;
}

export function findUserById(id: number): User | undefined {
  const stmt = getDatabase().prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id) as User | undefined;
}

export function findAllUsers(): User[] {
  const stmt = getDatabase().prepare("SELECT * FROM users ORDER BY created_at DESC");
  return stmt.all() as User[];
}

export function findUsersByRole(role: "jury" | "enseignant"): User[] {
  const stmt = getDatabase().prepare("SELECT * FROM users WHERE role = ? AND active = 1 ORDER BY full_name");
  return stmt.all(role) as User[];
}

export function createUser(user: Omit<User, "id" | "created_at" | "updated_at">): User {
  const stmt = getDatabase().prepare(`
    INSERT INTO users (username, password_hash, full_name, email, role, active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    user.username,
    user.password_hash,
    user.full_name,
    user.email,
    user.role,
    user.active
  );
  return findUserById(result.lastInsertRowid as number)!;
}

export function updateUser(id: number, data: Partial<User>): User | undefined {
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (data.full_name !== undefined) {
    fields.push("full_name = ?");
    values.push(data.full_name);
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email);
  }
  if (data.active !== undefined) {
    fields.push("active = ?");
    values.push(data.active);
  }
  if (data.password_hash !== undefined) {
    fields.push("password_hash = ?");
    values.push(data.password_hash);
  }

  if (fields.length === 0) return findUserById(id);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  const stmt = getDatabase().prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values);
  return findUserById(id);
}

export function deleteUser(id: number): boolean {
  const stmt = getDatabase().prepare("DELETE FROM users WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - ÉTUDIANTS
// ============================================

export function findEtudiantById(id: number): Etudiant | undefined {
  const stmt = getDatabase().prepare("SELECT * FROM etudiants WHERE id = ?");
  return stmt.get(id) as Etudiant | undefined;
}

export function findEtudiantByMatricule(matricule: string): Etudiant | undefined {
  const stmt = getDatabase().prepare("SELECT * FROM etudiants WHERE matricule = ?");
  return stmt.get(matricule) as Etudiant | undefined;
}

export function findAllEtudiants(): Etudiant[] {
  const stmt = getDatabase().prepare("SELECT * FROM etudiants WHERE actif = 1 ORDER BY nom, prenom");
  return stmt.all() as Etudiant[];
}

export function findEtudiantsByFiliereAndNiveau(filiereId: number, niveauId: number): Etudiant[] {
  const stmt = getDatabase().prepare(`
    SELECT * FROM etudiants 
    WHERE filiere_id = ? AND niveau_id = ? AND actif = 1 
    ORDER BY nom, prenom
  `);
  return stmt.all(filiereId, niveauId) as Etudiant[];
}

export function createEtudiant(etudiant: Omit<Etudiant, "id" | "created_at" | "updated_at">): Etudiant {
  const stmt = getDatabase().prepare(`
    INSERT INTO etudiants (matricule, nom, prenom, date_naissance, lieu_naissance, email, telephone, filiere_id, niveau_id, actif)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    etudiant.matricule,
    etudiant.nom,
    etudiant.prenom,
    etudiant.date_naissance,
    etudiant.lieu_naissance,
    etudiant.email,
    etudiant.telephone,
    etudiant.filiere_id,
    etudiant.niveau_id,
    etudiant.actif
  );
  return findEtudiantById(result.lastInsertRowid as number)!;
}

export function updateEtudiant(id: number, data: Partial<Etudiant>): Etudiant | undefined {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const allowedFields = ["nom", "prenom", "date_naissance", "lieu_naissance", "email", "telephone", "filiere_id", "niveau_id", "actif"];
  
  for (const field of allowedFields) {
    if (data[field as keyof Etudiant] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(data[field as keyof Etudiant] as string | number | null);
    }
  }

  if (fields.length === 0) return findEtudiantById(id);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  const stmt = getDatabase().prepare(`UPDATE etudiants SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values);
  return findEtudiantById(id);
}

export function deleteEtudiant(id: number): boolean {
  const stmt = getDatabase().prepare("UPDATE etudiants SET actif = 0 WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - NOTES
// ============================================

export function findNoteById(id: number): Note | undefined {
  const stmt = getDatabase().prepare("SELECT * FROM notes WHERE id = ?");
  return stmt.get(id) as Note | undefined;
}

export function findNotesByEtudiant(etudiantId: number): Note[] {
  const stmt = getDatabase().prepare("SELECT * FROM notes WHERE etudiant_id = ? ORDER BY date_saisie DESC");
  return stmt.all(etudiantId) as Note[];
}

export function findNotesByUE(ueId: number): Note[] {
  const stmt = getDatabase().prepare("SELECT * FROM notes WHERE ue_id = ? ORDER BY date_saisie DESC");
  return stmt.all(ueId) as Note[];
}

export function findNotesByEnseignant(enseignantId: number): Note[] {
  const stmt = getDatabase().prepare("SELECT * FROM notes WHERE enseignant_id = ? ORDER BY date_saisie DESC");
  return stmt.all(enseignantId) as Note[];
}

export function findNotesByStatut(statut: Note["statut"]): Note[] {
  const stmt = getDatabase().prepare("SELECT * FROM notes WHERE statut = ? ORDER BY date_saisie DESC");
  return stmt.all(statut) as Note[];
}

export function findNotesPendingValidation(): Note[] {
  const stmt = getDatabase().prepare("SELECT * FROM notes WHERE statut != 'VALIDEE' ORDER BY date_saisie DESC");
  return stmt.all() as Note[];
}

export interface NoteComplete extends Note {
  etudiant_matricule: string;
  etudiant_nom: string;
  etudiant_prenom: string;
  ue_code: string;
  ue_nom: string;
  type_eval_code: string;
  type_eval_nom: string;
  enseignant_nom: string;
}

export function findNotesCompleteByStatut(statut: Note["statut"] | "all"): NoteComplete[] {
  if (statut === "all") {
    const stmt = getDatabase().prepare(`
      SELECT n.*, 
        e.matricule as etudiant_matricule,
        e.nom as etudiant_nom,
        e.prenom as etudiant_prenom,
        ue.code as ue_code,
        ue.nom as ue_nom,
        te.code as type_eval_code,
        te.nom as type_eval_nom,
        u.full_name as enseignant_nom
      FROM notes n
      JOIN etudiants e ON n.etudiant_id = e.id
      JOIN unites_enseignement ue ON n.ue_id = ue.id
      JOIN types_evaluation te ON n.type_evaluation_id = te.id
      JOIN users u ON n.enseignant_id = u.id
      ORDER BY n.date_saisie DESC
    `);
    return stmt.all() as NoteComplete[];
  }
  
  const stmt = getDatabase().prepare(`
    SELECT n.*, 
      e.matricule as etudiant_matricule,
      e.nom as etudiant_nom,
      e.prenom as etudiant_prenom,
      ue.code as ue_code,
      ue.nom as ue_nom,
      te.code as type_eval_code,
      te.nom as type_eval_nom,
      u.full_name as enseignant_nom
    FROM notes n
    JOIN etudiants e ON n.etudiant_id = e.id
    JOIN unites_enseignement ue ON n.ue_id = ue.id
    JOIN types_evaluation te ON n.type_evaluation_id = te.id
    JOIN users u ON n.enseignant_id = u.id
    WHERE n.statut = ?
    ORDER BY n.date_saisie DESC
  `);
  return stmt.all(statut) as NoteComplete[];
}

export function createNote(note: Omit<Note, "id" | "created_at" | "updated_at" | "date_validation" | "valide_par" | "modifie_par" | "valeur_originale" | "motif_modification">): Note {
  const stmt = getDatabase().prepare(`
    INSERT INTO notes (etudiant_id, ue_id, type_evaluation_id, enseignant_id, valeur, valeur_sur_bareme, commentaire, statut, date_saisie)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  const result = stmt.run(
    note.etudiant_id,
    note.ue_id,
    note.type_evaluation_id,
    note.enseignant_id,
    note.valeur,
    note.valeur_sur_bareme,
    note.commentaire,
    note.statut
  );
  return findNoteById(result.lastInsertRowid as number)!;
}

export function updateNote(id: number, data: Partial<Note>): Note | undefined {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const allowedFields = ["valeur", "commentaire", "statut", "valeur_originale", "motif_modification"];
  
  for (const field of allowedFields) {
    if (data[field as keyof Note] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(data[field as keyof Note] as string | number | null);
    }
  }

  if (fields.length === 0) return findNoteById(id);

  fields.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  const stmt = getDatabase().prepare(`UPDATE notes SET ${fields.join(", ")} WHERE id = ?`);
  stmt.run(...values);
  return findNoteById(id);
}

export function validateNote(id: number, validePar: number): Note | undefined {
  const stmt = getDatabase().prepare(`
    UPDATE notes 
    SET statut = 'VALIDEE', date_validation = CURRENT_TIMESTAMP, valide_par = ?
    WHERE id = ?
  `);
  stmt.run(validePar, id);
  return findNoteById(id);
}

export function modifyAndValidateNote(
  id: number, 
  nouvelleValeur: number, 
  motif: string, 
  modifiePar: number
): Note | undefined {
  const note = findNoteById(id);
  if (!note) return undefined;

  const stmt = getDatabase().prepare(`
    UPDATE notes 
    SET valeur = ?, 
        valeur_originale = ?,
        motif_modification = ?,
        statut = 'MODIFIEE',
        modifie_par = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(nouvelleValeur, note.valeur, motif, modifiePar, id);
  return findNoteById(id);
}

export function deleteNote(id: number): boolean {
  const stmt = getDatabase().prepare("DELETE FROM notes WHERE id = ? AND statut = 'SAISIE'");
  const result = stmt.run(id);
  return result.changes > 0;
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - UE
// ============================================

export function findAllUE(): UniteEnseignement[] {
  const stmt = getDatabase().prepare("SELECT * FROM unites_enseignement ORDER BY code");
  return stmt.all() as UniteEnseignement[];
}

export function findUEById(id: number): UniteEnseignement | undefined {
  const stmt = getDatabase().prepare("SELECT * FROM unites_enseignement WHERE id = ?");
  return stmt.get(id) as UniteEnseignement | undefined;
}

export function findUEByCode(code: string): UniteEnseignement | undefined {
  const stmt = getDatabase().prepare("SELECT * FROM unites_enseignement WHERE code = ?");
  return stmt.get(code) as UniteEnseignement | undefined;
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - TYPES EVAL
// ============================================

export function findAllTypesEvaluation(): TypeEvaluation[] {
  const stmt = getDatabase().prepare("SELECT * FROM types_evaluation ORDER BY id");
  return stmt.all() as TypeEvaluation[];
}

export function findTypeEvaluationByCode(code: string): TypeEvaluation | undefined {
  const stmt = getDatabase().prepare("SELECT * FROM types_evaluation WHERE code = ?");
  return stmt.get(code) as TypeEvaluation | undefined;
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - DÉCISIONS
// ============================================

export function createDecisionJury(decision: Omit<DecisionJury, "id" | "date_decision">): DecisionJury {
  const stmt = getDatabase().prepare(`
    INSERT INTO decisions_jury (etudiant_id, ue_id, semestre_id, total, decision, mention, commentaire, decide_par, date_decision)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(etudiant_id, ue_id, semestre_id) DO UPDATE SET
      total = excluded.total,
      decision = excluded.decision,
      mention = excluded.mention,
      commentaire = excluded.commentaire,
      decide_par = excluded.decide_par,
      date_decision = CURRENT_TIMESTAMP
  `);
  stmt.run(
    decision.etudiant_id,
    decision.ue_id,
    decision.semestre_id,
    decision.total,
    decision.decision,
    decision.mention,
    decision.commentaire,
    decision.decide_par
  );
  
  const fetchStmt = getDatabase().prepare(`
    SELECT * FROM decisions_jury WHERE etudiant_id = ? AND ue_id = ? AND semestre_id = ?
  `);
  return fetchStmt.get(decision.etudiant_id, decision.ue_id, decision.semestre_id) as DecisionJury;
}

export function findDecisionsByUE(ueId: number, semestreId: number): DecisionJury[] {
  const stmt = getDatabase().prepare(`
    SELECT * FROM decisions_jury WHERE ue_id = ? AND semestre_id = ?
  `);
  return stmt.all(ueId, semestreId) as DecisionJury[];
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - PV
// ============================================

export function createProcesVerbal(pv: Omit<ProcesVerbal, "id" | "created_at" | "date_generation">): ProcesVerbal {
  const stmt = getDatabase().prepare(`
    INSERT INTO proces_verbaux (ue_id, semestre_id, annee_academique, genere_par, fichier_pdf, nom_fichier, 
      effectif_total, effectif_ca, effectif_cant, effectif_nc, effectif_el,
      pourcentage_ca, pourcentage_cant, pourcentage_nc, pourcentage_el, statut, date_generation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
  const result = stmt.run(
    pv.ue_id,
    pv.semestre_id,
    pv.annee_academique,
    pv.genere_par,
    pv.fichier_pdf,
    pv.nom_fichier,
    pv.effectif_total,
    pv.effectif_ca,
    pv.effectif_cant,
    pv.effectif_nc,
    pv.effectif_el,
    pv.pourcentage_ca,
    pv.pourcentage_cant,
    pv.pourcentage_nc,
    pv.pourcentage_el,
    pv.statut
  );
  
  const fetchStmt = getDatabase().prepare("SELECT * FROM proces_verbaux WHERE id = ?");
  return fetchStmt.get(result.lastInsertRowid) as ProcesVerbal;
}

export function findPVByUE(ueId: number, semestreId: number): ProcesVerbal | undefined {
  const stmt = getDatabase().prepare(`
    SELECT * FROM proces_verbaux WHERE ue_id = ? AND semestre_id = ? ORDER BY date_generation DESC LIMIT 1
  `);
  return stmt.get(ueId, semestreId) as ProcesVerbal | undefined;
}

export function findAllPV(): ProcesVerbal[] {
  const stmt = getDatabase().prepare("SELECT * FROM proces_verbaux ORDER BY date_generation DESC");
  return stmt.all() as ProcesVerbal[];
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - SEMESTRE
// ============================================

export function findActiveSemestre(): Semestre | undefined {
  const stmt = getDatabase().prepare("SELECT * FROM semestres WHERE actif = 1 LIMIT 1");
  return stmt.get() as Semestre | undefined;
}

export function findAllSemestres(): Semestre[] {
  const stmt = getDatabase().prepare("SELECT * FROM semestres ORDER BY annee_academique DESC, numero");
  return stmt.all() as Semestre[];
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - FILIÈRES
// ============================================

export function findAllFilieres(): Filiere[] {
  const stmt = getDatabase().prepare("SELECT * FROM filieres ORDER BY code");
  return stmt.all() as Filiere[];
}

// ============================================
// FONCTIONS D'ACCÈS AUX DONNÉES - NIVEAUX
// ============================================

export function findAllNiveaux(): Niveau[] {
  const stmt = getDatabase().prepare("SELECT * FROM niveaux ORDER BY ordre");
  return stmt.all() as Niveau[];
}

// ============================================
// FONCTIONS UTILITAIRES - CALCUL MENTIONS
// ============================================

export function calculerMention(moyenne: number): string {
  if (moyenne >= 16) return "A";
  if (moyenne >= 14) return "B";
  if (moyenne >= 12) return "AB";
  if (moyenne >= 10) return "C";
  return "D";
}

export function calculerDecision(total: number, seuilCA: number = 50, seuilCANT: number = 35): "CA" | "CANT" | "NC" | "EL" {
  if (total >= seuilCA) return "CA";
  if (total >= seuilCANT) return "CANT";
  if (total === 0) return "EL";
  return "NC";
}

// ============================================
// FONCTIONS UTILITAIRES - STATISTIQUES
// ============================================

export interface StatistiquesPV {
  effectif_total: number;
  effectif_ca: number;
  effectif_cant: number;
  effectif_nc: number;
  effectif_el: number;
  pourcentage_ca: number;
  pourcentage_cant: number;
  pourcentage_nc: number;
  pourcentage_el: number;
}

export function calculerStatistiquesPV(decisions: DecisionJury[]): StatistiquesPV {
  const total = decisions.length;
  const ca = decisions.filter(d => d.decision === "CA").length;
  const cant = decisions.filter(d => d.decision === "CANT").length;
  const nc = decisions.filter(d => d.decision === "NC").length;
  const el = decisions.filter(d => d.decision === "EL").length;

  return {
    effectif_total: total,
    effectif_ca: ca,
    effectif_cant: cant,
    effectif_nc: nc,
    effectif_el: el,
    pourcentage_ca: total > 0 ? parseFloat((ca / total * 100).toFixed(2)) : 0,
    pourcentage_cant: total > 0 ? parseFloat((cant / total * 100).toFixed(2)) : 0,
    pourcentage_nc: total > 0 ? parseFloat((nc / total * 100).toFixed(2)) : 0,
    pourcentage_el: total > 0 ? parseFloat((el / total * 100).toFixed(2)) : 0,
  };
}

// ============================================
// FONCTIONS DE RECHERCHE
// ============================================

export function searchNotes(query: string, statut: Note["statut"] | "all"): NoteComplete[] {
  const searchTerm = `%${query.toLowerCase()}%`;
  
  let sql = `
    SELECT n.*, 
      e.matricule as etudiant_matricule,
      e.nom as etudiant_nom,
      e.prenom as etudiant_prenom,
      ue.code as ue_code,
      ue.nom as ue_nom,
      te.code as type_eval_code,
      te.nom as type_eval_nom,
      u.full_name as enseignant_nom
    FROM notes n
    JOIN etudiants e ON n.etudiant_id = e.id
    JOIN unites_enseignement ue ON n.ue_id = ue.id
    JOIN types_evaluation te ON n.type_evaluation_id = te.id
    JOIN users u ON n.enseignant_id = u.id
    WHERE (
      LOWER(e.nom) LIKE ? OR
      LOWER(e.prenom) LIKE ? OR
      LOWER(e.matricule) LIKE ? OR
      LOWER(ue.nom) LIKE ? OR
      LOWER(ue.code) LIKE ? OR
      LOWER(u.full_name) LIKE ?
    )
  `;
  
  const params: (string | string)[] = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
  
  if (statut !== "all") {
    sql += " AND n.statut = ?";
    params.push(statut);
  }
  
  sql += " ORDER BY n.date_saisie DESC";
  
  const stmt = getDatabase().prepare(sql);
  return stmt.all(...params) as NoteComplete[];
}

export default {
  getDatabase,
  closeDatabase,
  // Users
  findUserByUsername,
  findUserById,
  findAllUsers,
  findUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  // Etudiants
  findEtudiantById,
  findEtudiantByMatricule,
  findAllEtudiants,
  findEtudiantsByFiliereAndNiveau,
  createEtudiant,
  updateEtudiant,
  deleteEtudiant,
  // Notes
  findNoteById,
  findNotesByEtudiant,
  findNotesByUE,
  findNotesByEnseignant,
  findNotesByStatut,
  findNotesPendingValidation,
  findNotesCompleteByStatut,
  createNote,
  updateNote,
  validateNote,
  modifyAndValidateNote,
  deleteNote,
  searchNotes,
  // UE
  findAllUE,
  findUEById,
  findUEByCode,
  // Types Evaluation
  findAllTypesEvaluation,
  findTypeEvaluationByCode,
  // Decisions
  createDecisionJury,
  findDecisionsByUE,
  // PV
  createProcesVerbal,
  findPVByUE,
  findAllPV,
  // Semestre
  findActiveSemestre,
  findAllSemestres,
  // Filieres
  findAllFilieres,
  // Niveaux
  findAllNiveaux,
  // Utils
  calculerMention,
  calculerDecision,
  calculerStatistiquesPV,
};
