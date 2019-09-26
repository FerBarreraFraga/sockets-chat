const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utils/utils');

const usuarios = new Usuarios();
io.on('connection', (client) => {

  console.log('Usuario conectado');

  client.on('entrarChat', (data, callback) => {
    const { usuario } = data;
    if (!usuario.nombre || !usuario.sala) {
      return callback({
        err: true,
        mensaje: 'El nombre / sala es necesario',
      })
    }

    client.join(usuario.sala);

    usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala);

    client.broadcast.to(usuario.sala).emit('listaPersonas', usuarios.getPersonasPorSala());
    callback(usuarios.getPersonasPorSala(usuario.sala));
  });

  client.on('crearMensaje', (data) => {
    let persona = usuarios.getPersona(client.id)
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

  });

  //mensajes privados
  client.on('mensajePrivado', (data) => {
    let persona = usuarios.getPersona(client.id)
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(data.para).emit('mensajePrivado', mensaje);

  });


  client.on('disconnect', () => {
    let personaBorrada = usuarios.eliminarPersona(client.id);

    client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Admin', `${personaBorrada.nombre} salio`));

    client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala());

  });


});