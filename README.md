# ATPL Study — Site local de révision

## Structure du projet

```
atpl-site/
├── index.html              ← Page d'accueil (grille des matières)
├── style.css               ← CSS unique partagé par toutes les pages
├── main.js                 ← JavaScript partagé (sidebar, tabs, quickcheck…)
├── _TEMPLATE_COURS.html    ← Template vierge à dupliquer pour chaque cours
│
├── meteorologie/
│   ├── index.html          ← Liste des cours de la matière
│   ├── MET01.html          ← Cours complet + fiche synthèse
│   ├── MET02.html
│   └── MET03.html
│
├── navigation/
│   ├── index.html
│   ├── NAV01.html
│   └── NAV02.html
│
├── droit-aerien/
│   ├── index.html
│   └── AL01.html
│
├── instruments/
├── radio-nav/
├── communications/
├── performances/
└── facteurs-humains/
```

## Lancer le site

Ouvrir simplement `index.html` dans un navigateur.
Sur macOS/Linux, depuis le terminal dans le dossier `atpl-site/` :

```bash
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Ou double-cliquer sur `index.html` dans l'explorateur de fichiers.

## Créer un nouveau cours

1. Copier `_TEMPLATE_COURS.html` dans le bon dossier de matière
   → Exemple : `meteorologie/MET04.html`

2. Remplacer tous les `XXX01` / `✏️` par le contenu réel

3. Ajouter le lien dans `index.html` de la matière
   → Dans la sidebar + dans la liste des cours

4. Ajouter l'entrée dans `SEARCH_INDEX` dans `main.js`
   ```js
   { code: 'MET04', matiere: 'Météorologie', titre: 'Titre', url: 'meteorologie/MET04.html' },
   ```

## Codes matières recommandés

| Matière           | Préfixe |
|-------------------|---------|
| Navigation        | NAV     |
| Droit Aérien      | AL      |
| Météorologie      | MET     |
| Performances      | PERF    |
| Instruments       | INS     |
| Radio-Navigation  | RNV     |
| Communications    | COM     |
| Facteurs Humains  | FH      |

## Composants disponibles

### Encadrés
```html
<div class="box box-retenir">  <!-- vert -->
<div class="box box-piege">    <!-- rouge -->
<div class="box box-info">     <!-- bleu -->
<div class="box box-formule">  <!-- jaune/or -->
```

### Formule display
```html
<div class="formula-display">T = 15 − 0,0065 × H</div>
```

### Chips de valeurs
```html
<div class="values-grid">
  <div class="value-chip">
    <span class="val">15 °C</span>
    <span class="val-label">Temp ISA MSL</span>
  </div>
</div>
```

### Tags
```html
<span class="tag tag-oaci">OACI</span>
<span class="tag tag-easa">EASA</span>
<span class="tag tag-fr">France</span>
<span class="tag tag-exam">Exam fréquent</span>
```

### Intégration de figures (matplotlib)
Générer les PNG dans `figures/` puis :
```html
<div class="fig-container">
  <img src="../figures/NOM.png" alt="Description">
  <div class="fig-caption">Fig. X — Description</div>
</div>
```

## Intégration avec le prompt ATPL (docx)

Le workflow recommandé :
1. Générer le `.docx` avec ton prompt ATPL existant
2. Copier les sections dans `_TEMPLATE_COURS.html`
3. Convertir les encadrés Word → classes HTML (`box-retenir`, etc.)
4. Les figures `.png` générées par matplotlib s'intègrent directement

À terme, le prompt peut générer directement le HTML en mode alternatif.
