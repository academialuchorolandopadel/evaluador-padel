// ejercicios.js – Banco de ejercicios para todos los golpes y transiciones

var EJERCICIOS = {
  smash: {
    parI: {
      aptitud: {
        "7_6": { nombre: "Iniciación al efecto", series: 3, repeticiones: "10", descripcion: "Golpear smash intentando rozar la pelota para generar efecto.", criterioExito: "5 de 10 con efecto perceptible." },
        "6_5": { nombre: "Efecto consistente", series: 3, repeticiones: "12", descripcion: "Smash con efecto desde mitad Zona II, variando drive/revés.", criterioExito: "8 de 12 con efecto controlado." },
        "5_4": { nombre: "Efecto siempre del mismo lado", series: 4, repeticiones: "10", descripcion: "Fijar un lado y ejecutar smash con efecto, luego cambiar.", criterioExito: "9 de 10 mantienen efecto y dirección." },
        "4_3": { nombre: "Efecto en ambos lados", series: 4, repeticiones: "8", descripcion: "Alternar smash con efecto a zonas marcadas.", criterioExito: "7 de 8 en cada zona." },
        "3_2": { nombre: "Maestría con efecto", series: 5, repeticiones: "10", descripcion: "Smash con efecto desde Zona II y III, ángulos extremos.", criterioExito: "9 de 10 en zona objetivo." }
      },
      direccionamiento: {
        "7_6": { nombre: "Buscar dos paredes", series: 3, repeticiones: "10", descripcion: "Intentar que el smash toque pared lateral y de fondo.", criterioExito: "4 de 10 tocan ambas." },
        "6_5": { nombre: "Precisión a dos paredes", series: 3, repeticiones: "8", descripcion: "Smash dirigido a dos paredes con intención.", criterioExito: "6 de 8." },
        "5_4": { nombre: "Elegir paredes", series: 4, repeticiones: "10", descripcion: "Decidir antes de golpear a qué pared pegar primero.", criterioExito: "8 de 10 aciertan la secuencia." },
        "4_3": { nombre: "Direccionamiento avanzado", series: 4, repeticiones: "8", descripcion: "Dirigir a alambres y sacar la pelota.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Direccionamiento total", series: 5, repeticiones: "10", descripcion: "Smash a cualquier zona del campo rival.", criterioExito: "9 de 10 en zona deseada." }
      },
      velocidad: {
        "7_6": { nombre: "Variar potencia", series: 3, repeticiones: "10", descripcion: "Alternar smash fuerte y suave.", criterioExito: "Diferenciar claramente." },
        "6_5": { nombre: "Cambio por tipo de golpe", series: 3, repeticiones: "12", descripcion: "Usar efecto para lentos y plano para rápidos.", criterioExito: "8 de 12 correctos." },
        "5_4": { nombre: "Control de impulso", series: 4, repeticiones: "10", descripcion: "Tres velocidades diferentes a voluntad.", criterioExito: "7 de 10 en la velocidad pedida." },
        "4_3": { nombre: "Cambio táctico", series: 4, repeticiones: "8", descripcion: "Rápido al cuerpo, lento a costados.", criterioExito: "6 de 8 según plan." },
        "3_2": { nombre: "Estrategia de velocidad", series: 5, repeticiones: "10", descripcion: "Alternar velocidades buscando traerla.", criterioExito: "9 de 10 efectivos." }
      },
      continuidad: {
        "7_6": { nombre: "Reducir errores", series: 4, repeticiones: "8", descripcion: "Ejecutar smash sin fallar; si falla, reiniciar conteo.", criterioExito: "Completar 2 series sin error." },
        "6_5": { nombre: "Consistencia en definición", series: 4, repeticiones: "10", descripcion: "Smash de definición sin errores no forzados.", criterioExito: "8 de 10 buenos." },
        "5_4": { nombre: "Seguridad en el golpe", series: 4, repeticiones: "12", descripcion: "Si no es clara, jugar tranquilo; definir seguro.", criterioExito: "10 de 12 sin error." },
        "4_3": { nombre: "Confiabilidad alta", series: 5, repeticiones: "12", descripcion: "Solo un error por serie.", criterioExito: "Máximo 1 error." },
        "3_2": { nombre: "Excelencia continua", series: 5, repeticiones: "15", descripcion: "Smash sostenido con mínimo error.", criterioExito: "1 error cada 15." }
      }
    },
    parIprima: {
      desplazamiento: {
        "7_6": { nombre: "Reacción post-smash", series: 4, repeticiones: "6", descripcion: "Después de smash, moverse hacia adelante.", criterioExito: "Llegar a Zona I en 4 de 6." },
        "6_5": { nombre: "Cierre de red", series: 4, repeticiones: "8", descripcion: "Avanzar a Zona I con pasos laterales.", criterioExito: "Cierre completo en 6 de 8." },
        "5_4": { nombre: "Cobertura eficiente", series: 4, repeticiones: "10", descripcion: "Llegar a red y cubrir ángulo.", criterioExito: "8 de 10." },
        "4_3": { nombre: "Transición rápida", series: 5, repeticiones: "8", descripcion: "Desde smash a posición de volea.", criterioExito: "7 de 8." },
        "3_2": { nombre: "Dominio del cierre", series: 5, repeticiones: "10", descripcion: "Cierre perfecto con lectura de respuesta.", criterioExito: "9 de 10." }
      }
    },
    parII: {
      reposicionamiento: {
        "7_6": { nombre: "Lectura inicial", series: 4, repeticiones: "8", descripcion: "Identificar trayectoria tras smash rival.", criterioExito: "5 de 8 correctas." },
        "6_5": { nombre: "Anticipación", series: 4, repeticiones: "10", descripcion: "Moverse antes del impacto rival.", criterioExito: "7 de 10." },
        "5_4": { nombre: "Esconder golpe", series: 4, repeticiones: "8", descripcion: "Ocultar intención y llegar a todas.", criterioExito: "6 de 8." },
        "4_3": { nombre: "Contraataque", series: 5, repeticiones: "10", descripcion: "Volear el smash rival.", criterioExito: "8 de 10." },
        "3_2": { nombre: "Lectura total", series: 5, repeticiones: "12", descripcion: "Anticipar y definir con volea.", criterioExito: "10 de 12." }
      }
    },
    parIIprima: {
      devolucion: {
        "7_6": { nombre: "Opción de bajar", series: 3, repeticiones: "10", descripcion: "Intentar bajar la pelota después del pique.", criterioExito: "5 de 10." },
        "6_5": { nombre: "Bloqueo de smash", series: 4, repeticiones: "8", descripcion: "Bloquear el smash rival.", criterioExito: "6 de 8." },
        "5_4": { nombre: "Volea de smash", series: 4, repeticiones: "10", descripcion: "Volear el smash contrario.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Contraataque volea", series: 5, repeticiones: "8", descripcion: "Volear con profundidad.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Volea ofensiva", series: 5, repeticiones: "10", descripcion: "Volear y sacar de la cancha.", criterioExito: "8 de 10." }
      }
    }
  },
  volea: {
    parI: {
      aptitud: {
        "7_6": { nombre: "Volea de bloqueo mejorado", series: 3, repeticiones: "10", descripcion: "Practicar bloqueo sólido de drive y revés.", criterioExito: "7 de 10 bloqueos firmes." },
        "6_5": { nombre: "Volea con slice", series: 3, repeticiones: "12", descripcion: "Impactar con slice tanto de drive como revés.", criterioExito: "8 de 12 con slice controlado." },
        "5_4": { nombre: "Globo de volea de ataque", series: 4, repeticiones: "10", descripcion: "Globo de volea con intención ofensiva.", criterioExito: "7 de 10 globos profundos." },
        "4_3": { nombre: "Volea alta con slice", series: 4, repeticiones: "8", descripcion: "Volea alta con mucho slice a los ángulos.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Volea total", series: 5, repeticiones: "10", descripcion: "Alternar bloqueos, slice y drops.", criterioExito: "9 de 10 ejecuciones correctas." }
      },
      direccionamiento: {
        "7_6": { nombre: "Dirigir volea", series: 3, repeticiones: "10", descripcion: "Intentar llevar la volea a zonas laterales.", criterioExito: "5 de 10 a zona deseada." },
        "6_5": { nombre: "Volea a los alambres", series: 3, repeticiones: "8", descripcion: "Buscar alambres laterales.", criterioExito: "6 de 8." },
        "5_4": { nombre: "Angular volea", series: 4, repeticiones: "10", descripcion: "Volea angulada y profunda.", criterioExito: "8 de 10." },
        "4_3": { nombre: "Volea al medio y cruzar", series: 4, repeticiones: "8", descripcion: "Alternar medio y cruzado.", criterioExito: "7 de 8." },
        "3_2": { nombre: "Direccionamiento completo", series: 5, repeticiones: "10", descripcion: "Cualquier dirección con igual maestría.", criterioExito: "9 de 10." }
      },
      velocidad: {
        "7_6": { nombre: "Cambio básico de ritmo", series: 3, repeticiones: "10", descripcion: "Alternar volea rápida y lenta.", criterioExito: "Perceptible cambio." },
        "6_5": { nombre: "Volea cortada", series: 3, repeticiones: "12", descripcion: "Dejar pelota muerta al lado de la red.", criterioExito: "8 de 12." },
        "5_4": { nombre: "Volea profunda y corta", series: 4, repeticiones: "10", descripcion: "Combinar profundidad con toques cortos.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Cambio táctico", series: 4, repeticiones: "8", descripcion: "Usar velocidad para descolocar.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Dominio de velocidades", series: 5, repeticiones: "10", descripcion: "Alternar velocidades con precisión.", criterioExito: "9 de 10." }
      },
      profundidad: {
        "7_6": { nombre: "Buscar profundidad", series: 3, repeticiones: "10", descripcion: "Intentar que la volea pique en Zona III.", criterioExito: "4 de 10." },
        "6_5": { nombre: "Profundidad constante", series: 3, repeticiones: "12", descripcion: "Mantener la pelota profunda.", criterioExito: "8 de 12." },
        "5_4": { nombre: "Profundidad alta", series: 4, repeticiones: "10", descripcion: "Lograr piques en Zona III.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Profundidad y precisión", series: 4, repeticiones: "8", descripcion: "Profundo y a los costados.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Profundidad total", series: 5, repeticiones: "10", descripcion: "Máximo una volea corta por serie.", criterioExito: "9 de 10 profundas." }
      }
    },
    parIprima: {
      desplazamiento: {
        "7_6": { nombre: "Mantener posición", series: 4, repeticiones: "6", descripcion: "No retroceder después de volea corta.", criterioExito: "4 de 6." },
        "6_5": { nombre: "Cierre horizontal", series: 4, repeticiones: "8", descripcion: "Moverse lateralmente para cubrir ángulo.", criterioExito: "6 de 8." },
        "5_4": { nombre: "Red en ataque", series: 4, repeticiones: "10", descripcion: "Avanzar y cerrar red tras volea.", criterioExito: "8 de 10." },
        "4_3": { nombre: "Duelo de voleas", series: 5, repeticiones: "8", descripcion: "Mantener posición en intercambio.", criterioExito: "7 de 8." },
        "3_2": { nombre: "Dominio de red", series: 5, repeticiones: "10", descripcion: "Imposible de superar con rasantes.", criterioExito: "9 de 10." }
      }
    },
    parII: {
      reposicionamiento: {
        "7_6": { nombre: "Lectura de volea rival", series: 4, repeticiones: "8", descripcion: "Reaccionar a tiempo.", criterioExito: "5 de 8." },
        "6_5": { nombre: "Salir de paredes", series: 4, repeticiones: "10", descripcion: "Manejar dos paredes.", criterioExito: "7 de 10." },
        "5_4": { nombre: "Ataque tras defensa", series: 4, repeticiones: "8", descripcion: "Pegar de fondo en ataque.", criterioExito: "6 de 8." },
        "4_3": { nombre: "Sobrepique ofensivo", series: 5, repeticiones: "10", descripcion: "Usar sobrepique para ganar red.", criterioExito: "8 de 10." },
        "3_2": { nombre: "Contraataque perfecto", series: 5, repeticiones: "12", descripcion: "Siempre buscar red.", criterioExito: "10 de 12." }
      }
    },
    parIIprima: {
      devolucion: {
        "7_6": { nombre: "Opción correcta", series: 3, repeticiones: "10", descripcion: "Elegir entre pared o fondo.", criterioExito: "5 de 10." },
        "6_5": { nombre: "Presión con fondo", series: 4, repeticiones: "8", descripcion: "Pegar de fondo para presionar.", criterioExito: "6 de 8." },
        "5_4": { nombre: "Duelo de voleas", series: 4, repeticiones: "10", descripcion: "Mantener duelo.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Contraataque volea", series: 5, repeticiones: "8", descripcion: "Volear para tomar red.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Siempre presión", series: 5, repeticiones: "10", descripcion: "Opción más agresiva.", criterioExito: "8 de 10." }
      }
    }
  },
  pegadaFondo: {
    parI: {
      aptitud: {
        "7_6": { nombre: "Pegada con slice", series: 3, repeticiones: "10", descripcion: "Empezar a usar slice de drive.", criterioExito: "5 de 10." },
        "6_5": { nombre: "Slice y plano", series: 3, repeticiones: "12", descripcion: "Combinar ambos golpes.", criterioExito: "8 de 12." },
        "5_4": { nombre: "Globo y rasante", series: 4, repeticiones: "10", descripcion: "Variar altura.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Globo llovido", series: 4, repeticiones: "8", descripcion: "Globo sin rebote.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Pegada total", series: 5, repeticiones: "10", descripcion: "Combinar todo.", criterioExito: "9 de 10." }
      },
      direccionamiento: {
        "7_6": { nombre: "Dirigir paralelo", series: 3, repeticiones: "10", descripcion: "Buscar tiros paralelos.", criterioExito: "5 de 10." },
        "6_5": { nombre: "Cruzado y paralelo", series: 3, repeticiones: "12", descripcion: "Alternar direcciones.", criterioExito: "8 de 12." },
        "5_4": { nombre: "A los alambres", series: 4, repeticiones: "10", descripcion: "Buscar laterales.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Rasantes y profundos", series: 4, repeticiones: "8", descripcion: "Obligar a levantar.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Cualquier zona", series: 5, repeticiones: "10", descripcion: "Según convenga.", criterioExito: "9 de 10." }
      },
      velocidad: {
        "7_6": { nombre: "Cambio básico", series: 3, repeticiones: "10", descripcion: "Fuerte y suave.", criterioExito: "Perceptible." },
        "6_5": { nombre: "Aflojar pelota", series: 3, repeticiones: "12", descripcion: "Dejarla corta.", criterioExito: "8 de 12." },
        "5_4": { nombre: "Control total", series: 4, repeticiones: "10", descripcion: "Elegir potencia.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Cambio táctico", series: 4, repeticiones: "8", descripcion: "Variar según rival.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Estrategia de velocidad", series: 5, repeticiones: "10", descripcion: "Usar potencia para desequilibrar.", criterioExito: "9 de 10." }
      },
      error: {
        "7_6": { nombre: "Reducir errores no forzados", series: 4, repeticiones: "8", descripcion: "Minimizar fallos.", criterioExito: "Máximo 2 errores." },
        "6_5": { nombre: "Consistencia", series: 4, repeticiones: "10", descripcion: "Secuencia sin errores.", criterioExito: "8 de 10." },
        "5_4": { nombre: "Seguridad", series: 4, repeticiones: "12", descripcion: "Ajustar potencia.", criterioExito: "10 de 12." },
        "4_3": { nombre: "Alta fiabilidad", series: 5, repeticiones: "12", descripcion: "Mínimo error.", criterioExito: "1 error." },
        "3_2": { nombre: "Excelencia", series: 5, repeticiones: "15", descripcion: "Casi sin fallos.", criterioExito: "1 error cada 15." }
      }
    },
    parIprima: {
      desplazamiento: {
        "7_6": { nombre: "Avanzar tras golpe ganador", series: 4, repeticiones: "6", descripcion: "Subir a la red si la pelota pasa.", criterioExito: "4 de 6." },
        "6_5": { nombre: "Tomar red en ataque", series: 4, repeticiones: "8", descripcion: "Incluso sin pasar rival.", criterioExito: "6 de 8." },
        "5_4": { nombre: "Transición rápida", series: 4, repeticiones: "10", descripcion: "Defensa a ataque.", criterioExito: "8 de 10." },
        "4_3": { nombre: "Siempre hacia adelante", series: 5, repeticiones: "8", descripcion: "Buscar red.", criterioExito: "7 de 8." },
        "3_2": { nombre: "Presión constante", series: 5, repeticiones: "10", descripcion: "Nunca quedarse.", criterioExito: "9 de 10." }
      }
    },
    parII: {
      reposicionamiento: {
        "7_6": { nombre: "Leer globo rival", series: 4, repeticiones: "8", descripcion: "Anticipar globo.", criterioExito: "5 de 8." },
        "6_5": { nombre: "Retroceder a tiempo", series: 4, repeticiones: "10", descripcion: "Moverse antes del impacto.", criterioExito: "7 de 10." },
        "5_4": { nombre: "Cierre horizontal ante aflojada", series: 4, repeticiones: "8", descripcion: "Llegar armado.", criterioExito: "6 de 8." },
        "4_3": { nombre: "Volear rasante", series: 5, repeticiones: "10", descripcion: "Mantener red.", criterioExito: "8 de 10." },
        "3_2": { nombre: "Dominio defensivo", series: 5, repeticiones: "12", descripcion: "Imposible de pasar.", criterioExito: "10 de 12." }
      }
    },
    parIIprima: {
      devolucion: {
        "7_6": { nombre: "Salir de pared", series: 3, repeticiones: "10", descripcion: "Opción segura.", criterioExito: "5 de 10." },
        "6_5": { nombre: "Buscar volea", series: 4, repeticiones: "8", descripcion: "Atacar si es posible.", criterioExito: "6 de 8." },
        "5_4": { nombre: "Smash o volea", series: 4, repeticiones: "10", descripcion: "Elegir mejor opción.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Contraataque", series: 5, repeticiones: "8", descripcion: "No perder red.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Definir punto", series: 5, repeticiones: "10", descripcion: "Siempre ofensivo.", criterioExito: "8 de 10." }
      }
    }
  },
  salidaPared: {
    parI: {
      aptitud: {
        "7_6": { nombre: "Salida con globo", series: 3, repeticiones: "10", descripcion: "Levantar consistentemente.", criterioExito: "5 de 10." },
        "6_5": { nombre: "Salida con slice", series: 3, repeticiones: "12", descripcion: "Agregar efecto.", criterioExito: "8 de 12." },
        "5_4": { nombre: "Rasante y slice", series: 4, repeticiones: "10", descripcion: "Variar salida.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Salida de revés", series: 4, repeticiones: "8", descripcion: "Dominar ambos lados.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Salida perfecta", series: 5, repeticiones: "10", descripcion: "Cualquier tipo.", criterioExito: "9 de 10." }
      },
      direccionamiento: {
        "7_6": { nombre: "Buscar medio", series: 3, repeticiones: "10", descripcion: "Dirigir salida.", criterioExito: "5 de 10." },
        "6_5": { nombre: "Cambiar dirección", series: 3, repeticiones: "12", descripcion: "Salida cruzada.", criterioExito: "8 de 12." },
        "5_4": { nombre: "A los alambres", series: 4, repeticiones: "10", descripcion: "Buscar laterales.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Salida angulada", series: 4, repeticiones: "8", descripcion: "Ángulos difíciles.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Cualquier zona", series: 5, repeticiones: "10", descripcion: "Según conveniencia.", criterioExito: "9 de 10." }
      },
      velocidad: {
        "7_6": { nombre: "Cambio de ritmo", series: 3, repeticiones: "10", descripcion: "Alternar potencias.", criterioExito: "Diferenciar." },
        "6_5": { nombre: "Aflojar salida", series: 3, repeticiones: "12", descripcion: "Dejarla corta.", criterioExito: "8 de 12." },
        "5_4": { nombre: "Control de velocidad", series: 4, repeticiones: "10", descripcion: "Elegir intensidad.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Variar según rival", series: 4, repeticiones: "8", descripcion: "Uso táctico.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Dominio total", series: 5, repeticiones: "10", descripcion: "Cualquier velocidad.", criterioExito: "9 de 10." }
      },
      levantadas: {
        "7_6": { nombre: "Levantar pelotas bajas", series: 4, repeticiones: "8", descripcion: "Desde cerca del piso.", criterioExito: "4 de 8." },
        "6_5": { nombre: "Levantar con globo", series: 4, repeticiones: "10", descripcion: "Pelotas difíciles.", criterioExito: "7 de 10." },
        "5_4": { nombre: "Levantar con slice", series: 4, repeticiones: "12", descripcion: "Rasante o globo.", criterioExito: "9 de 12." },
        "4_3": { nombre: "Levantar a los costados", series: 5, repeticiones: "10", descripcion: "Con dirección.", criterioExito: "8 de 10." },
        "3_2": { nombre: "Levantar sin esfuerzo", series: 5, repeticiones: "12", descripcion: "Casi sin errores.", criterioExito: "10 de 12." }
      }
    },
    parIprima: {
      desplazamiento: {
        "7_6": { nombre: "Avanzar tras globo", series: 4, repeticiones: "6", descripcion: "Si el globo pasa.", criterioExito: "4 de 6." },
        "6_5": { nombre: "Subir a la red", series: 4, repeticiones: "8", descripcion: "Aunque no pasen.", criterioExito: "6 de 8." },
        "5_4": { nombre: "Ataque tras salida", series: 4, repeticiones: "10", descripcion: "Siempre hacia delante.", criterioExito: "8 de 10." },
        "4_3": { nombre: "Transición rápida", series: 5, repeticiones: "8", descripcion: "Defensa a ataque.", criterioExito: "7 de 8." },
        "3_2": { nombre: "Cierre de red", series: 5, repeticiones: "10", descripcion: "Ganar red siempre.", criterioExito: "9 de 10." }
      }
    },
    parII: {
      reposicionamiento: {
        "7_6": { nombre: "Leer salida rival", series: 4, repeticiones: "8", descripcion: "Anticipar.", criterioExito: "5 de 8." },
        "6_5": { nombre: "Posición en Zona I/II", series: 4, repeticiones: "10", descripcion: "Buena ubicación.", criterioExito: "7 de 10." },
        "5_4": { nombre: "Cierre ante globo", series: 4, repeticiones: "8", descripcion: "Retroceder a tiempo.", criterioExito: "6 de 8." },
        "4_3": { nombre: "Volear salida", series: 5, repeticiones: "10", descripcion: "Adelantarse.", criterioExito: "8 de 10." },
        "3_2": { nombre: "Lectura perfecta", series: 5, repeticiones: "12", descripcion: "Siempre anticipa.", criterioExito: "10 de 12." }
      }
    },
    parIIprima: {
      devolucion: {
        "7_6": { nombre: "Elegir volea o smash", series: 3, repeticiones: "10", descripcion: "Decidir rápido.", criterioExito: "5 de 10." },
        "6_5": { nombre: "Volear si es rasante", series: 4, repeticiones: "8", descripcion: "Atacar.", criterioExito: "6 de 8." },
        "5_4": { nombre: "Smash si es globo", series: 4, repeticiones: "10", descripcion: "No dejar picar.", criterioExito: "7 de 10." },
        "4_3": { nombre: "Contraataque", series: 5, repeticiones: "8", descripcion: "Definir punto.", criterioExito: "6 de 8." },
        "3_2": { nombre: "Presión total", series: 5, repeticiones: "10", descripcion: "Siempre ofensivo.", criterioExito: "8 de 10." }
      }
    }
  }
};

window.EJERCICIOS = EJERCICIOS;
