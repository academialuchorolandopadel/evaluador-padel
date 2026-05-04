const EJERCICIOS = {
  smash: {
    parI: {
      aptitud: {
        "5_4": {
          nombre: "Smash con efecto por ambos lados",
          descripcion: "Desde mitad de Zona II, ejecutar smash con efecto tanto de derecha como de revés, buscando que la pelota pegue en ambas paredes laterales.",
          series: 3,
          repeticiones: "12 por lado",
          criterioExito: "Al menos 9 de 12 repeticiones logran el efecto deseado y entran en la zona de dos paredes.",
          material: "Conos para marcar zona de dos paredes"
        },
        "4_3": {
          nombre: "Smash con efecto en ambas direcciones",
          descripcion: "Golpear smash con efecto hacia la derecha y hacia la izquierda de forma alternada, variando la dirección a voluntad.",
          series: 4,
          repeticiones: "10 alternados",
          criterioExito: "8 de 10 golpes cambian la dirección correctamente y quedan dentro de los alambres.",
          material: "Dos zonas marcadas en las esquinas"
        },
        // ... más transiciones
      },
      direccionamiento: {
        "5_4": {
          nombre: "Búsqueda consciente de dos paredes",
          descripcion: "Practicar smash dirigido a las dos paredes, eligiendo previamente a cuál pegar primero. Usar referencias visuales.",
          series: 4,
          repeticiones: "8 por lado",
          criterioExito: "7 de 8 golpes logran el objetivo de tocar ambas paredes en el orden elegido.",
          material: "Marcas en las paredes"
        }
        // ... otras transiciones
      },
      velocidad: { /* ... */ },
      continuidad: {
        "4_3": {
          nombre: "Ritmo constante de smash",
          descripcion: "Ejecutar 15 smash consecutivos con efecto, manteniendo profundidad y dirección. El compañero devuelve de globo.",
          series: 3,
          repeticiones: "15",
          criterioExito: "No fallar más de 1 por serie.",
          material: "Compañero para lanzar globos"
        }
      }
    },
    parIprima: {
      desplazamiento: {
        "5_4": {
          nombre: "Cierre de red post-smash",
          descripcion: "Después de cada smash, avanzar rápidamente hasta la Zona I y cerrar la red con pasos laterales. Simular respuesta rival.",
          series: 4,
          repeticiones: "6",
          criterioExito: "Llegar a Zona I antes de que la pelota hipotética cruce la red.",
          material: "Entrenador o señal para inicio"
        }
      }
    },
    // ... parII, parIIprima similares
  },
  volea: {
    // misma estructura
  },
  pegadaFondo: {
    // ...
  },
  salidaPared: {
    // ...
  }
};

window.EJERCICIOS = EJERCICIOS;
