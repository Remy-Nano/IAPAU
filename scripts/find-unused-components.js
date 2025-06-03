#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Dossiers à analyser
const COMPONENT_DIRS = [
  "src/components/chat",
  "src/components/student",
  "src/components/examiner",
  "src/components/auth",
  "src/components/admin",
  "src/components/ui",
];

// Extensions de fichiers à analyser
const EXTENSIONS = [".tsx", ".ts"];

// Fonction pour obtenir tous les fichiers de composants
function getComponentFiles(dirs) {
  const files = [];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) return;

    const dirFiles = fs.readdirSync(dir, { withFileTypes: true });

    dirFiles.forEach((file) => {
      if (file.isFile() && EXTENSIONS.includes(path.extname(file.name))) {
        const filePath = path.join(dir, file.name);
        const componentName = path.basename(file.name, path.extname(file.name));
        files.push({ path: filePath, name: componentName });
      }
    });
  });

  return files;
}

// Fonction pour extraire les noms d'exports d'un fichier
function getExportsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const exports = [];

    // Regex pour les exports par défaut
    const defaultExportMatch = content.match(
      /export\s+default\s+(?:function\s+)?(\w+)/
    );
    if (defaultExportMatch) {
      exports.push(defaultExportMatch[1]);
    }

    // Regex pour les exports nommés
    const namedExportMatches = content.matchAll(
      /export\s+(?:const|function|class|interface|type)\s+(\w+)/g
    );
    for (const match of namedExportMatches) {
      exports.push(match[1]);
    }

    // Regex pour les exports destructurés
    const destructuredExportMatches = content.matchAll(
      /export\s*{\s*([^}]+)\s*}/g
    );
    for (const match of destructuredExportMatches) {
      const exportsList = match[1]
        .split(",")
        .map((e) => e.trim().split(" as ")[0]);
      exports.push(...exportsList);
    }

    return exports;
  } catch (error) {
    console.error(
      `Erreur lors de la lecture du fichier ${filePath}:`,
      error.message
    );
    return [];
  }
}

// Fonction pour vérifier si un composant est utilisé
function isComponentUsed(componentName, componentPath) {
  try {
    // Utiliser ripgrep pour chercher les imports du composant
    const result = execSync(
      `rg -l "${componentName}" src/ --type tsx --type ts --type js --type jsx`,
      {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"], // Ignore stderr
      }
    );

    const files = result
      .trim()
      .split("\n")
      .filter((f) => f && f !== componentPath);
    return files.length > 0;
  } catch (error) {
    // Si ripgrep n'est pas disponible, utiliser grep
    try {
      const result = execSync(
        `grep -r "${componentName}" src/ --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx"`,
        {
          encoding: "utf8",
          stdio: ["pipe", "pipe", "ignore"],
        }
      );

      const lines = result
        .trim()
        .split("\n")
        .filter((line) => {
          const filePath = line.split(":")[0];
          return filePath !== componentPath;
        });

      return lines.length > 0;
    } catch (grepError) {
      // En dernier recours, vérification manuelle simple
      return false;
    }
  }
}

function main() {
  console.log("🔍 Recherche des composants non utilisés...\n");

  const componentFiles = getComponentFiles(COMPONENT_DIRS);
  const unusedComponents = [];
  const usedComponents = [];

  componentFiles.forEach(({ path: filePath, name: componentName }) => {
    const exports = getExportsFromFile(filePath);

    exports.forEach((exportName) => {
      if (isComponentUsed(exportName, filePath)) {
        usedComponents.push({ file: filePath, component: exportName });
      } else {
        unusedComponents.push({ file: filePath, component: exportName });
      }
    });
  });

  // Affichage des résultats
  if (unusedComponents.length > 0) {
    console.log("❌ Composants potentiellement non utilisés:");
    unusedComponents.forEach(({ file, component }) => {
      console.log(`   • ${component} dans ${file}`);
    });
    console.log();
  } else {
    console.log("✅ Aucun composant non utilisé détecté!\n");
  }

  console.log(`📊 Résumé:`);
  console.log(`   • Composants utilisés: ${usedComponents.length}`);
  console.log(`   • Composants non utilisés: ${unusedComponents.length}`);
  console.log(
    `   • Total analysé: ${usedComponents.length + unusedComponents.length}`
  );

  if (unusedComponents.length > 0) {
    console.log("\n💡 Pour supprimer les composants non utilisés:");
    unusedComponents.forEach(({ file }) => {
      console.log(`   rm "${file}"`);
    });
  }
}

if (require.main === module) {
  main();
}
