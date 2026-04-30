// data.js
// Base de conocimiento extraída del "Método Sistemático de Categorización"
// Colegio de Fiscales F.A.P. (2010)

const PARES_SMASH = {
  parI: {
    nombre: "Par I - Golpe-Impacto Smash",
    lugarEjecucion: "Mitad de ZONA II",
    cuantificadores: [
      {
        id: "aptitud",
        nombre: "Aptitud del golpe-impacto",
        descripcion: "Cómo impacta la pelota el jugador al ejecutar el smash.",
        categorias: {
          7: "Pega plano, muy ocasionalmente puede pegar con sidespin, más por defecto que por efectividad.",
          6: "Pega con sidespin además de pegar plano.",
          5: "Impacta plano y con sidespin de un lado, pudiendo eventualmente buscar el efecto de sidespin contrario (resultado incierto).",
          4: "Pega con sidespin siempre del mismo lado, y también lo hace plano.",
          3: "Impacta el golpe plano y con sidespin, logrando con mucha eficiencia el resultado buscado.",
          2: "Pega plano y con sidespin indistintamente de ambos lados y con gran maestría. Pega tanto de Zona II como de Zona III con los mismos resultados."
        }
      },
      {
        id: "direccionamiento",
        nombre: "Capacidad de direccionamiento",
        descripcion: "Capacidad de elegir a voluntad dónde picará la pelota en el campo rival.",
        categorias: {
          7: "No dirige volitivamente a dos paredes ni tampoco a pared de fondo.",
          6: "Intenta buscar dos paredes tanto con sidespin como plano (no lográndolo en un alto porcentaje). Intenta traerla por pared de fondo (bajo porcentaje).",
          5: "Busca las dos paredes. Dirige los golpes a los alambres e intenta sacarla de la cancha sin buenos resultados.",
          4: "Conscientemente busca las paredes eligiendo según su conveniencia. Intenta sacar la pelota. Con sidespin busca las dos paredes.",
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
          6: "Cambia la velocidad solo por el tipo de golpe (sidespin más lento que el plano). No siempre acierta la elección.",
          5: "Logra hacer variación de velocidad (con limitaciones) tanto con sidespin como pegando plano.",
          4: "Cambia la velocidad por tipo de golpe (sidespin más lento) y cambia el impulso si quiere hacer retornar la pelota (plano).",
          3: "Cambia las velocidades indistintamente por golpe o por impulso, tanto plano como con sidespin.",
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
  // Aquí se agregarán después: parIprima, parII, parIIprima
};

// Hacerla accesible globalmente
window.DATA = {
  PARES_SMASH
};
