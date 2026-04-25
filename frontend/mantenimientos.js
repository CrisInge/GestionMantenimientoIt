// const API = "http://localhost:3000";
const API = "https://illustrious-enthusiasm-production-0827.up.railway.app";
const token = localStorage.getItem("token");

// proteger
if (!token) {
  window.location.href = "login.html";
}

// =======================
// CARGAR TODOS
// =======================
async function cargarTodos() {

  const res = await fetch(`${API}/mantenimientos`);
  const data = await res.json();

  const lista = document.getElementById("listaMantenimientos");
  lista.innerHTML = "";

  data.forEach(m => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div class="item">
        <span>Service Tag: ${m.service_tag}</span>
        <span>Tipo: ${m.tipo}</span>
        <span>Estado: ${m.estado}</span>
        <span>Técnico: ${m.tecnico || "Sin asignar"}</span>
        <span>Inicio: ${m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleString() : ""}</span>
        <span>Fin: ${m.fecha_fin ? new Date(m.fecha_fin).toLocaleString() : "En proceso"}</span>
        <span>
        ${m.solucion 
            ? "Solución: " + m.solucion 
            : (m.estado === "Finalizado" 
                ? "Solución: Mantenimiento finalizado" 
                : "Solución: Sin solución")
        }
        </span>
        
        
      </div>
    `;

    lista.appendChild(li);
  });
}

cargarTodos();