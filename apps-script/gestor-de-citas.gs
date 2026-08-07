/**
 * OdonTHÓ — Gestor de Citas (Google Apps Script)
 * ------------------------------------------------
 * Puente entre el sitio web y Google Calendar.
 * - GET  ?action=disponibilidad&desde=YYYY-MM-DD&hasta=YYYY-MM-DD  → devuelve huecos libres
 * - POST {action:'agendar', ...datos}                             → crea la cita (SIN CONFIRMAR)
 *
 * Calendario: dedicado "Citas OdonTHÓ"
 * Registro: hoja "Citas" en el Spreadsheet de logging
 *
 * ⚠️ Esta es una copia de REFERENCIA versionada en el repo — no se despliega
 * automáticamente desde git. El script real vive en script.google.com. Antes de
 * pegar este archivo ahí, reemplaza los placeholders [CALENDAR_ID] y [SHEETS_ID]
 * por los valores reales (ver CONFIG-PRIVADO.md, no versionado).
 */

// ================== CONFIGURACIÓN ==================
const CONFIG = {
  // TODO: reemplazar con el valor real desde CONFIG-PRIVADO.md antes de desplegar
  CALENDAR_ID: '[CALENDAR_ID]',

  DURACION_VALORACION_MIN: 30,
  ANTICIPACION_MIN_HORAS: 6,
  VENTANA_DIAS: 60,
  HORARIOS: {
    1: [[10, 13], [16, 19]],  // Lunes
    2: [[10, 13], [16, 19]],  // Martes
    3: [[10, 13], [16, 19]],  // Miércoles
    4: [[10, 13], [16, 19]],  // Jueves
    5: [[10, 13], [16, 19]],  // Viernes
    6: [[10, 13]],            // Sábado
    0: []                     // Domingo
  },
  ZONA_HORARIA: 'America/Merida',
  PREFIJO_SIN_CONFIRMAR: '⚠️ SIN CONFIRMAR - ',

  // --- Logging a Google Sheets ---
  // TODO: reemplazar con el valor real desde CONFIG-PRIVADO.md antes de desplegar
  SHEETS_ID: '[SHEETS_ID]',
  SHEETS_TAB: 'Citas'  // pestaña dedicada al log automático (se crea sola si no existe)
};

// ================== ROUTER ==================
function doGet(e) {
  const action = (e.parameter.action || '').toLowerCase();
  try {
    if (action === 'disponibilidad') {
      return jsonResponse(getDisponibilidad(e.parameter.desde, e.parameter.hasta));
    }
    return jsonResponse({ ok: false, error: 'Acción no reconocida' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if ((data.action || '').toLowerCase() === 'agendar') {
      return jsonResponse(agendarCita(data));
    }
    return jsonResponse({ ok: false, error: 'Acción no reconocida' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// ================== DISPONIBILIDAD ==================
function getDisponibilidad(desdeStr, hastaStr) {
  const cal = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!cal) return { ok: false, error: 'Calendario no encontrado' };

  const ahora = new Date();
  const limiteMin = new Date(ahora.getTime() + CONFIG.ANTICIPACION_MIN_HORAS * 3600 * 1000);

  const desde = desdeStr ? parseFecha(desdeStr) : new Date();
  const hasta = hastaStr ? parseFecha(hastaStr) : addDays(new Date(), CONFIG.VENTANA_DIAS);

  const ventanaMax = addDays(ahora, CONFIG.VENTANA_DIAS);
  const finReal = hasta > ventanaMax ? ventanaMax : hasta;

  const eventos = cal.getEvents(desde, addDays(finReal, 1));
  const ocupados = eventos.map(ev => ({
    ini: ev.getStartTime().getTime(),
    fin: ev.getEndTime().getTime()
  }));

  const dias = [];
  let cursor = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());

  while (cursor <= finReal) {
    const diaSemana = cursor.getDay();
    const bloques = CONFIG.HORARIOS[diaSemana] || [];
    const slots = [];

    bloques.forEach(([hIni, hFin]) => {
      let slotIni = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), hIni, 0, 0);
      const slotLimite = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), hFin, 0, 0);

      while (slotIni.getTime() + CONFIG.DURACION_VALORACION_MIN * 60000 <= slotLimite.getTime()) {
        const slotFin = new Date(slotIni.getTime() + CONFIG.DURACION_VALORACION_MIN * 60000);

        const cumpleAnticipacion = slotIni.getTime() >= limiteMin.getTime();
        const libre = !ocupados.some(o => slotIni.getTime() < o.fin && slotFin.getTime() > o.ini);

        if (cumpleAnticipacion && libre) {
          slots.push(formatHora(slotIni));
        }
        slotIni = slotFin;
      }
    });

    if (slots.length > 0) {
      dias.push({ fecha: formatFecha(cursor), slots: slots });
    }
    cursor = addDays(cursor, 1);
  }

  return { ok: true, dias: dias };
}

// ================== AGENDAR ==================
function agendarCita(data) {
  const cal = CalendarApp.getCalendarById(CONFIG.CALENDAR_ID);
  if (!cal) return { ok: false, error: 'Calendario no encontrado' };

  if (!data.nombre || !data.telefono || !data.fecha || !data.hora) {
    return { ok: false, error: 'Faltan datos (nombre, teléfono, fecha u hora)' };
  }
  const tel = String(data.telefono).replace(/\D/g, '');
  if (tel.length !== 10) {
    return { ok: false, error: 'Teléfono inválido (deben ser 10 dígitos)' };
  }

  const inicio = parseFechaHora(data.fecha, data.hora);
  if (!inicio) return { ok: false, error: 'Fecha u hora con formato inválido' };

  const fin = new Date(inicio.getTime() + CONFIG.DURACION_VALORACION_MIN * 60000);

  const limiteMin = new Date(Date.now() + CONFIG.ANTICIPACION_MIN_HORAS * 3600 * 1000);
  if (inicio.getTime() < limiteMin.getTime()) {
    return { ok: false, error: 'Ese horario ya no cumple la anticipación mínima' };
  }

  const eventosSolapados = cal.getEvents(inicio, fin);
  if (eventosSolapados.length > 0) {
    return { ok: false, error: 'Ese horario acaba de ocuparse, elige otro' };
  }

  const titulo = CONFIG.PREFIJO_SIN_CONFIRMAR + data.nombre + ' - Valoración';
  const descripcion =
    'Cita de valoración agendada desde el sitio web.\n\n' +
    'Paciente: ' + data.nombre + '\n' +
    'Teléfono: ' + tel + '\n' +
    (data.motivo ? 'Motivo: ' + data.motivo + '\n' : '') +
    '\n⚠️ Confirmar por WhatsApp. Al confirmar, quita "SIN CONFIRMAR" del título.';

  const evento = cal.createEvent(titulo, inicio, fin, { description: descripcion });
  const estado = 'SIN CONFIRMAR';

  // --- Registro secundario en Sheets (aislado: si falla, NO rompe el agendado) ---
  try {
    registrarEnSheets({
      timestamp: new Date(),
      nombre: data.nombre,
      telefono: tel,
      fecha: formatFecha(inicio),
      hora: formatHora(inicio),
      estado: estado,
      eventoId: evento.getId(),
      motivo: data.motivo || ''
    });
  } catch (errSheet) {
    // Solo se registra en el log de ejecución; la cita ya está creada en Calendar.
    Logger.log('No se pudo escribir en Sheets: ' + errSheet);
  }

  return {
    ok: true,
    mensaje: 'Cita registrada como pendiente de confirmar',
    eventoId: evento.getId(),
    fecha: formatFecha(inicio),
    hora: formatHora(inicio)
  };
}

// ================== LOGGING A SHEETS ==================
function registrarEnSheets(cita) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEETS_ID);
  let hoja = ss.getSheetByName(CONFIG.SHEETS_TAB);

  // Si la pestaña no existe, se crea con encabezados
  if (!hoja) {
    hoja = ss.insertSheet(CONFIG.SHEETS_TAB);
  }

  // Si está vacía (sin encabezados), los agrega
  if (hoja.getLastRow() === 0) {
    hoja.appendRow([
      'Timestamp', 'Nombre', 'Teléfono', 'Fecha cita', 'Hora', 'Estado', 'Evento ID', 'Motivo'
    ]);
    // Formato del encabezado
    const head = hoja.getRange(1, 1, 1, 8);
    head.setFontWeight('bold');
    head.setBackground('#3DBFBF');
    head.setFontColor('#FFFFFF');
  }

  hoja.appendRow([
    Utilities.formatDate(cita.timestamp, CONFIG.ZONA_HORARIA, 'yyyy-MM-dd HH:mm:ss'),
    cita.nombre,
    "'" + cita.telefono,   // apóstrofo para conservar el 0 inicial y evitar notación científica
    cita.fecha,
    cita.hora,
    cita.estado,
    cita.eventoId,
    cita.motivo
  ]);
}

// ================== UTILIDADES ==================
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseFecha(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function parseFechaHora(fechaStr, horaStr) {
  try {
    const [y, m, d] = fechaStr.split('-').map(Number);
    let h = 0, min = 0;
    const pm = /pm/i.test(horaStr);
    const am = /am/i.test(horaStr);
    const limpio = horaStr.replace(/[^\d:]/g, '');
    const partes = limpio.split(':').map(Number);
    h = partes[0]; min = partes[1] || 0;
    if (pm && h < 12) h += 12;
    if (am && h === 12) h = 0;
    return new Date(y, m - 1, d, h, min, 0);
  } catch (e) {
    return null;
  }
}

function addDays(date, days) {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function formatFecha(date) {
  return Utilities.formatDate(date, CONFIG.ZONA_HORARIA, 'yyyy-MM-dd');
}

function formatHora(date) {
  return Utilities.formatDate(date, CONFIG.ZONA_HORARIA, 'HH:mm');
}

// ================== PRUEBAS MANUALES ==================
function _test() {
  const disp = getDisponibilidad(null, null);
  Logger.log('Días con disponibilidad: ' + (disp.dias ? disp.dias.length : 0));
  if (disp.dias && disp.dias.length > 0) {
    Logger.log('Primer día: ' + JSON.stringify(disp.dias[0]));
  }
}

// Prueba de escritura a Sheets sin crear evento en Calendar.
// Ejecuta esta función una vez para autorizar permisos de Sheets y verificar el registro.
function _testSheets() {
  registrarEnSheets({
    timestamp: new Date(),
    nombre: 'PRUEBA - Borrar esta fila',
    telefono: '9990000000',
    fecha: '2026-01-01',
    hora: '10:00',
    estado: 'PRUEBA',
    eventoId: 'test-id-123',
    motivo: 'fila de prueba'
  });
  Logger.log('Fila de prueba escrita en la hoja "' + CONFIG.SHEETS_TAB + '". Revisa el Sheets y borra esa fila.');
}
