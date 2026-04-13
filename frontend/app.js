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
  localStorage.removeItem("id");
  localStorage.removeItem("nombre");
  localStorage.removeItem("correo");
  localStorage.removeItem("foto_perfil");
  window.location.href = "login.html";
}

function ponerAvatar(elemento, nombre, foto) {
  if (!elemento) return;

  if (foto && foto.trim() !== "") {
    elemento.style.backgroundImage = `url('${foto}')`;
    elemento.textContent = "";
  } else {
    elemento.style.backgroundImage = "none";
    elemento.textContent = nombre ? nombre.trim().charAt(0).toUpperCase() : "?";
  }
}

// Para mostrar nombre, correo y foto en el perfil
const nombre = localStorage.getItem("nombre");
const correo = localStorage.getItem("correo");
const fotoPerfil = localStorage.getItem("foto_perfil");

if (nombre) {
  const spanNombre = document.getElementById("nombreUsuario");
  if (spanNombre) spanNombre.textContent = nombre;
}

if (correo) {
  const spanCorreo = document.getElementById("correoUsuario");
  if (spanCorreo) spanCorreo.textContent = correo;
}

// const foto = document.querySelector(".fotoUsuario");
// ponerAvatar(foto, nombre, fotoPerfil);

const foto = document.querySelector(".fotoUsuario");
if (foto) {
  if (fotoPerfil) {
    foto.style.backgroundImage = `url('${fotoPerfil}')`;
  } else {
    foto.style.backgroundImage = "IMG/gohan.png";
  }
}

// PopUp del formulario de equipos
function abrirModal() {
  document.getElementById("modalEquipo").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("modalEquipo").style.display = "none";
}

// Para editar
function mostrarEditar(id) {
  const div = document.getElementById(`edit_${id}`);

  if (div.style.display === "none") {
    div.style.display = "block";

    const tecnicoActual = document.querySelector(`#edit_${id} input[id^="tecnico_"]`)?.value
      || document.querySelector(`#edit_${id}`).getAttribute("data-tecnico");

    cargarTecnicosEnEditar(id, tecnicoActual);
  } else {
    div.style.display = "none";
  }
}

async function cargarPerfilUsuarioActual() {
  const id = localStorage.getItem("id");
  if (!id) return;

  try {
    const res = await fetch(`${API}/usuarios/${id}`);
    const data = await res.json();

    if (!res.ok) {
      console.error(data.message || "No se pudo cargar el perfil");
      return;
    }

    const spanNombre = document.getElementById("nombreUsuario");
    const spanCorreo = document.getElementById("correoUsuario");
    const foto = document.querySelector(".fotoUsuario");

    if (spanNombre) spanNombre.textContent = data.nombre || "";
    if (spanCorreo) spanCorreo.textContent = data.correo || "";

    localStorage.setItem("nombre", data.nombre || "");
    localStorage.setItem("correo", data.correo || "");

    // if (foto) {
    //   if (data.foto_perfil) {
    //     foto.style.backgroundImage = `url('${data.foto_perfil}')`;
    //     localStorage.setItem("foto_perfil", data.foto_perfil);
    //   } else {
    //     foto.style.backgroundImage = "none";
    //     localStorage.removeItem("foto_perfil");
    //   }
    // }
        if (foto) {
          ponerAvatar(foto, data.nombre, data.foto_perfil);

          if (data.foto_perfil && data.foto_perfil.trim() !== "") {
            localStorage.setItem("foto_perfil", data.foto_perfil);
          } else {
            localStorage.removeItem("foto_perfil");
          }
        }

  } catch (error) {
    console.error("Error al cargar el perfil del usuario actual:", error);
  }
}

// Cancelar editar
function cancelarEdicion(id) {
  const div = document.getElementById(`edit_${id}`);
  div.style.display = "none";
}

if (rol === "tecnico") {
  document.getElementById("formEquipo").style.display = "none";
  document.getElementById("formMantenimiento").style.display = "none";
  document.getElementById("textAcciones").style.display = "none";

  const historial = document.getElementById("linkMantenimientos");
  if (historial) historial.style.display = "none";

  const registrarUsuarios = document.getElementById("linkRegistrarUsuarios");
  if (registrarUsuarios) registrarUsuarios.style.display = "none";

  const usuarios = document.getElementById("linkUsuarios");
  if (usuarios) usuarios.style.display = "none";

  const btnAgregarEquipo = document.getElementById("agregarEquipo");
  if (btnAgregarEquipo) btnAgregarEquipo.style.display = "none";
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

      if (u.nombre === tecnicoActual) {
        option.selected = true;
      }

      select.appendChild(option);
    }
  });
}

// ACTUALIZAR EQUIPO
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

// EQUIPOS
async function cargarEquipos() {
  const rol = localStorage.getItem("rol");
  const nombre = localStorage.getItem("nombre");

  let url = `${API}/equipos`;

  if (rol === "tecnico") {
    url += `?tecnico=${encodeURIComponent(nombre)}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  const lista = document.getElementById("listaEquipos");
  lista.innerHTML = "";

  if (data.length === 0) {
    lista.innerHTML = `
      <p style="text-align:center; padding:20px;">
        No tienes equipos asignados
      </p>
    `;
    return;
  }

  data.forEach(equipo => {
    const li = document.createElement("li");

    li.dataset.id = equipo.id_equipo;

    // li.innerHTML = `
    //   <div class="item" onclick="toggleHistorial(${equipo.id_equipo})">
    //     <div class="contSpan">
    //       <span class="usuario">${equipo.dueno_equipo}</span>
    //       <span class="marca">${equipo.marca}</span>
    //       <span class="modelo">${equipo.modelo}</span>
    //       <span class="area">${equipo.area}</span>
    //       <span class="service">${equipo.service_tag}</span>
    //       <span class="tecnico">${equipo.usuario_asignado}</span>

    //       ${
    //         rol === "admin"
    //           ? `
    //           <div class="btnsAcciones">
    //             <button onclick="event.stopPropagation(); mostrarEditar(${equipo.id_equipo})">Editar</button>
    //             <button onclick="event.stopPropagation(); eliminarEquipo(${equipo.id_equipo})">Eliminar</button>
    //           </div>
    //           `
    //           : ""
    //       }
    //     </div>
    //   </div>

    //   <div id="edit_${equipo.id_equipo}" style="display:none; margin-top:10px;">
    //     <h4>Editar datos</h4>
    //     <input id="dueno_${equipo.id_equipo}" value="${equipo.dueno_equipo}">
    //     <input id="marca_${equipo.id_equipo}" value="${equipo.marca}">
    //     <input id="modelo_${equipo.id_equipo}" value="${equipo.modelo}">
    //     <input id="service_${equipo.id_equipo}" value="${equipo.service_tag}">
    //     <input id="area_${equipo.id_equipo}" value="${equipo.area}">
    //     <select id="tecnico_${equipo.id_equipo}"></select>

    //     <button onclick="actualizarEquipo(${equipo.id_equipo})">Guardar</button>
    //     <button onclick="cancelarEdicion(${equipo.id_equipo})">Cancelar</button>
    //   </div>

    //   <div id="historial_${equipo.id_equipo}" style="display:none; cursor: none; margin:10px 0 25px 0;"></div>
    // `;


    li.innerHTML = `
  <div class="item">
    <div class="contSpan" onclick="toggleHistorial(${equipo.id_equipo})">
      <span class="usuario">${equipo.dueno_equipo}</span>
      <span class="marca">${equipo.marca}</span>
      <span class="modelo">${equipo.modelo}</span>
      <span class="area">${equipo.area}</span>
      <span class="service">${equipo.service_tag}</span>
      <span class="tecnico">${equipo.usuario_asignado || "Sin asignar"}</span>

      ${
        rol === "admin"
          ? `
          <div class="btnsAcciones">
            <button class="btnAccionIcono btnEditarIcono" title="Editar"
              onclick="event.stopPropagation(); mostrarEditar(${equipo.id_equipo})">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>

            <button class="btnAccionIcono btnEliminarIcono" title="Eliminar"
              onclick="event.stopPropagation(); eliminarEquipo(${equipo.id_equipo})">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
          `
          : `<div></div>`
      }
    </div>
  </div>

  <div id="edit_${equipo.id_equipo}" style="display:none;">
    <h4>Editar datos</h4>
    <input id="dueno_${equipo.id_equipo}" value="${equipo.dueno_equipo}">
    <input id="marca_${equipo.id_equipo}" value="${equipo.marca}">
    <input id="modelo_${equipo.id_equipo}" value="${equipo.modelo}">
    <input id="service_${equipo.id_equipo}" value="${equipo.service_tag}">
    <input id="area_${equipo.id_equipo}" value="${equipo.area}">
    <select id="tecnico_${equipo.id_equipo}"></select>

    <button onclick="actualizarEquipo(${equipo.id_equipo})">Guardar</button>
    <button onclick="cancelarEdicion(${equipo.id_equipo})">Cancelar</button>
  </div>

  <div id="historial_${equipo.id_equipo}" style="display:none;"></div>
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

// SELECT DINÁMICO
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

// HISTORIAL POR EQUIPO
async function toggleHistorial(id_equipo) {
  const div = document.getElementById(`historial_${id_equipo}`);

  if (div.style.display === "block") {
    div.style.display = "none";
    return;
  }

  div.style.display = "block";

  const res = await fetch(`${API}/mantenimientos/historial/${id_equipo}`);
  const data = await res.json();

  div.innerHTML = "<h4>Historial</h4>";

  if (data.length === 0) {
    div.innerHTML += `<p style="color:#666;">Este equipo no tiene historial todavía.</p>`;
    return;
  }

  data.forEach(m => {
    div.innerHTML += `
      <div class="item">
        <span><strong>Tipo:</strong> ${m.tipo}</span>
        <span><strong>Estado:</strong> ${m.estado}</span>
        <span><strong>Técnico:</strong> ${m.tecnico || "Sin asignar"}</span>
        <span><strong>Inicio:</strong> ${m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleString() : "Sin fecha"}</span>
        <span><strong>Fin:</strong> ${m.fecha_fin ? new Date(m.fecha_fin).toLocaleString() : "En proceso"}</span>
        <span><strong>Solución:</strong> ${m.comentario || "Sin solución"}</span>
      </div>
    `;
  });
}

// CARGAR TECNICOS EN MANTENIMIENTO
async function cargarTecnicosMant() {
  const res = await fetch(`${API}/usuarios`);
  const data = await res.json();

  const select = document.getElementById("tecnico_mant");
  select.innerHTML = '<option value="">Selecciona técnico</option>';

  data.forEach(u => {
    if (u.rol === "tecnico") {
      const option = document.createElement("option");
      option.value = u.id;
      option.textContent = u.nombre;
      select.appendChild(option);
    }
  });
}

// MANTENIMIENTOS
async function cargarMantenimientos() {
  const id_usuario = localStorage.getItem("id");
  const rol = localStorage.getItem("rol");

  let url = `${API}/mantenimientos?estado=Activo`;

  if (rol === "tecnico") {
    url += `&id_tecnico=${id_usuario}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  const lista = document.getElementById("listaMantenimientos");
  const tabla = document.getElementById("mantenimientosTableCard");
  const vacio = document.getElementById("mantenimientosVacio");
  const formCard = document.getElementById("maintenanceFormCard");

  lista.innerHTML = "";

  // 🔥 el técnico nunca debe ver el formulario
  if (formCard) {
    formCard.style.display = rol === "tecnico" ? "none" : "block";
  }

  // si no hay mantenimientos
  if (data.length === 0) {
    if (tabla) tabla.style.display = "none";
    if (vacio) vacio.style.display = "block";
    return;
  } else {
    if (tabla) tabla.style.display = "block";
    if (vacio) vacio.style.display = "none";
  }

  data.forEach(m => {
    const li = document.createElement("li");

    if (m.estado !== "Activo") return;

    if (rol === "admin") {
      li.innerHTML = `
        <div class="item">
          <span>${m.service_tag}</span>
          <span>${m.tipo}</span>
          <span>${m.estado}</span>
          <span>${m.tecnico || "Sin asignar"}</span>
          <div>
            <button onclick="terminarMantenimiento(${m.id_mantenimiento})">Terminar</button>
            <button onclick="eliminarMantenimiento(${m.id_mantenimiento})">Eliminar</button>
          </div>
        </div>
      `;
    } else {
      li.innerHTML = `
        <div class="item">
          <span>${m.service_tag}</span>
          <span>${m.tipo}</span>
          <span>${m.estado}</span>
          <span>${m.tecnico || "Sin asignar"}</span>
          <div>
            <input id="solucion_${m.id_mantenimiento}" placeholder="Escribir solución">
            <button onclick="agregarSolucion(${m.id_mantenimiento})">Guardar solución</button>
          </div>
        </div>
      `;
    }

    lista.appendChild(li);
  });
}

// async function cargarMantenimientos() {
//   const id_usuario = localStorage.getItem("id");
//   const rol = localStorage.getItem("rol");

//   let url = `${API}/mantenimientos?estado=Activo`;

//   if (rol === "tecnico") {
//     url += `&id_tecnico=${id_usuario}`;
//   }

//   const res = await fetch(url);
//   const data = await res.json();

//   // const lista = document.getElementById("listaMantenimientos");
//   // lista.innerHTML = "";

//   // if (data.length === 0) {
//   //   lista.innerHTML = `
//   //     <h3 style="text-align:center; padding:50px 20px 20px 20px; color: gray;">
//   //       Aun no tienes mantenimientos asignados
//   //     </h3>
//   //   `;
//   //   return;
//   // }

//   const lista = document.getElementById("listaMantenimientos");
//   const tabla = document.getElementById("mantenimientosTableCard");
//   const vacio = document.getElementById("mantenimientosVacio");

//   lista.innerHTML = "";

//   const formCard = document.getElementById("maintenanceFormCard");

//   if (rol === "tecnico") {
//     if (formCard) formCard.style.display = "none";
//   } else {
//     if (formCard) formCard.style.display = "block";
//   }

//   if (data.length === 0) {
//     if (tabla) tabla.style.display = "none";
//     if (vacio) vacio.style.display = "block";

//     // AQUÍ LA DIFERENCIA
//     if (formCard) {
//       if (rol === "admin") {
//         formCard.style.display = "block"; // admin sí puede agregar
//       } else {
//         formCard.style.display = "none";  // técnico no
//       }
//     }

//     return;
//   } else {
//     if (tabla) tabla.style.display = "block";
//     if (vacio) vacio.style.display = "none";

//     if (formCard) formCard.style.display = "block";
//   }





//   data.forEach(m => {
//     const li = document.createElement("li");

//     if (m.estado !== "Activo") return;

//     if (rol === "admin") {
//       li.innerHTML = `
//         <div class="item">
//           <span>${m.service_tag}</span>
//           <span>${m.tipo}</span>
//           <span>${m.estado}</span>
//           <span>${m.tecnico || "Sin asignar"}</span>
//           <div>
//             <button onclick="terminarMantenimiento(${m.id_mantenimiento})">Terminar</button>
//             <button onclick="eliminarMantenimiento(${m.id_mantenimiento})">Eliminar</button>
//           </div>
//         </div>
//       `;
//     } else {
//       li.innerHTML = `
//         <div class="item">
//           <span>${m.service_tag}</span>
//           <span>${m.tipo}</span>
//           <span>${m.estado}</span>
//           <span>${m.tecnico || "Sin asignar"}</span>
//           <div>
//             <input id="solucion_${m.id_mantenimiento}" placeholder="Escribir solución">
//             <button onclick="agregarSolucion(${m.id_mantenimiento})">Guardar solución</button>
//           </div>
//         </div>
//       `;
//     }

//     lista.appendChild(li);
//   });
// }

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

// CARGAR TECNICOS
async function cargarTecnicos() {
  const res = await fetch(`${API}/usuarios`);
  const data = await res.json();

  const select = document.getElementById("usuario_asignado");
  select.innerHTML = '<option value="">Selecciona un técnico</option>';

  data.forEach(u => {
    if (u.rol === "tecnico") {
      const option = document.createElement("option");
      option.value = u.nombre;
      option.textContent = u.nombre;
      select.appendChild(option);
    }
  });
}

// AGREGAR SOLUCIÓN
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

// INICIALIZAR
cargarEquipos();
cargarMantenimientos();
cargarEquiposSelect();
cargarTecnicos();
cargarTecnicosMant();
cargarPerfilUsuarioActual();