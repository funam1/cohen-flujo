/******************************************************
 * FLUJO BYMA – Automatización completa
 * Autor: Federico + GPT
 * Requiere: estar logueado en https://byma.cohen.com.ar
 ******************************************************/

// === UTILIDADES GENERALES ===
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function clickByXPath(xpath, descripcion) {
  const el = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (!el) {
    console.warn("No se encontró:", descripcion || xpath);
    return null;
  }

  el.click();
  console.log("Click en:", descripcion || xpath);
  return el;
}


// ===================================================
// =============== 1) SALDOS CC =======================
// ===================================================
async function descargarSaldosCuentaCorriente() {
  console.log(">>> [1/4] SALDOS CC – INICIO");

  clickByXPath('//*[@id="MEN_GEN_LNK_MONEDAS_REP_SALDCTACORR"]',
               "Menú Saldos Cuenta Corriente");
  await sleep(2000);

  clickByXPath('/html/body/div[1]/div/div/form/div[6]/div/button[2]',
               "Botón Buscar (Saldos CC)");
  await sleep(4000);

  clickByXPath('/html/body/div[1]/div/div/form/div[6]/div/button[3]',
               "Botón Descargar Excel (Saldos CC)");
  await sleep(2000);

  console.log(">>> [1/4] SALDOS CC – FIN");
}


// ===================================================
// =============== 2) SOLICITUDES FCI =================
// ===================================================
function seleccionarReporteFCI() {
  const select = document.evaluate(
    '/html/body/div[1]/div/div/form/div[5]/div[2]/div/select',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (!select) {
    console.warn("No se encontró el select en Solicitudes FCI");
    return false;
  }

  const opciones = [...select.options];
  const objetivo = opciones.find(o => o.textContent.trim() === "Rescate - Fecha de Pago");

  if (!objetivo) {
    console.warn('No se encontró "Rescate - Fecha de Pago"');
    return false;
  }

  select.value = objetivo.value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  console.log('Seleccionado "Rescate - Fecha de Pago"');
  return true;
}

async function descargarSolicitudesFCI() {
  console.log(">>> [2/4] SOLICITUDES FCI – INICIO");

  clickByXPath('//*[@id="MEN_GEN_LNK_FONDOS_SOL"]',
               "Menú Solicitudes FCI");
  await sleep(2000);

  seleccionarReporteFCI();
  await sleep(1000);

  clickByXPath('/html/body/div[1]/div/div/form/div[5]/div[1]/button[2]',
               "Botón Buscar (Solicitudes FCI)");
  await sleep(4000);

  clickByXPath('/html/body/div[1]/div/div/form/div[5]/div[1]/button[3]',
               "Botón Exportar Excel (Solicitudes FCI)");
  await sleep(2000);

  console.log(">>> [2/4] SOLICITUDES FCI – FIN");
}


// ===================================================
// ================== 3) BOLETOS =====================
// ===================================================
function seleccionarTipoOperacionBoletos() {
  const select = document.evaluate(
    '/html/body/div[1]/div/div/form/div[3]/div[2]/div/select',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (!select) {
    console.warn("No se encontró el select de Boletos");
    return false;
  }

  const opciones = [...select.options];
  const objetivo = opciones.find(o => o.textContent.trim() === "Tipo de Operacion");

  if (!objetivo) {
    console.warn('No existe opción "Tipo de Operacion"');
    console.log("Opciones:", opciones.map(o => o.textContent.trim()));
    return false;
  }

  select.value = objetivo.value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
  console.log('Seleccionado "Tipo de Operacion"');
  return true;
}

async function descargarBoletos() {
  console.log(">>> [3/4] BOLETOS – INICIO");

  clickByXPath('//*[@id="MEN_GEN_LNK_OP_BOL_AUTBOL"]',
               "Menú Boletos");
  await sleep(2500);

  seleccionarTipoOperacionBoletos();
  await sleep(1000);

  clickByXPath('/html/body/div[1]/div/div/form/div[3]/div[1]/button[2]',
               "Botón Buscar (Boletos)");
  await sleep(6000);

  const btn = document.evaluate(
    '/html/body/div[1]/div/div/form/div[4]/div[1]/button[3]',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (btn) {
    btn.click();
    console.log("Click en Descargar Excel (Boletos)");
    await sleep(2000);
  } else {
    console.warn("No hay botón de descarga (posiblemente 0 resultados)");
  }

  console.log(">>> [3/4] BOLETOS – FIN");
}


// ===================================================
// ============ 4) MOVIMIENTOS DIARIOS ===============
// ===================================================
async function descargarMovimientosDiarios() {
  console.log(">>> [4/4] MOVIMIENTOS DIARIOS – INICIO");

  clickByXPath('//*[@id="MEN_GEN_LNK_MONEDAS_REP_MOVCTACORR"]',
               "Menú Movimientos Diarios");
  await sleep(2500);

  clickByXPath('/html/body/div[1]/div/div/form/div[4]/div[2]/button[2]',
               "Botón Buscar (Movimientos Diarios)");
  await sleep(6000);

  const btn = document.evaluate(
    '/html/body/div[1]/div/div/form/div[4]/div[2]/button[3]',
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (btn) {
    btn.click();
    console.log("Descargando Excel (Movimientos Diarios)");
    await sleep(2000);
  } else {
    console.warn("No hay botón de descarga en Movimientos Diarios");
  }

  console.log(">>> [4/4] MOVIMIENTOS DIARIOS – FIN");
}


// ===================================================
// ============ FLUJO COMPLETO BYMA ==================
// ===================================================
async function flujoBYMACompleto() {
  console.log("=== INICIO FLUJO BYMA COMPLETO ===");

  await descargarSaldosCuentaCorriente();
  await descargarSolicitudesFCI();
  await descargarBoletos();
  await descargarMovimientosDiarios();

  console.log("=== FIN FLUJO BYMA COMPLETO ===");
}

// Autoejecución opcional:
// flujoBYMACompleto();
