let cliente = {
  mesa: "",
  hora: "",
  pedido: [],
};

const categorias = {
  1: "Comida",
  2: "Bebida",
  3: "Postre",
};

const btnGuardarCliente = document.querySelector("#guardar-cliente");
btnGuardarCliente.addEventListener("click", guardarCliente);

function guardarCliente() {
  const mesa = document.querySelector("#mesa").value;
  const hora = document.querySelector("#hora").value;

  // Revisar que los campos no esten vacios
  const camposVacios = [mesa, hora].some((campo) => campo === "");

  if (camposVacios) {
    const existeAlerta = document.querySelector(".invalid-feedback");

    if (!existeAlerta) {
      const alerta = document.createElement("DIV");
      alerta.classList.add("invalid-feedback", "d-block", "text-center");
      alerta.textContent = "Todos los campos son obligatorios";

      document.querySelector(".modal-body form").appendChild(alerta);

      setTimeout(() => {
        alerta.remove();
      }, 3000);
    }

    return;
  }

  // Se coloca ...cliente al inicio para que no se sobreescriba el objeto y elimine los pedidos
  cliente = { ...cliente, mesa, hora };

  const modalFormulario = document.querySelector("#formulario");
  const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
  modalBootstrap.hide();

  mostrarSecciones();

  obtenerPlatillos();
}

function mostrarSecciones() {
  const seccionesOcultas = document.querySelectorAll(".d-none");
  seccionesOcultas.forEach((seccion) => seccion.classList.remove("d-none"));
}

function obtenerPlatillos() {
  const url = "http://localhost:4000/platillos";

  fetch(url)
    .then((respuesta) => respuesta.json())
    .then((resultado) => mostrarPlatillos(resultado))
    .catch((error) => console.log(error));
}

function mostrarPlatillos(platillos) {
  const contenido = document.querySelector("#platillos .contenido");

  platillos.forEach((platillo) => {
    const row = document.createElement("DIV");
    row.classList.add("row", "py-3", "border-top");

    const nombre = document.createElement("DIV");
    nombre.classList.add("col-md-4");
    nombre.textContent = platillo.nombre;

    const precio = document.createElement("DIV");
    precio.classList.add("col-md-3", "fw-bold");
    precio.textContent = `$${platillo.precio}`;

    const categoria = document.createElement("DIV");
    categoria.classList.add("col-md-3");
    categoria.textContent = categorias[platillo.categoria];

    const inputCantidad = document.createElement("INPUT");
    inputCantidad.type = "number";
    inputCantidad.classList.add("form-control");
    inputCantidad.min = 0;
    inputCantidad.value = 0;
    inputCantidad.id = `platillo-${platillo.id}`;
    inputCantidad.onchange = function () {
      const cantidad = parseInt(inputCantidad.value);

      // Crea un objeto nuevo para juntar el platillo con la cantidad y que no queden en niveles diferentes
      agregarPlatillo({ ...platillo, cantidad }); // Crea un nuevo objeto y agregale a ese objeto la cantidad
    };

    const agregar = document.createElement("DIV");
    agregar.classList.add("col-md-2");
    agregar.appendChild(inputCantidad);

    row.appendChild(nombre);
    row.appendChild(precio);
    row.appendChild(categoria);
    row.appendChild(agregar);

    contenido.appendChild(row);
  });
}

function agregarPlatillo(producto) {
  let { pedido } = cliente;

  if (producto.cantidad > 0) {
    // En lugar de agregar dos veces el mismo platillo, se actualiza la cantidad
    if (pedido.some((platillo) => platillo.id === producto.id)) {
      const pedidoActualizado = pedido.map((platillo) => {
        if (platillo.id === producto.id) {
          platillo.cantidad = producto.cantidad;
        }

        return platillo;
      });

      cliente.pedido = [...pedidoActualizado];
    } else {
      cliente.pedido = [...pedido, producto];
    }
  } else {
    // Crear un array que contenga todos los platillos menos el que tiene cantidad 0
    eliminarPlatillo(producto.id);
  }

  limpiarHTML();

  // Se usa cliente.pedido en lugar de pedido porque el primero nos muestra la ultima version del array
  if (cliente.pedido.length) {
    actualizarResumen();
  } else {
    mensajePedidoVacio();
  }
}

function actualizarResumen() {
  const contenido = document.querySelector("#resumen .contenido");

  const resumen = document.createElement("DIV");
  resumen.classList.add("col-md-6", "card", "py-2", "px-3", "shadow");

  const mesa = document.createElement("P");
  mesa.textContent = "Mesa: ";
  mesa.classList.add("fw-bold");

  const mesaSpan = document.createElement("SPAN");
  mesaSpan.textContent = cliente.mesa;
  mesaSpan.classList.add("fw-normal");

  const hora = document.createElement("P");
  hora.textContent = "Hora: ";
  hora.classList.add("fw-bold");

  const horaSpan = document.createElement("SPAN");
  horaSpan.textContent = cliente.hora;
  horaSpan.classList.add("fw-normal");

  const heading = document.createElement("H3");
  heading.textContent = "Platillos consumidos";
  heading.classList.add("my-4", "text-center");

  const grupo = document.createElement("UL");
  grupo.classList.add("list-group");

  const { pedido } = cliente;
  pedido.forEach((platillo) => {
    const { nombre, precio, cantidad, id } = platillo;

    const lista = document.createElement("LI");
    lista.classList.add("list-group-item");

    const nombreEL = document.createElement("H3");
    nombreEL.classList.add("my-4");
    nombreEL.textContent = nombre;

    const cantidadEL = document.createElement("P");
    cantidadEL.classList.add("fw-bold");
    cantidadEL.textContent = "Cantidad: ";

    const cantidadValor = document.createElement("SPAN");
    cantidadValor.classList.add("fw-normal");
    cantidadValor.textContent = cantidad;

    const precioEL = document.createElement("P");
    precioEL.classList.add("fw-bold");
    precioEL.textContent = "Precio: ";

    const precioValor = document.createElement("SPAN");
    precioValor.classList.add("fw-normal");
    precioValor.textContent = `$${precio}`;

    const subtotalEL = document.createElement("P");
    subtotalEL.classList.add("fw-bold");
    subtotalEL.textContent = "Subtotal: ";

    const subtotalValor = document.createElement("SPAN");
    subtotalValor.classList.add("fw-normal");
    subtotalValor.textContent = calcularSubtotal(precio, cantidad);

    const btnEliminar = document.createElement("BUTTON");
    btnEliminar.classList.add("btn", "btn-danger");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = function () {
      eliminarPlatillo(id);
    };

    cantidadEL.appendChild(cantidadValor);
    precioEL.appendChild(precioValor);
    subtotalEL.appendChild(subtotalValor);

    lista.appendChild(nombreEL);
    lista.appendChild(cantidadEL);
    lista.appendChild(precioEL);
    lista.appendChild(subtotalEL);
    lista.appendChild(btnEliminar);

    grupo.appendChild(lista);
  });

  mesa.appendChild(mesaSpan);
  hora.appendChild(horaSpan);

  resumen.appendChild(heading);
  resumen.appendChild(mesa);
  resumen.appendChild(hora);
  resumen.appendChild(grupo);

  contenido.appendChild(resumen);

  formularioPropinas();
}

function limpiarHTML() {
  const contenido = document.querySelector("#resumen .contenido");

  while (contenido.firstChild) {
    contenido.removeChild(contenido.firstChild);
  }
}

function calcularSubtotal(precio, cantidad) {
  return `$${precio * cantidad}`;
}

function eliminarPlatillo(id) {
  const { pedido } = cliente;
  const resultado = pedido.filter((platillo) => platillo.id !== id);
  cliente.pedido = [...resultado];

  document.querySelector(`#platillo-${id}`).value = 0;

  limpiarHTML();

  if (cliente.pedido.length) {
    actualizarResumen();
  } else {
    mensajePedidoVacio();
  }
}

function mensajePedidoVacio() {
  const contenido = document.querySelector("#resumen .contenido");

  const texto = document.createElement("P");
  texto.classList.add("text-center");
  texto.textContent = "Añado los elementos del pedido";

  contenido.appendChild(texto);
}

function formularioPropinas() {
  const contenido = document.querySelector("#resumen .contenido");

  const formulario = document.createElement("DIV");
  formulario.classList.add("col-md-6", "formulario");

  const divFormulario = document.createElement("DIV");
  divFormulario.classList.add("py-2", "px-3", "card", "shadow");

  const heading = document.createElement("H3");
  heading.classList.add("my-4", "text-center");
  heading.textContent = "Propinas";

  const radio10 = document.createElement("INPUT");
  radio10.type = "radio";
  radio10.name = "propina";
  radio10.value = "10";
  radio10.classList.add("form-check-input");
  radio10.onclick = calcularPropina;

  const radio10Label = document.createElement("LABEL");
  radio10Label.classList.add("form-check-label");
  radio10Label.textContent = "10%";

  const radio10Div = document.createElement("DIV");
  radio10Div.classList.add("form-check");

  const radio25 = document.createElement("INPUT");
  radio25.type = "radio";
  radio25.name = "propina"; // Tener el mismo name que otro radiobutton los hace mutuamente excluyentes
  radio25.value = "25";
  radio25.classList.add("form-check-input");
  radio25.onclick = calcularPropina;

  const radio25Label = document.createElement("LABEL");
  radio25Label.classList.add("form-check-label");
  radio25Label.textContent = "25%";

  const radio25Div = document.createElement("DIV");
  radio25Div.classList.add("form-check");

  const radio50 = document.createElement("INPUT");
  radio50.type = "radio";
  radio50.name = "propina"; // Tener el mismo name que otro radiobutton los hace mutuamente excluyentes
  radio50.value = "50";
  radio50.classList.add("form-check-input");
  radio50.onclick = calcularPropina;

  const radio50Label = document.createElement("LABEL");
  radio50Label.classList.add("form-check-label");
  radio50Label.textContent = "50%";

  const radio50Div = document.createElement("DIV");
  radio50Div.classList.add("form-check");

  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10Label);

  radio25Div.appendChild(radio25);
  radio25Div.appendChild(radio25Label);

  radio50Div.appendChild(radio50);
  radio50Div.appendChild(radio50Label);

  divFormulario.appendChild(heading);
  divFormulario.appendChild(radio10Div);
  divFormulario.appendChild(radio25Div);
  divFormulario.appendChild(radio50Div);

  formulario.appendChild(divFormulario);

  contenido.appendChild(formulario);
}

function calcularPropina() {
  const { pedido } = cliente;
  let subtotal = 0;

  pedido.forEach((platillo) => {
    subtotal += platillo.precio * platillo.cantidad;
  });

  const propinaSeleccionada = document.querySelector(
    '[name="propina"]:checked'
  ).value;

  const propina = (subtotal * parseInt(propinaSeleccionada)) / 100;

  const total = subtotal + propina;

  mostrarTotalHTML(subtotal, propina, total);
}

function mostrarTotalHTML(subtotal, propina, total) {
  const divTotales = document.createElement("DIV");
  divTotales.classList.add("total-pagar", "my-5");

  // Div que sea hijo de un elemento con la clase formulario
  const formulario = document.querySelector(".formulario > div");

  const subtotalParrafo = document.createElement("P");
  subtotalParrafo.classList.add("fs-4", "fw-bold", "mt-2");
  subtotalParrafo.textContent = "Subtotal: ";

  const subtotalSpan = document.createElement("SPAN");
  subtotalSpan.classList.add("fw-normal");
  subtotalSpan.textContent = `$${subtotal}`;

  const propinaParrafo = document.createElement("P");
  propinaParrafo.classList.add("fs-4", "fw-bold", "mt-2");
  propinaParrafo.textContent = "Propina: ";

  const propinaSpan = document.createElement("SPAN");
  propinaSpan.classList.add("fw-normal");
  propinaSpan.textContent = `$${propina}`;

  const totalParrafo = document.createElement("P");
  totalParrafo.classList.add("fs-4", "fw-bold", "mt-2");
  totalParrafo.textContent = "Total: ";

  const totalSpan = document.createElement("SPAN");
  totalSpan.classList.add("fw-normal");
  totalSpan.textContent = `$${total}`;

  subtotalParrafo.appendChild(subtotalSpan);
  propinaParrafo.appendChild(propinaSpan);
  totalParrafo.appendChild(totalSpan);

  const totalPagarDiv = document.querySelector(".total-pagar");

  if (totalPagarDiv) {
    totalPagarDiv.remove();
  }

  divTotales.appendChild(subtotalParrafo);
  divTotales.appendChild(propinaParrafo);
  divTotales.appendChild(totalParrafo);

  formulario.appendChild(divTotales);
}
