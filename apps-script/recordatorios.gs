/**
 * OdonTHÓ — Recordatorios diarios de cita (Google Apps Script)
 * ------------------------------------------------------------
 * Cada día, a una hora fija, revisa las citas de MAÑANA registradas en la hoja "Citas"
 * y envía un correo a la Dra. con los recordatorios listos: cada uno con su link de
 * WhatsApp ya armado. La Dra. solo hace clic en cada link y presiona enviar.
 *
 * NOTA: sin WhatsApp Business API el envío final es manual (un clic). Este script
 * automatiza TODO lo demás: detectar, filtrar y preparar los mensajes.
 *
 * Se puede pegar en el MISMO proyecto Apps Script que "Gestor de Citas", o en uno nuevo.
 *
 * ⚠️ Esta es una copia de REFERENCIA versionada en el repo — no se despliega
 * automáticamente desde git. El script real vive en script.google.com. Antes de
 * pegar este archivo ahí, reemplaza los placeholders [SHEETS_ID] y [CORREO_CLINICA]
 * por los valores reales (ver CONFIG-PRIVADO.md, no versionado).
 */

// ================== CONFIGURACIÓN ==================
const REC_CONFIG = {
  // TODO: reemplazar con los valores reales desde CONFIG-PRIVADO.md antes de desplegar
  SHEETS_ID: '[SHEETS_ID]',
  SHEETS_TAB: 'Citas',

  // A quién se le envía el resumen diario (la Dra. / recepción)
  CORREO_DESTINO: '[CORREO_CLINICA]',

  ZONA_HORARIA: 'America/Merida',
  NOMBRE_CLINICA: 'OdonThó',
  DIRECCION: 'Av. Yucatán 351, planta alta, Col. Los Pinos, Mérida',

  // Índices de columna en la hoja "Citas" (1 = A, 2 = B, ...)
  // Timestamp | Nombre | Teléfono | Fecha cita | Hora | Estado | Evento ID | Motivo
  COL: { nombre: 2, telefono: 3, fecha: 4, hora: 5, estado: 6 }
};

// ================== FUNCIÓN PRINCIPAL (la que corre sola) ==================
function enviarRecordatoriosDeManana() {
  const citas = getCitasDeManana();

  if (citas.length === 0) {
    Logger.log('No hay citas para mañana. No se envía correo.');
    return;
  }

  const fechaManana = formatFechaLegible(addDays(hoy(), 1));
  const asunto = '🦷 OdonThó — ' + citas.length + ' recordatorio(s) para mañana (' + fechaManana + ')';

  let html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">';
  html += '<div style="background:#1E2D4E;padding:20px;border-radius:10px 10px 0 0;">';
  html += '<h2 style="color:#fff;margin:0;">OdonThó · Recordatorios de mañana</h2>';
  html += '<p style="color:#3DBFBF;margin:6px 0 0;font-size:14px;">' + fechaManana + ' · ' + citas.length + ' cita(s)</p>';
  html += '</div>';
  html += '<div style="background:#FAF8F3;padding:16px;border:1px solid #E2DDD6;border-top:none;">';
  html += '<p style="color:#64748B;font-size:13px;margin:0 0 16px;">Haz clic en “Enviar recordatorio” de cada paciente. Se abrirá WhatsApp con el mensaje listo — solo presiona enviar.</p>';

  citas.forEach((c, i) => {
    const link = construirLinkWhatsApp(c);
    html += '<div style="background:#fff;border:1px solid #E2DDD6;border-radius:8px;padding:14px;margin-bottom:10px;">';
    html += '<div style="font-weight:bold;color:#1E2D4E;font-size:15px;">' + (i + 1) + '. ' + c.nombre + '</div>';
    html += '<div style="color:#64748B;font-size:13px;margin:4px 0;">🕐 ' + c.hora + ' &nbsp;·&nbsp; 📞 ' + c.telefono + ' &nbsp;·&nbsp; ' + c.estado + '</div>';
    html += '<a href="' + link + '" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:9px 18px;border-radius:6px;margin-top:6px;">📲 Enviar recordatorio</a>';
    html += '</div>';
  });

  html += '</div>';
  html += '<div style="background:#1E2D4E;padding:12px;border-radius:0 0 10px 10px;text-align:center;">';
  html += '<p style="color:#94A3B8;font-size:11px;margin:0;">Recordatorios automáticos · OdonThó</p>';
  html += '</div></div>';

  MailApp.sendEmail({
    to: REC_CONFIG.CORREO_DESTINO,
    subject: asunto,
    htmlBody: html
  });

  Logger.log('Correo enviado con ' + citas.length + ' recordatorio(s).');
}

// ================== OBTENER CITAS DE MAÑANA ==================
function getCitasDeManana() {
  const ss = SpreadsheetApp.openById(REC_CONFIG.SHEETS_ID);
  const hoja = ss.getSheetByName(REC_CONFIG.SHEETS_TAB);
  if (!hoja || hoja.getLastRow() < 2) return [];

  const manana = formatFechaISO(addDays(hoy(), 1));
  const datos = hoja.getDataRange().getValues();
  const citas = [];

  // Empieza en 1 para saltar encabezados
  for (let i = 1; i < datos.length; i++) {
    const fila = datos[i];
    const fechaCelda = normalizarFecha(fila[REC_CONFIG.COL.fecha - 1]);
    if (fechaCelda === manana) {
      citas.push({
        nombre: String(fila[REC_CONFIG.COL.nombre - 1]).trim(),
        telefono: String(fila[REC_CONFIG.COL.telefono - 1]).replace(/\D/g, ''),
        fecha: fechaCelda,
        hora: String(fila[REC_CONFIG.COL.hora - 1]).trim(),
        estado: String(fila[REC_CONFIG.COL.estado - 1]).trim()
      });
    }
  }
  // Ordena por hora
  citas.sort((a, b) => a.hora.localeCompare(b.hora));
  return citas;
}

// ================== CONSTRUIR LINK DE WHATSAPP ==================
function construirLinkWhatsApp(cita) {
  const mensaje =
    'Hola ' + cita.nombre + '! Le saludamos de ' + REC_CONFIG.NOMBRE_CLINICA + '. ' +
    'Le recordamos su cita de valoración para mañana a las ' + cita.hora + '. ' +
    'Le pedimos confirmar su asistencia respondiendo a este mensaje. ' +
    'Si necesita reagendar, con gusto le apoyamos. Le esperamos! ' + REC_CONFIG.DIRECCION;

  const encoded = encodeURIComponent(mensaje);
  return 'https://wa.me/52' + cita.telefono + '?text=' + encoded;
}

// ================== CONFIGURAR EL DISPARADOR AUTOMÁTICO ==================
// Ejecuta esta función UNA sola vez para que el recordatorio se envíe solo cada día.
function crearDisparadorDiario() {
  // Borra disparadores previos de esta función para no duplicar
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'enviarRecordatoriosDeManana') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Crea uno nuevo: todos los días a las 6 PM (hora de enviar recordatorios del día siguiente)
  ScriptApp.newTrigger('enviarRecordatoriosDeManana')
    .timeBased()
    .everyDays(1)
    .atHour(18)
    .inTimezone(REC_CONFIG.ZONA_HORARIA)
    .create();

  Logger.log('Disparador diario creado: cada día a las 6 PM revisa las citas de mañana.');
}

// ================== UTILIDADES ==================
function hoy() {
  return new Date();
}

function addDays(date, days) {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function formatFechaISO(date) {
  return Utilities.formatDate(date, REC_CONFIG.ZONA_HORARIA, 'yyyy-MM-dd');
}

function formatFechaLegible(date) {
  return Utilities.formatDate(date, REC_CONFIG.ZONA_HORARIA, 'EEEE d \'de\' MMMM', );
}

// Normaliza la celda de fecha: puede venir como texto "2026-08-11" o como objeto Date
function normalizarFecha(valor) {
  if (valor instanceof Date) {
    return Utilities.formatDate(valor, REC_CONFIG.ZONA_HORARIA, 'yyyy-MM-dd');
  }
  return String(valor).trim().substring(0, 10);
}

// ================== PRUEBA MANUAL ==================
// Ejecuta esto para ver el correo AHORA con las citas de mañana (sin esperar las 6 PM).
function _testRecordatorios() {
  const citas = getCitasDeManana();
  Logger.log('Citas encontradas para mañana: ' + citas.length);
  citas.forEach(c => Logger.log(c.hora + ' - ' + c.nombre + ' (' + c.telefono + ')'));
  if (citas.length > 0) {
    enviarRecordatoriosDeManana();
    Logger.log('Correo de prueba enviado a ' + REC_CONFIG.CORREO_DESTINO);
  } else {
    Logger.log('No hay citas para mañana. Agenda una cita de prueba para mañana y vuelve a ejecutar.');
  }
}
