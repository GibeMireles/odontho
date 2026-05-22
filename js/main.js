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

/* Estado global de la app */
const App = {
  config: null,
  paso: 1,
  mesOffset: 0,
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
      ? `⭐ ${doc.opiniones_doctoralia} opiniones`
      : '⭐ Doctoralia';
    return `
      <div class="hero-tarjeta-doctor">
        <div class="htd-avatar">${renderFoto(doc.foto, doc.nombre)}</div>
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

/* Intenta renderizar <img> y fallback al emoji si la imagen no existe */
function renderFoto(src, nombre) {
  if (!src) return '👤';
  return `<img src="${src}" alt="${nombre}" onerror="this.parentElement.textContent='👤'">`;
}


/* ============================================================
   BARRA DE CONFIANZA
   ============================================================ */

function renderTrustBar() {
  const doctores = App.config.doctores;
  const maxOp = Math.max(...doctores.map(d => d.opiniones_doctoralia || 0));

  const items = [
    { num: `${maxOp}+`,      etiqueta: 'Opiniones Doctoralia' },
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

  grid.innerHTML = ordenados.map(s => `
    <div class="tarjeta-servicio-cita ${s.destacado ? 'tsc-destacado' : ''}"
         id="tsc-${s.id}"
         onclick="seleccionarServicio('${s.id}')">
      <span class="tsc-icono">${s.icono}</span>
      <div class="tsc-nombre">${s.nombre}</div>
      <div class="tsc-precio">${s.precio_texto}</div>
    </div>
  `).join('');

  /* Pre-seleccionar el primero */
  seleccionarServicio(ordenados[0].id);
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

  document.getElementById('resumen-servicio').textContent =
    `${servicio.nombre} — ${servicio.precio_texto}`;
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
      '<strong>¡Todo listo!</strong><span>Te esperamos 🎉</span>';
  }
}

function renderConfirmacion() {
  const s = App.seleccion;
  const waLink = generarLinkWhatsApp();

  document.getElementById('confirmacion-cita').innerHTML = `
    <div class="conf-icono">✅</div>
    <h3 class="conf-titulo">¡Cita confirmada!</h3>
    <p class="conf-detalle">
      <strong>${s.servicio?.nombre || ''}</strong><br>
      ${s.doctor?.nombre || ''}<br>
      ${s.fechaTexto || ''} · ${s.hora || ''}
    </p>
    <a href="${waLink}" target="_blank" rel="noopener" class="conf-wa-btn">
      💬 Abrir en WhatsApp
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
    const iconoHTML = esp.icono
      ? `<img src="${esp.icono}" alt="${esp.nombre}" onerror="this.parentElement.textContent='🦷'">`
      : '🦷';

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
      <div class="ts-icono-wrap">${s.icono}</div>
      <div class="ts-nombre">${s.nombre}</div>
      <p class="ts-descripcion">${s.descripcion}</p>
      <div class="ts-precio">${s.precio_texto}</div>
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
      ? `<span class="td-opiniones-badge">⭐ ${doc.opiniones_doctoralia} reseñas</span>`
      : '';

    return `
      <div class="tarjeta-doctor">
        <div class="td-cabecera">
          <div class="td-foto" style="background:${doc.color}22">
            ${renderFoto(doc.foto, doc.nombre)}
          </div>
          <div class="td-info">
            <div class="td-nombre">${doc.nombre}</div>
            <div class="td-especialidad" style="color:${doc.color}">${doc.especialidad}</div>
            <div class="td-experiencia">${doc.experiencia}</div>
          </div>
        </div>
        <div class="td-cuerpo">
          <p class="td-formacion">🎓 ${doc.formacion}</p>
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

function enviarFormulario() {
  const nombre  = document.getElementById('form-nombre').value.trim();
  const tel     = document.getElementById('form-tel').value.trim();
  const svcId   = document.getElementById('form-servicio').value;
  const svc     = App.config.servicios.find(s => s.id === svcId);
  const svcNombre = svc ? svc.nombre : 'Información general';

  if (!nombre || !tel) {
    alert('Por favor ingresa tu nombre y teléfono.');
    return;
  }

  const mensaje = `Hola, soy ${nombre} (${tel}).\nMe interesa: ${svcNombre}.\n¿Podrían darme más información?`;
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
  if (c.redes.instagram) redes.push({ href: c.redes.instagram, texto: '📸 Instagram' });
  if (c.redes.facebook)  redes.push({ href: c.redes.facebook,  texto: '👍 Facebook'  });

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
    <a href="https://maps.google.com" target="_blank" rel="noopener">📍 ${c.direccion}</a>
    <a href="tel:${c.telefono}">📞 ${c.telefono}</a>
    <a>🕐 Lun–Vie ${c.horario.lunes_viernes}</a>
    <a>🕐 Sáb ${c.horario.sabado}</a>
    <a href="${waLink}" target="_blank" rel="noopener">💬 WhatsApp</a>
  `;

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
