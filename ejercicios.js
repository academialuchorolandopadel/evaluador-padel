// ==================== EJERCICIOS.JS ====================
// Banco de ejercicios genéricos para todas las transiciones de categoría

const EJERCICIOS = {};

// Función auxiliar para rellenar ejercicios genéricos en todos los pares y transiciones
function generarEjercicios(golpe, paresCuant) {
  EJERCICIOS[golpe] = {};
  for (const [parKey, cuantificadores] of Object.entries(paresCuant)) {
    EJERCICIOS[golpe][parKey] = {};
    for (const cuant of cuantificadores) {
      EJERCICIOS[golpe][parKey][cuant.id] = {};
      for (let cat = 7; cat > 1; cat--) {
        const transicion = `${cat}_${cat-1}`;
        EJERCICIOS[golpe][parKey][cuant.id][transicion] = {
          nombre: `Ejercicio genérico para ${cuant.nombre} (${cat}ª → ${cat-1}ª)`,
          series: 3,
          repeticiones: "10",
          descripcion: `Practicar ${cuant.nombre.toLowerCase()} del golpe ${golpe} con foco en mejorar de ${cat}ª a ${cat-1}ª categoría.`,
          criterioExito: `Completar 7 de 10 repeticiones correctamente.`
        };
      }
    }
  }
}

// Smash
generarEjercicios('smash', {
  parI: [
    { id: 'aptitud' }, { id: 'direccionamiento' }, { id: 'velocidad' }, { id: 'continuidad' }
  ],
  parIprima: [
    { id: 'desplazamiento' }
  ],
  parII: [
    { id: 'reposicionamiento' }
  ],
  parIIprima: [
    { id: 'devolucion' }
  ]
});

// Volea
generarEjercicios('volea', {
  parI: [
    { id: 'aptitud' }, { id: 'direccionamiento' }, { id: 'velocidad' }, { id: 'profundidad' }
  ],
  parIprima: [
    { id: 'desplazamiento' }
  ],
  parII: [
    { id: 'reposicionamiento' }
  ],
  parIIprima: [
    { id: 'devolucion' }
  ]
});

// Pegada de fondo
generarEjercicios('pegadaFondo', {
  parI: [
    { id: 'aptitud' }, { id: 'direccionamiento' }, { id: 'velocidad' }, { id: 'error' }
  ],
  parIprima: [
    { id: 'desplazamiento' }
  ],
  parII: [
    { id: 'reposicionamiento' }
  ],
  parIIprima: [
    { id: 'devolucion' }
  ]
});

// Salida de pared
generarEjercicios('salidaPared', {
  parI: [
    { id: 'aptitud' }, { id: 'direccionamiento' }, { id: 'velocidad' }, { id: 'levantadas' }
  ],
  parIprima: [
    { id: 'desplazamiento' }
  ],
  parII: [
    { id: 'reposicionamiento' }
  ],
  parIIprima: [
    { id: 'devolucion' }
  ]
});

window.EJERCICIOS = EJERCICIOS;
