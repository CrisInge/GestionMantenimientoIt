// const API = "http://localhost:3000";
const API = "https://illustrious-enthusiasm-production-0827.up.railway.app";
const token = localStorage.getItem("token");
const rol = localStorage.getItem("rol");
const id = localStorage.getItem("id");

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

async function cargarUsuarioActual() {
  try {
    const res = await fetch(`${API}/usuarios/${id}`);
    const data = await res.json();

    if (!res.ok) return;

    const nombreTop = document.getElementById("nombreUsuarioTop");
    const correoTop = document.getElementById("correoUsuarioTop");
    const fotoTop = document.getElementById("fotoUsuarioTop");

    if (nombreTop) nombreTop.textContent = data.nombre || "Usuario";
    if (correoTop) correoTop.textContent = data.correo || "Sin correo";

    localStorage.setItem("nombre", data.nombre || "");
    localStorage.setItem("correo", data.correo || "");

    // if (fotoTop) {
    //   if (data.foto_perfil) {
    //     fotoTop.style.backgroundImage = `url('${data.foto_perfil}')`;
    //     localStorage.setItem("foto_perfil", data.foto_perfil);
    //   } else {
    //     fotoTop.style.backgroundImage = "none";
    //     localStorage.removeItem("foto_perfil");
    //   }
    // }

        if (fotoTop) {
            ponerAvatar(fotoTop, data.nombre, data.foto_perfil);

            if (data.foto_perfil && data.foto_perfil.trim() !== "") {
                localStorage.setItem("foto_perfil", data.foto_perfil);
            } else {
                localStorage.removeItem("foto_perfil");
            }
        }

  } catch (error) {
    console.error("Error cargando usuario actual:", error);
  }
}

async function cargarUsuarios() {
  try {
    const res = await fetch(`${API}/usuarios`);
    const data = await res.json();

    const lista = document.getElementById("usuariosLista");
    lista.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      lista.innerHTML = `<div class="usuariosVacio">No hay usuarios registrados.</div>`;
      return;
    }

    let admins = 0;
    let tecnicos = 0;

    data.forEach(usuario => {
      if (usuario.rol === "admin") admins++;
      if (usuario.rol === "tecnico") tecnicos++;

      const fila = document.createElement("div");
      fila.className = "usuarioFila";
      fila.dataset.nombre = (usuario.nombre || "").toLowerCase();
      fila.dataset.correo = (usuario.correo || "").toLowerCase();
      fila.dataset.rol = (usuario.rol || "").toLowerCase();

      const estadoClase = "activo";
      const estadoTexto = "Activo";

    //   const fotoHtml = `
    //     <div class="usuarioFoto" style="background-image: url('${
    //         usuario.foto_perfil ? usuario.foto_perfil : "IMG/default-user.png"
    //     }')"></div>
    //   `;

        const inicial = usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : "?";

        const fotoHtml = usuario.foto_perfil
        ? `<div class="usuarioFoto" style="background-image: url('${usuario.foto_perfil}')"></div>`
        : `<div class="usuarioFoto" style="display:flex;align-items:center;justify-content:center;font-weight:bold;background:#293D96;color:white;">${inicial}</div>`;

    //   fila.innerHTML = `
    //     <div>${fotoHtml}</div>
    //     <div class="usuarioNombre">${usuario.nombre || "Sin nombre"}</div>
    //     <div class="usuarioCorreo">${usuario.correo || "Sin correo"}</div>
    //     <div class="usuarioRol">${usuario.rol || "Sin rol"}</div>
    //     <div><span class="usuarioEstado ${estadoClase}">${estadoTexto}</span></div>
    //     <div class="usuarioAccionesFila">
    //         <button class="btnVer" title="Ver"><i class="fa-regular fa-eye"></i></button>
    //         <button class="btnEditar" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
    //         <button class="btnEliminar" title="Eliminar"><i class="fa-regular fa-trash-can"></i></button>
    //     </div>
    //     `;

        fila.innerHTML = `
            <div><div class="usuarioFoto"></div></div>
            <div class="usuarioNombre">${usuario.nombre || "Sin nombre"}</div>
            <div class="usuarioCorreo">${usuario.correo || "Sin correo"}</div>
            <div class="usuarioRol">${usuario.rol || "Sin rol"}</div>
            <div><span class="usuarioEstado ${estadoClase}">${estadoTexto}</span></div>
            <div class="usuarioAccionesFila">
                <button class="btnVer" title="Ver"><i class="fa-regular fa-eye"></i></button>
                <button class="btnEditar" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
                <button class="btnEliminar" title="Eliminar"><i class="fa-regular fa-trash-can"></i></button>
            </div>
            `;

        const avatar = fila.querySelector(".usuarioFoto");
        ponerAvatar(avatar, usuario.nombre, usuario.foto_perfil);


      lista.appendChild(fila);
    });

    document.getElementById("totalUsuarios").textContent = data.length;
    document.getElementById("totalAdmins").textContent = admins;
    document.getElementById("totalTecnicos").textContent = tecnicos;
  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }
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


function activarBusqueda() {
  const input = document.getElementById("busquedaUsuarios");
  if (!input) return;

  input.addEventListener("input", () => {
    const texto = input.value.trim().toLowerCase();
    const filas = document.querySelectorAll(".usuarioFila");

    filas.forEach(fila => {
      const nombre = fila.dataset.nombre || "";
      const correo = fila.dataset.correo || "";
      const rol = fila.dataset.rol || "";

      const visible =
        nombre.includes(texto) ||
        correo.includes(texto) ||
        rol.includes(texto);

      fila.style.display = visible ? "grid" : "none";
    });
  });
}

function activarBotonNuevo() {
  const btn = document.getElementById("btnNuevoUsuario");
  const linkRegistrar = document.getElementById("linkRegistrarUsuarios");

  if (rol !== "admin") {
    if (btn) btn.style.display = "none";
    if (linkRegistrar) linkRegistrar.style.display = "none";
    return;
  }

  if (btn) {
    btn.addEventListener("click", () => {
      window.location.href = "register.html";
    });
  }
}

cargarUsuarioActual();
cargarUsuarios();
activarBusqueda();
activarBotonNuevo();