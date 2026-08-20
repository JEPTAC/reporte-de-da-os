window.RUFE_DATA = {
  "summary": {
    "families": 432,
    "people": 1024,
    "withStatus": 392,
    "withoutStatus": 40,
    "empty": 111,
    "housing": {
      "habitable": 251,
      "damaged": 56,
      "noHab": 90,
      "destroyed": 2,
      "evacuated": 2,
      "multiple": 9
    },
    "sex": [
      [
        "Femenino",
        566
      ],
      [
        "Masculino",
        450
      ],
      [
        "Sin dato",
        8
      ]
    ],
    "ages": [
      [
        "0–5",
        36
      ],
      [
        "6–11",
        73
      ],
      [
        "12–17",
        70
      ],
      [
        "18–28",
        117
      ],
      [
        "29–59",
        406
      ],
      [
        "60 y más",
        283
      ],
      [
        "Sin dato válido",
        39
      ]
    ],
    "location": [
      [
        "Rural",
        225
      ],
      [
        "Urbana",
        129
      ],
      [
        "Sin dato homologable",
        78
      ]
    ],
    "completeness": [
      [
        "Estado del inmueble",
        392,
        432
      ],
      [
        "Dirección",
        409,
        432
      ],
      [
        "Teléfono",
        422,
        432
      ],
      [
        "Fecha de nacimiento válida",
        985,
        1024
      ],
      [
        "Sexo F/M válido",
        1016,
        1024
      ]
    ],
    "qualityIssues": [
      [
        "Núcleos numerados sin integrantes",
        111,
        "Sobreestimación del censo si se cuentan como familias.",
        "Confirmar si son filas de plantilla; completar o excluir mediante acta de depuración."
      ],
      [
        "Grupos de documento repetido",
        23,
        "Doble conteo potencial de personas.",
        "Comparar nombre, hogar, territorio y soporte; no borrar automáticamente."
      ],
      [
        "Jefaturas con documento repetido",
        10,
        "Posible doble registro familiar.",
        "Verificación domiciliaria y documental prioritaria."
      ],
      [
        "Personas sin documento válido",
        21,
        "Limitación para identificación y cruce.",
        "Completar tipo o número, o documentar razón de ausencia."
      ],
      [
        "Fecha de nacimiento inválida o ausente",
        39,
        "Clasificación etaria incompleta.",
        "Corregir contra documento o declaración soportada."
      ],
      [
        "Familias nominales sin estado",
        40,
        "No permite priorizar seguridad habitacional.",
        "Revisión de campo y consignación de categoría única."
      ],
      [
        "Registros con marcas múltiples",
        9,
        "Ambigüedad operacional.",
        "Resolver conflicto y registrar responsable, fecha y evidencia."
      ],
      [
        "Zona urbana/rural sin dato homologable",
        78,
        "Dificulta logística y análisis espacial.",
        "Completar barrio o vereda, dirección y coordenadas cuando sea posible."
      ]
    ],
    "methodObjective": [
      "Lectura y homologación de las hojas territoriales del archivo aportado.",
      "Cálculo de resultados agregados e indicadores de completitud.",
      "Clasificación por sexo, ciclo de vida, ubicación declarada y estado del inmueble.",
      "Identificación de duplicados potenciales, registros incompletos y marcas incompatibles.",
      "Orientaciones para validación por el CMGRD y articulación con instrumentos de respuesta y recuperación."
    ],
    "limitations": [
      "La base es un instrumento operativo en construcción.",
      "No se aportó acta formal de cierre, certificación de cobertura territorial ni universo esperado de familias afectadas.",
      "Las marcas habitacionales no equivalen por sí solas a un dictamen profesional de seguridad estructural.",
      "La estimación de personas únicas no reemplaza la depuración oficial individual.",
      "Persisten campos sin homologar, registros vacíos y marcas múltiples que requieren verificación en campo."
    ],
    "appliedRules": [
      "Se identificó automáticamente la fila de encabezados de cada hoja y se homologaron variantes ortográficas o de denominación.",
      "Se excluyó la Hoja 12 porque sus 144 documentos válidos están contenidos en Centro; incluirla habría generado doble conteo.",
      "Una familia efectiva se contabilizó cuando el núcleo numerado contiene al menos un nombre o apellido. Los núcleos sin integrantes se contabilizaron aparte.",
      "Una persona única estimada se calculó por documento válido; los registros sin documento se mantuvieron individualmente.",
      "La edad se calculó al 10 de agosto de 2026. Fechas futuras, anteriores a 1900, incompletas o no interpretables se clasificaron como dato inválido o ausente."
    ],
    "updates": [
      {
        "date": "12 de ago de 2026",
        "version": "v1.0",
        "title": "Corte inicial de consolidación",
        "note": "Primera publicación pública de resultados agregados del RUFE con conteo preliminar de familias, personas y clasificación censal de vivienda.",
        "status": "Publicado"
      },
      {
        "date": "15 de ago de 2026",
        "version": "v2.0",
        "title": "Ajuste territorial y de calidad",
        "note": "Se incorporó el detalle territorial por sectores, se separaron los núcleos vacíos y se añadieron hallazgos de calidad para la ruta de depuración.",
        "status": "Publicado"
      },
      {
        "date": "18 de ago de 2026",
        "version": "v3.0",
        "title": "Consolidado técnico vigente",
        "note": "Versión pública vigente. Incluye metodología, limitaciones, reglas aplicadas, priorización por vivienda y trazabilidad para futuras validaciones institucionales.",
        "status": "Vigente"
      }
    ],
    "documents": [
      [
        "Consolidado técnico RUFE · corte 18 de agosto de 2026",
        "Informe",
        "Resume el censo, la territorialización, la caracterización poblacional y las brechas de calidad del corte vigente."
      ],
      [
        "Ficha de apoyo visual territorial",
        "Infografía",
        "Pieza de lectura rápida con cifras, territorios priorizados y explicación de hallazgos críticos."
      ],
      [
        "Galería de afectaciones estructurales",
        "Registro fotográfico",
        "Evidencia visual de cubiertas colapsadas, grietas y afectaciones habitacionales sin exposición de personas."
      ],
      [
        "Bitácora pública de publicaciones",
        "Control documental",
        "Histórico de cambios publicados, versiones y notas de actualización del portal."
      ]
    ]
  },
  "sectors": [
    {
      "name": "Centro",
      "families": 74,
      "people": 161,
      "noHab": 21,
      "destroyed": 0,
      "unset": 4,
      "empty": 1,
      "zone": "urbano",
      "x": 53,
      "y": 48
    },
    {
      "name": "Montegrande",
      "families": 39,
      "people": 100,
      "noHab": 12,
      "destroyed": 0,
      "unset": 17,
      "empty": 12,
      "zone": "rural",
      "x": 67,
      "y": 29
    },
    {
      "name": "Todosantos",
      "families": 47,
      "people": 117,
      "noHab": 9,
      "destroyed": 2,
      "unset": 1,
      "empty": 0,
      "zone": "urbano",
      "x": 44,
      "y": 39
    },
    {
      "name": "El Espinal Av. La Planta",
      "families": 42,
      "people": 95,
      "noHab": 4,
      "destroyed": 0,
      "unset": 7,
      "empty": 0,
      "zone": "urbano",
      "x": 39,
      "y": 58
    },
    {
      "name": "La Siria",
      "families": 16,
      "people": 45,
      "noHab": 2,
      "destroyed": 0,
      "unset": 17,
      "empty": 16,
      "zone": "rural",
      "x": 77,
      "y": 16
    },
    {
      "name": "Presidente",
      "families": 32,
      "people": 83,
      "noHab": 6,
      "destroyed": 0,
      "unset": 3,
      "empty": 0,
      "zone": "urbano",
      "x": 58,
      "y": 64
    },
    {
      "name": "San José",
      "families": 30,
      "people": 51,
      "noHab": 2,
      "destroyed": 0,
      "unset": 9,
      "empty": 1,
      "zone": "urbano",
      "x": 49,
      "y": 67
    },
    {
      "name": "Guaqueros",
      "families": 10,
      "people": 21,
      "noHab": 0,
      "destroyed": 0,
      "unset": 21,
      "empty": 16,
      "zone": "rural",
      "x": 79,
      "y": 28
    },
    {
      "name": "Guayabal",
      "families": 24,
      "people": 56,
      "noHab": 6,
      "destroyed": 0,
      "unset": 1,
      "empty": 0,
      "zone": "rural",
      "x": 29,
      "y": 44
    },
    {
      "name": "Los Chancos",
      "families": 7,
      "people": 24,
      "noHab": 0,
      "destroyed": 0,
      "unset": 16,
      "empty": 16,
      "zone": "rural",
      "x": 22,
      "y": 36
    },
    {
      "name": "La Esperanza",
      "families": 6,
      "people": 14,
      "noHab": 0,
      "destroyed": 0,
      "unset": 16,
      "empty": 16,
      "zone": "rural",
      "x": 26,
      "y": 23
    },
    {
      "name": "Monterredondo",
      "families": 19,
      "people": 54,
      "noHab": 5,
      "destroyed": 0,
      "unset": 2,
      "empty": 0,
      "zone": "rural",
      "x": 70,
      "y": 53
    },
    {
      "name": "Vereda La Altania",
      "families": 2,
      "people": 6,
      "noHab": 0,
      "destroyed": 0,
      "unset": 16,
      "empty": 16,
      "zone": "rural",
      "x": 84,
      "y": 52
    },
    {
      "name": "La Puente",
      "families": 17,
      "people": 17,
      "noHab": 11,
      "destroyed": 0,
      "unset": 0,
      "empty": 0,
      "zone": "urbano",
      "x": 61,
      "y": 77
    },
    {
      "name": "Los Mates",
      "families": 1,
      "people": 2,
      "noHab": 0,
      "destroyed": 0,
      "unset": 16,
      "empty": 16,
      "zone": "rural",
      "x": 13,
      "y": 48
    },
    {
      "name": "Ciudad Jardín",
      "families": 14,
      "people": 42,
      "noHab": 3,
      "destroyed": 0,
      "unset": 1,
      "empty": 0,
      "zone": "urbano",
      "x": 35,
      "y": 69
    },
    {
      "name": "El Porvenir Java",
      "families": 12,
      "people": 44,
      "noHab": 3,
      "destroyed": 0,
      "unset": 3,
      "empty": 0,
      "zone": "urbano",
      "x": 42,
      "y": 75
    },
    {
      "name": "La Campiña",
      "families": 11,
      "people": 24,
      "noHab": 1,
      "destroyed": 0,
      "unset": 0,
      "empty": 0,
      "zone": "urbano",
      "x": 47,
      "y": 81
    },
    {
      "name": "Buenos Aires",
      "families": 9,
      "people": 23,
      "noHab": 0,
      "destroyed": 0,
      "unset": 0,
      "empty": 0,
      "zone": "urbano",
      "x": 21,
      "y": 62
    },
    {
      "name": "El Jardín",
      "families": 4,
      "people": 7,
      "noHab": 0,
      "destroyed": 0,
      "unset": 1,
      "empty": 1,
      "zone": "urbano",
      "x": 30,
      "y": 74
    },
    {
      "name": "La Pradera",
      "families": 5,
      "people": 14,
      "noHab": 2,
      "destroyed": 0,
      "unset": 0,
      "empty": 0,
      "zone": "urbano",
      "x": 25,
      "y": 71
    },
    {
      "name": "Positos",
      "families": 4,
      "people": 10,
      "noHab": 2,
      "destroyed": 0,
      "unset": 0,
      "empty": 0,
      "zone": "rural",
      "x": 17,
      "y": 57
    },
    {
      "name": "Angosturas",
      "families": 3,
      "people": 8,
      "noHab": 1,
      "destroyed": 0,
      "unset": 0,
      "empty": 0,
      "zone": "rural",
      "x": 84,
      "y": 41
    },
    {
      "name": "La Esmeralda",
      "families": 3,
      "people": 5,
      "noHab": 0,
      "destroyed": 0,
      "unset": 0,
      "empty": 0,
      "zone": "rural",
      "x": 74,
      "y": 70
    },
    {
      "name": "Belén",
      "families": 1,
      "people": 1,
      "noHab": 0,
      "destroyed": 0,
      "unset": 0,
      "empty": 0,
      "zone": "urbano",
      "x": 56,
      "y": 88
    }
  ]
};
