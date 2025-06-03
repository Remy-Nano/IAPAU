#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 ANALYSE ARCHITECTURE API NEXT.JS/MERN\n");

// Analyser les routes API
const apiDir = "src/app/api";
const libDir = "src/lib";

function getRouteFiles(dir) {
  const routes = [];

  function scanDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    items.forEach((item) => {
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        scanDir(fullPath);
      } else if (item.name === "route.ts") {
        routes.push(fullPath);
      }
    });
  }

  scanDir(dir);
  return routes;
}

function analyzeRoute(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Check si la route contient de la logique métier
  const businessLogicPatterns = [
    /bcrypt\.(hash|compare)/,
    /\.find\(/,
    /\.create\(/,
    /\.findOne\(/,
    /\.findById\(/,
    /new Date\(/,
    /validat.*Schema/i,
    /if.*length.*>.*10/,
    /trim\(\)/,
    /toLowerCase\(\)/,
  ];

  const hasBusinessLogic = businessLogicPatterns.some((pattern) =>
    pattern.test(content)
  );

  // Check imports de services/controllers
  const usesServices = /from.*\/lib\/(services|controllers)\//.test(content);

  // Check taille du fichier
  const lines = content.split("\n").length;

  return {
    path: filePath.replace("src/app/api/", ""),
    hasBusinessLogic,
    usesServices,
    lines,
    isTooLong: lines > 50,
    score: getRouteScore(hasBusinessLogic, usesServices, lines),
  };
}

function getRouteScore(hasBusinessLogic, usesServices, lines) {
  let score = 100;

  if (hasBusinessLogic) score -= 40;
  if (!usesServices) score -= 30;
  if (lines > 50) score -= 20;
  if (lines > 100) score -= 20;

  return Math.max(0, score);
}

function analyzeLibStructure() {
  const services = fs.existsSync(path.join(libDir, "services"))
    ? fs
        .readdirSync(path.join(libDir, "services"))
        .filter((f) => f.endsWith(".ts")).length
    : 0;

  const controllers = fs.existsSync(path.join(libDir, "controllers"))
    ? fs
        .readdirSync(path.join(libDir, "controllers"))
        .filter((f) => f.endsWith(".ts")).length
    : 0;

  const models = fs.existsSync(path.join(libDir, "models"))
    ? fs
        .readdirSync(path.join(libDir, "models"))
        .filter((f) => f.endsWith(".ts")).length
    : 0;

  const utils = fs.existsSync(path.join(libDir, "utils"))
    ? fs
        .readdirSync(path.join(libDir, "utils"))
        .filter((f) => f.endsWith(".ts")).length
    : 0;

  return { services, controllers, models, utils };
}

// Analyse principale
const routes = getRouteFiles(apiDir);
const routeAnalysis = routes.map(analyzeRoute);
const libStructure = analyzeLibStructure();

// Résultats
console.log(`📊 ROUTES API ANALYSÉES: ${routes.length}\n`);

console.log("🎯 SCORES PAR ROUTE:");
routeAnalysis
  .sort((a, b) => a.score - b.score)
  .forEach((route) => {
    const emoji = route.score >= 80 ? "✅" : route.score >= 60 ? "⚠️" : "❌";
    console.log(`${emoji} ${route.path.padEnd(30)} Score: ${route.score}/100`);

    if (route.hasBusinessLogic)
      console.log(`    💥 Contient de la logique métier`);
    if (!route.usesServices) console.log(`    📦 N'utilise pas de services`);
    if (route.isTooLong)
      console.log(`    📏 Fichier trop long (${route.lines} lignes)`);
  });

const avgScore = Math.round(
  routeAnalysis.reduce((sum, r) => sum + r.score, 0) / routeAnalysis.length
);
const goodRoutes = routeAnalysis.filter((r) => r.score >= 80).length;
const badRoutes = routeAnalysis.filter((r) => r.score < 60).length;

console.log(`\n📈 SCORE MOYEN: ${avgScore}/100`);
console.log(`✅ Routes bien architecturées: ${goodRoutes}/${routes.length}`);
console.log(`❌ Routes à refactoriser: ${badRoutes}/${routes.length}`);

console.log(`\n🏗️ STRUCTURE /src/lib/:`);
console.log(`📦 Services: ${libStructure.services}`);
console.log(`🎮 Controllers: ${libStructure.controllers}`);
console.log(`🗃️ Models: ${libStructure.models}`);
console.log(`🔧 Utils: ${libStructure.utils}`);

console.log(`\n🎉 RECOMMANDATIONS:`);
if (avgScore >= 80) {
  console.log("✅ Architecture API excellente !");
} else if (avgScore >= 60) {
  console.log("⚠️ Architecture API correcte, quelques améliorations possibles");
} else {
  console.log("❌ Architecture API à refactoriser");
}

if (badRoutes > 0) {
  console.log(
    `🔧 Refactoriser ${badRoutes} route(s) pour extraire la logique métier`
  );
}

if (libStructure.services < 3) {
  console.log("📦 Créer plus de services pour séparer la logique métier");
}
