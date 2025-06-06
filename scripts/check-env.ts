import fs from 'fs';
import path from 'path';

const rootEnvPath = path.join(process.cwd(), '.env');
const srcEnvPath = path.join(process.cwd(), 'src', '.env');

console.log('Vérification des fichiers .env :');

// Vérifier si le fichier .env existe à la racine
if (fs.existsSync(rootEnvPath)) {
  console.log('✅ Fichier .env trouvé à la racine');
  const content = fs.readFileSync(rootEnvPath, 'utf8');
  console.log('Contenu du fichier .env à la racine :');
  console.log(content);
} else {
  console.log('❌ Fichier .env non trouvé à la racine');
}

// Vérifier si le fichier .env existe dans le dossier src
if (fs.existsSync(srcEnvPath)) {
  console.log('❌ Fichier .env trouvé dans le dossier src (il devrait être à la racine)');
  const content = fs.readFileSync(srcEnvPath, 'utf8');
  console.log('Contenu du fichier .env dans src :');
  console.log(content);
}
