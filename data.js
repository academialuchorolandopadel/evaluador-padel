const DATA = {
    golpes: {
        smash: {
            nombre: "Golpes por Sobre la Cabeza",
            subtitulo: "Smash, Bandeja, Víbora, Rulo, Gancho",
            pares: {
                parI: {
                    nombre: "Par I – Golpe-Impacto (Sobre Cabeza)",
                    lugarEjecucion: "Mitad de ZONA II",
                    cuantificadores: [
                        {
                            id: "aptitud",
                            nombre: "Aptitud del golpe-impacto",
                            descripcion: "Cómo impacta la pelota al ejecutar el golpe.",
                            categorias: {
                                7: "Pega plano, muy ocasionalmente puede pegar con efecto, más por defecto que por efectividad.",
                                6: "Pega con efecto además de pegar plano.",
                                5: "Impacta plano y con efecto de un lado, pudiendo eventualmente buscar el efecto contrario (resultado incierto).",
                                4: "Pega con efecto siempre del mismo lado, y también lo hace plano.",
                                3: "Impacta el golpe plano y con efecto, logrando con mucha eficiencia el resultado buscado.",
                                2: "Pega plano y con efecto indistintamente de ambos lados y con gran maestría. Pega tanto de Zona II como de Zona III con los mismos resultados."
                            }
                        },
                        {
                            id: "direccionamiento",
                            nombre: "Capacidad de direccionamiento",
                            descripcion: "Capacidad de elegir a voluntad dónde picará la pelota en el campo rival.",
                            categorias: {
                                7: "No dirige volitivamente a dos paredes ni tampoco a pared de fondo.",
                                6: "Intenta buscar dos paredes tanto con efecto como plano (no lográndolo en un alto porcentaje). Intenta traerla por pared de fondo (bajo porcentaje).",
                                5: "Busca las dos paredes. Dirige los golpes a los alambres e intenta sacarla de la cancha sin buenos resultados.",
                                4: "Conscientemente busca las paredes eligiendo según su conveniencia. Intenta sacar la pelota. Con efecto busca las dos paredes.",
                                3: "Busca con facilidad las dos paredes, eligiendo a voluntad a cuál se le pega primero. Dirige a los alambres e intenta sacarla de la cancha con éxito. Busca el cuerpo del rival.",
                                2: "Varía la dirección a su discreción y sin dificultad. A dos paredes eligiendo que cierre o abra. La saca por arriba de los alambres o por pared de fondo, aún incómodo. Busca el cuerpo del rival."
                            }
                        },
                        {
                            id: "velocidad",
                            nombre: "Cambios de velocidad",
                            descripcion: "Habilidad para imprimir distintas velocidades a la pelota voluntariamente.",
                            categorias: {
                                7: "Al pegar casi siempre plano, tiene escasas posibilidades de cambiar de velocidad. El impulso carece de variaciones. No tiene criterio para seleccionar el cambio.",
                                6: "Cambia la velocidad solo por el tipo de golpe (con efecto más lento que el plano). No siempre acierta la elección.",
                                5: "Logra hacer variación de velocidad (con limitaciones) tanto con efecto como pegando plano.",
                                4: "Cambia la velocidad por tipo de golpe (con efecto más lento) y cambia el impulso si quiere hacer retornar la pelota (plano).",
                                3: "Cambia las velocidades indistintamente por golpe o por impulso, tanto plano como con efecto.",
                                2: "Cambia de velocidad según su conveniencia siendo totalmente criterioso. Gran estratega al cambiar la velocidad. Destaca al pegar 'a traerla' incluso desde cerca de Zona III."
                            }
                        },
                        {
                            id: "continuidad",
                            nombre: "Factor de continuidad",
                            descripcion: "Cantidad de smash que puede pegar sin fallar.",
                            categorias: {
                                7: "Cada cuatro golpes erra tres.",
                                6: "Cada cinco golpes dos son malas. Errores en definición o al intentar 'cosas' que imagina pero no ejecuta.",
                                5: "Cada seis golpes dos son malas. Error por apurar definición o jugar pelotas que no maneja con exactitud.",
                                4: "Ante la inseguridad, elige continuar el juego pegando flojo pero asegurando. De seis golpes erra uno.",
                                3: "Salto grande en continuidad. Es raro que erre un smash desde ZONA II. De siete golpes erra uno.",
                                2: "Gran continuidad, margen de error de 8 o 9 golpes a 1. No arriesga pelotas sin sentido, construye el tanto."
                            }
                        }
                    ]
                },
                parIprima: {
                    nombre: "Par I' – Desplazamiento de Posicionamiento (Sobre Cabeza)",
                    lugarEjecucion: "Luego de ejecutar el golpe desde mitad de ZONA II",
                    cuantificadores: [
                        {
                            id: "desplazamiento",
                            nombre: "Movimiento vertical hacia la red",
                            descripcion: "Evalúa si el jugador se queda quieto o avanza para cerrar la red después del golpe.",
                            categorias: {
                                7: "Intenta retomar su posición adecuada en la cancha, pero a la altura de donde pegó. Solo se desplaza verticalmente hacia la red cuando la pelota es muy lenta, y al hacerlo no es efectivo para definir el tanto (se acrecienta en damas).",
                                6: "Existe la actitud decidida de buscar la red después de pegar, pero lo hace en forma discontinua, con errores de criterio, no llegando a ser eficiente en el cierre de la red.",
                                5: "Se tiene actitud de cobertura de la red pero en esta categoría no se logra el objetivo deseado.",
                                4: "Existe la aptitud decidida de tomar la red después de impactar la pelota, pero lo hace en forma discontinua, no llegando siempre a la ZONA I y cerrando deficientemente la red.",
                                3: "Gran salto de movilidad respecto a 4ª: no solo actitud de cubrir la red rápidamente por si bajan rasante, sino también un buen cierre de la red.",
                                2: "Grandes desplazamientos horizontales y verticales. Logra un cierre óptimo de la red. Se destaca al levantar pelotas sumamente rasantes de la misma."
                            }
                        }
                    ]
                },
                parII: {
                    nombre: "Par II – Movimientos de Reposicionamiento (Sobre Cabeza)",
                    lugarEjecucion: "El rival ejecuta el golpe desde mitad de ZONA II; el observado está en línea de saque",
                    cuantificadores: [
                        {
                            id: "reposicionamiento",
                            nombre: "Lectura de pelota y reposicionamiento",
                            descripcion: "Cómo reacciona el jugador ante el golpe rival.",
                            categorias: {
                                7: "Mala lectura de pelota y trayectoria. Reposiciona después de que salió la pelota y llega encimado y desacomodado a impactarla. Opta por dejar pasar a la pared.",
                                6: "No tiene lectura de pelota pero sí de trayectoria. Comienza desplazamiento después del impacto rival pero se acomoda mejor. Llega más cómodo a pelotas de dos paredes. Si intenta bajar después del pique llega encimado.",
                                5: "Buena lectura de pelota y trayectoria. Inicia movimiento antes del impacto del rival. Llega con tiempo a dos paredes y pelotas que vuelven rápido. Intenta ir a volear el golpe (bloqueo).",
                                4: "Buena lectura, anticipa movimientos. Intenta esconder el golpe para dificultar lectura rival. Llega con facilidad a pelotas a volver y a las que buscan el costado.",
                                3: "Muy buena lectura, anticipa y esconde el golpe. Llega con comodidad a todas las pelotas. Comienza a contraatacar el golpe voleándolo.",
                                2: "Lectura correcta, anticipa totalmente. Conoce los tejidos, sale con antelación. Busca contraatacar voleando; cuando deja pasar, baja rasante y fuerte."
                            }
                        }
                    ]
                },
                parIIprima: {
                    nombre: "Par II' – Alternativas de Devolución (Sobre Cabeza)",
                    lugarEjecucion: "Misma situación",
                    cuantificadores: [
                        {
                            id: "devolucion",
                            nombre: "Elección de devolución",
                            descripcion: "Qué tipo de devolución prefiere ante un golpe rival.",
                            categorias: {
                                7: "Siempre opta por dejar pasar la pelota y salir de pared (la opción más lenta).",
                                6: "Comienza a intentar bajar la pelota después del pique, plano y con poca profundidad; el jugador de revés lo hace con efecto pero poco profundo.",
                                5: "Ya posee velocidad para ir a bloquear el golpe (no volear). También deja pasar a las paredes y baja de drive/revés.",
                                4: "Va a volear el golpe contrario. También deja pasar a las paredes y baja de ambos lados.",
                                3: "Contraataca el golpe voleándolo. Cuando deja pasar, devuelve rasante o con globo (llega a tiempo).",
                                2: "Mayoría de veces busca volear el golpe rival. Cuando deja pasar a la pared, sale rasante y fuerte de drive/revés, incluso intenta sacarla de la cancha."
                            }
                        }
                    ]
                }
            }
        },
        volea: {
            nombre: "Volea",
            pares: {
                parI: { /*...datos completos como antes...*/ },
                parIprima: { /*...*/ },
                parII: { /*...*/ },
                parIIprima: { /*...*/ }
            }
        },
        pegadaFondo: {
            nombre: "Pegada de Fondo",
            pares: { /*...*/ }
        },
        salidaPared: {
            nombre: "Salida de Pared",
            pares: { /*...*/ }
        }
    }
};

window.DATA = DATA;
