window.REPORT_DATA = {
  meta: {
    title: 'Emergencia Sísmica — San Pedro, Valle del Cauca',
    eventDate: '10 de agosto de 2026',
    cutoffDate: '18 de agosto de 2026',
    source: 'Informe técnico consolidado — avance del diligenciamiento RUFE y censo de familias afectadas',
    municipality: 'San Pedro, Valle del Cauca',
    status: 'Preliminar operativo; no sustituye evaluación estructural, acto administrativo ni validación oficial del RUD'
  },
  kpis: {
    families: 432,
    nominalPeople: 1024,
    uniquePeopleEstimated: 1001,
    territories: 25,
    familiesWithState: 392,
    familiesWithoutState: 40,
    emptyPreEnumerated: 111,
    repeatedDocGroups: 23,
    peopleWithoutValidDocument: 21,
    invalidBirthDates: 39,
    multipleHousingMarks: 9,
    repeatedHeads: 10,
    noZoneHomologable: 189,
    women: 566,
    men: 450,
    sexMissing: 8,
    minors: 179,
    age60plus: 283
  },
  completeness: [
    { label: 'Integrante nominal', value: 100.0 },
    { label: 'Teléfono', value: 97.7 },
    { label: 'Dirección', value: 94.7 },
    { label: 'Estado del inmueble', value: 90.7 },
    { label: 'Fecha de nacimiento válida', value: 96.2 },
    { label: 'Sexo F/M válido', value: 99.2 }
  ],
  housing: [
    { label: 'Habitable', count: 251, pct: 58.1, tone: 'green' },
    { label: 'Averiada', count: 56, pct: 13.0, tone: 'orange' },
    { label: 'No habitable', count: 90, pct: 20.8, tone: 'red' },
    { label: 'Destruida', count: 2, pct: 0.5, tone: 'darkred' },
    { label: 'Evacuada fuera de residencia', count: 2, pct: 0.5, tone: 'blue' },
    { label: 'Sin clasificación registrada', count: 40, pct: 9.3, tone: 'gray' }
  ],
  lifeCycle: [
    { label: '0–5', count: 36, pct: 3.5 },
    { label: '6–11', count: 73, pct: 7.1 },
    { label: '12–17', count: 70, pct: 6.8 },
    { label: '18–28', count: 117, pct: 11.4 },
    { label: '29–59', count: 406, pct: 39.6 },
    { label: '60 y más', count: 283, pct: 27.6 },
    { label: 'Sin dato válido', count: 39, pct: 3.8 }
  ],
  locationDeclared: [
    { label: 'Rural', count: 225 },
    { label: 'Urbana', count: 129 },
    { label: 'Sin dato homologable', count: 78 }
  ],
  territories: [
    { sector:'CENTRO', families:74, people:161, noHab:21, destroyed:0, noState:4, empty:1 },
    { sector:'MONTEGRANDE', families:39, people:100, noHab:12, destroyed:0, noState:17, empty:12 },
    { sector:'TODOSANTOS', families:47, people:117, noHab:9, destroyed:2, noState:1, empty:0 },
    { sector:'EL ESPINAL AV. LA PLANTA', families:42, people:95, noHab:4, destroyed:0, noState:7, empty:0 },
    { sector:'LA SIRIA', families:16, people:45, noHab:2, destroyed:0, noState:17, empty:16 },
    { sector:'PRESIDENTE', families:32, people:83, noHab:6, destroyed:0, noState:3, empty:0 },
    { sector:'SAN JOSE', families:30, people:51, noHab:2, destroyed:0, noState:9, empty:1 },
    { sector:'GUAQUEROS', families:10, people:21, noHab:0, destroyed:0, noState:21, empty:16 },
    { sector:'GUAYABAL', families:24, people:56, noHab:6, destroyed:0, noState:1, empty:0 },
    { sector:'LOS CHANCOS', families:7, people:24, noHab:0, destroyed:0, noState:16, empty:16 },
    { sector:'LA ESPERANZA', families:6, people:14, noHab:0, destroyed:0, noState:16, empty:16 },
    { sector:'MONTERREDONDO', families:19, people:54, noHab:5, destroyed:0, noState:2, empty:0 },
    { sector:'VEREDA LA ALTANIA', families:2, people:6, noHab:0, destroyed:0, noState:16, empty:16 },
    { sector:'LA PUENTE', families:17, people:17, noHab:11, destroyed:0, noState:0, empty:0 },
    { sector:'LOS MATES', families:1, people:2, noHab:0, destroyed:0, noState:16, empty:16 },
    { sector:'CIUDAD JARDÍN', families:14, people:42, noHab:3, destroyed:0, noState:1, empty:0 },
    { sector:'EL PORVENIR JAVA', families:12, people:44, noHab:3, destroyed:0, noState:3, empty:0 },
    { sector:'LA CAMPIÑA', families:11, people:24, noHab:1, destroyed:0, noState:0, empty:0 },
    { sector:'BUENOS AIRES', families:9, people:23, noHab:0, destroyed:0, noState:0, empty:0 },
    { sector:'EL JARDIN', families:4, people:7, noHab:0, destroyed:0, noState:1, empty:1 },
    { sector:'LA PRADERA', families:5, people:14, noHab:2, destroyed:0, noState:0, empty:0 },
    { sector:'POSITOS', families:4, people:10, noHab:2, destroyed:0, noState:0, empty:0 },
    { sector:'ANGOSTURAS', families:3, people:8, noHab:1, destroyed:0, noState:0, empty:0 },
    { sector:'LA ESMERALDA', families:3, people:5, noHab:0, destroyed:0, noState:0, empty:0 },
    { sector:'BELÉN', families:1, people:1, noHab:0, destroyed:0, noState:0, empty:0 }
  ],
  qualityIssues: [
    { label:'Núcleos numerados sin integrantes', count:111, risk:'Sobreestimación del censo si se cuentan como familias', treatment:'Confirmar si son filas de plantilla; completar o excluir mediante acta de depuración.' },
    { label:'Grupos de documento repetido', count:23, risk:'Doble conteo de personas', treatment:'Comparar nombre, hogar, territorio y soporte; no borrar automáticamente.' },
    { label:'Jefaturas con documento repetido', count:10, risk:'Posible doble registro familiar', treatment:'Verificación domiciliaria y documental prioritaria.' },
    { label:'Personas sin documento válido', count:21, risk:'Limitación para identificación y cruce', treatment:'Completar tipo/número o documentar razón de ausencia.' },
    { label:'Fecha de nacimiento inválida/ausente', count:39, risk:'Clasificación etaria incompleta', treatment:'Corregir contra documento o declaración soportada.' },
    { label:'Sexo sin dato F/M', count:8, risk:'Caracterización incompleta', treatment:'Validar sin presunciones.' },
    { label:'Familias nominales sin estado', count:40, risk:'No permite priorizar seguridad habitacional', treatment:'Realizar revisión de campo y consignar categoría única.' },
    { label:'Registros con marcas múltiples', count:9, risk:'Ambigüedad operacional', treatment:'Resolver conflicto, registrar responsable, fecha y evidencia.' },
    { label:'Zona urbana/rural sin dato homologable', count:189, risk:'Dificulta logística y análisis espacial', treatment:'Completar barrio/vereda, dirección y coordenadas cuando sea posible.' }
  ],
  methodology: [
    { step:1, title:'Captura territorial', detail:'Formato RUFE y soportes' },
    { step:2, title:'Control de calidad', detail:'Completitud y coherencia' },
    { step:3, title:'Depuración', detail:'Duplicados y conflictos' },
    { step:4, title:'Validación CMGRD', detail:'Trazabilidad y aprobación' },
    { step:5, title:'Consolidación oficial', detail:'Reporte y seguimiento' }
  ],
  appliedRules: [
    'Se identificó automáticamente la fila de encabezados de cada hoja y se homologaron variantes ortográficas o de denominación.',
    'Se excluyó “Hoja 12” porque sus 144 documentos válidos están contenidos en “CENTRO”; incluirla habría generado doble conteo.',
    'Una familia efectiva se contabilizó cuando el núcleo numerado contiene al menos un nombre o apellido; los núcleos numerados sin integrantes se contabilizaron aparte.',
    'Una persona única estimada se calculó por documento válido; los registros sin documento se mantuvieron individualmente.',
    'La edad se calculó al 10 de agosto de 2026; fechas futuras, anteriores a 1900, incompletas o no interpretables se clasificaron como dato inválido o ausente.',
    'Las categorías del inmueble se conservaron tal como fueron marcadas, sin imponer una jerarquía no contenida en la fuente.'
  ],
  priorities: [
    'Verificar en campo las 92 familias con vivienda no habitable o destruida.',
    'Completar la clasificación de 40 familias y resolver las 9 marcas múltiples.',
    'Depurar documentos repetidos y separar los 111 núcleos preenumerados vacíos.',
    'Articular RUFE, EDAN, inspecciones técnicas, alojamiento temporal y ayudas humanitarias.',
    'Validar el corte en el CMGRD y documentar el cargue o actualización en el RUD.'
  ],
  prioritizationMatrix: [
    { level:'1 — Crítico', criteria:'Inmueble destruido/no habitable con riesgo actual; personas sin alojamiento seguro; amenaza secundaria; población diferencial sin red de apoyo.', action:'Inspección y medida inmediata; alojamiento, salud, seguridad y asistencia humanitaria según necesidad.' },
    { level:'2 — Alto', criteria:'Avería con indicios de inestabilidad; evacuación preventiva; pérdida de servicios esenciales o medios de vida.', action:'Visita técnica prioritaria, control de acceso y apoyo sectorial.' },
    { level:'3 — Medio', criteria:'Averías sin indicio documentado de riesgo inminente; hogar con solución temporal.', action:'Programar inspección, documentar daños y definir intervención.' },
    { level:'4 — Seguimiento', criteria:'Habitable con afectaciones menores o sin daño verificado.', action:'Orientación de autoprotección, monitoreo y cierre documentado.' }
  ],
  limitations: [
    'La base es un instrumento operativo en construcción; no se aportó acta formal de cierre, certificación de cobertura territorial ni universo esperado de familias afectadas.',
    'Las marcas “habitable”, “averiada”, “no habitable” o “destruida” provienen del archivo y no equivalen por sí solas a un dictamen profesional de seguridad estructural.',
    'No se aportaron fichas de inspección visual rápida, conceptos de ingeniería, georreferenciación, fotografías ni soportes para validar cada afectación.',
    'No se verificó en el informe el cargue, aceptación o cierre en la plataforma nacional RUD.',
    'Los duplicados se identifican por coincidencia de número de documento y requieren revisión humana antes de eliminar registros.'
  ]
};
