# Booking conectado a Google Calendar (Apps Script) — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la disponibilidad estática (`horario_disponible` en `config.json`) por disponibilidad real obtenida de un Google Apps Script Web App, y hacer que confirmar una cita cree el evento en Google Calendar antes de abrir WhatsApp.

**Architecture:** El front-end estático (`js/main.js`) hace `fetch` GET al Apps Script (`?action=disponibilidad`) al cargar la página para pintar el calendario/horarios, y `fetch` POST (`action=agendar`) al confirmar una cita, antes de abrir el link `wa.me`. La URL del Apps Script vive en `config.json` (`clinica.calendar_api_url`), no hardcodeada. No hay backend propio ni build step — sigue siendo 100% estático, solo que ahora habla con un servicio externo.

**Tech Stack:** HTML5 + CSS3 + JavaScript vanilla (sin frameworks). Google Apps Script Web App ya desplegado (fuera de este repo) expone `GET ?action=disponibilidad` y `POST {action:'agendar', ...}`.

## Global Constraints

- URL del Apps Script: `https://script.google.com/macros/s/AKfycbx6at3nTWPMw7tOm1NIeaQpgFNFaVI-UCYDNO6NP2VUCUhJBsA_93a5K8V5rZAyQ6KQbA/exec` — va en `config.json`, nunca hardcodeada en `main.js`.
- Contrato GET `?action=disponibilidad` → `{ ok: true, dias: [ { fecha: "YYYY-MM-DD", slots: ["10:00", "10:30", ...] }, ... ] }`.
- Contrato POST `action=agendar` body → `{ action:'agendar', nombre, telefono, fecha:"YYYY-MM-DD", hora:"HH:mm" }`, respuesta `{ ok:true, ... }` o `{ ok:false, error:"..." }`.
- El POST debe usar `headers: { 'Content-Type': 'text/plain;charset=utf-8' }` para evitar el preflight CORS (Apps Script no responde bien a `application/json` con preflight).
- No borrar `horario_disponible` de los doctores en `config.json` — queda de referencia/fallback, ya no se usa para pintar el booking.
- Mantener paleta y tipografía actuales (navy `#1E2D4E`, teal `#3DBFBF`, error rojo `#DC2626` sobre `#FEF2F2`, botón WhatsApp verde `--verde-wa`).
- Este proyecto es HTML/CSS/JS estático sin `package.json` ni test runner — no hay tests automatizados. La "verificación" de cada tarea es manual: abrir `python -m http.server 8080` y comprobar en el navegador. La Tarea 6 cubre la verificación end-to-end completa que pidió el usuario.
- Todas las cadenas de usuario (mensajes de error, botones) van en español, consistente con el resto del sitio.

---

### Task 1: Guardar la URL del Apps Script en `config.json`

**Files:**
- Modify: `config.json:2-23` (objeto `clinica`)

**Interfaces:**
- Produces: `App.config.clinica.calendar_api_url` (string) — consumido por `fetchDisponibilidad()` y `enviarSolicitudCita()` en Task 4 y Task 5.

- [ ] **Step 1: Agregar el campo `calendar_api_url`**

En `config.json`, dentro del objeto `"clinica"`, justo después de la línea `"whatsapp": "529990000000",`, agrega:

```json
    "whatsapp": "529990000000",
    "calendar_api_url": "https://script.google.com/macros/s/AKfycbx6at3nTWPMw7tOm1NIeaQpgFNFaVI-UCYDNO6NP2VUCUhJBsA_93a5K8V5rZAyQ6KQbA/exec",
```

(el resto del objeto `clinica` — `email`, `direccion`, `maps_embed`, etc. — no cambia)

- [ ] **Step 2: Verificar que el JSON sigue siendo válido**

Run: `python -c "import json; json.load(open('config.json', encoding='utf-8')); print('OK')"`
Expected: `OK` (si falla con `JSONDecodeError`, revisa la coma que agregaste)

- [ ] **Step 3: Commit**

```bash
git add config.json
git commit -m "feat: agrega calendar_api_url a config.json para el booking con Google Calendar"
```

---

### Task 2: Hooks de HTML para loader y mensaje de error del Paso 1

**Files:**
- Modify: `index.html:109-122` (bloque `#paso-1`)

**Interfaces:**
- Produces: `#paso1-aviso` (contenedor del banner de error tras un intento de agendar fallido) y `#envoltorio-calendario` (contenedor que Task 4 reemplaza por completo según el estado: cargando / error / calendario real) — ambos consumidos por `renderPaso1()`, `mostrarAvisoPaso1()` y `ocultarAvisoPaso1()` en Task 4/5.

- [ ] **Step 1: Agregar `id="paso1-aviso"` y `id="envoltorio-calendario"`**

Reemplaza:

```html
        <!-- Paso 1: Calendario + horarios -->
        <div class="paso-contenido" id="paso-1">
          <div class="envoltorio-calendario">
            <div class="mini-calendario" id="mini-calendario">
              <!-- JS: renderCalendario() -->
            </div>
            <div class="columna-horarios">
              <p class="horarios-titulo">Horarios disponibles</p>
              <div class="grilla-horarios" id="horarios-grid">
                <p class="slots-mensaje">Selecciona un día</p>
              </div>
              <div class="nota-confirmacion">✓ Confirmación inmediata por WhatsApp</div>
            </div>
          </div>
        </div>
```

por:

```html
        <!-- Paso 1: Calendario + horarios -->
        <div class="paso-contenido" id="paso-1">
          <div id="paso1-aviso" class="aviso-paso1 oculto"></div>
          <div class="envoltorio-calendario" id="envoltorio-calendario">
            <div class="mini-calendario" id="mini-calendario">
              <!-- JS: renderCalendario() -->
            </div>
            <div class="columna-horarios">
              <p class="horarios-titulo">Horarios disponibles</p>
              <div class="grilla-horarios" id="horarios-grid">
                <p class="slots-mensaje">Selecciona un día</p>
              </div>
              <div class="nota-confirmacion">✓ Confirmación inmediata por WhatsApp</div>
            </div>
          </div>
        </div>
```

- [ ] **Step 2: Verificar visualmente que no rompe nada**

Run: `python -m http.server 8080` (desde la carpeta del proyecto), abre `http://localhost:8080` y confirma que la sección "Agenda tu cita" se ve igual que antes (el div nuevo está vacío + `oculto`, no debe notarse).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: agrega hooks de HTML para loader y aviso de error del booking"
```

---

### Task 3: CSS para loader, estado de error y banner de aviso

**Files:**
- Modify: `css/styles.css` (agregar reglas nuevas después de la línea 540, `.envoltorio-calendario { display: flex; flex-direction: column; gap: 20px; }`)

**Interfaces:**
- Produces: clases `.disponibilidad-estado`, `.disponibilidad-estado.disponibilidad-error`, `.spinner`, `.aviso-paso1` — consumidas por el HTML que genera `main.js` en Task 4/5.

- [ ] **Step 1: Insertar las reglas nuevas**

Justo después de:

```css
.envoltorio-calendario { display: flex; flex-direction: column; gap: 20px; }
```

agrega:

```css

/* Estado de carga / error de disponibilidad (reemplaza el calendario mientras no hay datos) */
.disponibilidad-estado {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 48px 20px;
  text-align: center;
}
.disponibilidad-estado p {
  font-size: 13px;
  color: var(--gris);
  max-width: 320px;
}
.disponibilidad-estado.disponibilidad-error p {
  color: var(--texto);
  font-weight: 600;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--borde);
  border-top-color: var(--teal);
  border-radius: 50%;
  animation: girar-spinner 0.7s linear infinite;
}
@keyframes girar-spinner {
  to { transform: rotate(360deg); }
}

/* Banner de aviso del Paso 1 (ej. horario ocupado al intentar agendar) */
.aviso-paso1 {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  color: #DC2626;
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}
```

- [ ] **Step 2: Verificar que el CSS carga sin errores de sintaxis**

Run: `python -m http.server 8080`, abre `http://localhost:8080`, abre la consola del navegador (F12) y confirma que no hay errores de CSS/parsing. Los estilos nuevos no se verán todavía (no hay HTML que los use hasta Task 4/5) — solo confirma que la página sigue viéndose normal.

- [ ] **Step 3: Commit**

```bash
git add css/styles.css
git commit -m "feat: agrega estilos para loader, estado de error y aviso del booking"
```

---

### Task 4: Disponibilidad real desde Google Calendar (Paso 1 — GET)

**Files:**
- Modify: `js/main.js` (múltiples bloques, detallados abajo)

**Interfaces:**
- Consumes: `App.config.clinica.calendar_api_url` (Task 1), `#envoltorio-calendario` / `#paso1-aviso` (Task 2), clases CSS de Task 3.
- Produces: `App.disponibilidad` (array `{fecha, slots}` o `null`), `App.disponibilidadCargando` (bool), `App.disponibilidadError` (bool), función `fechaISO(date)`, función `fetchDisponibilidad()`, función `renderPaso1()`, función `mostrarAvisoPaso1(mensaje)`, función `ocultarAvisoPaso1()` — todas consumidas por Task 5.

- [ ] **Step 1: Actualizar el estado global `App`**

Reemplaza:

```js
/* Estado global de la app */
const App = {
  config: null,
  paso: 1,
  mesOffset: 0,
  seleccion: {
    doctor:     null,
    diaFecha:   null,
    diaNombre:  '',
    hora:       null
  }
};
```

por:

```js
/* Estado global de la app */
const App = {
  config: null,
  paso: 1,
  mesOffset: 0,
  disponibilidad: null,          // array [{fecha:"YYYY-MM-DD", slots:["10:00",...]}] desde Apps Script
  disponibilidadCargando: true,
  disponibilidadError: false,
  seleccion: {
    diaFecha:   null,
    diaNombre:  '',
    fechaTexto: '',
    hora:       null
  }
};
```

- [ ] **Step 2: Cambiar `init()` para lanzar `fetchDisponibilidad()` después de renderizar**

Reemplaza:

```js
async function init() {
  try {
    const res = await fetch('config.json');
    if (!res.ok) throw new Error('No se pudo cargar config.json');
    App.config = await res.json();
    renderTodo();
  } catch (e) {
    console.error('OdonTHÓ — error cargando config:', e);
    document.body.innerHTML = `<div style="padding:40px;text-align:center;font-family:Arial">
      <h2>Error al cargar la página</h2>
      <p>Abre este proyecto desde un servidor local o GitHub Pages.</p>
    </div>`;
  }
}
```

por:

```js
async function init() {
  try {
    const res = await fetch('config.json');
    if (!res.ok) throw new Error('No se pudo cargar config.json');
    App.config = await res.json();
    renderTodo();
    fetchDisponibilidad();
  } catch (e) {
    console.error('OdonTHÓ — error cargando config:', e);
    document.body.innerHTML = `<div style="padding:40px;text-align:center;font-family:Arial">
      <h2>Error al cargar la página</h2>
      <p>Abre este proyecto desde un servidor local o GitHub Pages.</p>
    </div>`;
  }
}
```

- [ ] **Step 3: Cambiar `renderTodo()` para usar `renderPaso1()` en vez de `renderCalendario()`**

Reemplaza:

```js
function renderTodo() {
  renderNav();
  renderHero();
  renderTrustBar();
  renderCalendario();
  renderEspecialidades();
```

por:

```js
function renderTodo() {
  renderNav();
  renderHero();
  renderTrustBar();
  renderPaso1();
  renderEspecialidades();
```

- [ ] **Step 4: Reemplazar el bloque completo de "BOOKING — PASO 1: FECHA Y HORARIO"**

Reemplaza TODO este bloque (desde el comentario de cabecera hasta el cierre de `renderHorarios()`):

```js
/* ============================================================
   BOOKING — PASO 1: FECHA Y HORARIO
   Todas las citas son de valoración general: no se elige servicio
   ni doctor de antemano. El calendario combina la disponibilidad
   de ambos especialistas; cada horario indica con quién es.
   ============================================================ */

/* Devuelve el apellido paterno de un nombre completo, ej. "Dra. Miriam Edith Preciado Oseguera" -> "Preciado" */
function apellidoPaterno(nombre) {
  const palabras = nombre.replace(/^(Dr\.|Dra\.)\s*/i, '').split(' ').filter(Boolean);
  if (palabras.length < 2) return palabras[0] || '';
  return palabras.length >= 3 ? palabras[palabras.length - 2] : palabras[palabras.length - 1];
}

/* Nombre corto para etiquetar horarios, ej. "Dra. Preciado" */
function nombreCorto(doc) {
  const prefijo = /^dra\./i.test(doc.nombre) ? 'Dra.' : /^dr\./i.test(doc.nombre) ? 'Dr.' : '';
  return `${prefijo} ${apellidoPaterno(doc.nombre)}`.trim();
}

function horaAMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function renderCalendario() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const mes = new Date(hoy.getFullYear(), hoy.getMonth() + App.mesOffset, 1);

  /* Un día está disponible si CUALQUIER doctor tiene horario ese día */
  const diasDisp = new Set();
  App.config.doctores.forEach(doc => {
    Object.keys(doc.horario_disponible).forEach(dia => {
      if (doc.horario_disponible[dia].length > 0) diasDisp.add(DIAS_MAP[dia]);
    });
  });

  const nombreMes = `${MESES_CAP[mes.getMonth()]} ${mes.getFullYear()}`;
  const primerDia = mes.getDay();
  const offsetLunes = primerDia === 0 ? 6 : primerDia - 1;
  const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();

  let diasHTML = '';

  for (let i = 0; i < offsetLunes; i++) {
    diasHTML += '<div class="cal-dia vacio"></div>';
  }

  for (let d = 1; d <= ultimoDia; d++) {
    const fecha = new Date(mes.getFullYear(), mes.getMonth(), d);
    const esPasado = fecha <= hoy;
    const disponible = !esPasado && diasDisp.has(fecha.getDay());

    let clase = 'cal-dia';
    if (esPasado || !disponible) clase += ' ' + (esPasado ? 'pasado' : 'no-disponible');
    else clase += ' disponible';

    /* Marcar día seleccionado */
    if (App.seleccion.diaFecha && App.seleccion.diaFecha.getTime() === fecha.getTime()) {
      clase += ' seleccionado';
    }

    const onclick = disponible ? `onclick="seleccionarDia(${fecha.getTime()})"` : '';
    diasHTML += `<div class="${clase}" ${onclick}>${d}</div>`;
  }

  document.getElementById('mini-calendario').innerHTML = `
    <div class="cal-encabezado">
      <button class="cal-nav-btn" onclick="cambiarMes(-1)">‹</button>
      <span class="cal-mes-titulo">${nombreMes}</span>
      <button class="cal-nav-btn" onclick="cambiarMes(1)">›</button>
    </div>
    <div class="cal-dias-semana">
      ${['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => `<div class="cal-dia-sem">${d}</div>`).join('')}
    </div>
    <div class="cal-dias">${diasHTML}</div>
    <div class="cal-leyenda">
      <span class="leyenda-item"><span class="leyenda-color disponible"></span>Disponible</span>
      <span class="leyenda-item"><span class="leyenda-color no-disponible"></span>Sin citas</span>
    </div>
  `;
}

function cambiarMes(delta) {
  App.mesOffset += delta;
  /* No permitir ir a meses pasados */
  if (App.mesOffset < 0) App.mesOffset = 0;
  renderCalendario();
}

function seleccionarDia(timestamp) {
  App.seleccion.diaFecha = new Date(timestamp);
  const fecha = App.seleccion.diaFecha;

  const nombreDia = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][fecha.getDay()];
  App.seleccion.diaNombre = nombreDia;
  App.seleccion.hora = null;
  App.seleccion.doctor = null;

  const fechaStr = `${['dom','lun','mar','mié','jue','vie','sáb'][fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
  App.seleccion.fechaTexto = fechaStr;

  renderCalendario();
  renderHorarios();
  actualizarResumen();
}

function renderHorarios() {
  const fecha = App.seleccion.diaFecha;
  const grid = document.getElementById('horarios-grid');

  if (!fecha) {
    grid.innerHTML = '<p class="slots-mensaje">Selecciona un día en el calendario</p>';
    return;
  }

  const dia = App.seleccion.diaNombre;
  const slots = [];
  App.config.doctores.forEach(doc => {
    (doc.horario_disponible[dia] || []).forEach(hora => {
      slots.push({ hora, doctorId: doc.id, doctorLabel: nombreCorto(doc) });
    });
  });
  slots.sort((a, b) => horaAMinutos(a.hora) - horaAMinutos(b.hora));

  if (slots.length === 0) {
    grid.innerHTML = '<p class="slots-mensaje">Sin citas disponibles este día</p>';
    return;
  }

  grid.innerHTML = slots.map(s => {
    const sel = (App.seleccion.hora === s.hora && App.seleccion.doctor?.id === s.doctorId) ? ' seleccionado' : '';
    return `
      <div class="slot-horario disponible${sel}" onclick="seleccionarHorario('${s.hora}', '${s.doctorId}')">
        <span class="slot-hora">${s.hora}</span>
        <span class="slot-doctor">${s.doctorLabel}</span>
      </div>
    `;
  }).join('');
}

function seleccionarHorario(hora, doctorId) {
  App.seleccion.hora = hora;
  App.seleccion.doctor = App.config.doctores.find(d => d.id === doctorId) || null;
  renderHorarios();
  actualizarResumen();
}

function actualizarResumen() {
  const s = App.seleccion;
  document.getElementById('resumen-fecha').textContent = s.fechaTexto || 'Elige una fecha';
  document.getElementById('resumen-hora').textContent = s.hora
    ? `${s.hora}${s.doctor ? ' · ' + nombreCorto(s.doctor) : ''}`
    : 'Selecciona un horario';
}
```

por:

```js
/* ============================================================
   BOOKING — PASO 1: FECHA Y HORARIO
   Todas las citas son de valoración general: no se elige servicio
   ni doctor de antemano. La disponibilidad viene de Google Calendar
   vía Apps Script (App.config.clinica.calendar_api_url) — ya no de
   horario_disponible en config.json (que queda solo de referencia).
   ============================================================ */

function horaAMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/* Formatea un Date como "YYYY-MM-DD" en hora LOCAL (no usar toISOString: desfasa un día cerca de medianoche por UTC) */
function fechaISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/* Trae la disponibilidad real desde el Apps Script y repinta el Paso 1 */
async function fetchDisponibilidad() {
  App.disponibilidadCargando = true;
  App.disponibilidadError = false;
  renderPaso1();

  try {
    const base = App.config.clinica.calendar_api_url;
    const res = await fetch(`${base}?action=disponibilidad`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Respuesta inválida del Apps Script');
    App.disponibilidad = data.dias || [];
    App.disponibilidadCargando = false;
  } catch (e) {
    console.error('OdonTHÓ — error cargando disponibilidad:', e);
    App.disponibilidad = null;
    App.disponibilidadCargando = false;
    App.disponibilidadError = true;
  }

  renderPaso1();
}

/* Markup normal del Paso 1 (calendario + columna de horarios) */
function envoltorioCalendarioHTML() {
  return `
    <div class="mini-calendario" id="mini-calendario"></div>
    <div class="columna-horarios">
      <p class="horarios-titulo">Horarios disponibles</p>
      <div class="grilla-horarios" id="horarios-grid">
        <p class="slots-mensaje">Selecciona un día</p>
      </div>
      <div class="nota-confirmacion">✓ Confirmación inmediata por WhatsApp</div>
    </div>
  `;
}

function calendarioLoaderHTML() {
  return `
    <div class="disponibilidad-estado">
      <div class="spinner" aria-hidden="true"></div>
      <p>Cargando horarios disponibles…</p>
    </div>
  `;
}

function calendarioErrorHTML() {
  const mensajeWa = 'Hola, me gustaría agendar una cita de valoración. ¿Me ayudan con la disponibilidad?';
  const link = `https://wa.me/${App.config.clinica.whatsapp}?text=${encodeURIComponent(mensajeWa)}`;
  return `
    <div class="disponibilidad-estado disponibilidad-error">
      <p>No pudimos cargar los horarios, escríbenos por WhatsApp</p>
      <a href="${link}" target="_blank" rel="noopener" class="conf-wa-btn">
        ${icono('mensaje')} Escríbenos por WhatsApp
      </a>
    </div>
  `;
}

/* Decide qué mostrar en #envoltorio-calendario según el estado de la disponibilidad */
function renderPaso1() {
  const envoltorio = document.getElementById('envoltorio-calendario');

  if (App.disponibilidadCargando) {
    envoltorio.innerHTML = calendarioLoaderHTML();
    return;
  }
  if (App.disponibilidadError) {
    envoltorio.innerHTML = calendarioErrorHTML();
    return;
  }

  envoltorio.innerHTML = envoltorioCalendarioHTML();
  renderCalendario();
  renderHorarios();
}

function renderCalendario() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const mes = new Date(hoy.getFullYear(), hoy.getMonth() + App.mesOffset, 1);

  /* Un día está disponible si el Apps Script devolvió slots para esa fecha */
  const diasDisponibles = new Set(
    (App.disponibilidad || [])
      .filter(d => (d.slots || []).length > 0)
      .map(d => d.fecha)
  );

  const nombreMes = `${MESES_CAP[mes.getMonth()]} ${mes.getFullYear()}`;
  const primerDia = mes.getDay();
  const offsetLunes = primerDia === 0 ? 6 : primerDia - 1;
  const ultimoDia = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();

  let diasHTML = '';

  for (let i = 0; i < offsetLunes; i++) {
    diasHTML += '<div class="cal-dia vacio"></div>';
  }

  for (let d = 1; d <= ultimoDia; d++) {
    const fecha = new Date(mes.getFullYear(), mes.getMonth(), d);
    const esPasado = fecha <= hoy;
    const disponible = !esPasado && diasDisponibles.has(fechaISO(fecha));

    let clase = 'cal-dia';
    if (esPasado || !disponible) clase += ' ' + (esPasado ? 'pasado' : 'no-disponible');
    else clase += ' disponible';

    /* Marcar día seleccionado */
    if (App.seleccion.diaFecha && App.seleccion.diaFecha.getTime() === fecha.getTime()) {
      clase += ' seleccionado';
    }

    const onclick = disponible ? `onclick="seleccionarDia(${fecha.getTime()})"` : '';
    diasHTML += `<div class="${clase}" ${onclick}>${d}</div>`;
  }

  document.getElementById('mini-calendario').innerHTML = `
    <div class="cal-encabezado">
      <button class="cal-nav-btn" onclick="cambiarMes(-1)">‹</button>
      <span class="cal-mes-titulo">${nombreMes}</span>
      <button class="cal-nav-btn" onclick="cambiarMes(1)">›</button>
    </div>
    <div class="cal-dias-semana">
      ${['Lu','Ma','Mi','Ju','Vi','Sa','Do'].map(d => `<div class="cal-dia-sem">${d}</div>`).join('')}
    </div>
    <div class="cal-dias">${diasHTML}</div>
    <div class="cal-leyenda">
      <span class="leyenda-item"><span class="leyenda-color disponible"></span>Disponible</span>
      <span class="leyenda-item"><span class="leyenda-color no-disponible"></span>Sin citas</span>
    </div>
  `;
}

function cambiarMes(delta) {
  App.mesOffset += delta;
  /* No permitir ir a meses pasados */
  if (App.mesOffset < 0) App.mesOffset = 0;
  renderCalendario();
}

function seleccionarDia(timestamp) {
  App.seleccion.diaFecha = new Date(timestamp);
  const fecha = App.seleccion.diaFecha;

  const nombreDia = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][fecha.getDay()];
  App.seleccion.diaNombre = nombreDia;
  App.seleccion.hora = null;

  const fechaStr = `${['dom','lun','mar','mié','jue','vie','sáb'][fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
  App.seleccion.fechaTexto = fechaStr;

  ocultarAvisoPaso1();
  renderCalendario();
  renderHorarios();
  actualizarResumen();
}

function renderHorarios() {
  const fecha = App.seleccion.diaFecha;
  const grid = document.getElementById('horarios-grid');

  if (!fecha) {
    grid.innerHTML = '<p class="slots-mensaje">Selecciona un día en el calendario</p>';
    return;
  }

  const diaData = (App.disponibilidad || []).find(d => d.fecha === fechaISO(fecha));
  const slots = ((diaData && diaData.slots) || []).slice().sort((a, b) => horaAMinutos(a) - horaAMinutos(b));

  if (slots.length === 0) {
    grid.innerHTML = '<p class="slots-mensaje">Sin citas disponibles este día</p>';
    return;
  }

  grid.innerHTML = slots.map(hora => {
    const sel = App.seleccion.hora === hora ? ' seleccionado' : '';
    return `
      <div class="slot-horario disponible${sel}" onclick="seleccionarHorario('${hora}')">
        <span class="slot-hora">${hora}</span>
      </div>
    `;
  }).join('');
}

function seleccionarHorario(hora) {
  App.seleccion.hora = hora;
  ocultarAvisoPaso1();
  renderHorarios();
  actualizarResumen();
}

function actualizarResumen() {
  const s = App.seleccion;
  document.getElementById('resumen-fecha').textContent = s.fechaTexto || 'Elige una fecha';
  document.getElementById('resumen-hora').textContent = s.hora || 'Selecciona un horario';
}

/* Banner de aviso del Paso 1 (ej. "ese horario acaba de ocuparse") */
function mostrarAvisoPaso1(mensaje) {
  const aviso = document.getElementById('paso1-aviso');
  aviso.textContent = mensaje;
  aviso.classList.remove('oculto');
}

function ocultarAvisoPaso1() {
  const aviso = document.getElementById('paso1-aviso');
  aviso.classList.add('oculto');
  aviso.textContent = '';
}
```

**Nota para quien implemente:** este reemplazo quita las funciones `apellidoPaterno()` y `nombreCorto()` (quedaban muertas: ya nada en el nuevo flujo etiqueta el horario con el doctor, porque el Apps Script no manda esa información — solo `fecha`/`slots`). No las agregues de vuelta.

- [ ] **Step 5: Quitar el campo `doctor` del resumen/confirmación (paso 2)**

Busca esta línea dentro de `renderConfirmacion()`:

```js
      ${s.doctor ? `Con ${nombreCorto(s.doctor)}` : ''}
```

y bórrala (la línea completa). El bloque `renderConfirmacion()` queda así:

```js
function renderConfirmacion() {
  const s = App.seleccion;

  document.getElementById('confirmacion-cita').innerHTML = `
    <div class="conf-icono">${icono('check', 'ic ic-conf')}</div>
    <h3 class="conf-titulo">¡Ya casi! Confirma tu cita de valoración</h3>
    <p class="conf-detalle">
      ${s.fechaTexto || ''} · ${s.hora || ''}<br>
    </p>
    <div class="form-fila">
      <input type="text" id="booking-nombre" placeholder="Tu nombre completo" autocomplete="name">
      <input type="tel" id="booking-tel" placeholder="WhatsApp / teléfono" autocomplete="tel">
    </div>
    <button class="conf-wa-btn" id="booking-btn-enviar" onclick="enviarSolicitudCita()">
      ${icono('mensaje')} Enviar solicitud por WhatsApp
    </button>
  `;
}
```

- [ ] **Step 6: Verificación manual del Paso 1**

Run: `python -m http.server 8080` desde la carpeta del proyecto, abre `http://localhost:8080#citas` y confirma en el navegador:
1. Al cargar, el calendario muestra brevemente el spinner ("Cargando horarios disponibles…").
2. Después de 1–2 seg, aparece el calendario real con los días que trae el Apps Script marcados como disponibles (compara con lo que ves en Google Calendar).
3. Al hacer clic en un día disponible, los horarios mostrados coinciden con los `slots` de ese día en la respuesta de `?action=disponibilidad` (puedes verificar pegando esa URL en una pestaña nueva).
4. Abre la consola (F12) y confirma que no hay errores de JS.

Expected: sin errores en consola, calendario y horarios reflejan datos reales del Apps Script.

- [ ] **Step 7: Commit**

```bash
git add js/main.js
git commit -m "feat: conecta el calendario del booking a disponibilidad real de Google Calendar"
```

---

### Task 5: Crear el evento al confirmar la cita (Paso 2 — POST)

**Files:**
- Modify: `js/main.js:443-474` (función `enviarSolicitudCita`)

**Interfaces:**
- Consumes: `fechaISO()`, `App.seleccion`, `App.config.clinica.calendar_api_url`, `mostrarAvisoPaso1()`, `ocultarAvisoPaso1()`, `fetchDisponibilidad()` (todas de Task 4).
- Produces: comportamiento final del botón "Enviar solicitud por WhatsApp" — POST a Apps Script antes de abrir `wa.me`.

- [ ] **Step 1: Agregar `mostrarAvisoEnvio()` para errores de red que no son "horario ocupado"**

Justo antes de `function enviarSolicitudCita() {`, agrega:

```js
/* Mensaje genérico de error de envío (sin marcar ningún campo como inválido) */
function mostrarAvisoEnvio(mensaje) {
  let aviso = document.getElementById('booking-aviso-error');
  if (!aviso) {
    aviso = document.createElement('p');
    aviso.id = 'booking-aviso-error';
    aviso.className = 'form-error-msg';
    document.getElementById('booking-btn-enviar').before(aviso);
  }
  aviso.textContent = mensaje;
}

```

- [ ] **Step 2: Reemplazar `enviarSolicitudCita()` para que agende en Google Calendar antes de abrir WhatsApp**

Reemplaza:

```js
function enviarSolicitudCita() {
  limpiarErroresBooking();

  const inputNombre = document.getElementById('booking-nombre');
  const inputTel    = document.getElementById('booking-tel');
  const nombre = inputNombre.value.trim();
  const tel    = inputTel.value.trim();

  if (nombre.length < 2) {
    marcarErrorBooking(inputNombre, 'Por favor escribe tu nombre.');
    return;
  }

  /* Teléfono mexicano: 10 dígitos (se ignoran espacios, guiones y +52) */
  const soloDigitos = tel.replace(/\D/g, '').replace(/^52/, '');
  if (soloDigitos.length !== 10) {
    marcarErrorBooking(inputTel, 'Escribe un teléfono de 10 dígitos, ej. 999 123 4567.');
    return;
  }

  const s = App.seleccion;
  const mensaje = [
    `Hola, me gustaría agendar una cita de valoración en OdonThó.`,
    `Nombre: ${nombre}`,
    `Fecha preferida: ${s.fechaTexto || ''}`,
    `Hora preferida: ${s.hora || ''}`,
    `Quedo al pendiente para confirmar. ¡Gracias!`
  ].join('\n');

  const link = `https://wa.me/${App.config.clinica.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  window.open(link, '_blank', 'noopener');
}
```

por:

```js
async function enviarSolicitudCita() {
  limpiarErroresBooking();

  const inputNombre = document.getElementById('booking-nombre');
  const inputTel    = document.getElementById('booking-tel');
  const nombre = inputNombre.value.trim();
  const tel    = inputTel.value.trim();

  if (nombre.length < 2) {
    marcarErrorBooking(inputNombre, 'Por favor escribe tu nombre.');
    return;
  }

  /* Teléfono mexicano: 10 dígitos (se ignoran espacios, guiones y +52) */
  const soloDigitos = tel.replace(/\D/g, '').replace(/^52/, '');
  if (soloDigitos.length !== 10) {
    marcarErrorBooking(inputTel, 'Escribe un teléfono de 10 dígitos, ej. 999 123 4567.');
    return;
  }

  const s = App.seleccion;
  const btn = document.getElementById('booking-btn-enviar');
  const textoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Agendando…';

  try {
    const res = await fetch(App.config.clinica.calendar_api_url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'agendar',
        nombre,
        telefono: soloDigitos,
        fecha: fechaISO(s.diaFecha),
        hora: s.hora
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data.ok) {
      volverAPaso1ConError(data.error || 'Ese horario acaba de ocuparse, elige otro.');
      return;
    }
  } catch (e) {
    console.error('OdonTHÓ — error agendando cita:', e);
    btn.disabled = false;
    btn.innerHTML = textoOriginal;
    mostrarAvisoEnvio('No pudimos agendar tu cita. Inténtalo de nuevo o escríbenos por WhatsApp.');
    return;
  }

  const mensaje = [
    `Hola, me gustaría agendar una cita de valoración en OdonThó.`,
    `Nombre: ${nombre}`,
    `Fecha preferida: ${s.fechaTexto || ''}`,
    `Hora preferida: ${s.hora || ''}`,
    `Quedo al pendiente para confirmar. ¡Gracias!`
  ].join('\n');

  const link = `https://wa.me/${App.config.clinica.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  window.open(link, '_blank', 'noopener');
}

/* La cita ya no se pudo agendar (ok:false, ej. alguien más tomó el horario):
   vuelve al Paso 1, refresca disponibilidad real y avisa al usuario */
function volverAPaso1ConError(mensaje) {
  App.seleccion.hora = null;
  irAPaso(1);
  mostrarAvisoPaso1(mensaje);
  fetchDisponibilidad();
}
```

**Nota de diseño (por qué hay dos caminos de error distintos):** el spec distingue un solo caso explícito — `ok:false` ("ese horario acaba de ocuparse") — para el cual pide volver al paso de selección. Una falla de red/fetch (catch) es un caso distinto: no sabemos si el horario sigue libre, así que no tiene sentido mandar al usuario a re-elegir; lo dejamos en el Paso 2 con un aviso y puede reintentar sin volver a escribir sus datos.

- [ ] **Step 3: Verificación manual del Paso 2 — camino feliz**

Con `python -m http.server 8080` corriendo:
1. Completa el booking: elige fecha/hora reales (Task 4 ya debe estar funcionando), pasa a "Confirmar", llena nombre y teléfono (10 dígitos), da clic en "Enviar solicitud por WhatsApp".
2. El botón debe mostrar brevemente "Agendando…" y quedar deshabilitado durante la petición.
3. Confirma en Google Calendar que se creó el evento nuevo en la fecha/hora elegida, con el texto **"SIN CONFIRMAR"** (o el marcador que use el Apps Script) en el título/descripción.
4. Confirma que se abre una pestaña de WhatsApp (`wa.me`) con el mensaje prellenado de valoración, igual que antes.

Expected: evento creado en Calendar + WhatsApp se abre con el mensaje correcto.

- [ ] **Step 4: Verificación manual del Paso 2 — camino de conflicto**

Para forzar `ok:false`: agenda dos veces seguidas el mismo horario (en dos pestañas, o vuelve a intentar el mismo slot justo después de agendarlo). Confirma:
1. El segundo intento NO abre WhatsApp.
2. Regresa automáticamente al Paso 1 (tab "Fecha").
3. Aparece el banner rojo arriba del calendario con el mensaje de error devuelto por el Apps Script.
4. El calendario se refresca (spinner breve) y el horario recién ocupado ya no aparece disponible.

Expected: sin crear un segundo evento duplicado, usuario queda en Paso 1 con aviso claro.

- [ ] **Step 5: Commit**

```bash
git add js/main.js
git commit -m "feat: agenda la cita en Google Calendar antes de abrir WhatsApp"
```

---

### Task 6: Verificación end-to-end y actualización del README

**Files:**
- Modify: `README.md` (sección "Estado actual" y "Pendiente / siguiente sesión")

**Interfaces:**
- Ninguna — tarea de cierre.

- [ ] **Step 1: Correr la verificación completa que pidió el usuario**

Con `python -m http.server 8080`:
1. El calendario carga fechas reales del Apps Script (spinner → calendario real, sin fechas hardcodeadas de `horario_disponible`).
2. Al agendar, se crea el evento en Google Calendar y aparece **"SIN CONFIRMAR"**.
3. El flujo de WhatsApp sigue funcionando después de agendar (se abre `wa.me` con el mensaje de valoración prellenado).

Si algo falla, vuelve a la tarea correspondiente (4 o 5) antes de continuar — no marques este paso como hecho con fallas pendientes.

- [ ] **Step 2: Actualizar `README.md`**

En la sección "### Pendiente / siguiente sesión", quita el punto 1 (WhatsApp automatizado) si el flujo POST→wa.me ya cubre "confirmar antes de escribir" — o ajústalo según lo que realmente falte después de probar. Agrega a "Estado actual (contexto para retomar)" una línea nueva describiendo que el booking ahora usa disponibilidad real de Google Calendar vía Apps Script (`clinica.calendar_api_url` en `config.json`), y que `horario_disponible` de los doctores quedó como referencia sin uso activo.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: documenta el booking conectado a Google Calendar"
```

---

## Self-Review (spec coverage)

- Paso 1 hace `fetch` a `?action=disponibilidad`, solo muestra como disponibles las fechas devueltas, muestra slots del día elegido → Task 4.
- Loader mientras carga (1–2 seg) → Task 3 (CSS) + Task 4 (`calendarioLoaderHTML`).
- Fallback amable + botón WhatsApp si el fetch falla → Task 4 (`calendarioErrorHTML`).
- Paso 2 hace POST con `action:'agendar'` antes de abrir WhatsApp, con el body exacto pedido → Task 5.
- `ok:true` → confirma y abre WhatsApp como ya hacía; `ok:false` → muestra el error y vuelve a selección → Task 5.
- CORS con `text/plain;charset=utf-8` para evitar preflight → Task 5, Step 2.
- Diseño editorial navy/teal se mantiene (reutiliza `.conf-wa-btn`, variables de color existentes) → Task 3.
- Flujo de WhatsApp final se conserva igual → Task 5, Step 2 (mismo mensaje/link que antes).
- URL del Apps Script en `config.json`, no hardcodeada → Task 1.
- `horario_disponible` no se borra → Task 4 (comentario explícito, no se toca `config.json` de doctores).
- Los tres checks de prueba del usuario → Task 6, Step 1.
