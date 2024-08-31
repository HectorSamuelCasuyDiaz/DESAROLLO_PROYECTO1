let carrito = [];

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    event.preventDefault();
    const productoId = event.dataTransfer.getData("text");
    const producto = document.getElementById(productoId);
    agregarAlCarrito(productoId, producto);
}

function agregarAlCarrito(productoId, producto) {
    const itemExistente = carrito.find(item => item.id === productoId);

    if (itemExistente) {
        itemExistente.cantidad += 1;
        itemExistente.total += parseFloat(producto.querySelector("p:last-child").innerText.replace('Precio: $', ''));
    } else {
        const nuevoItem = {
            id: productoId,
            nombre: producto.querySelector("p:nth-child(2)").innerText,
            precio: parseFloat(producto.querySelector("p:last-child").innerText.replace('Precio: $', '')),
            cantidad: 1,
            total: parseFloat(producto.querySelector("p:last-child").innerText.replace('Precio: $', ''))
        };
        carrito.push(nuevoItem);
    }

    actualizarCarrito();
}

function actualizarCarrito() {
    const cesta = document.getElementById("cesta");
    cesta.innerHTML = '';

    carrito.forEach(item => {
        const productoDiv = document.createElement("div");
        productoDiv.innerHTML = `
            <img src="${item.id}.jpg" alt="${item.nombre}">
            <p>${item.nombre}</p>
            <p>Cantidad: ${item.cantidad}</p>
            <p>Total: $${item.total.toFixed(2)}</p>
        `;
        cesta.appendChild(productoDiv);
    });

    const totalPrecio = carrito.reduce((acc, item) => acc + item.total, 0);
    document.getElementById("totalPrecio").innerText = totalPrecio.toFixed(2);
    document.getElementById("totalPrecioFinal").innerText = totalPrecio.toFixed(2);
}

function obtenerUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(mostrarUbicacion);
    } else {
        document.getElementById("pais").innerText = "La geolocalización no es soportada por este navegador.";
    }
}

function mostrarUbicacion(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
            const pais = data.address.country;
            document.getElementById("pais").innerText = `Tu país de compra: ${pais}`;
        })
        .catch(error => {
            console.error("Error al obtener la ubicación:", error);
            document.getElementById("pais").innerText = "Error al obtener la ubicación.";
        });
}

function modificarCompra() {
    // Verifica si el carrito no está vacío
    if (carrito.length === 0) {
        alert("El carrito está vacío. No hay nada que modificar.");
        return;
    }

    // Crear un formulario de modificación
    const resumenCarrito = document.getElementById("resumenCarrito");
    resumenCarrito.innerHTML = ''; // Limpiar el resumen actual

    carrito.forEach((item, index) => {
        // Crear un div contenedor para cada producto en el carrito
        const productoDiv = document.createElement("div");
        productoDiv.classList.add("producto-modificar");

        // Crear el contenido del producto con un input para la cantidad
        productoDiv.innerHTML = `
            <img src="${item.id}.jpg" alt="${item.nombre}">
            <p>${item.nombre}</p>
            <p>Precio unitario: $${item.precio.toFixed(2)}</p>
            <label for="cantidad-${index}">Cantidad: </label>
            <input type="number" id="cantidad-${index}" value="${item.cantidad}" min="1" onchange="actualizarCantidad(${index}, this.value)">
            <p>Total: $<span id="total-${index}">${item.total.toFixed(2)}</span></p>
            <button onclick="eliminarProducto(${index})">Eliminar</button>
        `;

        // Agregar el div al resumen del carrito
        resumenCarrito.appendChild(productoDiv);
    });

    actualizarTotalFinal();
}

function actualizarCantidad(index, nuevaCantidad) {
    nuevaCantidad = parseInt(nuevaCantidad);
    if (nuevaCantidad < 1) {
        nuevaCantidad = 1;
    }

    // Actualizar la cantidad y el total en el carrito
    carrito[index].cantidad = nuevaCantidad;
    carrito[index].total = carrito[index].precio * nuevaCantidad;

    // Actualizar el DOM con la nueva cantidad y total
    document.getElementById(`total-${index}`).innerText = carrito[index].total.toFixed(2);

    // Actualizar el total final
    actualizarTotalFinal();
}

function eliminarProducto(index) {
    // Eliminar el producto del carrito
    carrito.splice(index, 1);

    // Actualizar la vista del carrito
    modificarCompra();
}

function actualizarTotalFinal() {
    const totalPrecioFinal = carrito.reduce((acc, item) => acc + item.total, 0);
    document.getElementById("totalPrecioFinal").innerText = totalPrecioFinal.toFixed(2);
}

function finalizarCompra() {
    alert("Compra finalizada con éxito. ¡Gracias por tu compra!");
    carrito = [];
    actualizarCarrito();
}
