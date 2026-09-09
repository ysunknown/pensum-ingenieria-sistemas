# Pénsum Ingeniería de Sistemas (UNEXPO, 2018)

Aplicación web estática para hacer seguimiento visual del pénsum de Ingeniería de Sistemas
(UNEXPO, Vice-Rectorado Luis Caballero Mejías, versión Diciembre 2018): materias por semestre,
prerrequisitos, electivas por especialidad y progreso del estudiante.

No usa build ni framework: es HTML + CSS + JS plano, separando la estructura (`index.html`),
los datos del pénsum (`js/data.js`), la lógica de negocio (`js/logic.js`, `js/state.js`) y la
capa de presentación (`js/ui.js`).

## Funcionalidad

- Materias organizadas por semestre (I a X): código, nombre, unidades de crédito (UC) y
  requisitos (incluye materias en paralelo `P(código)` y requisitos por UC acumuladas, ej. `34 UCA`).
- Tres estados marcables por materia, mutuamente excluyentes: **Aprobada** (verde), **Cursando**
  (azul) y **Por cursar** (rojo, para planificar el próximo semestre a inscribir).
- Resaltado en amarillo cuando se cumplen los requisitos para cursar una materia (aunque
  todavía no esté marcada).
- Las materias "Electiva" se eligen mediante una ventana modal centrada (con el fondo
  desenfocado) que lista las electivas disponibles, agrupadas por la especialidad que las dicta
  (Ingeniería de Sistemas, Industrial, Mecánica), resaltando también las que ya se pueden cursar.
- Catálogos de electivas por especialidad en cuadros aparte, con la misma apariencia de las
  tablas de semestre pero sin las columnas T/P/L/HT-S.
- Contadores en la cabecera: **Total U.C. aprobadas** (suma de créditos de materias marcadas
  como aprobadas) y **U.C. cursando este semestre** (suma de créditos de materias marcadas como
  cursando o por cursar).
- El progreso se guarda automáticamente en `localStorage` del navegador; no se envía a ningún
  servidor.

### Nota sobre el documento fuente

En el PDF escaneado, los requisitos de "MECÁNICA RACIONAL" y "SISTEMAS ELÉCTRICOS II" listan un
código `11031` que no corresponde a ninguna materia del pénsum. Se interpretó como un error de
digitalización de `11034` (MATEMÁTICA III) — el único requisito coherente con la secuencia de
materias — y así quedó codificado en `js/data.js`.

## Desarrollo local

No requiere instalación de dependencias. Basta con servir los archivos estáticos, por ejemplo:

```bash
npx serve .
```

o simplemente abrir `index.html` en el navegador.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Pénsum Ingeniería de Sistemas: app inicial"
git branch -M main
git remote add origin <URL_DE_TU_REPOSITORIO>
git push -u origin main
```

## Deploy en Vercel

Es un sitio 100% estático (sin build), así que Vercel lo detecta automáticamente:

1. Importa el repositorio desde [vercel.com/new](https://vercel.com/new).
2. Framework Preset: **Other** (no requiere build command ni output directory).
3. Deploy.

También puedes hacerlo desde la CLI:

```bash
npx vercel
npx vercel --prod
```
