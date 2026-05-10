/**
 * actualizar-galeria.js
 * Lee todas las fotos de /galeria y actualiza la sección #trabajos en index.html.
 * Uso: npm run galeria
 */

const fs   = require('fs');
const path = require('path');

const GALERIA_DIR = path.join(__dirname, 'galeria');
const HTML_FILE   = path.join(__dirname, 'index.html');
const EXTENSIONS  = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];

// Convierte nombre de archivo a etiqueta legible
// "galpon-industrial.jpg" → "Galpón industrial"
function nombreAEtiqueta(filename) {
  const base = path.basename(filename, path.extname(filename));

  // Si parece un nombre genérico de cámara (IMG_xxxx, DSC_xxxx, etc.), devolvemos label genérico
  if (/^(img|dsc|dsc|photo|picture|image|foto)[-_]?\d+$/i.test(base)) {
    return 'Trabajo realizado';
  }

  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    // corrige tildes comunes
    .replace(/\bGalpon\b/g, 'Galpón')
    .replace(/\bTecho\b/g, 'Techo')
    .replace(/\bCamara\b/g, 'Cámara')
    .replace(/\bAislacion\b/g, 'Aislación')
    .replace(/\bImpermeabilizacion\b/g, 'Impermeabilización')
    .replace(/\bRecubrimiento\b/g, 'Recubrimiento')
    .replace(/\bResidencial\b/g, 'Residencial')
    .replace(/\bIndustrial\b/g, 'Industrial')
    .replace(/\bAgropecuario\b/g, 'Agropecuario')
    .replace(/\bFrio\b/g, 'Frío')
    .replace(/\bTermica\b/g, 'Térmica');
}

// Asigna una categoría/tag en base al nombre del archivo
function nombreATag(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('galpon') || lower.includes('industrial'))  return 'Industrial';
  if (lower.includes('terraza') || lower.includes('residencial')) return 'Residencial';
  if (lower.includes('camara') || lower.includes('frio'))         return 'Frío industrial';
  if (lower.includes('silo') || lower.includes('agro') || lower.includes('campo')) return 'Agropecuario';
  if (lower.includes('imperme') || lower.includes('techo'))       return 'Impermeabilización';
  if (lower.includes('pared') || lower.includes('muro'))          return 'Aislación';
  if (lower.includes('piso') || lower.includes('recubri'))        return 'Recubrimiento';
  return 'Trabajo realizado';
}

// Lee las fotos de la carpeta galeria/
const fotos = fs.readdirSync(GALERIA_DIR)
  .filter(f => EXTENSIONS.includes(path.extname(f)))
  .sort();

if (fotos.length === 0) {
  console.log('⚠  No hay fotos en /galeria. Agregá imágenes y volvé a correr el script.');
  process.exit(0);
}

console.log(`📸 ${fotos.length} foto(s) encontrada(s) en /galeria:`);
fotos.forEach(f => console.log('   •', f));

// Genera el HTML de las cards
const cards = fotos.map(foto => {
  const ruta    = `galeria/${foto}`;
  const etiq    = nombreAEtiqueta(foto);
  const tag     = nombreATag(foto);

  return `
      <div class="gallery-card reveal">
        <div class="gallery-bg" style="background-image: url('${ruta}'); background-size: cover; background-position: center;"></div>
        <div class="gallery-overlay">
          <span class="gallery-tag">${tag}</span>
          <div class="gallery-title">${etiq}</div>
        </div>
      </div>`.trimStart();
}).join('\n\n      ');

const nuevoGrid = `<div class="gallery-grid">

      ${cards}

    </div>`;

// Reemplaza el bloque entre los marcadores en index.html
let html = fs.readFileSync(HTML_FILE, 'utf8');

const MARKER_START = '<!-- GALERIA:START -->';
const MARKER_END   = '<!-- GALERIA:END -->';

if (!html.includes(MARKER_START) || !html.includes(MARKER_END)) {
  console.error('❌ No se encontraron los marcadores <!-- GALERIA:START --> y <!-- GALERIA:END --> en index.html.');
  console.error('   Asegurate de que la sección de galería tenga esos comentarios.');
  process.exit(1);
}

const before = html.substring(0, html.indexOf(MARKER_START) + MARKER_START.length);
const after  = html.substring(html.indexOf(MARKER_END));
const nuevo  = `${before}\n    ${nuevoGrid}\n    ${after}`;

fs.writeFileSync(HTML_FILE, nuevo, 'utf8');
console.log(`✅ index.html actualizado con ${fotos.length} foto(s).`);
console.log('   Próximo paso: git add . && git commit -m "galeria: actualizar fotos" && git push');
