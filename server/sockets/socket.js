const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utils/utils');

const usuarios = new Usuarios();
io.on('connection', (client) => {

  console.log('Usuario conectado');

  client.on('entrarChat', (data, callback) => {
    if (!data.nombre || !data.sala) {
      return callback({
        err: true,
        mensaje: 'El nombre / sala es necesario',
      })
    }

    client.join(data.sala);

    usuarios.agregarPersona(client.id, data.nombre, data.sala);

    client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonasPorSala(data.sala));
    client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Admin', `${data.nombre} entro.`));

    callback(usuarios.getPersonasPorSala(data.sala));
  });

  client.on('crearMensaje', (data, callback) => {
    console.log('creaMensaje data: ', data);
    let persona = usuarios.getPersona(client.id)
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

    callback(mensaje);
  });

  //mensajes privados
  client.on('mensajePrivado', (data) => {
    let persona = usuarios.getPersona(client.id)
    let mensaje = crearMensaje(persona.nombre, data.mensaje);
    client.broadcast.to(data.para).emit('mensajePrivado', mensaje);

  });


  client.on('disconnect', () => {
    let personaBorrada = usuarios.eliminarPersona(client.id);
    if (personaBorrada) {
      client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Admin', `${personaBorrada.nombre} salio`));
      client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSala(personaBorrada.sala));
    }
  });


});