



const API = "http://localhost:3000";
const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

// PROTEGER RUTA
if (!token) {
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  window.location.href = "login.html";
}


// Para mostrar nombre y correo en el perfil
const nombre = localStorage.getItem("nombre");
const correo = localStorage.getItem("correo");

if (nombre) {
  const spanNombre = document.getElementById("nombreUsuario");
  if (spanNombre) spanNombre.textContent = nombre;
}

if (correo) {
  const spanCorreo = document.getElementById("correoUsuario");
  if (spanCorreo) spanCorreo.textContent = correo;
}

// PopUp del formulario de equipos
function abrirModal() {
  document.getElementById("modalEquipo").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modalEquipo").style.display = "none";
}



//  Para editar
function mostrarEditar(id) {
  const div = document.getElementById(`edit_${id}`);

  if (div.style.display === "none") {
    div.style.display = "block";

    // obtener técnico actual desde el DOM
    const tecnicoActual = document.querySelector(`#edit_${id} input[id^="tecnico_"]`)?.value 
      || document.querySelector(`#edit_${id}`).getAttribute("data-tecnico");

    cargarTecnicosEnEditar(id, tecnicoActual);

  } else {
    div.style.display = "none";
  }
}

// Cancelar editar
function cancelarEdicion(id) {
  const div = document.getElementById(`edit_${id}`);
  div.style.display = "none";
}

if (rol === "tecnico") {

  // ocultar crear equipos
  document.getElementById("formEquipo").style.display = "none";

  // ocultar crear mantenimientos
  document.getElementById("formMantenimiento").style.display = "none";

  // ocultar texto acciones
  document.getElementById("textAcciones").style.display = "none";

  // ocultar historial
  const historial = document.getElementById("linkMantenimientos");
  if (historial) historial.style.display = "none";

  // ocultar registrar usuarios
  const registrarUsuarios = document.getElementById("linkRegistrarUsuarios");
  if (registrarUsuarios) registrarUsuarios.style.display = "none";

  // ocultar usuarios
  const usuarios = document.getElementById("linkUsuarios");
  if (usuarios) usuarios.style.display = "none";

  // ocultar agregar equipo btn
  const btnAgregarEquipo = document.getElementById("agregarEquipo");
  if (btnAgregarEquipo) btnAgregarEquipo.style.display = "none";

  // ocultar equipos completos
  // const contEquipos = document.getElementById("contEquipos");
  // if (contEquipos) contEquipos.style.display = "none";

}

if (rol !== "admin") {
  const btn = document.querySelector("button[onclick=\"window.location.href='register.html'\"]");
  if (btn) btn.style.display = "none";
}

// Funcion para llenar select en editar
async function cargarTecnicosEnEditar(id, tecnicoActual) {
  const res = await fetch(`${API}/usuarios`);
  const data = await res.json();

  const select = document.getElementById(`tecnico_${id}`);

  select.innerHTML = '<option value="">Selecciona técnico</option>';

  data.forEach(u => {
    if (u.rol === "tecnico") {
      const option = document.createElement("option");
      option.value = u.nombre;
      option.textContent = u.nombre;

      // marcar seleccionado
      if (u.nombre === tecnicoActual) {
        option.selected = true;
      }

      select.appendChild(option);
    }
  });
}

// =======================
// ACTUALIZAR EQUIPO
// =======================
async function actualizarEquipo(id) {
  const equipo = {
    dueno_equipo: document.getElementById(`dueno_${id}`).value,
    marca: document.getElementById(`marca_${id}`).value,
    modelo: document.getElementById(`modelo_${id}`).value,
    service_tag: document.getElementById(`service_${id}`).value,
    area: document.getElementById(`area_${id}`).value,
    usuario_asignado: document.getElementById(`tecnico_${id}`).value
  };

  await fetch(`${API}/equipos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(equipo)
  });

  alert("Equipo actualizado");
  cargarEquipos();
}

// =======================
// EQUIPOS
// =======================

async function cargarEquipos() {
  // const res = await fetch(`${API}/equipos`);
  const rol = localStorage.getItem("rol");
  const nombre = localStorage.getItem("nombre"); // importante

  let url = `${API}/equipos`;

  if (rol === "tecnico") {
    url += `?tecnico=${nombre}`;
  }

  const res = await fetch(url);
  const data = await res.json();


  
  const lista = document.getElementById("listaEquipos");
  lista.innerHTML = "";

  data.forEach(equipo => {
    const li = document.createElement("li");

    li.dataset.id = equipo.id_equipo; // ID individual

    li.innerHTML = `
      <div class="item" onclick="toggleHistorial(${equipo.id_equipo})">
        <div class="contSpan">
          <span class="usuario">${equipo.dueno_equipo}</span>
          <span class="marca">${equipo.marca}</span>
          <span class="modelo">${equipo.modelo}</span>
          <span class="area">${equipo.area}</span>
          <span class="service">${equipo.service_tag}</span>
          <span class="tecnico">${equipo.usuario_asignado}</span>
        
        ${
          rol === "admin"
            ? `
            <div class="btnsAcciones">
              <button onclick="event.stopPropagation(); mostrarEditar(${equipo.id_equipo})">Editar</button>
              <button onclick="event.stopPropagation(); eliminarEquipo(${equipo.id_equipo})">Eliminar</button>
            </div>
            `
            : ""
        }

        </div>
      </div>

      <!-- FORMULARIO OCULTO -->
      <div id="edit_${equipo.id_equipo}" style="display:none; margin-top:10px;">
      <h4>Editar datos</h4>
        <input id="dueno_${equipo.id_equipo}" value="${equipo.dueno_equipo}">
        <input id="marca_${equipo.id_equipo}" value="${equipo.marca}">
        <input id="modelo_${equipo.id_equipo}" value="${equipo.modelo}">
        <input id="service_${equipo.id_equipo}" value="${equipo.service_tag}">
        <input id="area_${equipo.id_equipo}" value="${equipo.area}">
        <select id="tecnico_${equipo.id_equipo}"></select>

        <button onclick="actualizarEquipo(${equipo.id_equipo})">
          Guardar
        </button>
        <button onclick="cancelarEdicion(${equipo.id_equipo})">
          Cancelar
        </button>
      </div>
      
      <!-- HISTORIAL -->
      <div id="historial_${equipo.id_equipo}" style="display:none; margin-top:10px;"></div>

    `;

    lista.appendChild(li);
  });
}

// Crear equipo
document.getElementById("formEquipo").addEventListener("submit", async e => {
  e.preventDefault();

  const equipo = {
    dueno_equipo: document.getElementById("dueno_equipo").value,
    marca: document.getElementById("marca").value,
    modelo: document.getElementById("modelo").value,
    service_tag: document.getElementById("service_tag").value,
    area: document.getElementById("area").value,
    usuario_asignado: document.getElementById("usuario_asignado").value
  };

  await fetch(`${API}/equipos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(equipo)
  });

  document.getElementById("formEquipo").reset();
  cargarEquipos();
});

// Eliminar equipo
async function eliminarEquipo(id) {
  await fetch(`${API}/equipos/${id}`, {
    method: "DELETE"
  });

  cargarEquipos();
}

// =======================
// SELECT DINÁMICO
// =======================

async function cargarEquiposSelect() {
  const res = await fetch(`${API}/equipos`);
  const data = await res.json();

  const select = document.getElementById("service_tag_mant");
  select.innerHTML = '<option value="">Selecciona un equipo</option>';

  data.forEach(e => {
    const option = document.createElement("option");
    option.value = e.service_tag;
    option.textContent = `${e.dueno_equipo} | ${e.marca} ${e.modelo} (${e.service_tag})`;
    select.appendChild(option);
  });
}

// =======================
// HISTORIAL POR EQUIPO
// =======================
async function toggleHistorial(id_equipo) {
  const div = document.getElementById(`historial_${id_equipo}`);

  // mostrar / ocultar
  if (div.style.display === "block") {
    div.style.display = "none";
    return;
  }

  div.style.display = "block";

  // cargar historial
  // const res = await fetch(`${API}/mantenimientos?id_equipo=${id_equipo}`);
  const res = await fetch(`${API}/mantenimientos/historial/${id_equipo}`);
  const data = await res.json();

  div.innerHTML = "<h4>Historial</h4>";

  data.forEach(m => {
    div.innerHTML += `
      <div class="item" style="background:#f5f5f5; margin:5px; padding:5px;">
        <span>Tipo: ${m.tipo}</span>
        <span>Estado: ${m.estado}</span>
        <span>Técnico: ${m.tecnico || "Sin asignar"}</span>
        <span>Inicio: ${m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleString() : "Sin fecha"}</span>
        <span>Fin: ${m.fecha_fin ? new Date(m.fecha_fin).toLocaleString() : "En proceso"}</span>
        <span>Solución: ${m.comentario || "Sin solución"}</span>
      </div>
    `;
  });
}

// =======================
// CARGAR TECNICOS EN MANTENIMIENTO
// =======================
async function cargarTecnicosMant() {
  const res = await fetch(`${API}/usuarios`);
  const data = await res.json();

  const select = document.getElementById("tecnico_mant");

  select.innerHTML = '<option value="">Selecciona técnico</option>';

  data.forEach(u => {
    if (u.rol === "tecnico") {
      const option = document.createElement("option");
      option.value = u.id; //IMPORTANTE
      option.textContent = u.nombre;
      select.appendChild(option);
    }
  });
}

// =======================
// MANTENIMIENTOS
// =======================

async function cargarMantenimientos() {
  // const res = await fetch(`${API}/mantenimientos`);
  const id_usuario = localStorage.getItem("id");
  const rol = localStorage.getItem("rol");

  //let url = `${API}/mantenimientos`;
  let url = `${API}/mantenimientos?estado=Activo`;

  if (rol === "tecnico") {
    url += `&id_tecnico=${id_usuario}`;
  }

  const res = await fetch(url);

  const data = await res.json();

  const lista = document.getElementById("listaMantenimientos");
  lista.innerHTML = "";

  data.forEach(m => {
    const li = document.createElement("li");

    // FILTRO EXTRA (por si acaso)
    if (m.estado !== "Activo") return;

    if (rol === "admin") {
      li.innerHTML = `
        <div class="item">
          <span>Service Tag: ${m.service_tag}</span>
          <span>Tipo: ${m.tipo}</span>
          <span>Estado: ${m.estado}</span>
          <span>Técnico: ${m.tecnico || "Sin asignar"}</span>

          <button onclick="terminarMantenimiento(${m.id_mantenimiento})">
            Terminar
          </button>

          <button onclick="eliminarMantenimiento(${m.id_mantenimiento})">
            Eliminar
          </button>
        </div>
      `;
    } else {
      // TECNICO
      if (m.estado === "Activo") {
        li.innerHTML = `
          <div class="item">
            <span>Service Tag: ${m.service_tag}</span>
            <span>Tipo: ${m.tipo}</span>
            <span>Estado: ${m.estado}</span>
            <span>Técnico: ${m.tecnico || "Sin asignar"}</span>

            <input id="solucion_${m.id_mantenimiento}" placeholder="Escribir solución">

            <button onclick="agregarSolucion(${m.id_mantenimiento})">
              Guardar solución
            </button>
          </div>
        `;
      } else {
        li.innerHTML = `
          <div class="item">
            <span>Service Tag: ${m.service_tag}</span>
            <span>Tipo: ${m.tipo}</span>
            <span>Estado: ${m.estado}</span>
            <span>Técnico: ${m.tecnico || "Sin asignar"}</span>
            
          </div>
        `;
      }
    }

    lista.appendChild(li);
  });
}
// Crear mantenimiento
document.getElementById("formMantenimiento").addEventListener("submit", async e => {
  e.preventDefault();

  const mantenimiento = {
  service_tag: document.getElementById("service_tag_mant").value,
  tipo: document.getElementById("tipo").value,
  descripcion: document.getElementById("descripcion").value,
  id_tecnico: document.getElementById("tecnico_mant").value
};

  await fetch(`${API}/mantenimientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mantenimiento)
  });

  document.getElementById("formMantenimiento").reset();
  cargarMantenimientos();
});

// Eliminar mantenimiento
async function eliminarMantenimiento(id) {
  await fetch(`${API}/mantenimientos/${id}`, {
    method: "DELETE"
  });

  cargarMantenimientos();
}

// Terminar mantenimiento
async function terminarMantenimiento(id) {
  await fetch(`${API}/mantenimientos/${id}/terminar`, {
    method: "PUT"
  });

  cargarMantenimientos();
}

// =======================
// CARGAR TECNICOS
// =======================
async function cargarTecnicos() {
  const res = await fetch(`${API}/usuarios`);
  const data = await res.json();

  const select = document.getElementById("usuario_asignado");

  select.innerHTML = '<option value="">Selecciona un técnico</option>';

  data.forEach(u => {
    if (u.rol === "tecnico") {
      const option = document.createElement("option");
      option.value = u.nombre; // puedes usar ID después
      option.textContent = u.nombre;
      select.appendChild(option);
    }
  });
}

// =======================
// AGREGAR SOLUCIÓN (TECNICO)
// =======================
async function agregarSolucion(id) {
  const solucion = document.getElementById(`solucion_${id}`).value;

  await fetch(`${API}/mantenimientos/${id}/solucion`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ solucion })
  });

  alert("Solución guardada");
  cargarMantenimientos();
}

// =======================
// INICIALIZAR
// =======================

cargarEquipos();
cargarMantenimientos();
cargarEquiposSelect();
cargarTecnicos();
cargarTecnicosMant();