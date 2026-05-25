// === CARRITO DE COMPRAS COMPLETO Y FUNCIONAL ===
class Carrito {
    constructor() {
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.contador = document.querySelector('.contador-carrito');
        this.listaCarrito = document.getElementById('listacarrito');
        this.totalItems = document.getElementById('totalItems');
        this.totalPrecio = document.getElementById('totalPrecio');
        this.iconoCarrito = document.querySelector('.icono_carrito');
        this.menucarrito = document.getElementById('menucarrito');
        this.body = document.body;
        
        this.init();
    }
    
    init() {
        this.render();
        this.bindEvents();
        this.updateCounter();
    }
    
    bindEvents() {
        // Abrir/cerrar carrito
        this.iconoCarrito.addEventListener('click', () => {
            this.body.classList.toggle('mostrarcarrito');
        });
        
        document.getElementById('cerrarCarrito').addEventListener('click', () => {
            this.body.classList.remove('mostrarcarrito');
        });
        
        // Vaciar carrito
        document.getElementById('btnVaciar').addEventListener('click', () => {
            if (confirm('¿Estás seguro de vaciar el carrito?')) {
                this.vaciarCarrito();
            }
        });
        
       // Continuar compra
document.getElementById('btnContinuar').addEventListener('click', () => {
    // SIEMPRE redirige (incluso vacío)
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
    window.location.href = 'registros.html';
});
        
        // Detectar clics en botones AGREGAR en TODAS las páginas
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-btn')) {
                e.preventDefault();
                this.agregarProducto(e.target.closest('.card'));
            }
        });
        
        // Detectar cambios en cantidades y eliminar
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('eliminar')) {
                const item = e.target.closest('.item-carrito');
                const nombre = item.dataset.nombre;
                this.eliminarProducto(nombre);
            }
            
            if (e.target.classList.contains('btn-mas')) {
                const item = e.target.closest('.item-carrito');
                const nombre = item.dataset.nombre;
                this.aumentarCantidad(nombre);
            }
            
            if (e.target.classList.contains('btn-menos')) {
                const item = e.target.closest('.item-carrito');
                const nombre = item.dataset.nombre;
                this.disminuirCantidad(nombre);
            }
        });
        
        // Cerrar con overlay
        document.addEventListener('click', (e) => {
            if (e.target === this.menucarrito) {
                this.body.classList.remove('mostrarcarrito');
            }
        });
    }
    
    // NUEVA FUNCIÓN AGREGADA: Enviar a WhatsApp automáticamente
    enviarOrdenWhatsApp() {
        const cliente = JSON.parse(localStorage.getItem("cliente"));
        const { totalItems, totalPrecio } = this.calcularTotales();
        
        if (!cliente) {
            alert('Por favor completa tu registro primero');
            return;
        }

        
        const mensaje = `🌸 *NUEVA ORDEN - Sweet Healthy* 🌸

👤 *Cliente:* ${cliente.nombre}
📧 *Email:* ${cliente.email}
📞 *Teléfono:* ${cliente.telefono}
🏠 *Dirección:* ${cliente.direccion}

🛒 *DETALLES DEL PEDIDO:*
${this.carrito.map(item => `• ${item.nombre} (x${item.cantidad}) - $${(item.precio * item.cantidad).toLocaleString()}`).join('\n')}

💰 *TOTAL: $${parseFloat(totalPrecio).toLocaleString()}*
📦 *Cantidad de productos:* ${totalItems}

¡Gracias por tu compra! 😊`;

        // CAMBIA ESTE NÚMERO POR EL TUYO (con código de país)
        const numeroWhatsApp = "524622711860"; 
        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        

    }
    
    agregarProducto(card) {
        const nombre = card.dataset.nombre || card.querySelector('.card-name').textContent;
        const precioTexto = card.dataset.precio || card.querySelector('.card-price').textContent;
        const precio = parseFloat(precioTexto.replace(/[$\s]/g, ''));
        const imagen = card.dataset.imagen || card.querySelector('img').src;
        
        const existe = this.carrito.find(item => item.nombre === nombre);
        
        if (existe) {
            existe.cantidad++;
        } else {
            this.carrito.push({
                nombre,
                precio,
                imagen,
                cantidad: 1
            });
        }
        
        this.guardarCarrito();
        this.render();
        this.mostrarNotificacion(`${nombre} agregado al carrito`);
        
        // Efecto visual en botón
        const btn = card.querySelector('.add-btn');
        btn.textContent = '✓ Agregado!';
        btn.style.background = '#2d9e6b';
        setTimeout(() => {
            btn.textContent = '+ Agregar';
            btn.style.background = 'var(--rosa-principal)';
        }, 1500);
    }
    
    eliminarProducto(nombre) {
        this.carrito = this.carrito.filter(item => item.nombre !== nombre);
        this.guardarCarrito();
        this.render();
    }
    
    aumentarCantidad(nombre) {
        const item = this.carrito.find(item => item.nombre === nombre);
        if (item) {
            item.cantidad++;
            this.guardarCarrito();
            this.render();
        }
    }
    
    disminuirCantidad(nombre) {
        const item = this.carrito.find(item => item.nombre === nombre);
        if (item && item.cantidad > 1) {
            item.cantidad--;
        } else if (item) {
            this.eliminarProducto(nombre);
        }
        this.guardarCarrito();
        this.render();
    }
    
    vaciarCarrito() {
        this.carrito = [];
        this.guardarCarrito();
        this.render();
    }
    
    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }
    
    calcularTotales() {
        const totalItems = this.carrito.reduce((sum, item) => sum + item.cantidad, 0);
        const totalPrecio = this.carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        
        return { totalItems, totalPrecio: totalPrecio.toFixed(2) };
    }
    
    render() {
        const { totalItems, totalPrecio } = this.calcularTotales();
        
        // Actualizar contadores
        this.contador.textContent = totalItems;
        this.totalItems.textContent = totalItems;
        this.totalPrecio.textContent = `$${parseFloat(totalPrecio).toLocaleString()}`;
        
        // Renderizar lista
        if (this.carrito.length === 0) {
            this.listaCarrito.innerHTML = `
                <div class="carrito-vacio">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🛒</div>
                    <h3>Tu carrito está vacío</h3>
                    <p>¡Empieza a agregar tus productos favoritos!</p>
                </div>
            `;
        } else {
            this.listaCarrito.innerHTML = this.carrito.map(item => `
                <div class="item-carrito" data-nombre="${item.nombre}">
                    <img src="${item.imagen}" alt="${item.nombre}" width="60">
                    <div class="info">
                        <div class="nombre">${item.nombre}</div>
                        <div class="precio">$${item.precio.toFixed(2)}</div>
                    </div>
                    <div class="controles">
                        <div class="cantidad">
                            <button class="btn-cantidad btn-menos">-</button>
                            <span class="cantidad-numero">${item.cantidad}</span>
                            <button class="btn-cantidad btn-mas">+</button>
                        </div>
                        <button class="eliminar">✕</button>
                    </div>
                </div>
            `).join('');
        }
    }
    
    updateCounter() {
        const totalItems = this.calcularTotales().totalItems;
        this.contador.textContent = totalItems;
        this.contador.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    mostrarNotificacion(mensaje) {
        // Notificación toast
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #2d9e6b, #4ecdc4);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(45,158,107,0.4);
            z-index: 3000;
            font-weight: 600;
            transform: translateX(400px);
            transition: all 0.4s ease;
        `;
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notificacion.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 400);
        }, 3000);
    }
}

// Inicializar carrito cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.carrito = new Carrito();
});

// Cerrar carrito con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.body.classList.remove('mostrarcarrito');
    }
});

// FUNCIONALIDAD DE REGISTRO (MODIFICADA: Redirige automáticamente a WhatsApp)
document.getElementById("form-registro")?.addEventListener("submit", function(e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const telefono = document.getElementById("telefono").value;
    const direccion = document.getElementById("direccion").value;

    const cliente = {nombre, email, telefono, direccion};
    localStorage.setItem("cliente", JSON.stringify(cliente));

    // ✅ MOSTRAR CONFIRMACIÓN Y ENVIAR AUTOMÁTICAMENTE A WHATSAPP (3 segundos)
    document.getElementById("cliente-info").innerHTML = `
        <h3>✅ Registro exitoso</h3>
        <p>Enviando tu orden a WhatsApp en 3 segundos... 📱</p>
        <p><strong>👤 Nombre:</strong> ${nombre}</p>
        <p><strong>📧 Email:</strong> ${email}</p>
        <p><strong>📞 Teléfono:</strong> ${telefono}</p>
        <p><strong>🏠 Dirección:</strong> ${direccion}</p>
        <p>¡Gracias por registrarte en Sweet Healthy!</p>
    `;

    // REDIRECCIÓN AUTOMÁTICA A GUASAP
    setTimeout(() => {
        window.carrito.enviarOrdenWhatsApp();
    }, 3000);
});

window.onload = function() {
    const clienteGuardado = JSON.parse(localStorage.getItem("cliente"));
    const clienteInfo = document.getElementById("cliente-info");
    if(clienteGuardado && clienteInfo) {
        clienteInfo.innerHTML = `
            <h3>👤 Cliente registrado previamente</h3>
            <p><strong>Nombre:</strong> ${clienteGuardado.nombre}</p>
            <p><strong>Email:</strong> ${clienteGuardado.email}</p>
            <p><strong>Teléfono:</strong> ${clienteGuardado.telefono}</p>
            <p><strong>Dirección:</strong> ${clienteGuardado.direccion}</p>
        `;
    }
}
// SI ESTÁ EN registros.html Y HAY CARRITO → ENVÍA WHATSAPP
if (window.location.pathname.includes('registros.html')) {
    const carritoGuardado = JSON.parse(localStorage.getItem('carrito_compra'));
    if (carritoGuardado && carritoGuardado.length > 0) {
        setTimeout(() => {
            window.carrito.enviarOrdenWhatsApp();  // Automático!
        }, 2000);
    }
}
// ANTES: Solo mostraba confirmación
// AHORA: Después del registro → chequea carrito → envía WhatsApp
setTimeout(() => {
    if (JSON.parse(localStorage.getItem('carrito_compra') || '[]').length > 0) {
        window.carrito.enviarOrdenWhatsApp();  //  Automático!
    }
}, 2500);