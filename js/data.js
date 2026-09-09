/*
 * Datos del pénsum de Ingeniería de Sistemas (UNEXPO, Vice-Rectorado Luis Caballero Mejías,
 * versión Diciembre 2018). Estructura pura de datos: sin lógica de negocio ni DOM.
 *
 * Cada asignatura:
 *   code      código de la materia (string). Las materias "Electiva" sin código fijo
 *             usan un slotId (ver más abajo) en vez de code hasta que el usuario elige una.
 *   name      nombre de la asignatura
 *   uc        unidades de crédito
 *   reqText   texto de requisitos tal como aparece en el pénsum (para mostrar en la tabla)
 *   reqs      arreglo de cláusulas de requisito, evaluadas todas en conjunto (AND):
 *               { type: 'course',   code }    -> la materia <code> debe estar APROBADA
 *               { type: 'parallel', code }    -> la materia <code> debe estar APROBADA,
 *                                                CURSANDO o POR CURSAR (P(...) = paralelo)
 *               { type: 'uca',      amount }  -> unidades de crédito aprobadas acumuladas >= amount
 *               { type: 'all' }               -> todas las asignaturas de semestres I-IX aprobadas
 *   isElective  true si la casilla es un cupo de electiva a elegir
 *   slotId      identificador único del cupo de electiva (solo si isElective)
 *
 * NOTA sobre el documento fuente: en "MECÁNICA RACIONAL" y "SISTEMAS ELÉCTRICOS II" el PDF
 * escaneado lista un requisito "11031", código que no existe en ningún otro renglón del pénsum.
 * Se interpretó como un error de digitalización de "11034" (MATEMÁTICA III), que es el único
 * requisito coherente con la secuencia de materias, y así se codificó en `reqs`.
 */

const SEMESTERS = [
  {
    numero: 'I',
    romano: 'I',
    subjects: [
      { code: '11015', name: 'MATEMÁTICA I', uc: 5, reqText: '', reqs: [] },
      { code: '14012', name: 'DIBUJO I', uc: 2, reqText: '', reqs: [] },
      { code: '21012', name: 'INGLÉS I', uc: 2, reqText: '', reqs: [] },
      { code: '13013', name: 'QUÍMICA', uc: 3, reqText: '', reqs: [] },
      { code: '22012', name: 'LENGUAJE Y COMUNICACIÓN I', uc: 2, reqText: '', reqs: [] },
      { code: '11052', name: 'LÓGICA', uc: 2, reqText: '', reqs: [] },
      { code: '26211', name: 'EDUCACIÓN FÍSICA BASE', uc: 1, reqText: '', reqs: [] },
    ],
  },
  {
    numero: 'II',
    romano: 'II',
    subjects: [
      { code: '11025', name: 'MATEMÁTICA II', uc: 5, reqText: '11015', reqs: [{ type: 'course', code: '11015' }] },
      { code: '12014', name: 'FÍSICA I', uc: 4, reqText: '11015', reqs: [{ type: 'course', code: '11015' }] },
      { code: '12031', name: 'LABORATORIO DE FÍSICA I', uc: 1, reqText: 'P(12014)', reqs: [{ type: 'parallel', code: '12014' }] },
      { code: '13021', name: 'LABORATORIO DE QUÍMICA', uc: 1, reqText: '13013', reqs: [{ type: 'course', code: '13013' }] },
      { code: '51012', name: 'TECNOLOGÍA DE MATERIALES', uc: 2, reqText: '13013 / P(12014)', reqs: [{ type: 'course', code: '13013' }, { type: 'parallel', code: '12014' }] },
      { code: '21022', name: 'INGLÉS II', uc: 2, reqText: '21012', reqs: [{ type: 'course', code: '21012' }] },
      { code: '14022', name: 'DIBUJO II', uc: 2, reqText: '14012', reqs: [{ type: 'course', code: '14012' }] },
      { code: '22022', name: 'LENGUAJE Y COMUNICACIÓN II', uc: 2, reqText: '22012', reqs: [{ type: 'course', code: '22012' }] },
      { code: 'DEP-I', name: 'DEPORTES I', uc: 1, reqText: '26211', reqs: [{ type: 'course', code: '26211' }] },
    ],
  },
  {
    numero: 'III',
    romano: 'III',
    subjects: [
      { code: '11034', name: 'MATEMÁTICA III', uc: 4, reqText: '11025', reqs: [{ type: 'course', code: '11025' }] },
      { code: '12024', name: 'FÍSICA II', uc: 4, reqText: '12014 / 12031 / 11025', reqs: [{ type: 'course', code: '12014' }, { type: 'course', code: '12031' }, { type: 'course', code: '11025' }] },
      { code: '12041', name: 'LABORATORIO DE FÍSICA II', uc: 1, reqText: 'P(12024)', reqs: [{ type: 'parallel', code: '12024' }] },
      { code: '41514', name: 'SISTEMAS ELÉCTRICOS I', uc: 4, reqText: 'P(12041) / P(12024) / 34 UCA', reqs: [{ type: 'parallel', code: '12041' }, { type: 'parallel', code: '12024' }, { type: 'uca', amount: 34 }] },
      { code: '41521', name: 'LAB. DE SISTEMAS ELÉCTRICOS I', uc: 1, reqText: 'P(41514) / 34 UCA', reqs: [{ type: 'parallel', code: '41514' }, { type: 'uca', amount: 34 }] },
      { code: '46513', name: 'PROGRAMACIÓN DIGITAL', uc: 3, reqText: 'P(11034) / 11052', reqs: [{ type: 'parallel', code: '11034' }, { type: 'course', code: '11052' }] },
      { code: '33103', name: 'ESTADÍSTICAS Y PROBABILIDADES', uc: 3, reqText: '11025', reqs: [{ type: 'course', code: '11025' }] },
    ],
  },
  {
    numero: 'IV',
    romano: 'IV',
    subjects: [
      { code: '11044', name: 'MATEMÁTICA IV', uc: 4, reqText: '11034', reqs: [{ type: 'course', code: '11034' }] },
      { code: '53014', name: 'MECÁNICA RACIONAL', uc: 4, reqText: '11034 / 12014 / 12031', reqs: [{ type: 'course', code: '11034' }, { type: 'course', code: '12014' }, { type: 'course', code: '12031' }] },
      { code: '41534', name: 'SISTEMAS ELÉCTRICOS II', uc: 4, reqText: '11034 / 41514 / 41521 / 12024 / 12041', reqs: [{ type: 'course', code: '11034' }, { type: 'course', code: '41514' }, { type: 'course', code: '41521' }, { type: 'course', code: '12024' }, { type: 'course', code: '12041' }] },
      { code: '41541', name: 'LAB. DE SISTEMAS ELÉCTRICOS II', uc: 1, reqText: 'P(41534)', reqs: [{ type: 'parallel', code: '41534' }] },
      { code: '45514', name: 'SISTEMAS ELECTRÓNICOS I', uc: 4, reqText: '41514 / 41521', reqs: [{ type: 'course', code: '41514' }, { type: 'course', code: '41521' }] },
      { code: '45521', name: 'LAB. DE SISTEMAS ELECTRÓNICOS I', uc: 1, reqText: 'P(45514)', reqs: [{ type: 'parallel', code: '45514' }] },
      { code: '32012', name: 'INFORMES INDUSTRIALES', uc: 2, reqText: '57 UCA / 22022', reqs: [{ type: 'uca', amount: 57 }, { type: 'course', code: '22022' }] },
    ],
  },
  {
    numero: 'V',
    romano: 'V',
    subjects: [
      { code: '42513', name: 'SISTEMAS DIGITALES I', uc: 3, reqText: 'P(45534) / 46513', reqs: [{ type: 'parallel', code: '45534' }, { type: 'course', code: '46513' }] },
      { code: '42521', name: 'LAB. DE SISTEMAS DIGITALES I', uc: 1, reqText: 'P(42513) / 46513', reqs: [{ type: 'parallel', code: '42513' }, { type: 'course', code: '46513' }] },
      { code: '52243', name: 'FLUIDOS', uc: 3, reqText: '53014 / 13021', reqs: [{ type: 'course', code: '53014' }, { type: 'course', code: '13021' }] },
      { code: '43514', name: 'SISTEMAS DE CONTROL I', uc: 4, reqText: '11044 / 41534 / 41541', reqs: [{ type: 'course', code: '11044' }, { type: 'course', code: '41534' }, { type: 'course', code: '41541' }] },
      { code: '41553', name: 'CONVERTIDORES ELÉCTRICOS', uc: 3, reqText: '11044 / 41534 / 41541', reqs: [{ type: 'course', code: '11044' }, { type: 'course', code: '41534' }, { type: 'course', code: '41541' }] },
      { code: '41561', name: 'LAB. DE CONVERTIDORES ELÉCTRICOS', uc: 1, reqText: 'P(41553)', reqs: [{ type: 'parallel', code: '41553' }] },
      { code: '45534', name: 'SISTEMAS ELECTRÓNICOS II', uc: 4, reqText: '11044 / 45514 / 45521', reqs: [{ type: 'course', code: '11044' }, { type: 'course', code: '45514' }, { type: 'course', code: '45521' }] },
      { code: '45541', name: 'LAB. DE SISTEMAS ELECTRÓNICOS II', uc: 1, reqText: 'P(45534)', reqs: [{ type: 'parallel', code: '45534' }] },
    ],
  },
  {
    numero: 'VI',
    romano: 'VI',
    subjects: [
      { code: '42533', name: 'SISTEMAS DIGITALES II', uc: 3, reqText: '42513 / 42521 / 45534', reqs: [{ type: 'course', code: '42513' }, { type: 'course', code: '42521' }, { type: 'course', code: '45534' }] },
      { code: '42541', name: 'LAB. DE SISTEMAS DIGITALES II', uc: 1, reqText: 'P(42533)', reqs: [{ type: 'parallel', code: '42533' }] },
      { code: '43523', name: 'INSTRUMENTACIÓN INDUSTRIAL', uc: 3, reqText: '52243 / 43514', reqs: [{ type: 'course', code: '52243' }, { type: 'course', code: '43514' }] },
      { code: '43531', name: 'LAB. DE INSTRUMENTACIÓN INDUSTRIAL', uc: 1, reqText: 'P(43523)', reqs: [{ type: 'parallel', code: '43523' }] },
      { code: '43545', name: 'MODELAJE Y SIMULACIÓN DIGITAL', uc: 5, reqText: '43514 / 46513', reqs: [{ type: 'course', code: '43514' }, { type: 'course', code: '46513' }] },
      { code: '45553', name: 'ELECTRÓNICA INDUSTRIAL', uc: 3, reqText: '45534 / 45541 / 42513 / 41553 / 41561', reqs: [{ type: 'course', code: '45534' }, { type: 'course', code: '45541' }, { type: 'course', code: '42513' }, { type: 'course', code: '41553' }, { type: 'course', code: '41561' }] },
      { code: '45561', name: 'LAB. DE ELECTRÓNICA INDUSTRIAL', uc: 1, reqText: 'P(45553)', reqs: [{ type: 'parallel', code: '45553' }] },
      { code: '23022', name: 'METODOLOGÍA DE LA INVESTIGACIÓN', uc: 2, reqText: '33103', reqs: [{ type: 'course', code: '33103' }] },
    ],
  },
  {
    numero: 'VII',
    romano: 'VII',
    subjects: [
      { code: '42553', name: 'SISTEMAS DIGITALES III', uc: 3, reqText: '42533 / 42541', reqs: [{ type: 'course', code: '42533' }, { type: 'course', code: '42541' }] },
      { code: '42561', name: 'LAB. DE SISTEMAS DIGITALES III', uc: 1, reqText: 'P(42553)', reqs: [{ type: 'parallel', code: '42553' }] },
      { code: '46523', name: 'PROCESAMIENTO DE DATOS', uc: 3, reqText: '96 UCA / 46513 / 43545', reqs: [{ type: 'uca', amount: 96 }, { type: 'course', code: '46513' }, { type: 'course', code: '43545' }] },
      { code: '43554', name: 'SISTEMAS DE CONTROL II', uc: 4, reqText: '43523 / 43531 / 43545 / 45534', reqs: [{ type: 'course', code: '43523' }, { type: 'course', code: '43531' }, { type: 'course', code: '43545' }, { type: 'course', code: '45534' }] },
      { code: '43561', name: 'LAB. DE SISTEMAS DE CONTROL II', uc: 1, reqText: 'P(43554)', reqs: [{ type: 'parallel', code: '43554' }] },
      { code: '44513', name: 'SISTEMAS DE SEÑALES', uc: 3, reqText: '11044 / 96 UCA', reqs: [{ type: 'course', code: '11044' }, { type: 'uca', amount: 96 }] },
      { code: '34052', name: 'ELEMENTOS DE ECONOMÍA', uc: 2, reqText: '100 UCA', reqs: [{ type: 'uca', amount: 100 }] },
      { code: '21032', name: 'INGLÉS III', uc: 2, reqText: '97 UCA / 21022', reqs: [{ type: 'uca', amount: 97 }, { type: 'course', code: '21022' }] },
      { code: '24022', name: 'PROBLEMAS DEL DESARROLLO SOCIAL Y ECONÓMICO', uc: 2, reqText: '22022 / 96 UCA', reqs: [{ type: 'course', code: '22022' }, { type: 'uca', amount: 96 }] },
      { code: 'IS000', name: 'SERVICIO COMUNITARIO', uc: 0, reqText: '104 UCA', reqs: [{ type: 'uca', amount: 104 }] },
    ],
  },
  {
    numero: 'VIII',
    romano: 'VIII',
    subjects: [
      { code: '43573', name: 'SISTEMAS DE CONTROL III', uc: 3, reqText: '43554 / 43561 / 42533', reqs: [{ type: 'course', code: '43554' }, { type: 'course', code: '43561' }, { type: 'course', code: '42533' }] },
      { code: '43581', name: 'LAB. DE SISTEMAS DE CONTROL III', uc: 1, reqText: 'P(43573)', reqs: [{ type: 'parallel', code: '43573' }] },
      { code: '44023', name: 'SISTEMAS DE COMUNICACIONES', uc: 3, reqText: '44513', reqs: [{ type: 'course', code: '44513' }] },
      { code: '44031', name: 'LAB. DE SISTEMAS DE COMUNICACIONES', uc: 1, reqText: 'P(44023)', reqs: [{ type: 'parallel', code: '44023' }] },
      { code: '33113', name: 'INVESTIGACIÓN DE OPERACIONES', uc: 3, reqText: '33103 / 34052 / 43545', reqs: [{ type: 'course', code: '33103' }, { type: 'course', code: '34052' }, { type: 'course', code: '43545' }] },
      { code: '24032', name: 'PROBLEMÁTICA CONTEMPORÁNEA DE LA CIENCIA Y LA TECNOLOGÍA', uc: 2, reqText: '24022', reqs: [{ type: 'course', code: '24022' }] },
      { code: 'DEP-II', name: 'DEPORTES II', uc: 1, reqText: 'DEPORTES I', reqs: [{ type: 'course', code: 'DEP-I' }] },
      { isElective: true, slotId: 'S8E1', name: 'ELECTIVA', uc: 3, reqText: '', reqs: [] },
      { isElective: true, slotId: 'S8E2', name: 'ELECTIVA', uc: 3, reqText: '', reqs: [] },
    ],
  },
  {
    numero: 'IX',
    romano: 'IX',
    subjects: [
      { code: '31113', name: 'PRODUCCIÓN', uc: 3, reqText: '33113', reqs: [{ type: 'course', code: '33113' }] },
      { code: '44043', name: 'TRANSMISIÓN DE DATOS', uc: 3, reqText: '44023 / 44031', reqs: [{ type: 'course', code: '44023' }, { type: 'course', code: '44031' }] },
      { code: '43592', name: 'PROYECTOS INDUSTRIALES', uc: 2, reqText: '42553 / 43573 / 44023 / 45553', reqs: [{ type: 'course', code: '42553' }, { type: 'course', code: '43573' }, { type: 'course', code: '44023' }, { type: 'course', code: '45553' }] },
      { code: '24012', name: 'ESTUDIO Y COMPRENSIÓN DEL HOMBRE', uc: 2, reqText: '24032', reqs: [{ type: 'course', code: '24032' }] },
      { code: '32152', name: 'DERECHO PARA INGENIEROS', uc: 2, reqText: '150 UCA', reqs: [{ type: 'uca', amount: 150 }] },
      { isElective: true, slotId: 'S9E1', name: 'ELECTIVA', uc: 3, reqText: '', reqs: [] },
      { isElective: true, slotId: 'S9E2', name: 'ELECTIVA', uc: 3, reqText: '', reqs: [] },
      { isElective: true, slotId: 'S9E3', name: 'ELECTIVA', uc: 3, reqText: '', reqs: [] },
    ],
  },
  {
    numero: 'X',
    romano: 'X',
    subjects: [
      { code: '74130', name: 'ENTRENAMIENTO INDUSTRIAL DE SISTEMAS', uc: 30, reqText: 'HABER APROBADO TODAS LAS ASIGNATURAS ANTERIORES', reqs: [{ type: 'all' }] },
    ],
  },
];

// Catálogos de electivas, organizados por especialidad que las dicta.
const ELECTIVE_CATALOGS = [
  {
    id: 'sistemas',
    titulo: 'Electivas que dicta Ingeniería de Sistemas',
    subjects: [
      { code: '43113', name: 'CONTROLES INDUSTRIALES', uc: 3, reqText: '43554 / 43561', reqs: [{ type: 'course', code: '43554' }, { type: 'course', code: '43561' }] },
      { code: '43121', name: 'LAB. DE CONTROLES INDUSTRIALES', uc: 1, reqText: 'P(43113)', reqs: [{ type: 'parallel', code: '43113' }] },
      { code: '43623', name: 'CONTROL ÓPTIMO', uc: 3, reqText: '43554 / 43561', reqs: [{ type: 'course', code: '43554' }, { type: 'course', code: '43561' }] },
      { code: '43613', name: 'CONTROL DE PROCESOS INDUSTRIALES', uc: 3, reqText: '43554 / 43561', reqs: [{ type: 'course', code: '43554' }, { type: 'course', code: '43561' }] },
      { code: '46533', name: 'SISTEMAS DE INFORMACIÓN I', uc: 3, reqText: '46523', reqs: [{ type: 'course', code: '46523' }] },
      { code: '46543', name: 'SISTEMAS DE INFORMACIÓN II', uc: 3, reqText: '46533', reqs: [{ type: 'course', code: '46533' }] },
      { code: '46553', name: 'TEORÍA DE DECISIONES I', uc: 3, reqText: '46513 / 11044 / 130 UCA / 33113', reqs: [{ type: 'course', code: '46513' }, { type: 'course', code: '11044' }, { type: 'uca', amount: 130 }, { type: 'course', code: '33113' }] },
      { code: '46563', name: 'TEORÍA DE DECISIONES II', uc: 3, reqText: '46553', reqs: [{ type: 'course', code: '46553' }] },
      { code: '44203', name: 'TELEFONÍA', uc: 3, reqText: '44023 / 44031', reqs: [{ type: 'course', code: '44023' }, { type: 'course', code: '44031' }] },
      { code: '41594', name: 'CANALIZACIONES', uc: 4, reqText: '41553 / 41561 / 140 UCA', reqs: [{ type: 'course', code: '41553' }, { type: 'course', code: '41561' }, { type: 'uca', amount: 140 }] },
      { code: '42573', name: 'ARQUITECTURA DEL COMPUTADOR', uc: 3, reqText: '42553 / 42561', reqs: [{ type: 'course', code: '42553' }, { type: 'course', code: '42561' }] },
      { code: '44303', name: 'FIBRA ÓPTICA', uc: 3, reqText: '44023 / 44031', reqs: [{ type: 'course', code: '44023' }, { type: 'course', code: '44031' }] },
      { code: '46573', name: 'BASE DE DATOS', uc: 3, reqText: '46523', reqs: [{ type: 'course', code: '46523' }] },
      { code: '44423', name: 'SISTEMAS DE COMUNICACIONES MÓVILES', uc: 3, reqText: '44023 / 44031', reqs: [{ type: 'course', code: '44023' }, { type: 'course', code: '44031' }] },
      { code: '43703', name: 'SISTEMAS DE CONTROL DIFUSO', uc: 3, reqText: '130 UCA', reqs: [{ type: 'uca', amount: 130 }] },
      { code: '43713', name: 'CONTROL POR REDES NEURONALES', uc: 3, reqText: '130 UCA', reqs: [{ type: 'uca', amount: 130 }] },
      { code: '46583', name: 'PROGRAMACIÓN ORIENTADA A OBJETOS', uc: 3, reqText: '46523', reqs: [{ type: 'course', code: '46523' }] },
      { code: '46593', name: 'INGENIERÍA DE SOFTWARE', uc: 3, reqText: '46523', reqs: [{ type: 'course', code: '46523' }] },
      { code: '43643', name: 'DESARROLLO DE INGENIERÍA DE PROYECTOS', uc: 3, reqText: '150 UCA', reqs: [{ type: 'uca', amount: 150 }] },
      { code: '43653', name: 'AUTOMATIZACIÓN E INTEGRACIÓN DE PROCESOS INDUSTRIALES', uc: 3, reqText: '150 UCA', reqs: [{ type: 'uca', amount: 150 }] },
      { code: '44103', name: 'ANTENAS', uc: 3, reqText: '44023 / 44031', reqs: [{ type: 'course', code: '44023' }, { type: 'course', code: '44031' }] },
      { code: '44623', name: 'REDES DIGITALES DE COMUNICACIONES', uc: 3, reqText: '44023 / 44031', reqs: [{ type: 'course', code: '44023' }, { type: 'course', code: '44031' }] },
    ],
  },
  {
    id: 'industrial',
    titulo: 'Electivas que dicta Ingeniería Industrial',
    subjects: [
      { code: '32082', name: 'SISTEMAS Y PROCEDIMIENTOS', uc: 2, reqText: '150 UCA', reqs: [{ type: 'uca', amount: 150 }] },
      { code: '32102', name: 'GERENCIA EMPRESARIAL', uc: 2, reqText: '150 UCA', reqs: [{ type: 'uca', amount: 150 }] },
      { code: '34314', name: 'FINANZAS PARA INGENIEROS', uc: 4, reqText: '130 UCA', reqs: [{ type: 'uca', amount: 130 }] },
      { code: '34304', name: 'MERCADEO DE LOS SERVICIOS DE INGENIERÍA', uc: 4, reqText: '130 UCA', reqs: [{ type: 'uca', amount: 130 }] },
    ],
  },
  {
    id: 'mecanica',
    titulo: 'Electiva que dicta Ingeniería Mecánica',
    subjects: [
      { code: '51314', name: 'AUTOMATIZACIÓN INDUSTRIAL', uc: 4, reqText: '41553 / 41561', reqs: [{ type: 'course', code: '41553' }, { type: 'course', code: '41561' }] },
    ],
  },
];
