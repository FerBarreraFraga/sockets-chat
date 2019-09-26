var socket = io();

var params = new URLSearchParams(window.location.search);

if (!params.has('nombre') || !params.has('sala')) {
    window.location = 'index.html';
    throw new Error('El nombre / sala son necesarios');
}

var usuario = {
    nombre: params.get('nombre'),
    sala: params.get('sala'),
}

socket.on('connect', function () {
    console.log('Conectado al servidor');

    socket.emit('entrarChat', {
        usuario,
    }, function (resp) {
        console.log('Usuarios conectados ', resp);
    });

    // socket.emit('crearMensaje', function (resp) {
    //     console.log(resp);
    // });

    socket.on('crearMensaje', function (resp) {
        console.log(resp);
    });


    socket.on('listaPersonas', function (personas) {
        console.log(personas);
    });

    // Mensajes privados
    socket.on('mensajePrivado', function (mensaje) {
        console.log('mensajePrivado ',  mensaje);
    });

});

// escuchar
socket.on('disconnect', function () {

    console.log('Perdimos conexión con el servidor');

});



// Escuchar información
socket.on('enviarMensaje', function (mensaje) {

    console.log('Servidor:', mensaje);

});