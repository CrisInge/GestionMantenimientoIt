



const API = "http://localhost:3000";
const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");

// 🔥 PROTEGER RUTA
if (!token) {
  window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  window.location.href = "login.html";
}

if (rol === "tecnico") {

  // ❌ ocultar crear equipos
  document.getElementById("formEquipo").style.display = "none";

  // ❌ ocultar crear mantenimientos
  document.getElementById("formMantenimiento").style.display = "none";

  // ❌ ocultar equipos completos
  // const contEquipos = document.getElementById("contEquipos");
  // if (contEquipos) contEquipos.style.display = "none";

}

if (rol !== "admin") {
  const btn = document.querySelector("button[onclick=\"window.location.href='register.html'\"]");
  if (btn) btn.style.display = "none";
}

// =======================
// EQUIPOS
// =======================

async function cargarEquipos() {
  // const res = await fetch(`${API}/equipos`);
  const rol = localStorage.getItem("rol");
  const nombre = localStorage.getItem("nombre"); // 👈 importante

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
      <div class="item">
        <span class="usuario">${equipo.dueno_equipo}</span>
        <span class="marca">${equipo.marca}</span>
        <span class="modelo">${equipo.modelo}</span>
        <span class="area">${equipo.area}</span>
        <span class="service">${equipo.service_tag}</span>
        <span class="tecnico">${equipo.usuario_asignado}</span>
        <button onclick="eliminarEquipo(${equipo.id_equipo})">Eliminar</button>
      </div>
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
// SELECT DINÁMICO (🔥 PRO)
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
      option.value = u.id; // 🔥 IMPORTANTE: usar ID
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

  let url = `${API}/mantenimientos`;

  if (rol === "tecnico") {
    url += `?id_tecnico=${id_usuario}`;
  }

  const res = await fetch(url);

  const data = await res.json();

  const lista = document.getElementById("listaMantenimientos");
  lista.innerHTML = "";

  data.forEach(m => {
    const li = document.createElement("li");

    if (rol === "admin") {
      li.innerHTML = `
        <div class="item">
          <span>Service Tag: ${m.service_tag}</span>
          <span>Tipo: ${m.tipo}</span>
          <span>Estado: ${m.estado}</span>

          <button onclick="terminarMantenimiento(${m.id_mantenimiento})">
            Terminar
          </button>

          <button onclick="eliminarMantenimiento(${m.id_mantenimiento})">
            Eliminar
          </button>
        </div>
      `;
    } else {
      // 👨‍🔧 TECNICO
      li.innerHTML = `
        <div class="item">
          <span>Service Tag: ${m.service_tag}</span>
          <span>Tipo: ${m.tipo}</span>
          <span>Estado: ${m.estado}</span>

          <input id="solucion_${m.id_mantenimiento}" placeholder="Escribir solución">

          <button onclick="agregarSolucion(${m.id_mantenimiento})">
            Guardar solución
          </button>
        </div>
      `;
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
// CARGAR TECNICOS (🔥 PRO)
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