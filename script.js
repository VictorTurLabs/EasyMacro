let alimentoSeleccionado = null;
let alimentoEditandoIndex = null;
let alimentoRecetaSeleccionado = null;

let totalKcal = 0;
let totalProteina = 0;
let totalCarbs = 0;
let totalGrasas = 0;
let totalAgua = Number(localStorage.getItem("totalAgua")) || 0;

let comidasDelDia = JSON.parse(localStorage.getItem("comidasDelDia")) || [];
let recetas = JSON.parse(localStorage.getItem("recetas")) || [];
let ingredientesReceta = [];

const alimentosBase = [
  { nombre: "Pechuga de pollo", tipoMedida: "gramos", unidad: "g", unidadPlural: "g", kcal: 165, proteina: 31, carbs: 0, grasas: 4 },
  { nombre: "Arroz blanco cocido", tipoMedida: "gramos", unidad: "g", unidadPlural: "g", kcal: 130, proteina: 2.7, carbs: 28, grasas: 0.3 },
  { nombre: "Plátano", tipoMedida: "unidad", unidad: "plátano", unidadPlural: "plátanos", kcal: 89, proteina: 1.1, carbs: 23, grasas: 0.3 }
];

const alimentosGuardados = JSON.parse(localStorage.getItem("alimentos"));
let alimentos = Array.isArray(alimentosGuardados) && alimentosGuardados.length > 0
  ? alimentosGuardados
  : alimentosBase;

const fechaTexto = document.querySelector(".date");

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
const recipeView = document.querySelector(".recipe-view");

const crearNuevaComida = document.querySelector(".create-food-button");
const guardarAlimento = document.querySelector(".save-new-food-button");
const crearReceta = document.querySelector(".create-recipe-button");

const nuevoNombre = document.querySelector(".new-food-name");
const foodUnitType = document.querySelector(".food-unit-type");
const unitNameContainer = document.querySelector(".unit-name-container");
const unitNameInput = document.querySelector(".unit-name");
const unitNamePluralInput = document.querySelector(".unit-name-plural");

const nuevasKcal = document.querySelector(".new-food-kcal");
const nuevaProteina = document.querySelector(".new-food-protein");
const nuevosCarbs = document.querySelector(".new-food-carbs");
const nuevasGrasas = document.querySelector(".new-food-fat");

const kcalLabel = document.querySelector(".kcal-label");
const proteinLabel = document.querySelector(".protein-label");
const carbsLabel = document.querySelector(".carbs-label");
const fatLabel = document.querySelector(".fat-label");

const listaAlimentos = document.querySelector(".food-list");
const tituloModal = document.querySelector(".modal-title");

const buscador = document.querySelector(".food-search");
const cantidadInput = document.querySelector(".food-amount");
const cantidadLabel = document.querySelector(".food-amount-label");
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
const resetWaterButton = document.querySelector(".reset-water-button");

const recipeName = document.querySelector(".recipe-name");
const recipeFoodSearch = document.querySelector(".recipe-food-search");
const recipeFoodList = document.querySelector(".recipe-food-list");
const recipeAmountInput = document.querySelector(".recipe-food-amount");
const recipeAmountLabel = document.querySelector(".recipe-food-amount-label");
const addIngredientButton = document.querySelector(".add-ingredient-button");
const recipeIngredientsList = document.querySelector(".recipe-ingredients-list");
const saveRecipeButton = document.querySelector(".save-recipe-button");

function actualizarFecha() {
  const fechaHoy = new Date();

  fechaTexto.textContent = "Hoy · " + fechaHoy.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long"
  });
}

function guardarComidas() {
  localStorage.setItem("comidasDelDia", JSON.stringify(comidasDelDia));
}

function guardarAlimentos() {
  localStorage.setItem("alimentos", JSON.stringify(alimentos));
}

function guardarRecetas() {
  localStorage.setItem("recetas", JSON.stringify(recetas));
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

function calcularMacros(alimento, cantidad) {
  let multiplicador;

  if (alimento.tipoMedida === "unidad") {
    multiplicador = cantidad;
  } else {
    multiplicador = cantidad / 100;
  }

  return {
    kcal: alimento.kcal * multiplicador,
    proteina: alimento.proteina * multiplicador,
    carbs: alimento.carbs * multiplicador,
    grasas: alimento.grasas * multiplicador
  };
}

function textoCantidad(item) {
  if (item.tipoMedida === "unidad") {
    const cantidad = item.cantidad || item.gramos;
    const unidad = cantidad === 1 ? item.unidad : item.unidadPlural;

    return `${cantidad} ${unidad}`;
  }

  return `${item.cantidad || item.gramos} g`;
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
  alimentoEditandoIndex = null;
  botonAñadirAlimento.classList.add("hidden");

  if (cantidadLabel) {
    cantidadLabel.textContent = "Cantidad en gramos";
  }

  cantidadInput.placeholder = "Ej: 100";

  nuevoNombre.value = "";
  nuevasKcal.value = "";
  nuevaProteina.value = "";
  nuevosCarbs.value = "";
  nuevasGrasas.value = "";

  foodUnitType.value = "gramos";
  unitNameInput.value = "";

  if (unitNamePluralInput) {
    unitNamePluralInput.value = "";
  }

  unitNameContainer.classList.add("hidden");

  kcalLabel.textContent = "Kcal por 100 g";
  proteinLabel.textContent = "Proteína por 100 g";
  carbsLabel.textContent = "Carbohidratos por 100 g";
  fatLabel.textContent = "Grasas por 100 g";

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
      <span>${comida.nombre} · ${textoCantidad(comida)}</span>
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

    let ingredientesHTML = "";

    if (alimento.tipo === "receta" && alimento.ingredientes) {
      ingredientesHTML = `
        <small class="recipe-ingredients-preview">
          ${alimento.ingredientes.map(function (ingrediente) {
            return `${ingrediente.nombre} · ${textoCantidad(ingrediente)}`;
          }).join("<br>")}
        </small>
      `;
    }

    nuevoElemento.innerHTML = `
  <div class="food-item-header">
    <div class="food-item-info">
      <strong>
        ${alimento.nombre}
        ${alimento.tipo === "receta" ? '<span class="recipe-badge">RECETA</span>' : ""}
      </strong>

      <span class="food-macros">
        🔥${alimento.kcal.toFixed(0)}
        · 🥩${alimento.proteina.toFixed(1)}
        · 🍚${alimento.carbs.toFixed(1)}
        · 🥑${alimento.grasas.toFixed(1)}
      </span>
    </div>

    <div class="food-menu">
      <button class="food-menu-button">⋮</button>

      <div class="food-menu-dropdown hidden">
        <button class="edit-food-button">✏️ Editar</button>
        <button class="delete-food-button">🗑️ Eliminar</button>
      </div>
    </div>
  </div>

  ${ingredientesHTML}
`;

    const botonMenu = nuevoElemento.querySelector(".food-menu-button");
    const menu = nuevoElemento.querySelector(".food-menu-dropdown");

    botonMenu.addEventListener("click", function (event) {
      event.stopPropagation();

      document.querySelectorAll(".food-menu-dropdown").forEach(function (drop) {
        if (drop !== menu) {
          drop.classList.add("hidden");
        }
      });

      menu.classList.toggle("hidden");
    });

    const botonEditar = nuevoElemento.querySelector(".edit-food-button");

    botonEditar.addEventListener("click", function (event) {
      event.stopPropagation();

      if (alimento.tipo === "receta") {
        alert("Editar recetas lo haremos en el siguiente paso.");
        return;
      }

      alimentoEditandoIndex = alimentos.indexOf(alimento);

      nuevoNombre.value = alimento.nombre;
      foodUnitType.value = alimento.tipoMedida || "gramos";
      unitNameInput.value = alimento.unidad || "";
      unitNamePluralInput.value = alimento.unidadPlural || "";

      nuevasKcal.value = alimento.kcal;
      nuevaProteina.value = alimento.proteina;
      nuevosCarbs.value = alimento.carbs;
      nuevasGrasas.value = alimento.grasas;

      searchView.classList.add("hidden");
      createView.classList.remove("hidden");

      if (recipeView) {
        recipeView.classList.add("hidden");
      }

      tituloModal.textContent = "Editar alimento";

      if (foodUnitType.value === "unidad") {
        unitNameContainer.classList.remove("hidden");

        kcalLabel.textContent = "Kcal por unidad";
        proteinLabel.textContent = "Proteína por unidad";
        carbsLabel.textContent = "Carbohidratos por unidad";
        fatLabel.textContent = "Grasas por unidad";
      } else {
        unitNameContainer.classList.add("hidden");

        kcalLabel.textContent = "Kcal por 100 g";
        proteinLabel.textContent = "Proteína por 100 g";
        carbsLabel.textContent = "Carbohidratos por 100 g";
        fatLabel.textContent = "Grasas por 100 g";
      }
    });

    const botonEliminar = nuevoElemento.querySelector(".delete-food-button");

    botonEliminar.addEventListener("click", function (event) {
      event.stopPropagation();

      const index = alimentos.indexOf(alimento);

      if (index !== -1) {
        alimentos.splice(index, 1);
        guardarAlimentos();

        alimentoSeleccionado = null;
        mostrarAlimentos(alimentos);
        comprobarFormularioAñadir();
      }
    });

    nuevoElemento.addEventListener("click", function () {
      document.querySelectorAll(".food-item").forEach(function (item) {
        item.classList.remove("selected");
      });

      nuevoElemento.classList.add("selected");
      alimentoSeleccionado = alimento;

      if (alimento.tipoMedida === "unidad") {
        if (cantidadLabel) cantidadLabel.textContent = `Cantidad (${alimento.unidadPlural})`;
        cantidadInput.placeholder = "Ej: 2";
      } else {
        if (cantidadLabel) cantidadLabel.textContent = "Cantidad en gramos";
        cantidadInput.placeholder = "Ej: 100";
      }

      comprobarFormularioAñadir();
    });

    listaAlimentos.appendChild(nuevoElemento);
  });
}

/* RECETAS */

function limpiarFormularioReceta() {
  ingredientesReceta = [];
  alimentoRecetaSeleccionado = null;

  if (recipeName) recipeName.value = "";
  if (recipeFoodSearch) recipeFoodSearch.value = "";
  if (recipeAmountInput) recipeAmountInput.value = "";

  if (addIngredientButton) addIngredientButton.classList.add("hidden");

  mostrarMensajeInicialReceta();
  dibujarIngredientesReceta();
}

function mostrarMensajeInicialReceta() {
  if (!recipeFoodList) return;

  recipeFoodList.innerHTML = `
    <div class="empty-state">
      Busca alimentos para añadirlos a la receta.
    </div>
  `;
}

function mostrarAlimentosReceta(lista = alimentos) {
  if (!recipeFoodList) return;

  recipeFoodList.innerHTML = "";

  if (lista.length === 0) {
    recipeFoodList.innerHTML = `
      <div class="empty-state">
        No hemos encontrado ese alimento.
      </div>
    `;
    return;
  }

  lista.forEach(function (alimento) {
    const elemento = document.createElement("div");
    elemento.classList.add("food-item");

    elemento.innerHTML = `
      <strong>${alimento.nombre}</strong>
      <span>
        ${alimento.tipoMedida === "unidad" ? "Por unidad" : "Por 100 g"}
        · ${alimento.kcal} kcal · ${alimento.proteina}P
      </span>
    `;

    elemento.addEventListener("click", function () {
      document.querySelectorAll(".recipe-food-list .food-item").forEach(function (item) {
        item.classList.remove("selected");
      });

      elemento.classList.add("selected");
      alimentoRecetaSeleccionado = alimento;

      if (alimento.tipoMedida === "unidad") {
        if (recipeAmountLabel) recipeAmountLabel.textContent = `Cantidad (${alimento.unidadPlural})`;
        if (recipeAmountInput) recipeAmountInput.placeholder = "Ej: 2";
      } else {
        if (recipeAmountLabel) recipeAmountLabel.textContent = "Cantidad en gramos";
        if (recipeAmountInput) recipeAmountInput.placeholder = "Ej: 100";
      }

      comprobarFormularioIngrediente();
    });

    recipeFoodList.appendChild(elemento);
  });
}

function comprobarFormularioIngrediente() {
  if (!addIngredientButton || !recipeAmountInput) return;

  const hayAlimento = alimentoRecetaSeleccionado !== null;
  const hayCantidad = recipeAmountInput.value !== "";

  if (hayAlimento && hayCantidad) {
    addIngredientButton.classList.remove("hidden");
  } else {
    addIngredientButton.classList.add("hidden");
  }
}

function dibujarIngredientesReceta() {
  if (!recipeIngredientsList) return;

  recipeIngredientsList.innerHTML = "";

  if (ingredientesReceta.length === 0) {
    recipeIngredientsList.innerHTML = `
      <div class="empty-state">
        Todavía no has añadido ingredientes.
      </div>
    `;
    return;
  }

  ingredientesReceta.forEach(function (ingrediente, index) {
    const entrada = document.createElement("div");
    entrada.classList.add("meal-entry");

    entrada.innerHTML = `
      <span>${ingrediente.nombre} · ${textoCantidad(ingrediente)}</span>
      <button class="delete-meal-button">🗑️</button>
    `;

    entrada.querySelector(".delete-meal-button").addEventListener("click", function () {
      ingredientesReceta.splice(index, 1);
      dibujarIngredientesReceta();
    });

    recipeIngredientsList.appendChild(entrada);
  });
}

boton.addEventListener("click", function () {
  searchView.classList.remove("hidden");
  createView.classList.add("hidden");

  if (recipeView) {
    recipeView.classList.add("hidden");
  }

  tituloModal.textContent = "Añadir comida";
  modal.classList.remove("hidden");
});

cerrar.addEventListener("click", function () {
  modal.classList.add("hidden");
});

crearNuevaComida.addEventListener("click", function () {
  searchView.classList.add("hidden");
  createView.classList.remove("hidden");

  if (recipeView) {
    recipeView.classList.add("hidden");
  }

  alimentoEditandoIndex = null;
  tituloModal.textContent = "Crear alimento";
});

if (crearReceta) {
  crearReceta.addEventListener("click", function () {
    searchView.classList.add("hidden");
    createView.classList.add("hidden");
    recipeView.classList.remove("hidden");

    tituloModal.textContent = "Crear receta";
    limpiarFormularioReceta();
  });
}

guardarAlimento.addEventListener("click", function () {
  const alimento = {
    nombre: nuevoNombre.value,
    tipoMedida: foodUnitType.value,
    unidad: unitNameInput.value || "unidad",
    unidadPlural: unitNamePluralInput.value || "unidades",
    kcal: Number(nuevasKcal.value),
    proteina: Number(nuevaProteina.value),
    carbs: Number(nuevosCarbs.value),
    grasas: Number(nuevasGrasas.value)
  };

  if (alimentoEditandoIndex !== null) {
    alimentos[alimentoEditandoIndex] = alimento;
    alimentoEditandoIndex = null;
  } else {
    alimentos.push(alimento);
  }

  guardarAlimentos();

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
  const macros = calcularMacros(alimentoSeleccionado, cantidad);

  const comida = {
    nombre: alimentoSeleccionado.nombre,
    gramos: cantidad,
    momento: selectorComida.value,
    tipoMedida: alimentoSeleccionado.tipoMedida || "gramos",
    unidad: alimentoSeleccionado.unidad || "g",
    unidadPlural: alimentoSeleccionado.unidadPlural || "g",
    kcal: macros.kcal,
    proteina: macros.proteina,
    carbs: macros.carbs,
    grasas: macros.grasas
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

resetWaterButton.addEventListener("click", function () {
  totalAgua = 0;

  localStorage.setItem("totalAgua", totalAgua);
  actualizarAgua();
});

foodUnitType.addEventListener("change", function () {
  if (foodUnitType.value === "unidad") {
    unitNameContainer.classList.remove("hidden");

    kcalLabel.textContent = "Kcal por unidad";
    proteinLabel.textContent = "Proteína por unidad";
    carbsLabel.textContent = "Carbohidratos por unidad";
    fatLabel.textContent = "Grasas por unidad";
  } else {
    unitNameContainer.classList.add("hidden");

    kcalLabel.textContent = "Kcal por 100 g";
    proteinLabel.textContent = "Proteína por 100 g";
    carbsLabel.textContent = "Carbohidratos por 100 g";
    fatLabel.textContent = "Grasas por 100 g";
  }
});

if (recipeFoodSearch) {
  recipeFoodSearch.addEventListener("input", function () {
    const texto = recipeFoodSearch.value.toLowerCase();

    alimentoRecetaSeleccionado = null;

    if (addIngredientButton) {
      addIngredientButton.classList.add("hidden");
    }

    if (texto === "") {
      mostrarMensajeInicialReceta();
      return;
    }

    const alimentosFiltrados = alimentos.filter(function (alimento) {
      return alimento.nombre.toLowerCase().includes(texto);
    });

    mostrarAlimentosReceta(alimentosFiltrados);
  });
}

if (recipeAmountInput) {
  recipeAmountInput.addEventListener("input", function () {
    comprobarFormularioIngrediente();
  });
}

if (addIngredientButton) {
  addIngredientButton.addEventListener("click", function () {
    if (alimentoRecetaSeleccionado === null) return;

    const cantidad = Number(recipeAmountInput.value);
    const macros = calcularMacros(alimentoRecetaSeleccionado, cantidad);

    const ingrediente = {
      nombre: alimentoRecetaSeleccionado.nombre,
      cantidad: cantidad,
      tipoMedida: alimentoRecetaSeleccionado.tipoMedida || "gramos",
      unidad: alimentoRecetaSeleccionado.unidad || "g",
      unidadPlural: alimentoRecetaSeleccionado.unidadPlural || "g",
      kcal: macros.kcal,
      proteina: macros.proteina,
      carbs: macros.carbs,
      grasas: macros.grasas
    };

    ingredientesReceta.push(ingrediente);

    recipeFoodSearch.value = "";
    recipeAmountInput.value = "";
    alimentoRecetaSeleccionado = null;
    addIngredientButton.classList.add("hidden");

    mostrarMensajeInicialReceta();
    dibujarIngredientesReceta();
  });
}

if (saveRecipeButton) {
  saveRecipeButton.addEventListener("click", function () {
    if (recipeName.value === "" || ingredientesReceta.length === 0) return;

    let totalRecetaKcal = 0;
    let totalRecetaProteina = 0;
    let totalRecetaCarbs = 0;
    let totalRecetaGrasas = 0;

    ingredientesReceta.forEach(function (ingrediente) {
      totalRecetaKcal += ingrediente.kcal;
      totalRecetaProteina += ingrediente.proteina;
      totalRecetaCarbs += ingrediente.carbs;
      totalRecetaGrasas += ingrediente.grasas;
    });

    const recetaComoAlimento = {
      nombre: recipeName.value,
      tipo: "receta",
      tipoMedida: "unidad",
      unidad: "ración",
      unidadPlural: "raciones",
      kcal: totalRecetaKcal,
      proteina: totalRecetaProteina,
      carbs: totalRecetaCarbs,
      grasas: totalRecetaGrasas,
      ingredientes: ingredientesReceta
    };

    alimentos.push(recetaComoAlimento);
    guardarAlimentos();

    recipeView.classList.add("hidden");
    searchView.classList.remove("hidden");
    tituloModal.textContent = "Añadir comida";

    limpiarFormularioReceta();
  });
}

mostrarMensajeInicial();
dibujarComidas();

comidasDelDia.forEach(function (comida) {
  totalKcal += comida.kcal;
  totalProteina += comida.proteina;
  totalCarbs += comida.carbs;
  totalGrasas += comida.grasas;
});

actualizarFecha();
actualizarResumen();
actualizarAgua();
