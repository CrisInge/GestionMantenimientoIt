// const API = "http://localhost:3000";
const API = "https://illustrious-enthusiasm-production-0827.up.railway.app";
const token = localStorage.getItem("token");
const id = localStorage.getItem("id");
const rol = localStorage.getItem("rol");

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

async function cargarPerfil() {
  try {
    const res = await fetch(`${API}/usuarios/${id}`);
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error al cargar perfil");
      return;
    }

    document.getElementById("nombre").value = data.nombre || "";
    document.getElementById("correo").value = data.correo || "";
    document.getElementById("direccion").value = data.direccion || "";
    document.getElementById("ciudad").value = data.ciudad || "";
    document.getElementById("estado").value = data.estado || "";
    document.getElementById("codigo_postal").value = data.codigo_postal || "";
    document.getElementById("pais").value = data.pais || "";

    document.getElementById("topbarNombre").textContent = data.nombre || "Usuario";
    document.getElementById("topbarCorreo").textContent = data.correo || "Sin correo";

    document.getElementById("rolUsuario").textContent = data.rol || "";
    document.getElementById("tipoAcceso").textContent =
      data.rol === "admin" ? "Administrador del sistema" : "Técnico operativo";

    // if (data.foto_perfil) {
    //   document.getElementById("avatarPreview").style.backgroundImage = `url('${data.foto_perfil}')`;
    //   document.getElementById("miniAvatarPreview").style.backgroundImage = `url('${data.foto_perfil}')`;
    //   localStorage.setItem("foto_perfil", data.foto_perfil);
    // }

    ponerAvatar(document.getElementById("avatarPreview"), data.nombre, data.foto_perfil);
    ponerAvatar(document.getElementById("miniAvatarPreview"), data.nombre, data.foto_perfil);

    if (data.foto_perfil && data.foto_perfil.trim() !== "") {
    localStorage.setItem("foto_perfil", data.foto_perfil);
    } else {
    localStorage.removeItem("foto_perfil");
    }


    localStorage.setItem("nombre", data.nombre || "");
    localStorage.setItem("correo", data.correo || "");
  } catch (error) {
    console.error("Error cargando perfil:", error);
  }
}

document.getElementById("formPerfil").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    nombre: document.getElementById("nombre").value,
    correo: document.getElementById("correo").value,
    direccion: document.getElementById("direccion").value,
    ciudad: document.getElementById("ciudad").value,
    estado: document.getElementById("estado").value,
    codigo_postal: document.getElementById("codigo_postal").value,
    pais: document.getElementById("pais").value,
    foto_perfil: localStorage.getItem("foto_perfil") || ""
  };

  try {
    const res = await fetch(`${API}/usuarios/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Error al actualizar perfil");
      return;
    }

    alert(data.message || "Perfil actualizado");
    cargarPerfil();
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    alert("Error al actualizar el perfil");
  }
});

document.getElementById("formPassword").addEventListener("submit", async (e) => {
  e.preventDefault();

  const password_actual = document.getElementById("password_actual").value.trim();
  const password_nueva = document.getElementById("password_nueva").value.trim();
  const password_confirmar = document.getElementById("password_confirmar").value.trim();

  if (!password_actual || !password_nueva || !password_confirmar) {
    alert("Completa todos los campos de contraseña");
    return;
  }

  if (password_nueva.length < 6) {
    alert("La nueva contraseña debe tener al menos 6 caracteres");
    return;
  }

  if (password_nueva !== password_confirmar) {
    alert("La confirmación de contraseña no coincide");
    return;
  }

  try {
    const res = await fetch(`${API}/usuarios/${id}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password_actual,
        password_nueva
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "No se pudo cambiar la contraseña");
      return;
    }

    alert(data.message || "Contraseña actualizada");
    document.getElementById("formPassword").reset();
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    alert("Error al cambiar la contraseña");
  }
});

// document.getElementById("fotoPerfil").addEventListener("change", function (e) {
//   const file = e.target.files[0];
//   if (!file) return;

//   // límite: 2 MB
//   if (file.size > 2 * 1024 * 1024) {
//     alert("La imagen es demasiado grande. Selecciona una menor a 2 MB.");
//     e.target.value = "";
//     return;
//   }

//   document.getElementById("photoFileName").textContent = file.name;

//   const reader = new FileReader();
//   reader.onload = function (event) {
//     const base64 = event.target.result;

//     document.getElementById("avatarPreview").style.backgroundImage = `url('${base64}')`;
//     document.getElementById("miniAvatarPreview").style.backgroundImage = `url('${base64}')`;

//     localStorage.setItem("foto_perfil", base64);
//   };

//   reader.readAsDataURL(file);
// });
document.getElementById("fotoPerfil").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("La imagen es demasiado grande. Selecciona una menor a 2 MB.");
    e.target.value = "";
    return;
  }

  document.getElementById("photoFileName").textContent = file.name;

  const reader = new FileReader();
  reader.onload = function (event) {
    const base64 = event.target.result;
    const nombreActual = document.getElementById("nombre").value || "U";

    ponerAvatar(document.getElementById("avatarPreview"), nombreActual, base64);
    ponerAvatar(document.getElementById("miniAvatarPreview"), nombreActual, base64);

    localStorage.setItem("foto_perfil", base64);
  };

  reader.readAsDataURL(file);
});


function guardarPreferencias() {
  const prefs = {
    notif_email: document.getElementById("notif_email").checked,
    notif_sistema: document.getElementById("notif_sistema").checked,
    notif_mantenimiento: document.getElementById("notif_mantenimiento").checked
  };

  localStorage.setItem("preferencias_usuario", JSON.stringify(prefs));
  alert("Preferencias guardadas");
}

function cargarPreferencias() {
  const prefs = JSON.parse(localStorage.getItem("preferencias_usuario") || "{}");
  document.getElementById("notif_email").checked = !!prefs.notif_email;
  document.getElementById("notif_sistema").checked = !!prefs.notif_sistema;
  document.getElementById("notif_mantenimiento").checked = !!prefs.notif_mantenimiento;
}

function inicializarMenuLateral() {
  const cards = document.querySelectorAll(".menu-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      document.querySelectorAll(".section-content").forEach(section => {
        section.classList.remove("active");
      });

      const target = card.dataset.section;
      document.getElementById(`section-${target}`).classList.add("active");
    });
  });
}

function ajustarMenuPorRol() {
  if (rol === "tecnico") {
    const historial = document.getElementById("linkMantenimientos");
    if (historial) historial.style.display = "none";

    const registrarUsuarios = document.getElementById("linkRegistrarUsuarios");
    if (registrarUsuarios) registrarUsuarios.style.display = "none";

    const usuarios = document.getElementById("linkUsuarios");
    if (usuarios) usuarios.style.display = "none";
  }
}

cargarPerfil();
cargarPreferencias();
inicializarMenuLateral();
ajustarMenuPorRol();