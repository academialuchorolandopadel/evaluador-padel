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
        parI: {
          nombre: "Par I – Golpe-Impacto Volea",
          lugarEjecucion: "ZONA I",
          cuantificadores: [
            {
              id: "aptitud",
              nombre: "Aptitud del golpe-impacto",
              descripcion: "Cómo ejecuta la volea (bloqueo, plano, slice, globo, alta).",
              categorias: {
                7: "Bloquea el golpe tanto de drive como de revés; posibilidad de intentar pegar plano de revés. Volea desde ZONA II por deficiente lectura. Carece de profundidad.",
                6: "Mayoritariamente bloquea; intenta buscar alambres sin éxito. Con slice de revés busca el medio. Volea alta se impacta plana.",
                5: "Impacta con slice tanto de drive como de revés cuando desee. Globo de volea con fines de ataque (no eficiente). Volea alta con mucho slice.",
                4: "Bloquea solo ante gran velocidad rival. Globo de volea defensivo. Volea alta de Zona II plana y con potencia.",
                3: "Impacta de slice de drive/revés cuando desea. Globo de volea de ataque con buenos resultados. Volea alta con muy buen slice.",
                2: "Pega plano y con slice de drive/revés sin dificultad, tanto en Zona I como en Zona II. Ejecuta drop con buenos resultados."
              }
            },
            {
              id: "direccionamiento",
              nombre: "Capacidad de direccionamiento",
              descripcion: "Hacia dónde dirige la volea.",
              categorias: {
                7: "No posee capacidad de direccionamiento.",
                6: "Intenta buscar los alambres (bajo porcentaje). Volea alta se angula como smash.",
                5: "Busca alambres e intenta pelotas profundas. Volea alta se dirige al medio.",
                4: "Angula la pelota y busca alambres. De revés con slice al medio. Volea alta se angula como smash.",
                3: "Pega plano para que vuelva al mismo campo; con slice a los ángulos y alambres. Volea alta al medio.",
                2: "Direcciona hacia alambres, ángulo o cuerpo del rival sin dificultad."
              }
            },
            {
              id: "velocidad",
              nombre: "Cambios de velocidad",
              descripcion: "Variación de velocidad en la volea.",
              categorias: {
                7: "La velocidad depende de la pelota que viene, no de su voluntad.",
                6: "Intenta cambios de velocidad frecuentemente pero sin resultados óptimos.",
                5: "Empieza a utilizar cambios de velocidad (plano y slice).",
                4: "Busca deliberadamente diferentes ángulos, cambiando velocidad de impulso.",
                3: "Juega a voluntad la pelota corta con mucho slice (pica en Zona I). Cambia velocidad constantemente.",
                2: "Cambia velocidad a voluntad según posición de rivales. Ejecuta drop con muy buenos resultados."
              }
            },
            {
              id: "profundidad",
              nombre: "Factor de profundidad",
              descripcion: "Relación de pelotas que pican entre línea de saque y pared vs. por delante.",
              categorias: {
                7: "No maneja velocidad ni direccionamiento, la profundidad es aleatoria.",
                6: "Busca conscientemente profundidad pero no lo logra la mayoría de veces.",
                5: "Trata de que la pelota pique en Zona III, pero no lo logra en su gran mayoría.",
                4: "Busca profundidad conscientemente pero no en todas las ejecuciones.",
                3: "Juega profundo tanto plano como slice (aproximadamente 50% pican en Zona III).",
                2: "De 8 o 9 golpes, 1 no es profundo."
              }
            }
          ]
        },
        parIprima: {
          nombre: "Par I' – Desplazamiento de Posicionamiento (Volea)",
          lugarEjecucion: "Después de impactar la volea desde ZONA I",
          cuantificadores: [
            {
              id: "desplazamiento",
              nombre: "Movimiento post-volea",
              descripcion: "Qué hace el jugador después de volear (retrocede, se queda, avanza, cierra horizontalmente).",
              categorias: {
                7: "Tiende a retroceder si considera que la volea quedó corta, o se queda parado por lentitud.",
                6: "Retrocede por inseguridad en su golpe. Comienza a moverse horizontalmente en forma poco sólida.",
                5: "Mayor movilidad vertical le permite estar más atrás y adelantarse. Cierre horizontal inadecuado.",
                4: "No retrocede en condiciones normales; tiende a ganar la posición. Movimientos horizontales para cubrir la red.",
                3: "Mayor rapidez vertical y horizontal: retrocede o adelanta en tiempos adecuados. Mejora el cierre de la red.",
                2: "Se mantiene en posición, capaz de duelos de volea. Movimientos verticales y horizontales muy efectivos; difícil superarlo con pelotas rasantes o anguladas."
              }
            }
          ]
        },
        parII: {
          nombre: "Par II – Movimientos de Reposicionamiento (Volea)",
          lugarEjecucion: "El rival volea desde ZONA I; el observado puede estar en ZONA I, II o III",
          cuantificadores: [
            {
              id: "reposicionamiento",
              nombre: "Reposicionamiento según ubicación",
              descripcion: "Cómo se mueve para responder a la volea rival.",
              categorias: {
                7: "ZONA III: sale de pared (a veces se 'anuda' en dos paredes). ZONA II: sobrepique por defecto. ZONA I: retrocede.",
                6: "ZONA III: sale apurado de dos paredes, pega de fondo estático. ZONA II: sobrepique con dirección pero levantando. ZONA I: bloquea sin mantener posición.",
                5: "ZONA III: pega de fondo atacando hacia delante; ZONA II: busca sobrepique en actitud de ataque; ZONA I: avanza para ganar la red.",
                4: "ZONA III: llega tarde a dos paredes; pega de fondo estático. ZONA II: sobrepique con dirección. ZONA I: mantiene posición y cierra horizontalmente.",
                3: "Buena lectura, anticipa. ZONA III: maneja paredes, sale con tiempo. ZONA II: sobrepique en ataque. ZONA I: avanza para ganar la red.",
                2: "Correcta lectura, anticipa totalmente. ZONA III: manejo perfecto de paredes; ZONA II: sobrepique siempre en ataque; ZONA I: avanza sin perder la red."
              }
            }
          ]
        },
        parIIprima: {
          nombre: "Par II' – Alternativas de Devolución (Volea)",
          lugarEjecucion: "Misma situación",
          cuantificadores: [
            {
              id: "devolucion",
              nombre: "Elección de devolución",
              descripcion: "Qué tipo de devolución elige ante una volea rival.",
              categorias: {
                7: "Siempre opta por la opción más lenta (pared). Si está en ZONA II, sobrepique por defecto; en duelo de voleas, retrocede.",
                6: "Elige entre salir de pared o pegar de fondo según convenga. Último recurso: contra pared.",
                5: "Prefiere pegar de fondo para presionar; fomenta duelo de voleas.",
                4: "Prefiere salir de pared antes que sobrepique; en duelo de voleas mantiene posición.",
                3: "Pega de fondo para contraatacar; busca sobrepique para ganar la red; duelo de voleas siempre hacia delante.",
                2: "Siempre busca opción de mayor presión: pega de fondo en lugar de pared, sobrepique en lugar de esperar, duelo de voleas para ganar la red."
              }
            }
          ]
        }
      }
    },
    pegadaFondo: {
      nombre: "Pegada de Fondo",
      pares: {
        parI: {
          nombre: "Par I – Golpe-Impacto Pegada de Fondo",
          lugarEjecucion: "Desde la línea de saque (ZONA III)",
          cuantificadores: [
            {
              id: "aptitud",
              nombre: "Aptitud del golpe-impacto",
              descripcion: "Cómo ejecuta la pegada de fondo (plano, slice, globo, sobrepique).",
              categorias: {
                7: "Pega plano de drive; levanta en globo de revés. Algunos golpean con slice de drive por deficiencia técnica.",
                6: "Comúnmente plano y fuerte de drive; comienza a usar slice de drive. De revés intenta globo, dominio limitado.",
                5: "De drive y revés impacta plano o con slice; juega a media altura intentando cruzarla; globo también cruzado.",
                4: "Impacta plano o slice de ambos lados; revés rasante o globo; buen direccionamiento.",
                3: "Pega de drive o revés con slice o plano sin mayores dificultades. Globo 'llovido' cruzado o paralelo.",
                2: "Pega plano o con slice de ambos lados con total habilidad. Globo muy preciso (llovido o al rincón)."
              }
            },
            {
              id: "direccionamiento",
              nombre: "Capacidad de direccionamiento",
              descripcion: "Hacia dónde dirige la pegada de fondo.",
              categorias: {
                7: "Sin direccionamiento; búsqueda de paralelos con alto error.",
                6: "Buen direccionamiento dentro de limitaciones; globo casi siempre cruzado.",
                5: "Dirige con igual facilidad hacia cualquier dirección; globos cruzados o paralelos según oportunidad.",
                4: "Dirige paralelo, cruzado y al medio con buen acierto; globos generalmente cruzados.",
                3: "Direcciona a laterales (alambres), medio, e incluso pelotas muy rasantes que obligan a levantar. Globo a discreción.",
                2: "Direcciona a cualquier lugar con igual maestría (medio, laterales, cuerpo). Globo llovido o al rincón a voluntad."
              }
            },
            {
              id: "velocidad",
              nombre: "Cambios de velocidad",
              descripcion: "Variación de velocidad en la pegada de fondo.",
              categorias: {
                7: "Siempre fuerte, pocos cambios (más por defecto que voluntad).",
                6: "Generalmente fuerte, no cambia velocidad. Ocasional revés rasante con menor velocidad por falta de habilidad.",
                5: "Imprime velocidad o 'afloja' según conveniencia. Reduce errores al ajustar potencia.",
                4: "Cambios de velocidad tanto de drive como de revés (plano o slice).",
                3: "Cambia velocidad a voluntad: fuerte al medio, suave a laterales para complicar.",
                2: "Impacta fuerte cuando es necesario (busca cuerpo rival); suave y rasante a laterales para contraatacar."
              }
            },
            {
              id: "error",
              nombre: "Factor de error",
              descripcion: "Relación de tiros francos buenos vs. malos.",
              categorias: {
                7: "4/1 (cuatro malos por uno bueno).",
                6: "3/1. Error por apurar definición y pegar siempre con igual potencia.",
                5: "Se reduce a 4/1. Al manejar velocidades, asegura el golpe cuando la devolución es con presión.",
                4: "6/1.",
                3: "7/1.",
                2: "8 o 9/1."
              }
            }
          ]
        },
        parIprima: {
          nombre: "Par I' – Desplazamiento de Posicionamiento (Pegada de Fondo)",
          lugarEjecucion: "Después de ejecutar la pegada de fondo desde línea de saque",
          cuantificadores: [
            {
              id: "desplazamiento",
              nombre: "Movimiento post-pegada",
              descripcion: "Actitud de ataque tras el golpe (avanzar, quedarse, etc.).",
              categorias: {
                7: "Solo avanza si la pelota pasó a los rivales; se queda en ZONA II. En globo, espera a ver si pasó para moverse.",
                6: "Avanza solo cuando la pelota pasa a los rivales, llegando casi al comienzo de ZONA I. En globo, espera confirmación de que no hay smash.",
                5: "Avanza aunque la pelota no haya pasado a los rivales, si 'afloja' lo suficiente. Globo lo ataca en algunas ocasiones aunque no haya pasado.",
                4: "Toma definitivamente la red cuando pasan al rival con rasantes o globos. Después del golpe realiza movimientos verticales.",
                3: "Comienza movimientos de posicionamiento inmediatamente después de impactar. Avanza incluso si el globo no ha pasado, buscando ganar la red. Usa sobrepique como recurso.",
                2: "Siempre va hacia adelante buscando la red. En este golpe, los movimientos son verticales para contraatacar, incluso cuando el rival volea."
              }
            }
          ]
        },
        parII: {
          nombre: "Par II – Movimientos de Reposicionamiento (Pegada de Fondo)",
          lugarEjecucion: "El rival pega de fondo desde línea de saque; el observado está en ZONA I",
          cuantificadores: [
            {
              id: "reposicionamiento",
              nombre: "Lectura y reacción",
              descripcion: "Cómo reacciona ante la pegada de fondo rival (globo, aflojada, rasante).",
              categorias: {
                7: "No lee el globo; se para lejos de la red. Si es profundo, lo pasa. Si la pelota pasa rasante, va a buscarla exigido.",
                6: "No lee pero conoce trayectoria. Ante globo intenta smash alternadamente. Si le aflojan a un costado, lo toma por sorpresa. Cierre horizontal bueno.",
                5: "Lee el golpe: ante globo retrocede antes del impacto, ante aflojada llega armado. Si lo pasan, queda mal posicionado.",
                4: "Lee la pelota: retrocede ante globo perfilándose para smash; ante rasante intenta volear. Si lo pasan, sale de pared.",
                3: "Buena lectura: retrocede con anticipación ante globo, llega armado ante aflojada. Si lo pasan, sale jugando a los costados o con globo profundo.",
                2: "Muy buena lectura: retrocede anticipadamente ante globo (casi imposible pasarlo). Llega con tiempo a aflojada; ante rasante avanza para volear sin perder cierre."
              }
            }
          ]
        },
        parIIprima: {
          nombre: "Par II' – Alternativas de Devolución (Pegada de Fondo)",
          lugarEjecucion: "Misma situación",
          cuantificadores: [
            {
              id: "devolucion",
              nombre: "Elección de devolución",
              descripcion: "Qué prefiere hacer ante una pegada de fondo rival.",
              categorias: {
                7: "Ante globo comprometido, sale de pared. Siempre opción más lenta.",
                6: "Intenta volear para no perder ataque, no siempre logrado. Globo poco profundo: smash; si lo supera, sale de pared.",
                5: "Opta por volear o smash (aunque no siempre logrado).",
                4: "Busca no perder posición de ataque: volea o smash según sea posible.",
                3: "Volea o smash; si es pasado, sale de pared pero siempre buscando contraatacar.",
                2: "Siempre busca volear o smash para mantener ataque. Muy difícil pasarlo."
              }
            }
          ]
        }
      }
    },
    salidaPared: {
      nombre: "Salida de Pared",
      pares: {
        parI: {
          nombre: "Par I – Golpe-Impacto Salida de Pared",
          lugarEjecucion: "ZONA III (o donde se produzca el rebote)",
          cuantificadores: [
            {
              id: "aptitud",
              nombre: "Aptitud del golpe-impacto",
              descripcion: "Cómo sale de la pared (globo, rasante, contra pared).",
              categorias: {
                7: "Habitualmente levanta en globo tanto de drive como de revés. Abusa de volver contra pared de fondo con resultado incierto.",
                6: "De drive impacta plano; de revés 'acompaña' la pelota. Volver contra pared con factor de caída 5/2 (mayor confianza).",
                5: "De drive o revés sale con slice. Salida contra pared de fondo con factor 5/3. Levanta pelotas bajas con globo.",
                4: "Puede impactar rasante de ambos lados. Contra pared con factor de caída que permite confianza. Levanta pelotas a muy baja altura con globos o contra pared.",
                3: "Impacta plano o con slice de ambos lados. Muy buen direccionamiento; levanta a muy baja altura.",
                2: "Pega plano o slice de ambos lados sin dificultad. Levanta pelotas de muy baja altura saliendo sin problemas con rasantes o globos profundos."
              }
            },
            {
              id: "direccionamiento",
              nombre: "Capacidad de direccionamiento",
              descripcion: "Hacia dónde dirige la salida de pared.",
              categorias: {
                7: "No posee direccionamiento (ni en globo, ni plano).",
                6: "De drive busca todas las direcciones; de revés básicamente al medio. Globos intenta cruzados. Contra pared sin direccionamiento.",
                5: "Busca todas las direcciones con alto acierto. De revés cambia el ángulo. Contra pared aún sin direccionamiento.",
                4: "Busca todas las direcciones, acentuando al medio con revés. Globos tanto cruzados como paralelos.",
                3: "Muy buen direccionamiento: busca alambres, ángulos y medio. Globos paralelos y cruzados.",
                2: "Direcciona sin dificultad a ángulos, alambres y medio de forma rasante. Globo 'llovido' paralelo y cruzado."
              }
            },
            {
              id: "velocidad",
              nombre: "Cambios de velocidad",
              descripcion: "Variación de velocidad en la salida de pared.",
              categorias: {
                7: "Siempre impacta fuerte, no hay cambios.",
                6: "Comienza a variar velocidad tanto de drive como de revés.",
                5: "Cambia velocidad (plano o slice) tanto de drive como de revés.",
                4: "Impacta fuerte o 'aflojando' hacia costados o medio.",
                3: "Cambia velocidad usando slice; buena variación.",
                2: "Realiza cambios sin dificultad según posición rival: suave a laterales, fuerte al medio o al cuerpo."
              }
            },
            {
              id: "levantadas",
              nombre: "Factor de levantadas",
              descripcion: "Facilidad para levantar pelotas desde muy cerca del piso.",
              categorias: {
                7: "Margen de error amplio, no tiene habilidad suficiente.",
                6: "Comienza a levantar pelotas a muy baja altura, por lo general en globos o contra pared.",
                5: "Levanta pelotas de baja altura tanto de drive como de revés; en revés utiliza globo.",
                4: "Levanta a muy baja altura con globos o contra pared con buenos resultados.",
                3: "Levanta a muy baja altura utilizando drive y revés, saliendo con globo o rasante.",
                2: "Levanta pelotas de muy baja altura sin problemas, saliendo con tiros rasantes, globos cruzados o paralelos."
              }
            }
          ]
        },
        parIprima: {
          nombre: "Par I' – Desplazamiento de Posicionamiento (Salida de Pared)",
          lugarEjecucion: "Luego de ejecutar la salida de pared",
          cuantificadores: [
            {
              id: "desplazamiento",
              nombre: "Movimiento post-salida",
              descripcion: "Actitud después de salir de pared (avanzar, quedarse).",
              categorias: {
                7: "Solo avanza si el rival tiene que salir de pared de fondo (globo quebrado).",
                6: "Solo avanza sobre pelotas firmes que hayan pasado la línea de ataque rival.",
                5: "Se desplaza verticalmente hacia la red incluso sin haber quebrado la línea rival. Con globo profundo intenta atacar aunque devuelvan smash.",
                4: "Después de globos o rasantes avanza hacia Zona II tratando de ganar la red.",
                3: "Luego de impactar (rasante o globo) avanza verticalmente hacia Zona I para ganar el punto.",
                2: "Gran habilidad para llegar a Zona I después del golpe, ganando la red y cerrando laterales."
              }
            }
          ]
        },
        parII: {
          nombre: "Par II – Movimientos de Reposicionamiento (Salida de Pared)",
          lugarEjecucion: "El rival sale de pared entre ZONA III y comienzo de ZONA II; el observado en ZONA I",
          cuantificadores: [
            {
              id: "reposicionamiento",
              nombre: "Lectura y reacción",
              descripcion: "Cómo se reposiciona ante la salida de pared rival (globo, rasante, aflojada).",
              categorias: {
                7: "No lee: ante globo comienza movimiento después del impacto (facilita que lo pasen). Ante rasante, no tiene buen cierre. Si lo angulan a dos paredes, se encima.",
                6: "Llega parado pero sin buena lectura. Globo: intenta smash salvo los profundos. Rasante fuerte: cierre deficiente. Aflojada: llega exigido porque se mueve tarde.",
                5: "Lee el golpe: se posiciona sobre línea ZONA I/II. Ante globo retrocede antes; ante aflojada se desplaza horizontal; ante rasante da paso adelante. Si lo quiebran, sale de pared.",
                4: "Reposiciona tardíamente. Movimientos horizontales tardíos; globo: smash si no lo supera. Si lo pasan, sale de pared.",
                3: "Buena lectura y movimientos: buen cierre. Ante globo retrocede para smash; ante rasante volea avanzando. Si es pasado, sale jugando a costados.",
                2: "Excelente lectura: posicionado en línea ZONA I/II. Ante globo retrocede anticipadamente (muy difícil pasarlo). Ante aflojada se desplaza horizontal y vertical para impactar. Ante rasante da paso adelante para definir. Siempre anticipa para resolver."
              }
            }
          ]
        },
        parIIprima: {
          nombre: "Par II' – Alternativas de Devolución (Salida de Pared)",
          lugarEjecucion: "Misma situación",
          cuantificadores: [
            {
              id: "devolucion",
              nombre: "Elección de devolución",
              descripcion: "Qué prefiere hacer ante una salida de pared rival.",
              categorias: {
                7: "Intenta volear pero con mal cierre; si no, sale de pared. Globo: prefiere smash pero si está complicado deja pasar.",
                6: "A toda costa intenta volear si es rasante, smash si es globo.",
                5: "Elige volear o smashar para mayor presión. Si lo superan, sale de pared.",
                4: "Intenta volear la rasante; globo: smash si no lo supera, si lo supera sale de pared. A veces prefiere dejar pasar por inseguridad.",
                3: "Devuelve volea avanzando ante rasante; globo: smash para no perder ataque. Si no, sale rasante a costados o medio.",
                2: "Siempre volea o smash. Si sale de pared, busca laterales o centro con globo profundo."
              }
            }
          ]
        }
      }
    }
  }
};

window.DATA = DATA;
