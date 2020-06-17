import Configuraciones from './Utilidades/Configuraciones';
import EntidadesBl from './CapaNegocios/Entidades';
import CatalogosBl from './CapaNegocios/Catalogos';
import UsuariosBl from './CapaNegocios/Usuarios';
import VotacionesBl from './CapaNegocios/Votaciones';
import SesionesBl from './CapaNegocios/Sesiones';
import pdf from 'html-pdf';
import variables from './Utilidades/Variables';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';
import { verificarToken } from './Utilidades/Utilidades';
import entidades from './Utilidades/Temporal';

//Iniciando objetos de configuracion
const conf = new Configuraciones();
const app = conf.getApp();
const servEntidades = new EntidadesBl();
const servCatalogos = new CatalogosBl();
const servUsuarios = new UsuariosBl();
const servVotaciones = new VotacionesBl();
const servSeisiones = new SesionesBl();
const upload = conf.getUpload();

//CREANDO LOS ENDPOINST --------------------------

app.get('/', function (req, res) {
    console.log("LLega el metodo Get Raiz");
    res.send("Llegando al acces point Raiz en el servidor");
});


app.post('/login-home', function (req, res) {
    let usuario = req.body.usuario;
    let contrasenia = req.body.password;

    //Z7qTArO4AZNocboJ4KM5
    servUsuarios.getUsuario(usuario).then(respUsuario => {
        if (respUsuario == null || respUsuario == undefined) {
            res.status(401).send("El usuario ingresado no existe");
        } else if (contrasenia == respUsuario.password) {
            //SETEANDO LA FECHA ACTUAL PARA LA SESION
            let fechaActual = new Date();
            let [anioI, mesI, diaI] = fechaActual.toISOString().substr(0, 10).split('-');
            let horaI = fechaActual.getHours() < 10 ? `0${fechaActual.getHours()}` : fechaActual.getHours();
            let minutosI = fechaActual.getMinutes() < 10 ? `0${fechaActual.getMinutes()}` : fechaActual.getMinutes();

            //SETEANDO LA FECHA DE VENCIMIENTO PARA LA SESION
            let fechaVencEnSegundos = Math.floor(fechaActual.getTime() / 1000) + (60 * 60);
            let fechaVencimiento = new Date(fechaVencEnSegundos * 1000);
            let [anioV, mesV, diaV] = fechaVencimiento.toISOString().substr(0, 10).split('-');
            let horaV = fechaVencimiento.getHours() < 10 ? `0${fechaVencimiento.getHours()}` : fechaVencimiento.getHours();
            let minutosV = fechaVencimiento.getMinutes() < 10 ? `0${fechaVencimiento.getMinutes()}` : fechaVencimiento.getMinutes();

            //ESTRUCTURANDO EL OBJETO SESION
            let sesion = {
                tipo: { id: 1, nombre: 'sistema' },
                fechaInicio: `${diaI}/${mesI}/${anioI}`,
                horaInicio: `${horaI}:${minutosI}`,
                fechaExpiracion: `${diaV}/${mesV}/${anioV}`,
                horaExpiracion: `${horaV}:${minutosV}`,
                fechaFin: null,
                horaFin: null,
                idUsuario: respUsuario.id,
                usuario: respUsuario.usuario,
                persona: respUsuario.nombreCompleto,
                activa: true
            };

            //EJECUTANDO LAS CONSULTAS PARA CREAR LA SESION Y EL TOKEN
            let consultasSesion = async () => {
                //Agregando la sesion a la base de datos
                let idSesion = await servSeisiones.agregarSesion(sesion);

                //Creando Token con validez de  1 hora 
                //Token tipo 1 es para home
                let tokenData = {
                    user: usuario,
                    sesion: idSesion,
                    tipo: 1
                };

                let token = jwt.sign({
                    algorithm: 'RS256',
                    exp: fechaVencEnSegundos,
                    data: tokenData
                }, variables.KEY_TOKEN);

                //Agregando el token a la sesion
                await servSeisiones.actualizarSesion(idSesion, { token: token });

                return token;
            }

            //CREANDO LA RESPUESTA A ENVIAR
            consultasSesion().then(token => {
                console.log(token);
                //Agregando los accesos permitidos al usuario
                let accesos = [];
                respUsuario.roles.forEach(rol => {
                    rol.permisos.forEach(permiso => {
                        accesos.push(permiso);
                    });
                });

                //Crando nombre corto
                let nombreCorto = respUsuario.primerNombre + ' ' + respUsuario.primerApellido;

                res.send({
                    token,
                    usuario: {
                        primerNombre: respUsuario.primerNombre,
                        segundoNombre: respUsuario.segundoNombre,
                        tercerNombre: respUsuario.tercerNombre,
                        primerApellido: respUsuario.primerApellido,
                        segundoApellido: respUsuario.segundoApellido,
                        nombreCompleto: respUsuario.nombreCompleto,
                        nombreCorto: nombreCorto,
                        usuario: respUsuario.usuario,
                        accesos: accesos
                    }
                })
            });
        } else {
            res.status(401).send("Usuario o contraseña incorrecto");
        }
    });

});

app.post('/login-votacion', function (req, res) {
    let usuario = req.body.usuario;
    let contrasenia = req.body.password;
    let idVotacion = req.body.votacion;

    servUsuarios.getUsuarioVotacion(idVotacion, usuario).then(respUsuario => {
        if (respUsuario == null || respUsuario == undefined) {
            res.status(401).send("El usuario ingresado no existe");
        } else if (contrasenia == respUsuario.password) {
            //SETEANDO LA FECHA ACTUAL PARA LA SESION
            let fechaActual = new Date();
            let [anioI, mesI, diaI] = fechaActual.toISOString().substr(0, 10).split('-');
            let horaI = fechaActual.getHours() < 10 ? `0${fechaActual.getHours()}` : fechaActual.getHours();
            let minutosI = fechaActual.getMinutes() < 10 ? `0${fechaActual.getMinutes()}` : fechaActual.getMinutes();

            //SETEANDO LA FECHA DE VENCIMIENTO PARA LA SESION
            let fechaVencEnSegundos = Math.floor(fechaActual.getTime() / 1000) + (60 * 60);
            let fechaVencimiento = new Date(fechaVencEnSegundos * 1000);
            let [anioV, mesV, diaV] = fechaVencimiento.toISOString().substr(0, 10).split('-');
            let horaV = fechaVencimiento.getHours() < 10 ? `0${fechaVencimiento.getHours()}` : fechaVencimiento.getHours();
            let minutosV = fechaVencimiento.getMinutes() < 10 ? `0${fechaVencimiento.getMinutes()}` : fechaVencimiento.getMinutes();

            //ESTRUCTURANDO EL OBJETO SESION
            let sesion = {
                tipo: { id: 2, nombre: 'votacion' },
                fechaInicio: `${diaI}/${mesI}/${anioI}`,
                horaInicio: `${horaI}:${minutosI}`,
                fechaExpiracion: `${diaV}/${mesV}/${anioV}`,
                horaExpiracion: `${horaV}:${minutosV}`,
                fechaFin: null,
                horaFin: null,
                idUsuario: respUsuario.id,
                usuario: respUsuario.usuario,
                persona: respUsuario.nombre,
                activa: true
            };

            //EJECUTANDO LAS CONSULTAS PARA CREAR LA SESION Y EL TOKEN
            let consultasSesion = async () => {
                //Agregando la sesion a la base de datos
                let idSesion = await servSeisiones.agregarSesion(sesion);

                //Creando Token con validez de  1 hora 
                //Token tipo 2 es para votacion
                let tokenData = {
                    user: usuario,
                    sesion: idSesion,
                    tipo: 2
                };

                let token = jwt.sign({
                    algorithm: 'RS256',
                    exp: fechaVencEnSegundos,
                    data: tokenData
                }, variables.KEY_TOKEN);

                //Agregando el token a la sesion
                await servSeisiones.actualizarSesion(idSesion, { token: token });

                return token;
            }

            //CREANDO LA RESPUESTA A ENVIAR
            consultasSesion().then(token => {
                console.log(token);
                res.send({
                    token,
                    usuario: {
                        id: respUsuario.id,
                        nombreCompleto: respUsuario.nombre,
                        usuario: respUsuario.usuario,
                        votacion: idVotacion
                    }
                })
            });
        } else {
            res.status(401).send("Usuario o contraseña incorrecto");
        }
    });
});

app.post('/cerrar-sesion', (req, res) => {
    if (req.headers.authorization != undefined || req.headers.authorization != null) {
        let token = req.headers.authorization;
        let tokenDecodificado = jwt.decode(token, { complete: true });
        let fechaActual = new Date();
        let [anio, mes, dia] = fechaActual.toISOString().substr(0, 10).split('-');
        let hora = fechaActual.getHours() < 10 ? `0${fechaActual.getHours()}` : fechaActual.getHours();
        let minutos = fechaActual.getMinutes() < 10 ? `0${fechaActual.getMinutes()}` : fechaActual.getMinutes();

        servSeisiones.actualizarSesion(tokenDecodificado.payload.data.sesion, { activa: false, fechaFin: `${dia}/${mes}/${anio}`, horaFin: `${hora}:${minutos}` }).then(r => {
            res.status(200).send({ estado: false, informacion: "Sesion terminada" });
        });
    } else {
        res.status(500).send("No se puede cerrar la sesión");
    }
});

app.post('/validar-token', function (req, res, next) {
    if (req.headers.authorization != undefined || req.headers.authorization != null) {
        let token = req.headers.authorization;
        let tokenDecodificado = jwt.decode(token, { complete: true });
        let tipoToken = req.body.tipo;

        //Se verifica si tokenDecodificado es null porque podria ser que enviara cualquier otro tipo de datos en
        //el encabezado authorization, y como solamente un token puede ser decodificado, cualquier otro tipo de
        //deto devolveria null.
        if (tokenDecodificado != undefined ? tokenDecodificado != null : false) {
            servSeisiones.getSesion(tokenDecodificado.payload.data.sesion).then(sesion => {
                if (sesion.activa) {
                    try {
                        jwt.verify(token, variables.KEY_TOKEN);
                        if (tokenDecodificado.payload.data.tipo != tipoToken * 1) {
                            res.status(401).send({ estado: false, informacion: "No tiene acceso a este recurso" });
                        }
                        res.status(200).send({ estado: true, informacion: "Token valido" });
                    } catch (err) {
                        res.status(401).send({ estado: false, informacion: "La sesión a expirado" });
                    }
                } else {
                    servSeisiones.actualizarSesion(tokenDecodificado.payload.data.sesion, { activa: false }).then(r => {
                        res.status(401).send({ estado: false, informacion: "La sesión a expirado" });
                    });
                }
            });
        } else {
            res.status(401).send('Debe iniciar sesión');
        }
    } else {
        res.status(401).send('Debe iniciar sesión');
    }
});

app.post('/subir-excel', upload.single('documento'), function (req, res, next) {
    //Para acceder al archivo y sus propiedades se puede hacer con "req.file"
    servEntidades.leerArchivoExcel(req.file).then((respuesta) => {
        res.send(respuesta);
    });
});

app.get('/catalogo', function (req, res) {
    servCatalogos.getCatalogo(req.query.catalogo).then(catalogo => {
        res.send(catalogo);
    });
});

app.post('/entidad', function (req, res) {
    servEntidades.agregarEntidad(req.query.entidad).then(respuesta => {
        res.send(respuesta);
    });
});

app.post('/votacion', upload.array('imagenes', 12), function (req, res) {
    let votacion = JSON.parse(req.body.datos);
    let [dia, mes, anio] = votacion.fechaVencimiento.split('/');
    let [hora, minutos] = votacion.horaVencimiento.split(':');
    let fechaVencimiento = new Date(anio, mes - 1, dia, hora, minutos, 0, 0);

    let fechaVencimientoSegundos = Math.floor(fechaVencimiento.getTime() / 1000);


    let token = jwt.sign({
        algorithm: 'RS256',
        exp: fechaVencimientoSegundos,
        data: votacion.nombre
    }, variables.KEY_TOKEN);
    votacion.token = token;
    votacion.estado = {
        id: 1,
        nombre: 'Activa'
    };
    servVotaciones.agregarVotacion(votacion);
    
        let respuesta = servVotaciones.agregarVotacion(votacion);
        res.send(respuesta);
      
    //res.send('OK');
});

app.get('/descargar/:file(*)', (req, res) => {
    ///descargar/:file(*)
    console.log(req.params.file);
    let file = 'prueba.jpeg';//req.params.file;
    file = req.params.file;
    let fileLocation = `${__dirname}/uploads`;

    res.download(`${fileLocation}/${file}`, error => {
        console.log(error);
    });
});


app.post('/voto', (req, res) => {
    //PASO 1: VALIDAR LA EL TOKEN DE SESION
    let tokenSesion = req.headers.authorization;
    let respValidacionTokenSesion = verificarToken(tokenSesion, 2);
    //FALTA VERIFICAR SI EL TOKEN ESTA ACTIVO MANDAR A VALIDAR Y SINO MANDAR UN 401


    let validar = async () => {
        //PASO 2: VALIDAR SESION EN BASE AL TOKEN
        let sesionValida = await servSeisiones.validarSesion(respValidacionTokenSesion.data.sesion);
        
        if (sesionValida) {

            //PASO 3: VALIDAR EL TOKEN DE LA VOTACION
            let respValidacionTokenVotacion = verificarToken(req.body.tokenVotacion, null);
            
            if (respValidacionTokenVotacion.valido) {
                
                //PASO 4: VALIDAR LA VOTACION EN BASE AL ESTADO DE LA BD
                let votacionActiva = await servVotaciones.validarVotacion(req.body.votacion);
                
                if (votacionActiva) {
                    //PASO 5: SI LA VOTACION ESTA ACTIVA SE PROCEDE A VERIFICAR SI EL USUARIO YA VOTO
                    console.log(req.body.papeletaOrigen+" ....... "+req.body.papeleta+">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                    let permitirVoto = await servVotaciones.validarVoto(req.body.votacion, req.body.idUsuario, req.body.papeleta);

                    //PASO 6: VALIDAR SI EL USUARIO YA VOTO
                    if (permitirVoto) {
                        let opcionMarcada=await servVotaciones.emitirVoto(req.body.votacion,req.body.papeleta,req.body.papeletaOrigen,req.body.opcion,req.body.idUsuario,req.body.usuario).then(r=>{
                            return r;
                        });
                        return opcionMarcada;
                    }

                }

            }
        }
    
    }
    
    validar().then((r) => {
        res.status(200).send(r);
    });

});

/*
app.get('/votacion/:votacionId', (req, res) => {
    servVotaciones.getVotacion(req.params.votacionId).then(votacion => {
        res.send(votacion);
    });
});
*/

app.get('/votacion/:votacionId/:usuarioId', (req, res) => {
    console.log("ID VOTACION " + req.params.votacionId);
    console.log("ID USUARIO " + req.params.usuarioId);
    servVotaciones.getVotacion(req.params.votacionId, req.params.usuarioId).then(votacion => {
        res.status(200).send(votacion)
    });
});

/*
app.get('/usuario/votaciones/:idUsuario', (req, res) => {
    console.log(req.params.idUsuario);
    servUsuarios.getVotacionesUsuario(req.params.idUsuario).then(votacionesUsuario => {
        servVotaciones.getVotaciones(votacionesUsuario).then(votaciones => {
            res.status(200).send(votaciones);
        });
    });
});
*/

app.post('/filtrar-entidades', function (req, res) {
    /*
    console.log("CADENA " + req.query.cadena);
    servEntidades.getEntidadesPorFiltro(req.query.cadena);
    res.send('OK');
    */
    //servEntidades.getEntidadesFiltradas();
    let txtFiltro = null;
    if (req.body.textoFiltro != undefined ? req.body.textoFiltro != null ? req.body.textoFiltro.length > 0 : false : false) {
        txtFiltro = req.body.textoFiltro;
    }
    let tipologiasFiltro = req.body.tipologias;

    console.log(txtFiltro);
    //console.log(tipologiasFiltro);

    servEntidades.getEntidadesFiltradas(txtFiltro, tipologiasFiltro).then(respuesta => {
        res.send(respuesta);
    });
});

app.get('/paginacion-entidades', function (req, res) {
    let id = null;

    if (req.query.id != 1) {
        id = req.query.id;
    }

    servEntidades.getEntidadesPaginadas(id, req.query.cantidadPorPagina * 1).then(respuesta => {
        res.send(respuesta);
    });
});

app.get('/reporte-entidad', function (req, res) {

    let dirFonts = `file://${__dirname}/assets/fontawesome/css/all.css`;
    let dirImg = `file://${__dirname}/assets/logo-conna-transparente.png`;

    servEntidades.getEntidadPorId(req.query.id).then(entidad => {
        let config = {
            "format": "Letter",
            "orientation": "portrait",
            "border": {
                "top": "1cm",
                "right": "1cm",
                "bottom": "1cm",
                "left": "1cm"
            },
        };

        ejs.renderFile('./Reportes/EntidadRegistrada.ejs', { entidad: entidad, dirImg: dirImg, dirFonts: dirFonts }, function (err, str) {
            // str => Rendered HTML string
            res.setHeader('Content-type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="Reporte entidad registrada"')
            pdf.create(str, config).toStream(function (err, stream) {
                stream.pipe(res);
            });
        })
    });
});

app.get('/entidades', function (req, res) {
    servEntidades.getAllEntidades().then((respuesta) => {
        res.send(respuesta);
    });
});


app.get('/prueba', (req, res) => {
    /*  
  servEntidades.getAllEntidades().then(entidades=>{
      console.log("************************>>>>>>>>>>>> "+        entidades.length);
      res.send(entidades);
  });*/

    /*
    entidades.forEach((e,index)=>{
        console.log(`${index+1}-${e.nombre}`);
    });
    
    res.send('OK');
    */

    let indexSupremo = 0;
    let agregar = async () => {
        for (let index = 0; index < entidades.length; index++) {
            await servEntidades.agregarEntidad(entidades[index]).then(() => {
                indexSupremo++;
            });
        }
    };
    agregar().then(() => {
        console.log("**************************** SE AGREGARON ************* " + indexSupremo);
        res.send("Ok");
    });

});

//INICIANDO EL SERVIDOR --------------------------
//Iniciando servdor en puerto: 8080
const server = app.listen(8082, function () {

    let host = server.address().address;
    let port = server.address().port;

    console.log("Servidor escuchando en http://%s:%s", host, port);
});
