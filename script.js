let alimentoSeleccionado = null;

let totalKcal = 0;
let totalProteina = 0;
let totalCarbs = 0;
let totalGrasas = 0;

let totalAgua = Number(localStorage.getItem("totalAgua")) || 0;
let comidasDelDia = JSON.parse(localStorage.getItem("comidasDelDia")) || [];

let alimentos = [
  { nombre: "Pechuga de pollo", kcal: 165, proteina: 31, carbs: 0, grasas: 4 },
  { nombre: "Arroz blanco cocido", kcal: 130, proteina: 2.7, carbs: 28, grasas: 0.3 },
  { nombre: "Plátano", kcal: 89, proteina: 1.1, carbs: 23, grasas: 0.3 }
];

const totalKcalTexto = document.querySelector(".total-kcal");
const totalProteinaTexto = document.querySelector(".total-proteina");
const totalCarbsTexto = document.querySelector(".total-carbs");
const totalGrasasTexto = document.querySelector(".total-grasas");
const totalWaterTexto = document.querySelector(".total-water");

const boton = document.querySelector(".add-button");
const modal = document.querySelector(".modal");
const cerrar = document.querySelector(".close-button");

const searchView = document.querySelector(".search-view");
const createView = document.querySelector(".create-view");
const crearNuevaComida = document.querySelector(".create-food-button");
const guardarAlimento = document.querySelector(".save-new-food-button");

const nuevoNombre = document.querySelector(".new-food-name");
const nuevasKcal = document.querySelector(".new-food-kcal");
const nuevaProteina = document.querySelector(".new-food-protein");
const nuevosCarbs = document.querySelector(".new-food-carbs");
const nuevasGrasas = document.querySelector(".new-food-fat");

const listaAlimentos = document.querySelector(".food-list");
const tituloModal = document.querySelector(".modal-title");

const buscador = document.querySelector(".food-search");
const cantidadInput = document.querySelector(".food-amount");
const botonAñadirAlimento = document.querySelector(".add-food-button");
const selectorComida = document.querySelector(".meal-type");

const listaDesayuno = document.querySelector(".desayuno-list");
const listaComida = document.querySelector(".comida-list");
const listaMerienda = document.querySelector(".merienda-list");
const listaCena = document.querySelector(".cena-list");
const listaSnack = document.querySelector(".snack-list");

const mealsToggleButton = document.querySelector(".meals-toggle-button");
const mealsModal = document.querySelector(".meals-modal");
const closeMealsButton = document.querySelector(".close-meals-button");
const mealCount = document.querySelector(".meal-count");

const waterButton = document.querySelector(".water-button");
const waterFill = document.querySelector(".water-fill");

let temporizadorAgua;

function guardarComidas() {
  localStorage.setItem("comidasDelDia", JSON.stringify(comidasDelDia));
}

function actualizarResumen() {
  totalKcalTexto.textContent = `${totalKcal.toFixed(0)} / 2750 kcal`;
  totalProteinaTexto.textContent = `${totalProteina.toFixed(1)} / 180 g`;
  totalCarbsTexto.textContent = `${totalCarbs.toFixed(1)} / 330 g`;
  totalGrasasTexto.textContent = `${totalGrasas.toFixed(1)} / 75 g`;
}

function actualizarAgua() {
  totalWaterTexto.textContent = `${totalAgua} / 2.5 L`;

  const porcentajeAgua = (totalAgua / 2.5) * 100;
  waterFill.style.height = `${porcentajeAgua}%`;
}

function mostrarMensajeInicial() {
  listaAlimentos.innerHTML = `
    <div class="empty-state">
      Empieza a escribir para buscar un alimento.
    </div>
  `;
}

function comprobarFormularioAñadir() {
  const hayAlimento = alimentoSeleccionado !== null;
  const hayCantidad = cantidadInput.value !== "";

  if (hayAlimento && hayCantidad) {
    botonAñadirAlimento.classList.remove("hidden");
  } else {
    botonAñadirAlimento.classList.add("hidden");
  }
}

function limpiarFormularioAñadir() {
  buscador.value = "";
  cantidadInput.value = "";
  alimentoSeleccionado = null;
  botonAñadirAlimento.classList.add("hidden");
  mostrarMensajeInicial();
}

function dibujarComidas() {
  listaDesayuno.innerHTML = "";
  listaComida.innerHTML = "";
  listaMerienda.innerHTML = "";
  listaCena.innerHTML = "";
  listaSnack.innerHTML = "";

  comidasDelDia.forEach(function (comida, index) {
    const entrada = document.createElement("div");
    entrada.classList.add("meal-entry");

    entrada.innerHTML = `
      <span>${comida.nombre} · ${comida.gramos} g</span>
      <button class="delete-meal-button">🗑️</button>
    `;

    entrada.querySelector(".delete-meal-button").addEventListener("click", function () {
      totalKcal -= comida.kcal;
      totalProteina -= comida.proteina;
      totalCarbs -= comida.carbs;
      totalGrasas -= comida.grasas;

      comidasDelDia.splice(index, 1);
      guardarComidas();

      actualizarResumen();
      dibujarComidas();
    });

    if (comida.momento === "Desayuno") listaDesayuno.appendChild(entrada);
    if (comida.momento === "Comida") listaComida.appendChild(entrada);
    if (comida.momento === "Merienda") listaMerienda.appendChild(entrada);
    if (comida.momento === "Cena") listaCena.appendChild(entrada);
    if (comida.momento === "Snack") listaSnack.appendChild(entrada);
  });

  if (listaDesayuno.innerHTML === "") listaDesayuno.innerHTML = "No hay comidas añadidas.";
  if (listaComida.innerHTML === "") listaComida.innerHTML = "No hay comidas añadidas.";
  if (listaMerienda.innerHTML === "") listaMerienda.innerHTML = "No hay comidas añadidas.";
  if (listaCena.innerHTML === "") listaCena.innerHTML = "No hay comidas añadidas.";
  if (listaSnack.innerHTML === "") listaSnack.innerHTML = "No hay comidas añadidas.";

  mealCount.textContent = comidasDelDia.length;
}

function mostrarAlimentos(lista = alimentos) {
  listaAlimentos.innerHTML = "";

  if (lista.length === 0) {
    listaAlimentos.innerHTML = `
      <div class="empty-state">
        No hemos encontrado ese alimento.
        <br>
        Pulsa abajo para crearlo.
      </div>
    `;
    return;
  }

  lista.forEach(function (alimento) {
    const nuevoElemento = document.createElement("div");
    nuevoElemento.classList.add("food-item");

    nuevoElemento.innerHTML = `
      <strong>${alimento.nombre}</strong>
      <span>${alimento.kcal} kcal · ${alimento.proteina}P · ${alimento.carbs}C · ${alimento.grasas}G</span>
    `;

    nuevoElemento.addEventListener("click", function () {
      document.querySelectorAll(".food-item").forEach(function (item) {
        item.classList.remove("selected");
      });

      nuevoElemento.classList.add("selected");
      alimentoSeleccionado = alimento;
      comprobarFormularioAñadir();
    });

    listaAlimentos.appendChild(nuevoElemento);
  });
}

boton.addEventListener("click", function () {
  searchView.classList.remove("hidden");
  createView.classList.add("hidden");
  tituloModal.textContent = "Añadir comida";
  modal.classList.remove("hidden");
});

cerrar.addEventListener("click", function () {
  modal.classList.add("hidden");
});

crearNuevaComida.addEventListener("click", function () {
  searchView.classList.add("hidden");
  createView.classList.remove("hidden");
  tituloModal.textContent = "Crear alimento";
});

guardarAlimento.addEventListener("click", function () {
  const alimento = {
    nombre: nuevoNombre.value,
    kcal: Number(nuevasKcal.value),
    proteina: Number(nuevaProteina.value),
    carbs: Number(nuevosCarbs.value),
    grasas: Number(nuevasGrasas.value)
  };

  alimentos.push(alimento);

  nuevoNombre.value = "";
  nuevasKcal.value = "";
  nuevaProteina.value = "";
  nuevosCarbs.value = "";
  nuevasGrasas.value = "";

  createView.classList.add("hidden");
  searchView.classList.remove("hidden");
  tituloModal.textContent = "Añadir comida";

  limpiarFormularioAñadir();
});

buscador.addEventListener("input", function () {
  const texto = buscador.value.toLowerCase();

  alimentoSeleccionado = null;
  botonAñadirAlimento.classList.add("hidden");

  if (texto === "") {
    mostrarMensajeInicial();
    return;
  }

  const alimentosFiltrados = alimentos.filter(function (alimento) {
    return alimento.nombre.toLowerCase().includes(texto);
  });

  mostrarAlimentos(alimentosFiltrados);
});

cantidadInput.addEventListener("input", function () {
  comprobarFormularioAñadir();
});

botonAñadirAlimento.addEventListener("click", function () {
  if (alimentoSeleccionado === null) return;

  const cantidad = Number(cantidadInput.value);

  const comida = {
    nombre: alimentoSeleccionado.nombre,
    gramos: cantidad,
    momento: selectorComida.value,
    kcal: alimentoSeleccionado.kcal * cantidad / 100,
    proteina: alimentoSeleccionado.proteina * cantidad / 100,
    carbs: alimentoSeleccionado.carbs * cantidad / 100,
    grasas: alimentoSeleccionado.grasas * cantidad / 100
  };

  comidasDelDia.push(comida);
  guardarComidas();

  totalKcal += comida.kcal;
  totalProteina += comida.proteina;
  totalCarbs += comida.carbs;
  totalGrasas += comida.grasas;

  dibujarComidas();
  actualizarResumen();

  modal.classList.add("hidden");
  limpiarFormularioAñadir();
});

mealsToggleButton.addEventListener("click", function () {
  mealsModal.classList.remove("hidden");
});

closeMealsButton.addEventListener("click", function () {
  mealsModal.classList.add("hidden");
});

waterButton.addEventListener("click", function () {
  totalAgua += 0.25;

  if (totalAgua > 2.5) {
    totalAgua = 2.5;
  }

  localStorage.setItem("totalAgua", totalAgua);
  actualizarAgua();
});

waterButton.addEventListener("mousedown", function () {
  waterButton.classList.add("reset-warning");

  temporizadorAgua = setTimeout(function () {
    totalAgua = 0;
    localStorage.setItem("totalAgua", totalAgua);
    actualizarAgua();
    waterButton.classList.remove("reset-warning");
  }, 800);
});

waterButton.addEventListener("mouseup", function () {
  clearTimeout(temporizadorAgua);
  waterButton.classList.remove("reset-warning");
});

waterButton.addEventListener("mouseleave", function () {
  clearTimeout(temporizadorAgua);
  waterButton.classList.remove("reset-warning");
});

waterButton.addEventListener("touchstart", function () {
  waterButton.classList.add("reset-warning");

  temporizadorAgua = setTimeout(function () {
    totalAgua = 0;
    localStorage.setItem("totalAgua", totalAgua);
    actualizarAgua();
    waterButton.classList.remove("reset-warning");
  }, 800);
});

waterButton.addEventListener("touchend", function () {
  clearTimeout(temporizadorAgua);
  waterButton.classList.remove("reset-warning");
});

mostrarMensajeInicial();
dibujarComidas();

comidasDelDia.forEach(function (comida) {
  totalKcal += comida.kcal;
  totalProteina += comida.proteina;
  totalCarbs += comida.carbs;
  totalGrasas += comida.grasas;
});

actualizarResumen();
actualizarAgua();