const EJERCICIOS = {
  smash: {
    parI: {
      aptitud: {
        "7_6": { nombre:"Iniciación al efecto en smash", series:3, repeticiones:"10", descripcion:"Golpear smash intentando rozar la pelota para generar efecto, alternando derecha e izquierda.", criterioExito:"5 de 10 con efecto perceptible." },
        "6_5": { nombre:"Efecto consistente en ambos lados", series:3, repeticiones:"12", descripcion:"Ejecutar smash con efecto desde mitad Zona II, variando entre drive y revés.", criterioExito:"8 de 12 con efecto controlado." },
        "5_4": { nombre:"Smash con efecto siempre del mismo lado", series:4, repeticiones:"10", descripcion:"Elegir un lado y realizar todos los smash con efecto hacia ese lado, luego cambiar.", criterioExito:"9 de 10 mantienen el efecto y dirección." },
        "4_3": { nombre:"Efecto en ambos lados con precisión", series:4, repeticiones:"8", descripcion:"Alternar smash con efecto a zonas marcadas en ambas esquinas.", criterioExito:"7 de 8 en cada zona." },
        "3_2": { nombre:"Maestría con efecto", series:5, repeticiones:"10", descripcion:"Smash con efecto desde Zona II y Zona III, buscando ángulos extremos.", criterioExito:"9 de 10 en zona objetivo." }
      },
      direccionamiento: {
        "7_6": { nombre:"Búsqueda de dos paredes", series:3, repeticiones:"10", descripcion:"Intentar que el smash toque pared lateral y de fondo.", criterioExito:"4 de 10 logran tocar ambas." },
        "6_5": { nombre:"Precisión a dos paredes", series:3, repeticiones:"8", descripcion:"Smash dirigido a las dos paredes con intención.", criterioExito:"6 de 8." },
        "5_4": { nombre:"Elección de paredes", series:4, repeticiones:"10", descripcion:"Decidir antes de golpear a qué pared pegar primero.", criterioExito:"8 de 10 aciertan la secuencia." },
        "4_3": { nombre:"Direccionamiento avanzado", series:4, repeticiones:"8", descripcion:"Dirigir el smash a los alambres y sacar la pelota.", criterioExito:"6 de 8." },
        "3_2": { nombre:"Direccionamiento total", series:5, repeticiones:"10", descripcion:"Smash a cualquier zona del campo rival, incluyendo el cuerpo.", criterioExito:"9 de 10 en zona deseada." }
      },
      velocidad: {
        "7_6": { nombre:"Variación básica de potencia", series:3, repeticiones:"10", descripcion:"Alternar smash fuerte y suave.", criterioExito:"Diferenciar claramente." },
        "6_5": { nombre:"Cambio por tipo de golpe", series:3, repeticiones:"12", descripcion:"Usar efecto para lentos y plano para rápidos.", criterioExito:"8 de 12 correctos." },
        "5_4": { nombre:"Control de impulso", series:4, repeticiones:"10", descripcion:"Golpear con tres velocidades diferentes a voluntad.", criterioExito:"7 de 10 en la velocidad pedida." },
        "4_3": { nombre:"Cambio táctico", series:4, repeticiones:"8", descripcion:"Smash rápido al cuerpo, lento a los costados.", criterioExito:"6 de 8 según plan." },
        "3_2": { nombre:"Estrategia de velocidad", series:5, repeticiones:"10", descripcion:"Alternar velocidades buscando 'traerla' de cerca de Zona III.", criterioExito:"9 de 10 efectivos." }
      },
      continuidad: {
        "7_6": { nombre:"Reducir errores", series:4, repeticiones:"8", descripcion:"Ejecutar smash sin fallar; si falla, reiniciar conteo.", criterioExito:"Completar 2 series sin error." },
        "6_5": { nombre:"Consistencia en definición", series:4, repeticiones:"10", descripcion:"Smash de definición sin errores no forzados.", criterioExito:"8 de 10 buenos." },
        "5_4": { nombre:"Seguridad en el golpe", series:4, repeticiones:"12", descripcion:"Si no es clara, jugar tranquilo; solo definir cuando sea seguro.", criterioExito:"10 de 12 sin error." },
        "4_3": { nombre:"Confiabilidad alta", series:5, repeticiones:"12", descripcion:"Solo se permite un error por serie.", criterioExito:"Máximo 1 error." },
        "3_2": { nombre:"Excelencia continua", series:5, repeticiones:"15", descripcion:"Smash sostenido con mínimo margen de error.", criterioExito:"1 error cada 15." }
      }
    },
    parIprima: {
      desplazamiento: {
        "7_6": { nombre:"Reacción post-smash", series:4, repeticiones:"6", descripcion:"Después de smash, moverse inmediatamente hacia adelante.", criterioExito:"Llegar a Zona I en 4 de 6." },
        "6_5": { nombre:"Cierre de red", series:4, repeticiones:"8", descripcion:"Avanzar a Zona I con pasos laterales.", criterioExito:"Cierre completo en 6 de 8." },
        "5_4": { nombre:"Cobertura eficiente", series:4, repeticiones:"10", descripcion:"Llegar a red y cubrir ángulo.", criterioExito:"8 de 10." },
        "4_3": { nombre:"Transición rápida", series:5, repeticiones:"8", descripcion:"Desde smash a posición de volea en Zona I.", criterioExito:"7 de 8." },
        "3_2": { nombre:"Dominio del cierre", series:5, repeticiones:"10", descripcion:"Cierre perfecto con lectura de respuesta rival.", criterioExito:"9 de 10." }
      }
    },
    parII: {
      reposicionamiento: {
        "7_6": { nombre:"Lectura inicial", series:4, repeticiones:"8", descripcion:"Identificar trayectoria tras smash rival.", criterioExito:"5 de 8 correctas." },
        "6_5": { nombre:"Anticipación", series:4, repeticiones:"10", descripcion:"Moverse antes del impacto rival.", criterioExito:"7 de 10." },
        "5_4": { nombre:"Esconder golpe", series:4, repeticiones:"8", descripcion:"Ocultar intención y llegar a todas.", criterioExito:"6 de 8." },
        "4_3": { nombre:"Contraataque", series:5, repeticiones:"10", descripcion:"Volear el smash rival.", criterioExito:"8 de 10." },
        "3_2": { nombre:"Lectura total", series:5, repeticiones:"12", descripcion:"Anticipar y definir con volea.", criterioExito:"10 de 12." }
      }
    },
    parIIprima: {
      devolucion: {
        "7_6": { nombre:"Opción de bajar", series:3, repeticiones:"10", descripcion:"Intentar bajar la pelota después del pique.", criterioExito:"5 de 10." },
        "6_5": { nombre:"Bloqueo de smash", series:4, repeticiones:"8", descripcion:"Bloquear el smash rival.", criterioExito:"6 de 8." },
        "5_4": { nombre:"Volea de smash", series:4, repeticiones:"10", descripcion:"Volear el smash contrario.", criterioExito:"7 de 10." },
        "4_3": { nombre:"Contraataque volea", series:5, repeticiones:"8", descripcion:"Volear con profundidad.", criterioExito:"6 de 8." },
        "3_2": { nombre:"Volea ofensiva", series:5, repeticiones:"10", descripcion:"Volear y sacar de la cancha.", criterioExito:"8 de 10." }
      }
    }
  },
  volea: { /* estructura similar, con ejercicios para cada transición */ },
  pegadaFondo: { /* ... */ },
  salidaPared: { /* ... */ }
};

window.EJERCICIOS = EJERCICIOS;
