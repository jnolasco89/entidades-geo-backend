let entidades = 
    [
        {
            "nombre":"Iglesia Evangélica El Dios de Israel",
            "tipologia":[
                {"id":5,"nombre":"Acogimiento institucional"}
            ],
            "sedes":[
                {
                    "tipo":{"id":1,"nombre":"central"},
                    "departamento":{ "DepartamentoID": "6", "RegionID": "2", "DEP_ID": "06", "DepartamentoDsc": "SAN SALVADOR", "DepartamentoLbl": "San Salvador"},
                    "municipio":{ "MunicipioID": "110", "DepartamentoID": "6", "MUN_ID": "0614", "DEP_ID": "06", "MunicipioDsc": "SAN SALVADOR", "MunicipioLbl": "San Salvador"},
                    "direccion":"Calle 5 de noviembre , final sexta avenida Norte, Barrio san Jacinto",
                    "contactos":[
                        {"tipo":{"id":1,"nombreS":"Teléfono","nombreP":"Teléfonos"},"valor":"2235-1933"},
                        {"tipo":{"id":2,"nombreS":"Correo","nombreP":"Correos"},"valor":"evely@lacapilla.org.sv"}
                         ],
                    "personasDeContacto":[
                        {   
                            "tipo":{"id":1,"nombre":"Representante legal"},
                            "titulo":"Sr",   
                            "primerNombre":"Carlos",   
                            "segundoNombre":"Isaías",
                            "tercerNombre":null,
                            "primerApellido":"Bautista",
                            "segundoApellido":"Hernández",
                            "contactos":[
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "nombre":"Fundación Vínculo de Amor",
            "tipologia":[
                {"id":6,"nombre":"Transferencias sociales"}
            ],
            "sedes":[
                {
                    "tipo":{"id":1,"nombre":"central"},
                    "departamento":{ "DepartamentoID": "6", "RegionID": "2", "DEP_ID": "06", "DepartamentoDsc": "SAN SALVADOR", "DepartamentoLbl": "San Salvador"},
                    "municipio":{ "MunicipioID": "110", "DepartamentoID": "6", "MUN_ID": "0614", "DEP_ID": "06", "MunicipioDsc": "SAN SALVADOR", "MunicipioLbl": "San Salvador"},
                    "direccion":"29 calle poniente y 17 Avenida Norte # 1620, Colonia Layco",
                    "contactos":[
                        {"tipo":{"id":1,"nombreS":"Teléfono","nombreP":"Teléfonos"},"valor":"2557-3588"},  
                        {"tipo":{"id":1,"nombreS":"Teléfono","nombreP":"Teléfonos"},"valor":"2557-3589"},
                        {"tipo":{"id":2,"nombreS":"Correo","nombreP":"Correos"},"valor":"vinculodeamor12@gmail.com"}
                         ],
                    "personasDeContacto":[
                        {   
                            "tipo":{"id":1,"nombre":"Representante legal"},
                            "titulo":"Sr",
                            "primerNombre":"Samuel",   
                            "segundoNombre":"Wilson",
                            "tercerNombre":null,
                            "primerApellido":"Hawkins Jr",
                            "segundoApellido":null,
                            "contactos":[
                            ]
                        },
                        {   
                            "tipo":{"id":2,"nombre":"contacto"},
                            "titulo":"Sra",  
                            "primerNombre":"Mariela",
                            "segundoNombre":null,
                            "tercerNombre":null,
                            "primerApellido":"Fumero",
                            "segundoApellido":null,
                            "contactos":[
                                {"tipo":{"id":2,"nombreS":"Correo","nombreP":"Correos"},"valor":"geronymariela@vinculodeamor.org"},
                                {"tipo":{"id":2,"nombreS":"Correo","nombreP":"Correos"},"valor":"comunicaciones@vinculodeamor.org"}
                            ]
                        }
                    ]
                }
            ]
        }
    ];


export default entidades;