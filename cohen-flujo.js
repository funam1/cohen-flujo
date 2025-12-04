/* ============================================================
   COHEN AUTOMATION SCRIPT – LEGIBLE VERSION (SAFE MODE)
   Autor: ChatGPT para Federico Unamuno
   Automatiza: Tenencia → CC → No Renovar (con filtro)
   Botón flotante: "Ejecutar Flujo Cohen"
   ============================================================ */

console.log("[Cohen Auto] Script cargado correctamente.");

/* ---------------- CONFIGURACIÓN (modo SAFE) ---------------- */

const CFG = {
    delayClick: 900,
    delaySmall: 1300,
    delayPage: 3500,
    delayDownload: 4500,
    delayFilter: 2200,
    delayNextPage: 2500
};

/* ---------------------- UTILITARIOS ------------------------ */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function esperarXPath(xpath, timeout = 15000) {
    return new Promise((resolve, reject) => {
        const t0 = Date.now();

        (function buscar() {
            const el = document.evaluate(
                xpath, document, null,
                XPathResult.FIRST_ORDERED_NODE_TYPE, null
            ).singleNodeValue;

            if (el) return resolve(el);
            if (Date.now() - t0 > timeout)
                return reject("Timeout buscando: " + xpath);

            setTimeout(buscar, 200);
        })();
    });
}

async function clickXPath(xpath, nombre = "") {
    try {
        const el = await esperarXPath(xpath);
        let target = el;
        if (target.tagName.toLowerCase() === "i" && target.parentElement) {
            target = target.parentElement;
        }
        target.click();
        console.log("[Cohen Auto] Click:", nombre || xpath);
        await sleep(CFG.delayClick);
        return true;
    } catch (e) {
        console.warn("[Cohen Auto] No se pudo clickear", nombre, e);
        return false;
    }
}

/* ----------------------- FLUJOS --------------------------- */

async function irASeccionTenenciaCC() {
    console.log("[Cohen Auto] Entrando a Tenencia/CC...");
    await clickXPath('//*[@id="menu_izquierda"]/li[2]/ul/li/a', "Menú Tenencia/CC");
    await esperarXPath('//*[@id="clientes_1_module-tenencia_nombre"]');
    await sleep(CFG.delayPage);
}

async function cargarTenencia() {
    console.log("[Cohen Auto] Cargando tenencia...");
    await clickXPath('//*[@id="clientes_1_module-tenencia_nombre"]', "Botón Tenencia");
    await esperarXPath('//*[@id="clientes_1_module-download-download_action"]');
    await sleep(CFG.delayPage);
}

async function descargarTenencia() {
    console.log("[Cohen Auto] Descargando tenencia...");
    await clickXPath('//*[@id="clientes_1_module-download-download_action"]', "Descarga Tenencia");
    await sleep(CFG.delayDownload);
}

async function cargarCuentaCorriente() {
    console.log("[Cohen Auto] Cargando cuenta corriente...");
    await clickXPath('//*[@id="clientes_1_module-cuenta_corriente_nombre"]', "Botón CC");
    await esperarXPath('//*[@id="clientes_1_module-download-download_action"]');
    await sleep(CFG.delayPage);
}

async function descargarCuentaCorriente() {
    console.log("[Cohen Auto] Descargando CC...");
    await clickXPath('//*[@id="clientes_1_module-download-download_action"]/i', "Descarga CC");
    await sleep(CFG.delayDownload);
}

async function irANoRenovar() {
   
  const xpath = '//*[@id="menu_izquierda"]/li[4]/ul/li[2]/a';
  console.log('[Cohen Auto] Navegando a No Renovar...');
  await clickByXPath(xpath, 'Menú No Renovar');

  // Esperamos a que esté la tabla principal que usamos (la misma del paginador Next)
  try {
    await esperarXPath('//*[@id="DataTables_Table_8"]', 15000);
  } catch (e) {
    console.warn('[Cohen Auto] No se encontró la tabla DataTables_Table_8:', e);
  }

  await sleep(CFG.delayPagina);
}

function getTodayParts() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return { yyyy, mm, dd, dayNum: String(d.getDate()) };
}

function buscarDiaCalendario(dayNum) {
    const els = Array.from(document.querySelectorAll("td, span, button"));
    return els.find(el => el.textContent.trim() === dayNum && el.offsetParent);
}

async function aplicarFiltroFechaHoy() {
  console.log("[Cohen Auto] Aplicando filtro de fecha = hoy (DataTables)...");

  const { yyyy, mm, dd } = getTodayParts();
  const hoy = `${yyyy}-${mm}-${dd}`;

  try {
    if (window.$ && $.fn.dataTable) {
      // Usamos la tabla que matchea con el botón Next: DataTables_Table_8
      const dt = $('#DataTables_Table_8').DataTable();
      dt.search(hoy).draw();   // búsqueda global por la fecha
      console.log("[Cohen Auto] Filtro aplicado via DataTables.search:", hoy);
      await sleep(CFG.delayFilter);
      return;
    } else {
      console.warn("[Cohen Auto] DataTables no disponible, no pude aplicar el filtro vía API");
    }
  } catch (e) {
    console.warn("[Cohen Auto] Error aplicando filtro via DataTables:", e);
  }

  // Fallback muy simple por si no hay DataTables (casi seguro no lo vas a usar)
  console.warn("[Cohen Auto] Usando fallback simple de input (puede no funcionar bien)");
  try {
    const input = await esperarXPath('//*[@id="DataTables_Table_8"]/thead/tr[2]/td[5]/div[1]/input');
    input.value = hoy;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(CFG.delayFilter);
  } catch (e2) {
    console.warn("[Cohen Auto] Fallback también falló:", e2);
  }
}


function btnNext() {
    return document.evaluate(
        '//*[@id="DataTables_Table_8_next"]/a',
        document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
    ).singleNodeValue;
}

async function clickNoRenovar() {
    const botones = Array.from(document.querySelectorAll('button, a'))
    .filter(el => {
      const txt = el.textContent.trim().toLowerCase();
      return txt.includes('no renovar');  // más flexible que igualdad estricta
    });

  console.log('[Cohen Auto] Botones "No Renovar" en esta página:', botones.length);

  for (const b of botones) {
    try {
      b.click();
      await sleep(CFG.delayClick);
    } catch (e) {
      console.warn('[Cohen Auto] Error al clickear "No Renovar":', e);
    }
  }
}

async function procesarNoRenovar() {
    while (true) {
        await clickNoRenovar();
        await sleep(CFG.delaySmall);

        const next = btnNext();
        if (!next || next.parentElement.classList.contains("disabled")) break;

        next.click();
        await sleep(CFG.delayNextPage);
    }

    console.log("[Cohen Auto] No Renovar COMPLETADO.");
}

/* ---------------------- FLUJO PRINCIPAL ------------------- */

async function ejecutarFlujoCohen() {
    try {
        console.log("========= INICIO FLUJO COHEN (SAFE) =========");

        await irASeccionTenenciaCC();
        await cargarTenencia();
        await descargarTenencia();

        await cargarCuentaCorriente();
        await descargarCuentaCorriente();

        await irANoRenovar();
        await aplicarFiltroFechaHoy();
        await procesarNoRenovar();

        console.log("========= FIN FLUJO COHEN =========");
        alert("Flujo Cohen COMPLETADO ✔");
    } catch (e) {
        console.error("Error en flujo:", e);
        alert("Error en ejecución. Ver consola.");
    }
}

/* ------------------ BOTÓN FLOTANTE ------------------------ */

function agregarBotonFlotante() {
    if (document.getElementById("cohen-flujo-btn")) return;

    const btn = document.createElement("button");
    btn.id = "cohen-flujo-btn";
    btn.innerText = "Ejecutar Flujo Cohen";
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = 999999;
    btn.style.padding = "10px 15px";
    btn.style.background = "#0b79d0";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.boxShadow = "0px 2px 6px rgba(0,0,0,0.3)";

    btn.onclick = ejecutarFlujoCohen;

    document.body.appendChild(btn);
}

agregarBotonFlotante();
console.log("[Cohen Auto] Botón flotante agregado.");
