import { writeFile } from 'node:fs/promises';
import { createCharacterSheet } from '../src/lib/character-sheet.js';

const sampleData = {
  nombre: 'Juan Cruz Sosa',
  apodo: 'El Zorro del Salado',
  procedencia: 'Dolores, Buenos Aires',
  mate: '+1',
  viveza: '0',
  facon: '-1',
  guapura: [true, true, false],
  salud: [true, true, false, false, false],
  estabilidad: [true, false, false, false, false],
  condiciones: {
    lerdo: false,
    cagao: true,
    aturdio: false,
  },
  caballo: 'Malacara, zaino overo',
  equipo: 'Facón de plata, boleadoras, poncho pampa, mate y yerba. Caballo ensillado.',
  rasgos:
    'Gaucho errante del Salado. Desconfía de los forasteros, pero nunca abandona a un compañero.\nBusca a su hermano desaparecido en las tolderías del sur.',
  notas:
    'Sospecha que el cacique aliado oculta algo. Debe una noche de mate y payada en la pulpería de Dolores.',
};

const bytes = await createCharacterSheet(sampleData);
const outputPath = '/tmp/pampa-sheet-preview.pdf';

await writeFile(outputPath, bytes);
console.log(`PDF generated at ${outputPath}`);
