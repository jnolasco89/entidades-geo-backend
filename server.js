import Configuraciones from './Utilidades/Configuraciones';
import EntidadesBl from './CapaNegocios/Entidades';
import CatalogosBl from './CapaNegocios/Catalogos';
import UsuariosBl from './CapaNegocios/Usuarios';
import pdf from 'html-pdf';
import variables from './Utilidades/Variables';
import jwt from 'jsonwebtoken';
import ejs from 'ejs';

//Iniciando objetos de configuracion
const conf = new Configuraciones();
const app = conf.getApp();
const servEntidades = new EntidadesBl();
const servCatalogos = new CatalogosBl();
const servUsuarios = new UsuariosBl();
const upload = conf.getUpload();

//CREANDO LOS ENDPOINST --------------------------

app.get('/', function(req, res) {
    console.log("LLega el metodo Get Raiz");
    res.send("Llegando al acces point Raiz en el servidor");
});


app.post('/login', function(req, res) {
    let usuario = req.body.usuario;
    let contrasenia = req.body.password;

    servUsuarios.getUsuario(usuario).then(respUsuario => {
        if (respUsuario == null || respUsuario == undefined) {
            res.status(401).send("El usuario ingresado no existe");
        } else if (contrasenia == respUsuario.password) {
            let tokenData = {
                user: usuario
            };

            //Token con validez de  1 hora 
            let token = jwt.sign({
                algorithm: 'RS256',
                exp: Math.floor(Date.now() / 1000) + 40,//,Math.floor(Date.now() / 1000) + (60 * 60),
                data: tokenData
            }, variables.KEY_TOKEN);

            res.send({
                token,
                usuario: {
                    primerNombre: usuario.primerNombre,
                    segundoNombre: usuario.segundoNombre,
                    tercerNombre: usuario.tercerNombre,
                    primerApellido: usuario.primerApellido,
                    segundoApellido: usuario.segundoApellido,
                    nombreCompleto: usuario.nombreCompleto,
                    usuario: usario.usuario
                }
            })
        } else {
            res.status(401).send("Usuario o contraseña incorrecto");
        }
    });
});

app.post('/validar-token', function(req, res, next) {
    if (req.headers.authorization != undefined || req.headers.authorization != null) {
        let token = req.headers.authorization;

        try {
            jwt.verify(token, variables.KEY_TOKEN);
            res.status(200).send({ estado: true, informacion: "Token valido" });
        } catch (err) {
            res.status(401).send({ estado: false, informacion: "La sesión a expirado" });
        }
    } else {
        res.status(401).send('Debe iniciar sesión');
    }
});

app.post('/subir-excel', upload.single('documento'), function(req, res, next) {
    //Para acceder al archivo y sus propiedades se puede hacer con "req.file"
    servEntidades.leerArchivoExcel(req.file).then((respuesta) => {
        res.send(respuesta);
    });
});

app.get('/catalogo', function(req, res) {
    servCatalogos.getCatalogo(req.query.catalogo).then(catalogo => {
        res.send(catalogo);
    });
});

app.post('/entidad', function(req, res) {
    servEntidades.agregarEntidad(req.query.entidad).then(respuesta => {
        res.send(respuesta);
    });
});

app.post('/filtrar-entidades', function(req, res) {
    /*
    console.log("CADENA " + req.query.cadena);
    servEntidades.getEntidadesPorFiltro(req.query.cadena);
    res.send('OK');
    */
    //servEntidades.getEntidadesFiltradas();
    let txtFiltro=null;
    if(req.body.textoFiltro!=undefined?req.body.textoFiltro!=null?req.body.textoFiltro.length>0:false:false){
        txtFiltro=req.body.textoFiltro;
    }
    let tipologiasFiltro=req.body.tipologias;

    console.log(txtFiltro);
    //console.log(tipologiasFiltro);

    servEntidades.getEntidadesFiltradas(txtFiltro,tipologiasFiltro).then(respuesta=>{
        res.send(respuesta);
    });
});

app.get('/paginacion-entidades', function(req, res) {
    let id = null;

    if (req.query.id != 1) {
        id = req.query.id;
    }
    
    servEntidades.getEntidadesPaginadas(id, req.query.cantidadPorPagina * 1).then(respuesta => {
        res.send(respuesta);
    });
});

app.get('/reporte-entidad', function(req, res) {
    
    let dirFonts=`file://${__dirname}/assets/fontawesome/css/all.css`;
    let dirImg=`file://${__dirname}/assets/logo-conna-transparente.png`;
    
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
           
            ejs.renderFile('./Reportes/EntidadRegistrada.ejs',{entidad:entidad,dirImg:dirImg,dirFonts:dirFonts}, function(err, str){
                // str => Rendered HTML string
                res.setHeader('Content-type', 'application/pdf');
                res.setHeader('Content-Disposition', 'inline; filename="Reporte entidad registrada"')
                pdf.create(str, config).toStream(function(err, stream) {
                    stream.pipe(res);
                });
            })
    });
});

app.get('/entidades', function(req, res) {
    servEntidades.getAllEntidades().then((respuesta) => {
        res.send(respuesta);
    });
});


//INICIANDO EL SERVIDOR --------------------------
//Iniciando servdor en puerto: 8080
const server = app.listen(8082, function() {

    let host = server.address().address;
    let port = server.address().port;

    console.log("Servidor escuchando en http://%s:%s", host, port);
});
