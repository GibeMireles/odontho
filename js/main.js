/* ============================================================
   OdonTHÓ — main.js
   Carga config.json y renderiza todas las secciones
   Sin frameworks · Sin bundlers
   ============================================================ */

/* Mapeo de días españoles a número JS (domingo=0) */
const DIAS_MAP = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3,
  jueves: 4, viernes: 5, sabado: 6
};

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'
];

const MESES_CAP = MESES.map(m => m.charAt(0).toUpperCase() + m.slice(1));

/* ============================================================
   ÍCONOS — set SVG consistente (trazo 24×24 estilo Lucide)
   Los servicios en config.json referencian estos nombres.
   Si el nombre no existe en el mapa, se renderiza tal cual
   (permite seguir usando emojis o texto como fallback).
   ============================================================ */

const ICONOS = {
  diente:       '<path d="M12 5.5C10.5 4 9 3 7 3 4 3 2 5.5 2 8.5c0 5 3 7 4 12 .3 1.5 2.5 1.5 3-.5.5-2 .5-5 3-5s2.5 3 3 5c.5 2 2.7 2 3 .5 1-5 4-7 4-12 0-3-2-5.5-5-5.5-2 0-3.5 1-5 2.5z"/>',
  implante:     '<path d="M12 3C9.8 3 8 4.3 8 6.5c0 1.8 1 3 1 5.5h6c0-2.5 1-3.7 1-5.5C16 4.3 14.2 3 12 3z"/><path d="M9.5 15h5"/><path d="M10 18h4"/><path d="M10.8 21h2.4"/>',
  urgencia:     '<path d="M11 2a2 2 0 0 0-2 2v5H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5h5a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-5V4a2 2 0 0 0-2-2z"/>',
  bebe:         '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',
  escudo:       '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  corona:       '<path d="M2 7l4.5 4L12 4l5.5 7L22 7l-2 12H4L2 7z"/>',
  pulso:        '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.5 12h4l1.5-2 2 4 2-6 1.5 4h5"/>',
  sonrisa:      '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  escaneo:      '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
  microscopio:  '<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>',
  hueso:        '<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/>',
  estetoscopio: '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  biberon:      '<path d="M9 8h6"/><path d="M10 4h4"/><path d="M10 4a2 2 0 0 0-2 2v1a2 2 0 0 0 1 1.73V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8.73A2 2 0 0 0 16 7V6a2 2 0 0 0-2-2"/><path d="M9 12h6"/><path d="M9 16h6"/>',
  calendario:   '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  mensaje:      '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  estrella:     '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  usuario:      '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  graduacion:   '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3.5 2.5 8.5 2.5 12 0v-5"/><path d="M22 10v6"/>',
  ubicacion:    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  telefono:     '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  reloj:        '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  check:        '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  candado:      '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  instagram:    '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  facebook:     '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'
};

/* Genera un <svg> inline; si el nombre no está en el mapa, devuelve el valor tal cual */
function icono(nombre, clase = 'ic') {
  const path = ICONOS[nombre];
  if (!path) return nombre || '';
  const fill = nombre === 'estrella' ? 'currentColor' : 'none';
  return `<svg class="${clase}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

/* Estado global de la app */
const App = {
  config: null,
  paso: 1,
  mesOffset: 0,
  mostrarTodosServicios: false,
  seleccion: {
    servicio:   null,
    especialidad: null,
    doctor:     null,
    diaFecha:   null,
    diaNombre:  '',
    hora:       null
  }
};


/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

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

function renderTodo() {
  renderNav();
  renderHero();
  renderTrustBar();
  renderServiciosCita();
  renderEspecialidades();
  renderFiltros();
  renderServicios('todos');
  renderDoctores();
  renderTestimonios();
  renderFaq();
  renderSelectServicios();
  renderFooter();
  configurarWa();
}

document.addEventListener('DOMContentLoaded', init);


/* ============================================================
   NAV — actualiza logo/cta desde config
   ============================================================ */

function renderNav() {
  /* El logo ya está en HTML; solo actualizamos el CTA si necesario */
  const navCta = document.querySelector('.nav-cta');
  if (navCta) navCta.href = '#citas';
}

function toggleMenu() {
  document.getElementById('nav-enlaces').classList.toggle('abierto');
}

function cerrarMenu() {
  document.getElementById('nav-enlaces').classList.remove('abierto');
}


/* ============================================================
   HERO
   ============================================================ */

function renderHero() {
  const c = App.config.clinica;

  document.getElementById('hero-tagline').textContent = c.tagline;
  document.getElementById('hero-descripcion').textContent = c.descripcion;

  const waLink = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent('Hola, me interesa agendar una cita en OdonTHÓ.')}`;
  document.getElementById('hero-wa').href = waLink;

  /* Tarjetas de doctores en el visual */
  const visual = document.getElementById('hero-visual');
  const tarjetas = App.config.doctores.map(doc => {
    const opinionesTexto = doc.opiniones_doctoralia
      ? `${icono('estrella', 'ic ic-estrella')} ${doc.opiniones_doctoralia} opiniones`
      : `${icono('estrella', 'ic ic-estrella')} Doctoralia`;
    return `
      <div class="hero-tarjeta-doctor">
        <div class="htd-avatar">${renderFoto(doc.foto, doc.nombre, doc.foto_posicion)}</div>
        <div class="htd-info">
          <div class="htd-nombre">${doc.nombre}</div>
          <div class="htd-especialidad">${doc.especialidad}</div>
        </div>
        <div class="htd-opiniones">${opinionesTexto}</div>
      </div>
    `;
  }).join('');
  visual.innerHTML = tarjetas;
}

/* Intenta renderizar <img> y fallback a iniciales si la imagen no carga */
/* Nombre + apellido paterno, ej. "Dra. Miriam Edith Preciado Oseguera" -> "MP" */
function iniciales(nombre) {
  const palabras = nombre.replace(/^(Dr\.|Dra\.)\s*/i, '').split(' ').filter(Boolean);
  if (palabras.length < 2) return (palabras[0] || '').slice(0, 2).toUpperCase();
  const apellido = palabras.length >= 3 ? palabras[palabras.length - 2] : palabras[palabras.length - 1];
  return (palabras[0][0] + apellido[0]).toUpperCase();
}

function renderFoto(src, nombre, posicion) {
  if (!src) return iniciales(nombre);
  const style = posicion ? ` style="object-position:${posicion}"` : '';
  return `<img src="${src}" alt="${nombre}"${style} onerror="this.parentElement.textContent='${iniciales(nombre)}'">`;
}


/* ============================================================
   BARRA DE CONFIANZA
   ============================================================ */

function renderTrustBar() {
  const doctores = App.config.doctores;
  const maxOp = Math.max(...doctores.map(d => d.opiniones_doctoralia || 0));
  /* Redondear hacia abajo a la centena: 404 → "400+" (evita leerse como error HTTP) */
  const opTexto = maxOp >= 100 ? `${Math.floor(maxOp / 100) * 100}+` : `${maxOp}+`;

  const items = [
    { num: opTexto,          etiqueta: 'Opiniones Doctoralia' },
    { num: '19 años',        etiqueta: 'De experiencia' },
    { num: '2',              etiqueta: 'Especialistas SEDENA' },
    { num: 'Mérida',         etiqueta: 'Yucatán' }
  ];

  document.getElementById('trust-bar').innerHTML = items.map(i => `
    <div class="confianza-item">
      <span class="confianza-num">${i.num}</span>
      <span class="confianza-etiqueta">${i.etiqueta}</span>
    </div>
  `).join('');
}


/* ============================================================
   BOOKING — PASO 1: SERVICIOS
   ============================================================ */

function renderServiciosCita() {
  const servicios = App.config.servicios;
  const grid = document.getElementById('servicios-cita-grid');

  /* Ordenar: destacados primero */
  const ordenados = [...servicios].sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));

  /* Mostrar solo destacados al inicio; el resto se expande con "Ver todos" */
  const destacados = ordenados.filter(s => s.destacado);
  const visibles = App.mostrarTodosServicios || destacados.length === 0 ? ordenados : destacados;
  const ocultos = ordenados.length - visibles.length;

  const tarjetas = visibles.map(s => `
    <div class="tarjeta-servicio-cita ${s.destacado ? 'tsc-destacado' : ''}"
         id="tsc-${s.id}"
         onclick="seleccionarServicio('${s.id}')">
      <span class="tsc-icono">${icono(s.icono)}</span>
      <div class="tsc-nombre">${s.nombre}</div>
      ${s.precio_desde ? `<div class="tsc-precio">${s.precio_texto}</div>` : ''}
    </div>
  `).join('');

  const btnVerTodos = ocultos > 0
    ? `<button class="tsc-ver-todos" onclick="verTodosServicios()">+ Ver los ${ocultos} servicios restantes</button>`
    : '';

  grid.innerHTML = tarjetas + btnVerTodos;

  /* Restaurar selección previa o pre-seleccionar el primero */
  const previo = App.seleccion.servicio;
  seleccionarServicio(previo && visibles.some(s => s.id === previo.id) ? previo.id : visibles[0].id);
}

function verTodosServicios() {
  App.mostrarTodosServicios = true;
  renderServiciosCita();
}

function seleccionarServicio(id) {
  const servicios = App.config.servicios;
  const servicio = servicios.find(s => s.id === id);
  if (!servicio) return;

  /* Quitar activa de todas */
  document.querySelectorAll('.tarjeta-servicio-cita').forEach(el => el.classList.remove('activa'));
  const el = document.getElementById(`tsc-${id}`);
  if (el) el.classList.add('activa');

  App.seleccion.servicio = servicio;

  /* Determinar especialidad y doctor */
  const especialidad = App.config.especialidades.find(e => e.id === servicio.especialidad_id);
  App.seleccion.especialidad = especialidad || null;

  if (especialidad) {
    App.seleccion.doctor = App.config.doctores.find(d => d.id === especialidad.doctor_id) || null;
  }

  document.getElementById('resumen-servicio').textContent = servicio.precio_desde
    ? `${servicio.nombre} — ${servicio.precio_texto}`
    : servicio.nombre;
}


/* ============================================================
   BOOKING — PASO 2: CALENDARIO
   ============================================================ */

function renderCalendario() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const mes = new Date(hoy.getFullYear(), hoy.getMonth() + App.mesOffset, 1);
  const doctor = App.seleccion.doctor;
  const diasDisp = doctor ? Object.keys(doctor.horario_disponible).map(d => DIAS_MAP[d]) : [];

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
    const disponible = !esPasado && diasDisp.includes(fecha.getDay());

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

  renderCalendario();
  renderHorarios();
  actualizarResumen();
}

function renderHorarios() {
  const doctor = App.seleccion.doctor;
  const fecha = App.seleccion.diaFecha;
  const grid = document.getElementById('horarios-grid');

  if (!fecha || !doctor) {
    grid.innerHTML = '<p class="slots-mensaje">Selecciona un día en el calendario</p>';
    return;
  }

  const horarios = doctor.horario_disponible[App.seleccion.diaNombre] || [];

  if (horarios.length === 0) {
    grid.innerHTML = '<p class="slots-mensaje">Sin citas disponibles este día</p>';
    return;
  }

  grid.innerHTML = horarios.map(h => {
    const sel = App.seleccion.hora === h ? ' seleccionado' : '';
    return `<div class="slot-horario disponible${sel}" onclick="seleccionarHorario('${h}')">${h}</div>`;
  }).join('');
}

function seleccionarHorario(hora) {
  App.seleccion.hora = hora;
  renderHorarios();
  actualizarResumen();
}

function actualizarResumen() {
  const s = App.seleccion;
  const fechaLabel = s.fechaTexto ? `${s.fechaTexto}${s.hora ? ' · ' + s.hora : ''}` : 'Elige fecha y horario';
  document.getElementById('resumen-fecha').textContent = fechaLabel;
}


/* ============================================================
   BOOKING — FLUJO DE PASOS
   ============================================================ */

function siguientePaso() {
  if (App.paso === 1) {
    if (!App.seleccion.servicio) {
      alert('Por favor selecciona un servicio para continuar.');
      return;
    }
    irAPaso(2);
    renderCalendario();
  } else if (App.paso === 2) {
    if (!App.seleccion.diaFecha || !App.seleccion.hora) {
      alert('Por favor selecciona una fecha y horario para continuar.');
      return;
    }
    irAPaso(3);
    renderConfirmacion();
  }
}

function irAPaso(num) {
  /* Ocultar paso actual */
  document.getElementById(`paso-${App.paso}`).classList.add('oculto');
  document.getElementById(`paso-tab-${App.paso}`).classList.remove('activo');

  App.paso = num;

  /* Mostrar nuevo paso */
  document.getElementById(`paso-${num}`).classList.remove('oculto');
  document.getElementById(`paso-tab-${num}`).classList.add('activo');

  /* Ocultar botón en el paso 3 */
  const btnSig = document.getElementById('btn-siguiente');
  btnSig.style.display = num === 3 ? 'none' : '';

  if (num === 3) {
    document.querySelector('.citas-resumen').innerHTML =
      '<strong>¡Todo listo!</strong><span>Te esperamos en el consultorio</span>';
  }
}

function renderConfirmacion() {
  const s = App.seleccion;
  const waLink = generarLinkWhatsApp();

  document.getElementById('confirmacion-cita').innerHTML = `
    <div class="conf-icono">${icono('check', 'ic ic-conf')}</div>
    <h3 class="conf-titulo">¡Ya casi! Confirma por WhatsApp</h3>
    <p class="conf-detalle">
      <strong>${s.servicio?.nombre || ''}</strong><br>
      ${s.doctor?.nombre || ''}<br>
      ${s.fechaTexto || ''} · ${s.hora || ''}
    </p>
    <a href="${waLink}" target="_blank" rel="noopener" class="conf-wa-btn">
      ${icono('mensaje')} Confirmar cita por WhatsApp
    </a>
  `;
}


/* ============================================================
   ESPECIALIDADES
   ============================================================ */

function renderEspecialidades() {
  const grid = document.getElementById('especialidades-grid');

  grid.innerHTML = App.config.especialidades.map(esp => {
    const doctor = App.config.doctores.find(d => d.id === esp.doctor_id);
    const fallbackDiente = icono('diente', 'ic ic-especialidad').replace(/"/g, '&quot;');
    const iconoHTML = esp.icono
      ? `<img src="${esp.icono}" alt="${esp.nombre}" onerror="this.parentElement.innerHTML='${fallbackDiente}'">`
      : icono('diente', 'ic ic-especialidad');

    return `
      <div class="tarjeta-especialidad">
        <div class="te-icono">${iconoHTML}</div>
        <div class="te-nombre">${esp.nombre}</div>
        <p class="te-descripcion">${esp.descripcion}</p>
        ${doctor ? `<div class="te-doctor">${doctor.nombre}</div>` : ''}
        <a href="#servicios" class="te-link" onclick="filtrarServicios(null,'${esp.id}')">
          Ver servicios →
        </a>
      </div>
    `;
  }).join('');
}


/* ============================================================
   SERVICIOS + FILTROS
   ============================================================ */

function renderFiltros() {
  const contenedor = document.getElementById('filtros-servicios');

  const filtros = [{ id: 'todos', nombre: 'Todos' }, ...App.config.especialidades];

  contenedor.innerHTML = filtros.map(f => `
    <button class="filtro-btn ${f.id === 'todos' ? 'activo' : ''}"
            data-filtro="${f.id}"
            onclick="filtrarServicios(this, '${f.id}')">
      ${f.nombre}
    </button>
  `).join('');
}

function filtrarServicios(btn, filtro) {
  /* Actualizar botón activo */
  document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
  if (btn) {
    btn.classList.add('activo');
  } else {
    /* Llamada desde enlace de especialidad */
    const target = document.querySelector(`[data-filtro="${filtro}"]`);
    if (target) target.classList.add('activo');
  }
  renderServicios(filtro);
}

function renderServicios(filtro) {
  const grid = document.getElementById('servicios-grid');
  let servicios = App.config.servicios;

  if (filtro && filtro !== 'todos') {
    servicios = servicios.filter(s => s.especialidad_id === filtro);
  }

  grid.innerHTML = servicios.map(s => `
    <div class="tarjeta-servicio ${s.destacado ? 'destacado' : ''}">
      <div class="ts-icono-wrap">${icono(s.icono)}</div>
      <div class="ts-nombre">${s.nombre}</div>
      <p class="ts-descripcion">${s.descripcion}</p>
      ${s.precio_desde ? `<div class="ts-precio">${s.precio_texto}</div>` : ''}
    </div>
  `).join('');
}


/* ============================================================
   DOCTORES
   ============================================================ */

function renderDoctores() {
  const grid = document.getElementById('doctores-grid');

  grid.innerHTML = App.config.doctores.map(doc => {
    const opinionesBtn = doc.opiniones_doctoralia
      ? `<span class="td-opiniones-badge">${icono('estrella', 'ic ic-estrella')} ${doc.opiniones_doctoralia} reseñas</span>`
      : '';

    return `
      <div class="tarjeta-doctor">
        <div class="td-cabecera">
          <div class="td-foto" style="background:${doc.color}22">
            ${renderFoto(doc.foto, doc.nombre, doc.foto_posicion)}
          </div>
          <div class="td-info">
            <div class="td-nombre">${doc.nombre}</div>
            <div class="td-especialidad" style="color:${doc.color}">${doc.especialidad}</div>
            <div class="td-experiencia">${doc.experiencia}</div>
          </div>
        </div>
        <div class="td-cuerpo">
          <p class="td-formacion">${icono('graduacion')} ${doc.formacion}</p>
          <p class="td-descripcion">${doc.descripcion}</p>
          <p class="td-cedula">Cédula profesional: ${doc.cedula}</p>
          <div class="td-acciones">
            ${doc.doctoralia
              ? `<a href="${doc.doctoralia}" target="_blank" rel="noopener" class="td-btn-doctoralia">Ver perfil Doctoralia →</a>`
              : ''}
            ${opinionesBtn}
          </div>
        </div>
      </div>
    `;
  }).join('');
}


/* ============================================================
   TESTIMONIOS
   ============================================================ */

function renderTestimonios() {
  const grid = document.getElementById('testimonios-grid');
  const doctores = App.config.doctores;

  grid.innerHTML = App.config.testimonios.map(t => {
    const doctor = doctores.find(d => d.id === t.doctor_id);
    const iniciales = t.nombre.split(' ').map(p => p[0]).join('').slice(0, 2);

    return `
      <div class="tarjeta-testimonio">
        <div class="testimonio-estrellas">★★★★★</div>
        <blockquote class="testimonio-texto">"${t.texto}"</blockquote>
        <div class="testimonio-autor">
          <div class="testimonio-avatar">${iniciales}</div>
          <div>
            <div class="testimonio-nombre">${t.nombre}</div>
            <div class="testimonio-meta">${t.fecha} · ${t.fuente}</div>
            ${t.servicio ? `<div class="testimonio-servicio">${t.servicio}</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}


/* ============================================================
   FAQ
   ============================================================ */

function renderFaq() {
  const lista = document.getElementById('faq-lista');

  lista.innerHTML = App.config.faq.map((item, i) => `
    <div class="faq-item" id="faq-${i}" onclick="toggleFaq(${i})">
      <div class="faq-pregunta">
        ${item.pregunta}
        <span class="faq-icono">+</span>
      </div>
      <div class="faq-respuesta">${item.respuesta}</div>
    </div>
  `).join('');
}

function toggleFaq(i) {
  const item = document.getElementById(`faq-${i}`);
  const estaAbierto = item.classList.contains('abierto');

  /* Cerrar todos */
  document.querySelectorAll('.faq-item.abierto').forEach(el => el.classList.remove('abierto'));

  if (!estaAbierto) item.classList.add('abierto');
}


/* ============================================================
   FORMULARIO DE CONTACTO
   ============================================================ */

function renderSelectServicios() {
  const select = document.getElementById('form-servicio');
  if (!select) return;

  const opciones = App.config.servicios.map(s =>
    `<option value="${s.id}">${s.nombre}</option>`
  ).join('');

  select.innerHTML = `<option value="">¿Qué servicio te interesa?</option>${opciones}`;
}

function marcarError(input, mensaje) {
  input.classList.add('campo-error');
  let aviso = document.getElementById('form-aviso-error');
  if (!aviso) {
    aviso = document.createElement('p');
    aviso.id = 'form-aviso-error';
    aviso.className = 'form-error-msg';
    document.getElementById('btn-form-wa').before(aviso);
  }
  aviso.textContent = mensaje;
  input.focus();
}

function limpiarErrores() {
  document.querySelectorAll('.campo-error').forEach(el => el.classList.remove('campo-error'));
  const aviso = document.getElementById('form-aviso-error');
  if (aviso) aviso.remove();
}

function enviarFormulario() {
  limpiarErrores();

  const inputNombre = document.getElementById('form-nombre');
  const inputTel    = document.getElementById('form-tel');
  const nombre  = inputNombre.value.trim();
  const tel     = inputTel.value.trim();
  const svcId   = document.getElementById('form-servicio').value;
  const svc     = App.config.servicios.find(s => s.id === svcId);
  const svcNombre = svc ? svc.nombre : 'Información general';

  if (nombre.length < 2) {
    marcarError(inputNombre, 'Por favor escribe tu nombre.');
    return;
  }

  /* Teléfono mexicano: 10 dígitos (se ignoran espacios, guiones y +52) */
  const soloDigitos = tel.replace(/\D/g, '').replace(/^52/, '');
  if (soloDigitos.length !== 10) {
    marcarError(inputTel, 'Escribe un teléfono de 10 dígitos, ej. 999 123 4567.');
    return;
  }

  const mensaje = `Hola, soy ${nombre} (${soloDigitos}).\nMe interesa: ${svcNombre}.\n¿Podrían darme más información?`;
  const link = `https://wa.me/${App.config.clinica.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  window.open(link, '_blank', 'noopener');
}


/* ============================================================
   FOOTER
   ============================================================ */

function renderFooter() {
  const c = App.config.clinica;

  document.getElementById('pie-descripcion').textContent = c.descripcion;

  /* Redes sociales */
  const redes = [];
  if (c.redes.instagram) redes.push({ href: c.redes.instagram, texto: `${icono('instagram')} Instagram` });
  if (c.redes.facebook)  redes.push({ href: c.redes.facebook,  texto: `${icono('facebook')} Facebook`  });

  document.getElementById('pie-redes').innerHTML = redes.map(r =>
    `<a href="${r.href}" target="_blank" rel="noopener" class="pie-red">${r.texto}</a>`
  ).join('');

  /* Especialidades */
  document.getElementById('pie-especialidades-links').innerHTML =
    App.config.especialidades.map(e =>
      `<a href="#especialidades">${e.nombre}</a>`
    ).join('');

  /* Contacto */
  const waLink = `https://wa.me/${c.whatsapp}`;
  document.getElementById('pie-contacto-links').innerHTML = `
    <a href="${c.maps_link}" target="_blank" rel="noopener">${icono('ubicacion')} ${c.direccion}</a>
    <a href="tel:${c.telefono}">${icono('telefono')} ${c.telefono}</a>
    <a>${icono('reloj')} Lun–Vie ${c.horario.lunes_viernes}</a>
    <a>${icono('reloj')} Sáb ${c.horario.sabado}</a>
    <a href="${waLink}" target="_blank" rel="noopener">${icono('mensaje')} WhatsApp</a>
  `;

  /* Mapa */
  const pieMapa = document.getElementById('pie-mapa');
  if (pieMapa && c.maps_embed) {
    pieMapa.innerHTML = `
      <div class="pie-mapa-iframe-wrap">
        <iframe src="${c.maps_embed}" width="100%" height="300" style="border:0" loading="lazy" allowfullscreen></iframe>
      </div>
      <a href="${c.maps_link}" target="_blank" rel="noopener" class="pie-mapa-btn">${icono('ubicacion')} Cómo llegar</a>
    `;
  }

  const año = new Date().getFullYear();
  document.getElementById('pie-copyright').textContent =
    `© ${año} OdonTHÓ · Todos los derechos reservados`;
}


/* ============================================================
   BOTÓN FLOTANTE WHATSAPP
   ============================================================ */

function configurarWa() {
  const mensaje = `Hola, me gustaría agendar una cita en OdonTHÓ. ¿Tienen disponibilidad?`;
  const link = `https://wa.me/${App.config.clinica.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  document.getElementById('wa-float-link').href = link;

  /* Ocultar el botón flotante mientras la caja de citas está en pantalla,
     para no tapar el botón "Siguiente" del booking */
  const booking = document.getElementById('booking-box');
  const flotante = document.getElementById('wa-float');
  if (booking && flotante && 'IntersectionObserver' in window) {
    new IntersectionObserver(entradas => {
      flotante.classList.toggle('wa-oculto', entradas[0].isIntersecting);
    }, { threshold: 0.05 }).observe(booking);
  }
}


/* ============================================================
   UTILIDAD — Genera link de WhatsApp para el booking
   ============================================================ */

function generarLinkWhatsApp() {
  const s = App.seleccion;
  const c = App.config.clinica;

  const msg = [
    `Hola, me gustaría agendar una cita:`,
    `• Servicio: ${s.servicio?.nombre || ''}`,
    `• Especialista: ${s.doctor?.nombre || ''}`,
    `• Fecha: ${s.fechaTexto || ''}`,
    `• Hora: ${s.hora || ''}`,
    ``,
    `¿Está disponible ese horario?`
  ].join('\n');

  return `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(msg)}`;
}
