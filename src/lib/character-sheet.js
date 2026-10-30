import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_MARGIN = 25;

const INK = rgb(0.141, 0.122, 0.102);
const MUTED = rgb(0.427, 0.384, 0.341);
const RULE = rgb(0.851, 0.804, 0.714);
const BORDER = rgb(0.52, 0.48, 0.43);
const SECTION_FILL = rgb(0.984, 0.978, 0.965);

const CHOICES = ['+1', '0', '-1'];

function sanitizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/\u00a0/g, ' ')
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '');
}

function asText(value) {
  return sanitizeText(value).trim();
}

function asMultilineText(value) {
  return sanitizeText(value).trim();
}

function asBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'on';
}

function asChoice(value) {
  const normalized = value === null || value === undefined ? '' : String(value).trim();
  if (normalized === '+1' || normalized === '1') return '+1';
  if (normalized === '0') return '0';
  if (normalized === '-1') return '-1';
  return '';
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export async function createCharacterSheet(data = {}) {
  const source = asObject(data);
  const condiciones = asObject(source.condiciones);
  const guapura = Array.isArray(source.guapura) ? source.guapura : [];
  const salud = Array.isArray(source.salud) ? source.salud : [];
  const estabilidad = Array.isArray(source.estabilidad) ? source.estabilidad : [];

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Pampa Primigenia - Hoja de Personaje');
  pdfDoc.setAuthor('Sierpes del Sur');
  pdfDoc.setSubject('Hoja de personaje editable');
  pdfDoc.setCreator('Pampa Primigenia');
  pdfDoc.setProducer('pdf-lib');

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const form = pdfDoc.getForm();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text, x, y, size, options = {}) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: INK,
      ...options,
    });
  };

  const drawSection = (top, height, label, x = MARGIN, width = CONTENT_WIDTH) => {
    page.drawRectangle({
      x,
      y: top - height,
      width,
      height,
      borderWidth: 0.7,
      borderColor: RULE,
      color: SECTION_FILL,
    });
    page.drawText(label, {
      x: x + 10,
      y: top - 13,
      size: 8,
      font: bold,
      color: INK,
    });
    return top - 18;
  };

  const drawFieldLabel = (text, x, baselineY) => {
    page.drawText(text, {
      x,
      y: baselineY,
      size: 7,
      font,
      color: MUTED,
    });
  };

  const addTextField = (name, x, y, width, height, value, multiline = false) => {
    const field = form.createTextField(name);
    if (multiline) field.enableMultiline();
    field.addToPage(page, {
      x,
      y,
      width,
      height,
      borderWidth: 0.6,
      borderColor: BORDER,
      textColor: INK,
    });
    field.setText(asMultilineText(value));
    field.setFontSize(10);
    return field;
  };

  const addDropdown = (name, x, y, value) => {
    const field = form.createDropdown(name);
    field.addOptions(CHOICES);
    field.addToPage(page, {
      x,
      y,
      width: 60,
      height: 22,
      borderWidth: 0.6,
      borderColor: BORDER,
      textColor: INK,
    });
    const selected = asChoice(value);
    if (selected) field.select(selected);
    field.setFontSize(10);
    return field;
  };

  const addCheckBox = (name, x, y, checked) => {
    const field = form.createCheckBox(name);
    field.addToPage(page, {
      x,
      y,
      width: 13,
      height: 13,
      borderWidth: 0.6,
      borderColor: BORDER,
    });
    if (checked) field.check();
    return field;
  };

  const drawCheckBoxLabel = (text, x, y, size = 8.5) => {
    page.drawText(text, {
      x,
      y: y + 3.5,
      size,
      font,
      color: INK,
    });
  };

  const titleBaseline = PAGE_HEIGHT - MARGIN - 1.89;
  page.drawText('PAMPA PRIMIGENIA', {
    x: MARGIN,
    y: titleBaseline,
    size: 22,
    font: bold,
    color: INK,
  });

  const headerRight = 'HOJA DE PERSONAJE';
  const headerRightWidth = bold.widthOfTextAtSize(headerRight, 9);
  page.drawText(headerRight, {
    x: PAGE_WIDTH - MARGIN - headerRightWidth,
    y: titleBaseline,
    size: 9,
    font: bold,
    color: INK,
  });

  page.drawLine({
    start: { x: MARGIN, y: 789 },
    end: { x: PAGE_WIDTH - MARGIN, y: 789 },
    thickness: 0.8,
    color: RULE,
  });

  page.drawText('Pulp Austral - Powered by the Apocalypse', {
    x: MARGIN,
    y: 777,
    size: 7.5,
    font,
    color: MUTED,
  });

  const datosTop = 760;
  const datosContentTop = drawSection(datosTop, 89, 'DATOS');
  drawFieldLabel('NOMBRE', MARGIN, datosContentTop - 9);
  addTextField('nombre', MARGIN, datosContentTop - 32, 310, 20, source.nombre);
  drawFieldLabel('APODO', 360, datosContentTop - 9);
  addTextField('apodo', 360, datosContentTop - 32, 195, 20, source.apodo);
  drawFieldLabel('PROCEDENCIA', MARGIN, datosContentTop - 45);
  addTextField('procedencia', MARGIN, datosContentTop - 68, 240, 20, source.procedencia);

  const atributosTop = datosTop - 89 - 7;
  const atributosContentTop = drawSection(atributosTop, 55, 'ATRIBUTOS');
  const attributeColumns = [
    {
      name: 'mate',
      label: 'MATE - Carisma, empatía y habilidad social.',
      value: source.mate,
    },
    {
      name: 'viveza',
      label: 'VIVEZA - Intelecto, astucia y percepción.',
      value: source.viveza,
    },
    {
      name: 'facon',
      label: 'FACÓN - Fuerza, agilidad y combate.',
      value: source.facon,
    },
  ];

  attributeColumns.forEach((attribute, index) => {
    const x = MARGIN + index * (CONTENT_WIDTH / 3);
    page.drawText(attribute.label, {
      x,
      y: atributosContentTop - 8,
      size: 7,
      font,
      color: INK,
    });
    addDropdown(attribute.name, x, atributosContentTop - 33, attribute.value);
  });

  const estadoRowTop = atributosTop - 55 - 7;
  const estadoRowHeight = 72;
  const halfWidth = (CONTENT_WIDTH - 15) / 2;
  const guapuraContentTop = drawSection(estadoRowTop, estadoRowHeight, 'GUAPURA');
  page.drawText('Guapura (máximo 3)', {
    x: MARGIN + 10,
    y: guapuraContentTop - 9,
    size: 8,
    font,
    color: MUTED,
  });
  addCheckBox('guapura_1', MARGIN + 10, guapuraContentTop - 31, asBoolean(guapura[0]));
  addCheckBox('guapura_2', MARGIN + 40, guapuraContentTop - 31, asBoolean(guapura[1]));
  addCheckBox('guapura_3', MARGIN + 70, guapuraContentTop - 31, asBoolean(guapura[2]));

  const estadoX = MARGIN + halfWidth + 15;
  const estadoContentTop = drawSection(
    estadoRowTop,
    estadoRowHeight,
    'ESTADO',
    estadoX,
    halfWidth
  );

  drawFieldLabel('SALUD (5)', estadoX + 10, estadoContentTop - 6);
  for (let index = 0; index < 5; index += 1) {
    addCheckBox(
      `salud_${index + 1}`,
      estadoX + 10 + index * 20,
      estadoContentTop - 31,
      asBoolean(salud[index])
    );
  }

  drawFieldLabel('ESTABILIDAD (5)', estadoX + 115, estadoContentTop - 6);
  for (let index = 0; index < 5; index += 1) {
    addCheckBox(
      `estabilidad_${index + 1}`,
      estadoX + 115 + index * 20,
      estadoContentTop - 31,
      asBoolean(estabilidad[index])
    );
  }

  const condicionesTop = estadoRowTop - estadoRowHeight - 7;
  const condicionesContentTop = drawSection(condicionesTop, 42, 'CONDICIONES');
  const condicionesItems = [
    { name: 'cond_lerdo', label: 'Lerdo (-2 MATE)', checked: asBoolean(condiciones.lerdo) },
    { name: 'cond_cagao', label: 'Cagao (-2 FACÓN)', checked: asBoolean(condiciones.cagao) },
    {
      name: 'cond_aturdio',
      label: 'Aturdío (-2 VIVEZA)',
      checked: asBoolean(condiciones.aturdio),
    },
  ];

  condicionesItems.forEach((item, index) => {
    const x = MARGIN + 10 + index * 160;
    addCheckBox(item.name, x, condicionesContentTop - 20, item.checked);
    drawCheckBoxLabel(item.label, x + 18, condicionesContentTop - 20);
  });

  const equipoTop = condicionesTop - 42 - 7;
  const equipoContentTop = drawSection(equipoTop, 188, 'EQUIPO Y CABALLO');
  drawFieldLabel('CABALLO', MARGIN + 10, equipoContentTop - 7);
  addTextField('caballo', MARGIN + 10, equipoContentTop - 30, CONTENT_WIDTH - 20, 20, source.caballo);
  drawFieldLabel('EQUIPO', MARGIN + 10, equipoContentTop - 42);
  addTextField('equipo', MARGIN + 10, equipoContentTop - 165, CONTENT_WIDTH - 20, 120, source.equipo, true);

  const historiaTop = equipoTop - 188 - 7;
  const historiaContentTop = drawSection(historiaTop, 237, 'HISTORIA Y NOTAS');
  drawFieldLabel('RASGOS E HISTORIA', MARGIN + 10, historiaContentTop - 6);
  addTextField(
    'rasgos',
    MARGIN + 10,
    historiaContentTop - 99,
    CONTENT_WIDTH - 20,
    90,
    source.rasgos,
    true
  );
  drawFieldLabel('NOTAS', MARGIN + 10, historiaContentTop - 107);
  addTextField(
    'notas',
    MARGIN + 10,
    historiaContentTop - 209,
    CONTENT_WIDTH - 20,
    99,
    source.notas,
    true
  );

  form.updateFieldAppearances(font);

  return await pdfDoc.save();
}
