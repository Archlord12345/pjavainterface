-- ============================================
-- BASE DE DONNÉES SQLITE - GESTION DES NOTES
-- Université de Yaoundé I
-- ============================================
-- Types de comptes: JURY et ENSEIGNANT uniquement
-- ============================================

-- Table des utilisateurs (2 types: jury, enseignant)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('jury', 'enseignant')),
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des filières
CREATE TABLE IF NOT EXISTS filieres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des niveaux
CREATE TABLE IF NOT EXISTS niveaux (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    ordre INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des semestres
CREATE TABLE IF NOT EXISTS semestres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero INTEGER NOT NULL,
    annee_academique TEXT NOT NULL,
    date_debut DATE,
    date_fin DATE,
    actif INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des Unités d'Enseignement (UE)
CREATE TABLE IF NOT EXISTS unites_enseignement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    coefficient REAL DEFAULT 1,
    credits INTEGER DEFAULT 0,
    filiere_id INTEGER,
    niveau_id INTEGER,
    semestre_id INTEGER,
    responsable_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filiere_id) REFERENCES filieres(id),
    FOREIGN KEY (niveau_id) REFERENCES niveaux(id),
    FOREIGN KEY (semestre_id) REFERENCES semestres(id),
    FOREIGN KEY (responsable_id) REFERENCES users(id)
);

-- Table des étudiants
CREATE TABLE IF NOT EXISTS etudiants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricule TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    date_naissance DATE,
    lieu_naissance TEXT,
    email TEXT,
    telephone TEXT,
    filiere_id INTEGER,
    niveau_id INTEGER,
    actif INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filiere_id) REFERENCES filieres(id),
    FOREIGN KEY (niveau_id) REFERENCES niveaux(id)
);

-- Table des types d'évaluation
CREATE TABLE IF NOT EXISTS types_evaluation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    description TEXT,
    bareme_max REAL NOT NULL DEFAULT 20,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des notes
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    etudiant_id INTEGER NOT NULL,
    ue_id INTEGER NOT NULL,
    type_evaluation_id INTEGER NOT NULL,
    enseignant_id INTEGER NOT NULL,
    valeur REAL NOT NULL CHECK(valeur >= 0 AND valeur <= 20),
    valeur_sur_bareme REAL DEFAULT 20,
    commentaire TEXT,
    statut TEXT DEFAULT 'SAISIE' CHECK(statut IN ('SAISIE', 'MODIFIEE', 'VALIDEE')),
    date_saisie DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_validation DATETIME,
    valide_par INTEGER,
    modifie_par INTEGER,
    valeur_originale REAL,
    motif_modification TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id),
    FOREIGN KEY (ue_id) REFERENCES unites_enseignement(id),
    FOREIGN KEY (type_evaluation_id) REFERENCES types_evaluation(id),
    FOREIGN KEY (enseignant_id) REFERENCES users(id),
    FOREIGN KEY (valide_par) REFERENCES users(id),
    FOREIGN KEY (modifie_par) REFERENCES users(id),
    UNIQUE(etudiant_id, ue_id, type_evaluation_id)
);

-- Table des PV (Procès-Verbaux)
CREATE TABLE IF NOT EXISTS proces_verbaux (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ue_id INTEGER NOT NULL,
    semestre_id INTEGER NOT NULL,
    annee_academique TEXT NOT NULL,
    date_generation DATETIME DEFAULT CURRENT_TIMESTAMP,
    genere_par INTEGER NOT NULL,
    fichier_pdf BLOB,
    nom_fichier TEXT,
    effectif_total INTEGER DEFAULT 0,
    effectif_ca INTEGER DEFAULT 0,
    effectif_cant INTEGER DEFAULT 0,
    effectif_nc INTEGER DEFAULT 0,
    effectif_el INTEGER DEFAULT 0,
    pourcentage_ca REAL DEFAULT 0,
    pourcentage_cant REAL DEFAULT 0,
    pourcentage_nc REAL DEFAULT 0,
    pourcentage_el REAL DEFAULT 0,
    statut TEXT DEFAULT 'BROUILLON' CHECK(statut IN ('BROUILLON', 'VALIDE', 'SIGNE')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ue_id) REFERENCES unites_enseignement(id),
    FOREIGN KEY (semestre_id) REFERENCES semestres(id),
    FOREIGN KEY (genere_par) REFERENCES users(id)
);

-- Table des décisions de jury
CREATE TABLE IF NOT EXISTS decisions_jury (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    etudiant_id INTEGER NOT NULL,
    ue_id INTEGER NOT NULL,
    semestre_id INTEGER NOT NULL,
    total REAL NOT NULL,
    decision TEXT NOT NULL CHECK(decision IN ('CA', 'CANT', 'NC', 'EL')),
    mention TEXT,
    commentaire TEXT,
    decide_par INTEGER NOT NULL,
    date_decision DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id),
    FOREIGN KEY (ue_id) REFERENCES unites_enseignement(id),
    FOREIGN KEY (semestre_id) REFERENCES semestres(id),
    FOREIGN KEY (decide_par) REFERENCES users(id),
    UNIQUE(etudiant_id, ue_id, semestre_id)
);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS parametres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cle TEXT UNIQUE NOT NULL,
    valeur TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEX POUR OPTIMISER LES REQUÊTES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_etudiants_filiere ON etudiants(filiere_id);
CREATE INDEX IF NOT EXISTS idx_etudiants_niveau ON etudiants(niveau_id);
CREATE INDEX IF NOT EXISTS idx_etudiants_matricule ON etudiants(matricule);
CREATE INDEX IF NOT EXISTS idx_notes_etudiant ON notes(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_notes_ue ON notes(ue_id);
CREATE INDEX IF NOT EXISTS idx_notes_statut ON notes(statut);
CREATE INDEX IF NOT EXISTS idx_notes_enseignant ON notes(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_pv_ue ON proces_verbaux(ue_id);
CREATE INDEX IF NOT EXISTS idx_pv_semestre ON proces_verbaux(semestre_id);
CREATE INDEX IF NOT EXISTS idx_decisions_etudiant ON decisions_jury(etudiant_id);

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Types d'évaluation par défaut
INSERT INTO types_evaluation (code, nom, description, bareme_max) VALUES
('CC', 'Contrôle Continu', 'Évaluation continue durant le semestre', 20),
('TP', 'Travaux Pratiques', 'Travaux pratiques en laboratoire', 20),
('EE', 'Examen Écrit', 'Examen écrit de fin de semestre', 40),
('EP', 'Examen Pratique', 'Examen pratique de fin de semestre', 40);

-- Niveaux par défaut
INSERT INTO niveaux (code, nom, ordre) VALUES
('L1', 'Licence 1', 1),
('L2', 'Licence 2', 2),
('L3', 'Licence 3', 3),
('M1', 'Master 1', 4),
('M2', 'Master 2', 5);

-- Filières par défaut
INSERT INTO filieres (code, nom, description) VALUES
('ICT', 'Informatique et Communication Technologique', 'Filière ICT'),
('MATH', 'Mathématiques', 'Filière Mathématiques'),
('PHYS', 'Physique', 'Filière Physique'),
('CHIM', 'Chimie', 'Filière Chimie');

-- Semestre actif
INSERT INTO semestres (numero, annee_academique, date_debut, date_fin, actif) VALUES
(1, '2025-2026', '2025-09-01', '2026-01-31', 1);

-- Unités d'enseignement exemples
INSERT INTO unites_enseignement (code, nom, coefficient, credits, filiere_id, niveau_id, semestre_id) VALUES
('ICT203', 'ICT203 - ICT', 2, 4, 1, 2, 1),
('INF201', 'Algorithme', 2, 4, 1, 2, 1),
('INF202', 'Bases de données', 2, 4, 1, 2, 1),
('INF203', 'Programmation Web', 2.5, 5, 1, 2, 1),
('INF204', 'Réseaux', 2, 4, 1, 2, 1);

-- Utilisateurs par défaut (mot de passe: 1234 hashé en simple pour demo)
-- En production, utiliser bcrypt ou argon2
INSERT INTO users (username, password_hash, full_name, email, role, active) VALUES
('prof1', '1234', 'Dr. Messi', 'messi@univ-yaounde.cm', 'enseignant', 1),
('prof2', '1234', 'Pr. Ngando', 'ngando@univ-yaounde.cm', 'enseignant', 1),
('jury1', '1234', 'M. Nkondock', 'nkondock@univ-yaounde.cm', 'jury', 1),
('jury2', '1234', 'Mme. Tchinda', 'tchinda@univ-yaounde.cm', 'jury', 1);

-- Paramètres système
INSERT INTO parametres (cle, valeur, description) VALUES
('seuil_ca', '50', 'Seuil minimum pour capacité (sur 100)'),
('seuil_cant', '35', 'Seuil minimum pour capacité avec dette'),
('seuil_el', '0', 'Seuil pour élimination'),
('note_elimination', '0', 'Note éliminatoire'),
('mention_a', '16', 'Seuil mention Assez Bien'),
('mention_b', '14', 'Seuil mention Bien'),
('mention_ab', '12', 'Seuil mention Assez Bien'),
('mention_c', '10', 'Seuil mention Passable'),
('universite_nom', 'Université de Yaoundé I', 'Nom de l''université'),
('universite_sigle', 'UY1', 'Sigle de l''université');

-- ============================================
-- VUES UTILES
-- ============================================

-- Vue pour les notes avec détails complets
CREATE VIEW IF NOT EXISTS vue_notes_completes AS
SELECT 
    n.id,
    n.valeur,
    n.valeur_sur_bareme,
    n.statut,
    n.commentaire,
    n.date_saisie,
    n.date_validation,
    e.matricule,
    e.nom || ' ' || e.prenom as etudiant_nom_complet,
    ue.code as ue_code,
    ue.nom as ue_nom,
    te.code as type_eval_code,
    te.nom as type_eval_nom,
    ens.full_name as enseignant_nom,
    f.code as filiere_code,
    nv.code as niveau_code
FROM notes n
JOIN etudiants e ON n.etudiant_id = e.id
JOIN unites_enseignement ue ON n.ue_id = ue.id
JOIN types_evaluation te ON n.type_evaluation_id = te.id
JOIN users ens ON n.enseignant_id = ens.id
LEFT JOIN filieres f ON e.filiere_id = f.id
LEFT JOIN niveaux nv ON e.niveau_id = nv.id;

-- Vue pour les résultats par UE
CREATE VIEW IF NOT EXISTS vue_resultats_ue AS
SELECT 
    e.id as etudiant_id,
    e.matricule,
    e.nom || ' ' || e.prenom as etudiant_nom_complet,
    ue.id as ue_id,
    ue.code as ue_code,
    ue.nom as ue_nom,
    ue.coefficient,
    s.id as semestre_id,
    s.numero as semestre,
    s.annee_academique,
    n_cc.valeur as note_cc,
    n_tp.valeur as note_tp,
    n_ee.valeur * 2 as note_ee_sur_40,
    n_ep.valeur * 2 as note_ep_sur_40,
    COALESCE(n_cc.valeur, 0) as cc,
    COALESCE(n_ee.valeur * 2, 0) as ee,
    COALESCE(n_ep.valeur * 2, 0) as ep,
    COALESCE(n_cc.valeur, 0) + COALESCE(n_ee.valeur * 2, 0) + COALESCE(n_ep.valeur * 2, 0) as total_sur_100,
    f.code as filiere,
    nv.code as niveau
FROM etudiants e
JOIN unites_enseignement ue ON ue.id = ue.id
JOIN semestres s ON s.actif = 1
LEFT JOIN filieres f ON e.filiere_id = f.id
LEFT JOIN niveaux nv ON e.niveau_id = nv.id
LEFT JOIN notes n_cc ON n_cc.etudiant_id = e.id AND n_cc.ue_id = ue.id AND n_cc.type_evaluation_id = 1
LEFT JOIN notes n_tp ON n_tp.etudiant_id = e.id AND n_tp.ue_id = ue.id AND n_tp.type_evaluation_id = 2
LEFT JOIN notes n_ee ON n_ee.etudiant_id = e.id AND n_ee.ue_id = ue.id AND n_ee.type_evaluation_id = 3
LEFT JOIN notes n_ep ON n_ep.etudiant_id = e.id AND n_ep.ue_id = ue.id AND n_ep.type_evaluation_id = 4;

-- Vue pour les statistiques PV
CREATE VIEW IF NOT EXISTS vue_stats_pv AS
SELECT 
    ue.id as ue_id,
    ue.code as ue_code,
    ue.nom as ue_nom,
    s.id as semestre_id,
    s.annee_academique,
    COUNT(DISTINCT e.id) as effectif_total,
    SUM(CASE WHEN dj.decision = 'CA' THEN 1 ELSE 0 END) as nb_ca,
    SUM(CASE WHEN dj.decision = 'CANT' THEN 1 ELSE 0 END) as nb_cant,
    SUM(CASE WHEN dj.decision = 'NC' THEN 1 ELSE 0 END) as nb_nc,
    SUM(CASE WHEN dj.decision = 'EL' THEN 1 ELSE 0 END) as nb_el,
    ROUND(100.0 * SUM(CASE WHEN dj.decision = 'CA' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT e.id), 0), 2) as pct_ca,
    ROUND(100.0 * SUM(CASE WHEN dj.decision = 'CANT' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT e.id), 0), 2) as pct_cant,
    ROUND(100.0 * SUM(CASE WHEN dj.decision = 'NC' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT e.id), 0), 2) as pct_nc,
    ROUND(100.0 * SUM(CASE WHEN dj.decision = 'EL' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT e.id), 0), 2) as pct_el
FROM unites_enseignement ue
JOIN semestres s ON s.actif = 1
LEFT JOIN etudiants e ON e.filiere_id = ue.filiere_id AND e.niveau_id = ue.niveau_id
LEFT JOIN decisions_jury dj ON dj.etudiant_id = e.id AND dj.ue_id = ue.id AND dj.semestre_id = s.id
GROUP BY ue.id, ue.code, ue.nom, s.id, s.annee_academique;
