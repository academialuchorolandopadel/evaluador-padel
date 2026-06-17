// ====================================================================
// manual.js — Manual del Método (contenido de referencia)
// Academia Lucho Rolando
//
// Contiene TODO el contenido del Manual, separado de app.js para poder
// editarlo y ampliarlo sin tocar la lógica de la aplicación.
//
// Dos grandes bloques:
//   1) Sistema de Categorización (4 golpes, cuantificadores, categorías)
//   2) Sistema D.I.E. (Decisión · Intención · Ejecución)
//
// Expone: window.prepararVistaManual()
// ====================================================================

(function () {

  // === FIX: se escribe el contenido PRIMERO y se marca la bandera DESPUÉS,
  // para que el manual nunca pueda quedar vacío por una marca prematura. ===
  function prepararVistaManual() {
    const container = document.getElementById('manualView');
    if (!container) return;
    if (window.manualGenerado === true) return;

    container.innerHTML = construirManualHTML();
    window.manualGenerado = true;
  }

  function construirManualHTML() {
    return `
      <div class="manual-wrapper">

        <div class="manual-hero">
          <h1>📘 Manual del Método</h1>
          <p class="manual-subtitulo">Academia Lucho Rolando — Sistema de categorización y lectura táctica del juego</p>
        </div>

        <!-- Navegación entre los dos bloques del manual -->
        <div class="manual-nav">
          <button class="manual-nav-btn active" onclick="mostrarBloqueManual('categorizacion', this)">📊 Categorización</button>
          <button class="manual-nav-btn" onclick="mostrarBloqueManual('die', this)">🎯 Sistema D.I.E.</button>
        </div>

        <!-- ============ BLOQUE 1: CATEGORIZACIÓN ============ -->
        <div id="manual-bloque-categorizacion" class="manual-bloque">
          ${construirBloqueCategorizacion()}
        </div>

        <!-- ============ BLOQUE 2: D.I.E. ============ -->
        <div id="manual-bloque-die" class="manual-bloque" style="display:none;">
          ${construirBloqueDie()}
        </div>

      </div>

      <style>${MANUAL_ESTILOS}</style>
    `;
  }


  // ====================================================================
  // CONTENIDO HTML (constantes inyectadas en construirManualHTML)
  // ====================================================================
  function construirBloqueCategorizacion() { return `        <div class="manual-seccion">
          <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
            <h2>📖 Introducción al Método</h2>
            <span class="toggle-icon">▼</span>
          </div>
          <div class="manual-seccion-body">
            <p>Este método tiene como única finalidad encontrar una forma objetiva de <strong>categorizar el nivel de juego</strong> de cualquier jugador de pádel, independientemente de comparaciones con otros jugadores o resultados de competencias.</p>
            <div class="manual-highlight">
              <strong>Principio clave:</strong> No existe un golpe de 5ª o de 3ª, sino una <em>forma característica de juego</em> de 5ª o 3ª. Por eso el sistema analiza los golpes junto con los desplazamientos asociados a ellos.
            </div>
            <h3>Métodos descartados</h3>
            <ul>
              <li><strong>Método Comparativo:</strong> Requiere jugadores "modelo" por categoría. Limitado geográficamente, subjetivo y pierde vigencia rápidamente en categorías bajas donde la evolución es veloz.</li>
              <li><strong>Método de Ascensos y Descensos:</strong> Solo apto para quienes compiten a nivel nacional con frecuencia. Excluye a la gran mayoría de jugadores.</li>
            </ul>
            <h3>¿Qué analiza este método?</h3>
            <p>Se identificaron <strong>4 golpes base</strong> que se ejecutan en cualquier partido, y para cada uno se definieron <strong>4 cuantificadores</strong> que permiten medir nivel de manera precisa y repetible:</p>
            <div class="manual-golpes-grid">
              <div class="manual-golpe-chip">🏐 Smash</div>
              <div class="manual-golpe-chip">🏸 Volea</div>
              <div class="manual-golpe-chip">🎯 Pegada de Fondo</div>
              <div class="manual-golpe-chip">🧱 Salida de Pared</div>
            </div>
          </div>
        </div>

        <div class="manual-seccion">
          <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
            <h2>📏 Los 4 Cuantificadores por Golpe</h2>
            <span class="toggle-icon">▼</span>
          </div>
          <div class="manual-seccion-body">
            <p>Para cada uno de los 4 golpes, se miden estas 4 dimensiones:</p>
            <div class="manual-cuant-grid">
              <div class="manual-cuant-card">
                <div class="cuant-numero">1</div>
                <h4>Aptitud de Golpe-Impacto</h4>
                <p>Capacidad para impactar la pelota y transferirle efectos (plano, sidespin, slice, topspin).</p>
              </div>
              <div class="manual-cuant-card">
                <div class="cuant-numero">2</div>
                <h4>Capacidad de Direccionamiento</h4>
                <p>Grado de exactitud con que el jugador puede elegir <em>conscientemente</em> el lugar de destino de la pelota.</p>
              </div>
              <div class="manual-cuant-card">
                <div class="cuant-numero">3</div>
                <h4>Cambios de Velocidad</h4>
                <p>Habilidad para cambiar voluntariamente la velocidad de la pelota, usando ese recurso a favor (estrategia del golpe).</p>
              </div>
              <div class="manual-cuant-card">
                <div class="cuant-numero">4</div>
                <h4>Factor Específico del Golpe</h4>
                <p>Varía según el golpe: <strong>Continuidad</strong> (Smash), <strong>Profundidad</strong> (Volea), <strong>Error</strong> (Pegada de Fondo), <strong>Levantadas</strong> (Salida de Pared).</p>
              </div>
            </div>
            <h3 style="margin-top:24px;">Zonas de la cancha</h3>
            <p>El método divide cada campo en 3 zonas para precisar las observaciones:</p>
            <div class="manual-zonas">
              <div class="zona zona-c"><strong>ZONA I</strong><br>1,5 m desde la red</div>
              <div class="zona zona-b"><strong>ZONA II</strong><br>5,5 m intermedios</div>
              <div class="zona zona-a"><strong>ZONA III</strong><br>3 m desde pared de fondo</div>
            </div>
          </div>
        </div>

        <div class="manual-seccion">
          <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
            <h2>⚙️ Los Pares y Posicionamientos</h2>
            <span class="toggle-icon">▼</span>
          </div>
          <div class="manual-seccion-body">
            <p>Un partido de pádel es una sucesión ininterrumpida de golpes y desplazamientos. Por eso el método evalúa cada golpe unido a sus movimientos asociados, en unidades que llama <strong>Pares</strong>:</p>
            <div class="manual-par-box">
              <div class="par-box-item">
                <span class="par-badge">PAR I</span>
                <h4>Golpe-Impacto + Desplazamiento de Posicionamiento</h4>
                <p>Asocia el golpe con los movimientos que el jugador hace <em>mientras la pelota viaja hacia el rival</em> (hasta que el rival la impacta). Evalúa técnica de golpe + inteligencia táctica de reubicación.</p>
              </div>
              <div class="par-box-item">
                <span class="par-badge">PAR II</span>
                <h4>Desplazamiento de Reposicionamiento + Golpe-Devolución</h4>
                <p>Evalúa los movimientos <em>desde que el rival impacta</em> hasta que nuestro jugador está en condiciones de pegar. Incluye la <strong>Lectura de Pelota</strong>: anticipar trayectoria, efectos y rebotes.</p>
              </div>
            </div>
            <div class="manual-highlight">
              <strong>Lectura de Pelota</strong> es el conocimiento que brinda la práctica y la concentración para presumir, <em>antes que el rival impulse la pelota</em>, dónde va a ir y qué recorrido va a describir considerando efectos, velocidad y rebotes en paredes.
            </div>
            <h3>Desplazamientos: dos dimensiones</h3>
            <ul>
              <li><strong>Verticales:</strong> Según el eje red-pared trasera. Hacia adelante (red) o hacia atrás (pared).</li>
              <li><strong>Horizontales:</strong> Paralelos a la red. Para cubrir los costados y cerrar la red.</li>
            </ul>
          </div>
        </div>

        <div class="manual-seccion">
          <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
            <h2>🏆 Categorías por Golpe</h2>
            <span class="toggle-icon">▼</span>
          </div>
          <div class="manual-seccion-body">
            <div class="manual-golpe-tabs">
              <button class="manual-golpe-tab active" onclick="mostrarGolpeManual('smash', this)">🏐 Smash</button>
              <button class="manual-golpe-tab" onclick="mostrarGolpeManual('volea', this)">🏸 Volea</button>
              <button class="manual-golpe-tab" onclick="mostrarGolpeManual('fondo', this)">🎯 Pegada de Fondo</button>
              <button class="manual-golpe-tab" onclick="mostrarGolpeManual('pared', this)">🧱 Salida de Pared</button>
            </div>
            <div id="manual-golpe-smash" class="manual-golpe-content active">
              ${generarCategoriaHTML('smash')}
            </div>
            <div id="manual-golpe-volea" class="manual-golpe-content" style="display:none;">
              ${generarCategoriaHTML('volea')}
            </div>
            <div id="manual-golpe-fondo" class="manual-golpe-content" style="display:none;">
              ${generarCategoriaHTML('fondo')}
            </div>
            <div id="manual-golpe-pared" class="manual-golpe-content" style="display:none;">
              ${generarCategoriaHTML('pared')}
            </div>
          </div>
        </div>

      </div>
`; }

  function construirBloqueDie() { return `      <!-- INTRO D.I.E. -->
      <div class="die-intro">
        <p>Cada golpe que ejecuta un jugador atraviesa tres filtros encadenados. Si cualquiera falla, el golpe se cae —por más bien que hayan salido los otros dos. Esa es la idea central del método: <strong>la cadena se corta por el eslabón más débil.</strong></p>
      </div>

      <!-- LOS TRES ESLABONES -->
      <div class="die-cadena">
        <div class="die-eslabon" style="--c:#2E6DA4;">
          <div class="die-letra">D</div>
          <div class="die-eslabon-txt">
            <h3>Decisión</h3>
            <p><em>Qué</em> golpe elijo hacer.</p>
            <p class="die-detalle">Depende de la lectura de la bola y de la capacidad del jugador. No tiene una sola respuesta correcta: se juzga contra lo que ese jugador podía ejecutar.</p>
          </div>
        </div>
        <div class="die-flecha">→</div>
        <div class="die-eslabon" style="--c:#C8963E;">
          <div class="die-letra">I</div>
          <div class="die-eslabon-txt">
            <h3>Intención</h3>
            <p><em>Con qué propósito</em> lo ejecuto.</p>
            <p class="die-detalle">Defensiva, neutral, ofensiva o ganadora. Lo que recibís marca el techo de lo que conviene intentar.</p>
          </div>
        </div>
        <div class="die-flecha">→</div>
        <div class="die-eslabon" style="--c:#C0392B;">
          <div class="die-letra">E</div>
          <div class="die-eslabon-txt">
            <h3>Ejecución</h3>
            <p><em>Qué tan bien</em> sale técnicamente.</p>
            <p class="die-detalle">Es la aptitud de golpe que ya mide la app en cada evaluación. La decisión y la intención pueden ser perfectas, pero si la técnica falla, el punto se pierde igual.</p>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: DECISIÓN -->
      <div class="manual-seccion">
        <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
          <h2><span class="die-badge" style="background:#2E6DA4;">D</span> La Decisión</h2>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="manual-seccion-body">
          <p>La decisión es <strong>qué golpe elegís</strong> frente a la bola que recibís. No se mide contra una tabla fija, porque la mejor opción depende de lo que cada jugador puede ejecutar. Frente a un mismo globo pasado, un jugador puede tener disponible una bandeja lenta a dos paredes, un gancho a la reja o una floja al medio: las tres pueden ser válidas según su capacidad.</p>
          <p>Por eso la decisión se evalúa en una escala de cuatro niveles, juzgando si eligió la mejor opción <em>de las que tenía a su alcance</em>:</p>
          <div class="die-escala-decision">
            <div class="die-dec-nivel" style="--c:#2d6a4f;"><strong>Óptima</strong><span>Eligió la mejor opción de su menú.</span></div>
            <div class="die-dec-nivel" style="--c:#6B9E78;"><strong>Válida</strong><span>Eligió una opción razonable, aunque no la mejor.</span></div>
            <div class="die-dec-nivel" style="--c:#D99A3E;"><strong>Subóptima</strong><span>Tenía algo mejor disponible y no lo vio.</span></div>
            <div class="die-dec-nivel" style="--c:#C0392B;"><strong>Errada</strong><span>Eligió algo fuera de lo que la bola permitía.</span></div>
          </div>
          <div class="manual-highlight">Pasarse del techo de intención (atacar una bola que no daba para tanto) es una de las formas más comunes de decisión errada.</div>
        </div>
      </div>

      <!-- SECCIÓN: INTENCIÓN (niveles) -->
      <div class="manual-seccion">
        <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
          <h2><span class="die-badge" style="background:#C8963E;">I</span> La Intención — los cuatro niveles</h2>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="manual-seccion-body">
          <p>La intención es una característica del golpe, igual que la velocidad, el efecto o la dirección. Una misma intención <strong>sube de calidad a medida que se asciende de categoría</strong>: la neutral de un 2ª no se parece a la de un 7ª.</p>
          <div class="escalera">
            <div class="escalon" data-n="defensiva"><div class="escalon-icono">🛡️</div><div class="escalon-texto"><h3>Defensiva</h3><p>Golpe de supervivencia: seguir en el punto, sin buscar incomodar.</p></div></div>
            <div class="escalon" data-n="neutral"><div class="escalon-icono">⚖️</div><div class="escalon-texto"><h3>Neutral</h3><p>Golpe de construcción: ni te apura ni regala nada, mantiene el equilibrio.</p></div></div>
            <div class="escalon" data-n="ofensiva"><div class="escalon-icono">⚔️</div><div class="escalon-texto"><h3>Ofensiva</h3><p>Busca incomodar y ganar terreno, sin arriesgar a cerrar el punto.</p></div></div>
            <div class="escalon" data-n="ganadora"><div class="escalon-icono">🎯</div><div class="escalon-texto"><h3>Ganadora</h3><p>Busca terminar el punto. Cualquier golpe bien ejecutado puede serlo.</p></div></div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: RANGO POR GOLPE -->
      <div class="manual-seccion">
        <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
          <h2><span class="die-badge" style="background:#C8963E;">I</span> Qué intenciones admite cada golpe</h2>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="manual-seccion-body">
          <p>La mayoría de los golpes recorren toda la escala. Unos pocos están acotados por su propia naturaleza: son la excepción que confirma la regla.</p>
          <div class="rango-grupo-label">Golpes base — rango completo</div>
          <div class="rango-lista" id="rangoBase"></div>
          <div class="rango-grupo-label segundo">Casos especiales — rango acotado</div>
          <div class="rango-lista" id="rangoEspecial"></div>
        </div>
      </div>

      <!-- SECCIÓN: MATRIZ + CONTRAATAQUE -->
      <div class="manual-seccion">
        <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
          <h2><span class="die-badge" style="background:#C8963E;">I</span> La regla de respuesta y el contraataque</h2>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="manual-seccion-body">
          <p>Lo que recibís marca el techo de lo que conviene intentar. Y como toda moneda tiene dos caras, esa misma regla explica el contraataque: cuando el rival se pasa de su techo, te regala la bola.</p>

          <div class="die-modos">
            <button class="die-modo-btn active" onclick="dieSetModo('responder', this)">🛡️ Respondo</button>
            <button class="die-modo-btn" onclick="dieSetModo('trampa', this)">🪤 Tiendo la trampa</button>
          </div>

          <div class="matriz-card">
            <div class="matriz-instruccion" id="dieInstruccion">Si el rival te manda una bola… <strong>(tocá una)</strong></div>
            <div class="recibe-label" id="dieRecibeLabel">Recibís</div>
            <div class="recibe-fila" id="dieRecibeFila">
              <button class="chip" data-n="defensiva" onclick="dieRecibir('defensiva', this)">🛡️ Defensiva</button>
              <button class="chip" data-n="neutral" onclick="dieRecibir('neutral', this)">⚖️ Neutral</button>
              <button class="chip" data-n="ofensiva" onclick="dieRecibir('ofensiva', this)">⚔️ Ofensiva</button>
              <button class="chip" data-n="ganadora" onclick="dieRecibir('ganadora', this)">🎯 Ganadora</button>
            </div>
            <div class="matriz-divisor"><span>↓</span></div>
            <div class="responde-label" id="dieRespondeLabel">Tu respuesta puede ser</div>
            <div class="responde-fila" id="dieRespondeFila">
              <div class="respuesta" data-n="defensiva">🛡️ Defensiva</div>
              <div class="respuesta" data-n="neutral">⚖️ Neutral</div>
              <div class="respuesta" data-n="ofensiva">⚔️ Ofensiva</div>
              <div class="respuesta" data-n="ganadora">🎯 Ganadora</div>
            </div>
            <div class="veredicto" id="dieVeredicto">Tocá una bola para ver la recomendación.</div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: EJECUCIÓN -->
      <div class="manual-seccion">
        <div class="manual-seccion-header" onclick="toggleManualSeccion(this)">
          <h2><span class="die-badge" style="background:#C0392B;">E</span> La Ejecución</h2>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="manual-seccion-body">
          <p>La ejecución es <strong>qué tan bien sale el golpe técnicamente</strong>. En este sistema no es una medición aparte: es la <strong>aptitud de golpe</strong> que la app ya evalúa en cada categoría, con sus cuantificadores de aptitud, direccionamiento, velocidad y factor específico.</p>
          <p>Lo importante de entenderla dentro del D.I.E. es esto: un jugador puede decidir bien y elegir la intención correcta, pero si falla la ejecución, el golpe se cae igual. Y esa falla técnica, contra un buen rival, se transforma en una bola que te contraataca. Por eso la ejecución no es "lo último que importa", sino el eslabón que sostiene a los otros dos.</p>
          <div class="manual-highlight">Decisión 10 + Intención 10 + Ejecución 3 = punto perdido. La cadena se corta por el eslabón más débil.</div>
        </div>
      </div>
`; }

  var MANUAL_ESTILOS = `        .manual-wrapper { max-width: 900px; margin: 0 auto; padding: 16px; }
        .manual-hero { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 32px; border-radius: 16px; margin-bottom: 24px; text-align: center; }
        .manual-hero h1 { margin: 0 0 8px 0; font-size: 1.6rem; }
        .manual-subtitulo { margin: 0; color: #aac4ff; font-size: 0.9rem; }
        .manual-seccion { background: white; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #eee; }
        .manual-seccion-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px; cursor: pointer; background: #f8f9fa; transition: background 0.2s; }
        .manual-seccion-header:hover { background: #e9ecef; }
        .manual-seccion-header h2 { margin: 0; font-size: 1.1rem; }
        .manual-seccion-body { padding: 20px; border-top: 1px solid #eee; }
        .manual-seccion-body.collapsed { display: none; }
        .manual-highlight { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
        .manual-golpes-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
        .manual-golpe-chip { background: #e8f4fd; border: 2px solid #3498db; border-radius: 20px; padding: 6px 16px; font-weight: 600; font-size: 0.9rem; }
        .manual-cuant-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-top: 16px; }
        .manual-cuant-card { background: #f8f9fa; border-radius: 10px; padding: 16px; border-top: 4px solid #3498db; }
        .cuant-numero { width: 32px; height: 32px; background: #3498db; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 10px; }
        .manual-cuant-card h4 { margin: 0 0 8px 0; font-size: 0.95rem; }
        .manual-cuant-card p { margin: 0; font-size: 0.85rem; color: #555; }
        .manual-zonas { display: flex; gap: 8px; margin-top: 12px; }
        .zona { flex: 1; padding: 12px; border-radius: 8px; text-align: center; font-size: 0.85rem; line-height: 1.4; }
        .zona-a { background: #fff3e0; border: 2px solid #ff9800; }
        .zona-b { background: #e8f5e9; border: 2px solid #4caf50; }
        .zona-c { background: #e3f2fd; border: 2px solid #2196f3; }
        .manual-par-box { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
        .par-box-item { background: #f8f9fa; border-radius: 10px; padding: 16px; border-left: 4px solid #9b59b6; }
        .par-badge { background: #9b59b6; color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; display: inline-block; margin-bottom: 8px; }
        .par-box-item h4 { margin: 0 0 8px 0; font-size: 0.95rem; }
        .par-box-item p { margin: 0; font-size: 0.85rem; color: #555; }
        .manual-golpe-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .manual-golpe-tab { padding: 8px 16px; border: 2px solid #ddd; border-radius: 20px; background: white; cursor: pointer; font-size: 0.9rem; transition: all 0.2s; }
        .manual-golpe-tab.active, .manual-golpe-tab:hover { background: #2c3e50; color: white; border-color: #2c3e50; }
        .manual-cat-card { border-radius: 10px; margin-bottom: 12px; overflow: hidden; border: 1px solid #e0e0e0; }
        .manual-cat-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; transition: background 0.2s; }
        .manual-cat-header:hover { filter: brightness(0.95); }
        .manual-cat-body { padding: 16px; background: white; border-top: 1px solid #eee; display: none; }
        .manual-cat-body.open { display: block; }
        .cat-color-7 { background: #f8d7da; }
        .cat-color-6 { background: #fff3cd; }
        .cat-color-5 { background: #d1ecf1; }
        .cat-color-4 { background: #d4edda; }
        .cat-color-3 { background: #cce5ff; }
        .cat-color-2 { background: #e2d9f3; }
        .cat-titulo { font-weight: bold; font-size: 1rem; }
        .cat-subtitulo { font-size: 0.8rem; color: #555; margin-left: auto; }
        .cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cat-item h5 { margin: 0 0 4px 0; font-size: 0.85rem; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .cat-item p { margin: 0; font-size: 0.82rem; color: #444; line-height: 1.5; }
        .cat-par { background: #f8f9fa; border-radius: 8px; padding: 10px 12px; margin-top: 12px; border-left: 3px solid #6c757d; font-size: 0.83rem; color: #444; }
        .cat-par strong { color: #2c3e50; }
        @media (max-width: 600px) {
          .manual-zonas { flex-direction: column; }
          .manual-par-box { grid-template-columns: 1fr; }
          .cat-grid { grid-template-columns: 1fr; }
        }

        /* ===== NAV ENTRE BLOQUES ===== */
        .manual-nav { display:flex; gap:10px; margin-bottom:24px; flex-wrap:wrap; }
        .manual-nav-btn { flex:1; min-width:140px; padding:12px 16px; border:2px solid var(--azul,#003366); border-radius:10px; background:#fff; color:var(--azul,#003366); font-family:'Oswald',sans-serif; font-size:1rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .manual-nav-btn.active { background:var(--azul,#003366); color:#fff; }

        /* ===== D.I.E. INTRO ===== */
        .die-intro { background:#fff; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.08); margin-bottom:20px; border-left:4px solid var(--dorado,#C8963E); }
        .die-intro p { font-size:0.95rem; color:#444; }

        /* ===== CADENA DE 3 ESLABONES ===== */
        .die-cadena { display:flex; align-items:stretch; gap:8px; margin-bottom:28px; flex-wrap:nowrap; }
        .die-eslabon { flex:1; background:#fff; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.08); border-top:4px solid var(--c); }
        .die-letra { width:40px; height:40px; border-radius:10px; background:var(--c); color:#fff; font-family:'Oswald',sans-serif; font-size:1.4rem; font-weight:700; display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
        .die-eslabon-txt h3 { color:var(--c); font-size:1.05rem; margin-bottom:4px; }
        .die-eslabon-txt p { font-size:0.82rem; color:#555; margin-bottom:4px; }
        .die-eslabon-txt .die-detalle { font-size:0.78rem; color:#777; }
        .die-flecha { display:flex; align-items:center; color:var(--dorado,#C8963E); font-size:1.5rem; font-weight:bold; flex-shrink:0; }

        .die-badge { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:6px; color:#fff; font-family:'Oswald',sans-serif; font-weight:700; font-size:0.9rem; margin-right:8px; vertical-align:middle; }

        /* ===== ESCALA DE DECISIÓN ===== */
        .die-escala-decision { display:flex; flex-direction:column; gap:8px; margin:16px 0; }
        .die-dec-nivel { display:flex; align-items:baseline; gap:12px; padding:10px 14px; border-radius:8px; background:#f8f9fa; border-left:4px solid var(--c); }
        .die-dec-nivel strong { color:var(--c); min-width:90px; }
        .die-dec-nivel span { font-size:0.85rem; color:#555; }

        /* ===== ESCALERA DE INTENCIONES ===== */
        .escalera { display:flex; flex-direction:column; gap:8px; margin-top:12px; }
        .escalon { display:flex; align-items:center; gap:16px; background:#fff; border-radius:10px; padding:12px 16px; box-shadow:0 2px 6px rgba(0,0,0,0.06); border-left:6px solid var(--nivel-color); }
        .escalon[data-n="defensiva"] { --nivel-color:#4A7BA6; margin-left:0; }
        .escalon[data-n="neutral"]   { --nivel-color:#6B9E78; margin-left:20px; }
        .escalon[data-n="ofensiva"]  { --nivel-color:#D99A3E; margin-left:40px; }
        .escalon[data-n="ganadora"]  { --nivel-color:#C0392B; margin-left:60px; }
        .escalon-icono { width:40px; height:40px; border-radius:10px; flex-shrink:0; background:var(--nivel-color); display:flex; align-items:center; justify-content:center; font-size:1.2rem; }
        .escalon-texto h3 { font-size:0.95rem; color:var(--nivel-color); }
        .escalon-texto p { font-size:0.82rem; color:#666; }

        /* ===== RANGO POR GOLPE ===== */
        .rango-grupo-label { font-size:0.72rem; letter-spacing:1.5px; text-transform:uppercase; color:#888; font-weight:600; margin:18px 0 10px; }
        .rango-lista { display:flex; flex-direction:column; gap:10px; }
        .rango-fila { background:#fff; border-radius:10px; box-shadow:0 2px 6px rgba(0,0,0,0.06); padding:12px 14px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
        .rango-nombre { font-weight:600; color:var(--azul,#003366); min-width:130px; font-size:0.9rem; }
        .rango-barra { display:flex; gap:6px; flex:1; min-width:220px; }
        .rango-celda { flex:1; text-align:center; padding:6px 4px; border-radius:6px; font-size:0.7rem; font-weight:600; color:#fff; }
        .rango-celda.on[data-n="defensiva"] { background:#4A7BA6; }
        .rango-celda.on[data-n="neutral"]   { background:#6B9E78; }
        .rango-celda.on[data-n="ofensiva"]  { background:#D99A3E; }
        .rango-celda.on[data-n="ganadora"]  { background:#C0392B; }
        .rango-celda.off { background:#ECE8DF; color:#BBB2A0; }
        .rango-nota { font-size:0.76rem; color:#777; font-style:italic; flex-basis:100%; }

        /* ===== MATRIZ ===== */
        .die-modos { display:flex; gap:8px; margin:18px 0; }
        .die-modo-btn { flex:1; padding:10px; border:2px solid var(--dorado,#C8963E); border-radius:30px; background:#fff; color:#8a6420; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; }
        .die-modo-btn.active { background:var(--dorado,#C8963E); color:#fff; }
        .matriz-card { background:#fff; border-radius:14px; box-shadow:0 2px 10px rgba(0,0,0,0.08); padding:20px; border:1px solid #eee; }
        .matriz-instruccion { text-align:center; font-size:0.9rem; color:#555; margin-bottom:16px; }
        .recibe-label, .responde-label { text-align:center; font-size:0.7rem; letter-spacing:1.5px; text-transform:uppercase; color:#888; font-weight:600; margin-bottom:10px; }
        .recibe-fila, .responde-fila { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }
        .chip { border:none; cursor:pointer; font-family:'Inter',sans-serif; border-radius:30px; padding:10px 18px; font-weight:600; font-size:0.88rem; color:#fff; opacity:0.45; transition:all 0.25s; }
        .chip[data-n="defensiva"] { background:#4A7BA6; }
        .chip[data-n="neutral"]   { background:#6B9E78; }
        .chip[data-n="ofensiva"]  { background:#D99A3E; }
        .chip[data-n="ganadora"]  { background:#C0392B; }
        .chip.activo { opacity:1; transform:scale(1.06); box-shadow:0 4px 14px rgba(0,0,0,0.18); }
        .matriz-divisor { height:1px; background:#eee; margin:20px 0; position:relative; }
        .matriz-divisor span { position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:#fff; padding:0 12px; font-size:1.1rem; color:var(--dorado,#C8963E); }
        .respuesta { border-radius:30px; padding:10px 18px; font-weight:600; font-size:0.88rem; color:#fff; transition:all 0.3s; position:relative; }
        .respuesta[data-n="defensiva"] { background:#4A7BA6; }
        .respuesta[data-n="neutral"]   { background:#6B9E78; }
        .respuesta[data-n="ofensiva"]  { background:#D99A3E; }
        .respuesta[data-n="ganadora"]  { background:#C0392B; }
        .respuesta.permitida { opacity:1; }
        .respuesta.prohibida { opacity:0.22; filter:grayscale(0.7); }
        .respuesta.techo::after { content:'TECHO'; position:absolute; top:-9px; right:-6px; background:var(--dorado,#C8963E); color:#fff; font-size:0.55rem; padding:2px 6px; border-radius:8px; font-weight:700; }
        .veredicto { margin-top:18px; text-align:center; font-size:0.9rem; min-height:44px; padding:12px; border-radius:10px; background:#E8F0FE; color:#003366; }

        @media (max-width:600px){
          .die-cadena { flex-direction:column; }
          .die-flecha { transform:rotate(90deg); align-self:center; }
          .escalon { margin-left:0 !important; }
          .rango-nombre { min-width:100%; }
          .chip, .respuesta { padding:9px 14px; font-size:0.8rem; }
        }
`;

  const MANUAL_CATEGORIAS = {
    smash: {
      nombre: 'Smash (Sobre Cabeza)',
      categorias: {
        7: { nombre: '7ª Categoría', aptitud: 'Pega plano. Muy ocasionalmente con sidespin, más por defecto que por efectividad.', direccion: 'No dirige volitivamente a dos paredes ni a pared de fondo.', velocidad: 'Sin variación. No tiene criterio para seleccionar el cambio de velocidad.', factor: 'Continuidad: cada 4 golpes erra 3.', par: 'Pega el smash generalmente plano, sin dirigir ni intentar sacarla. Velocidad casi siempre igual. Escasa actitud de desplazamiento vertical hacia la red después de impactar.' },
        6: { nombre: '6ª Categoría', aptitud: 'Pega con sidespin además de plano.', direccion: 'Intenta buscar dos paredes tanto plano como sidespin (sin lograrlo en alto porcentaje). Pega plano para traerla por pared de fondo (bajo porcentaje).', velocidad: 'Cambia velocidad solo por tipo de golpe. El sidespin es más lento que el plano. No siempre acierta la elección.', factor: 'Continuidad: cada 5 golpes 2 son malos. Los errores se dan al intentar cosas que puede imaginar pero no ejecutar.', par: 'Pega plano y con sidespin. Cambia velocidad por tipo de golpe. Su desplazamiento hacia la red es discontinuo y no siempre eficiente.' },
        5: { nombre: '5ª Categoría', aptitud: 'Impacta plano y con sidespin de un lado. Eventualmente busca sidespin contrario (resultado incierto).', direccion: 'Busca las dos paredes. Dirige a los alambres e intenta sacarla de la cancha (no con buenos resultados).', velocidad: 'Logra variación de velocidad con limitaciones, tanto con sidespin como plano.', factor: 'Continuidad: cada 6 golpes 2 son malos. Error por apurar la definición.', par: 'Puede impactar plano o sidespin con igual habilidad. Dirige a paredes, alambres, etc. Cambia velocidades con buena continuidad. Sus desplazamientos tienen dinámica pero no logra cierres rápidos y eficientes.' },
        4: { nombre: '4ª Categoría', aptitud: 'Pega con sidespin siempre del mismo lado, y también plano.', direccion: 'Conscientemente busca las paredes eligiendo según conveniencia. Intenta sacar la pelota. Con sidespin busca las dos paredes.', velocidad: 'Cambia velocidad por tipo de golpe (sidespin más lento). Cambia el impulso para traerla (plano).', factor: 'Continuidad: ante inseguridad elige continuar flojo asegurando el tanto. De 6 golpes erra 1.', par: 'Pega con sidespin o plano según conveniencia. Cambia velocidad por tipo. Busca dos paredes con sidespin y logra sacarla. Sus movimientos tienden a la red pero no eficientemente aún.' },
        3: { nombre: '3ª Categoría', aptitud: 'Impacta plano y con sidespin logrando con mucha eficiencia el resultado buscado.', direccion: 'Busca con facilidad las dos paredes eligiendo a voluntad cuál pegar primero. Dirige a alambres e intenta sacarla con éxito. Busca también el cuerpo del rival.', velocidad: 'Cambia velocidades indistintamente por golpe o por impulso, tanto plano como sidespin.', factor: 'Continuidad: gran salto. Es raro que erre un smash desde Zona II. De 7 golpes erra 1.', par: 'Impacta plano o sidespin de ambos lados. Dirige a ángulos buscados, dos paredes, alambre, cambiando velocidades. Desplazamientos mucho más dinámicos logrando cierre de red con gran eficiencia.' },
        2: { nombre: '2ª Categoría', aptitud: 'Pega plano y sidespin indistintamente de ambos lados con gran maestría. Pega tanto desde Zona II como Zona III con igual resultado.', direccion: 'Varía dirección a discreción sin dificultad. Saca por alambres o pared de fondo aún cuando la pelota no le queda cómoda. Busca con intención el cuerpo del rival.', velocidad: 'Cambia de velocidad según conveniencia siendo totalmente criterioso. Cuando impacta a traerla se destaca por la eficiencia. Al cambiar velocidad es un gran estratega.', factor: 'Continuidad: de 8 o 9 golpes a 1. No se arriesgan pelotas porque sí, siempre construye el tanto.', par: 'Gran estratega. Pega plano o sidespin según conveniencia desde Zona III. Construye el tanto para definir en el momento adecuado. Excelente lectura de juego. Sus desplazamientos verticales y horizontales son óptimos; superarlo con rasantes es muy difícil.' }
      }
    },
    volea: {
      nombre: 'Volea',
      categorias: {
        7: { nombre: '7ª Categoría', aptitud: 'Bloquea en Zona I tanto de drive como de revés. Puede intentar pegar plano de revés. Voleas con escasa profundidad y alto margen de error.', direccion: 'No posee capacidad de direccionamiento.', velocidad: 'La velocidad depende de la pelota que viene, no de la voluntad del jugador.', factor: 'Profundidad: prácticamente imposible que busque volitivamente la profundidad. Puede salir profunda o no. Característica: volea desde Zona II por deficiente lectura.', par: 'Volea de bloqueo sin direccionamiento ni manejo de velocidad. No maneja profundidad. Se queda parado o retrocede por carencia de desplazamiento.' },
        6: { nombre: '6ª Categoría', aptitud: 'Bloquea tanto de drive como de revés usando la fuerza del rival.', direccion: 'Intenta buscar los alambres como alternativa de complicación (no lo consigue en gran porcentaje). Con slice de revés suele buscar el medio. En volea alta la angula como si fuese smash.', velocidad: 'Intenta realizar cambios de velocidad frecuentemente pero sin resultados óptimos.', factor: 'Profundidad: busca conscientemente pelotas profundas pero no lo logra la mayoría de las veces.', par: 'Mayoritariamente volea bloqueando. La volea alta la impacta plana. No mantiene posición, comienza a intentar cerrar horizontalmente la red sin lograrlo generalmente.' },
        5: { nombre: '5ª Categoría', aptitud: 'Impacta con slice tanto de drive como de revés cuando desee. El globo de volea se utiliza con fines de ataque (sin ser eficiente en la mayoría de los casos). La volea alta se pega con mucho slice.', direccion: 'Busca alambres e intenta pelotas profundas tanto de drive como de revés. En volea alta dirige al medio variando su velocidad.', velocidad: 'Comienza a utilizar cambios de velocidad tanto de drive como de revés (plano y slice).', factor: 'Profundidad: trata de que la pelota pique en Zona III pero no lo logra en gran mayoría.', par: 'Puede impactar con slice de drive y revés al igual que la volea alta. El globo se juega con finalidad de ganar la red en ataque. Busca angular a alambres, intenta cambiar velocidades. Desplazamiento vertical más rápido pero el horizontal no es adecuado para cerrar la red.' },
        4: { nombre: '4ª Categoría', aptitud: 'Bloquea solo cuando la pelota viene con gran velocidad y está a muy corta distancia. El globo de volea lo utiliza de forma defensiva. La volea alta en Zona II se impacta plano y con potencia.', direccion: 'Angula la pelota y busca los alambres. De revés impacta con slice buscando el medio. La volea alta la angula como un smash.', velocidad: 'Busca deliberadamente diferentes ángulos, cambiando la velocidad de impulso de la pelota.', factor: 'Profundidad: busca conscientemente pelotas profundas pero no lo logra en la totalidad de las veces.', par: 'Bloquea solo con potencia del rival. Globo de volea defensivo. Angula y busca alambres. Cambia velocidad según conveniencia. Utiliza desplazamientos verticales y horizontales con muy buen resultado.' },
        3: { nombre: '3ª Categoría', aptitud: 'Impacta con slice de drive y revés cuando desea. El globo de volea se utiliza con fines de ataque con buenos resultados. La volea alta es impactada con muy buen slice.', direccion: 'Pegando plano puede direccionar para que vuelva al mismo campo. Con slice dirige a ángulos y alambres. En volea alta la dirige en gran porcentaje al medio.', velocidad: 'Usa mucho el cambio de velocidad, jugando a voluntad la pelota corta con mucho slice. Tira corta a picar en Zona I.', factor: 'Profundidad: juega profundo tanto plano como slice, sobretodo slice. Un 50% pican en Zona III.', par: 'Impacta con slice de drive y revés igual que la volea alta. El globo en actitud firme de ataque. Busca angulares a alambres e incluso trae la pelota a su campo. Tira corta para picar en Zona I. Impacta buscando profundidad. Todo con desplazamientos vertical y horizontal rápidos y eficaces.' },
        2: { nombre: '2ª Categoría', aptitud: 'Pega plano y con slice tanto de drive como de revés sin dificultad alguna. Tanto desde Zona I como Zona II con la misma eficacia.', direccion: 'Habilidad y capacidad para direccionar tanto de revés como de drive hacia alambres, angularla o al cuerpo del rival.', velocidad: 'A voluntad del jugador teniendo en cuenta posición de sus rivales para ganar el tanto. Ejecuta drop con muy buenos resultados.', factor: 'Profundidad: de 8 o 9 golpes, 1 no es profundo.', par: 'No existe dificultad alguna al impactar, tanto de drive como de revés con slice o plano, desde Zona I o Zona II con igual eficiencia, incluso a traerla a su campo. Direcciona según conveniencia. La volea alta es de alta efectividad con slice y profundidad. Cierra de forma efectiva la red con movimientos horizontales y verticales.' }
      }
    },
    fondo: {
      nombre: 'Pegada de Fondo',
      categorias: {
        7: { nombre: '7ª Categoría', aptitud: 'Golpea plano de drive. Levanta en globo de revés. Algunos pueden pegar con slice de drive por deficiencia técnica.', direccion: 'Sin direccionamiento de drive ni de revés. Los tiros paralelos tienen alto porcentaje de error.', velocidad: 'Siempre fuerte con pocos cambios de velocidad, más por defecto que por voluntad.', factor: 'Error: grande, 4/1.', par: 'Pega plano y levanta de revés sin lugar definido. Siempre la misma velocidad, fuerte de drive. No realiza movimientos de posicionamiento hasta que se confirma que la pelota pasó a los rivales; entonces avanza sin llegar a la red.' },
        6: { nombre: '6ª Categoría', aptitud: 'Pega plano y fuerte de drive (da buenos resultados aún). En tránsito evolutivo comienza a usar slice de drive. De revés intenta levantar de globo por falta de dominio del golpe rasante.', direccion: 'Buen direccionamiento dentro de sus limitaciones. El globo casi siempre cruzado.', velocidad: 'Pega generalmente fuerte, no cambia la velocidad. Cuando tira rasante de revés le imprime menor velocidad por falta de habilidad.', factor: 'Error: sigue siendo alto, 3/1. Se apuran en la definición y pegan todas con igual potencia.', par: 'De drive plano, también con slice en menor proporción. De revés sigue levantando en globo; cuando intenta rasante lo hace de forma poco consistente. Acompaña el golpe con movimiento hacia la red solo cuando pasa la línea de ataque rival.' },
        5: { nombre: '5ª Categoría', aptitud: 'Tanto de drive como de revés impacta plano o con slice. Juega a media altura intentando cruzarla. Comienza a utilizar el paralelo.', direccion: 'Dirige con igual facilidad hacia cualquier dirección. Los globos cruzados o paralelos según la oportunidad.', velocidad: 'Imprime velocidad o "afloja" de acuerdo a lo más conveniente.', factor: 'Error: al poder manejar velocidades se reduce considerablemente. Cuando la devolución fue con mucha presión reduce la fuerza, logrando mayor seguridad. Cada 4/1.', par: 'Drive y revés plano o con slice. Comienza a manejar direccionamiento y velocidades en ambos lados. Ataca las pelotas aunque no hayan pasado la línea de ataque rival, lo que implica un cambio profundo en actitud y preparación física.' },
        4: { nombre: '4ª Categoría', aptitud: 'Impacta tanto de drive como de revés plano o slice. De revés tanto rasante como en globo.', direccion: 'Dirige paralelos, cruzados y al medio con buen direccionamiento. Los globos generalmente cruzados.', velocidad: 'Los realiza tanto de drive como de revés (plano o slice).', factor: 'Error: cada 6/1.', par: 'Pegan de drive o revés plano o slice con dirección y cambios de velocidad, con mayor habilidad de drive. Factor de error menor que la categoría anterior. Se posiciona después de ejecutar el golpe e incluso se adelanta para bloquear el smash. El sobrepique aún no lo direccionan. Solo va decididamente a la red cuando pasan definitivamente a los rivales.' },
        3: { nombre: '3ª Categoría', aptitud: 'Pega de drive o revés con slice o plano sin mayores dificultades.', direccion: 'Direcciona hacia laterales buscando alambres, al medio. Comienza a tirar pelotas muy rasantes para que el rival deba levantar. Globo a discreción, cruzado o paralelo, intentando que sea "llovido".', velocidad: 'Cambia a voluntad tanto de drive como de revés. Al medio fuerte y con potencia; a los laterales suave.', factor: 'Error: 7/1.', par: 'Impacta drive o revés plano o slice. Direcciona hacia cualquier lado según conveniencia. Imprime velocidades para complicar al rival. Una vez impactado avanza con movimientos verticales para contraatacar, también cuando tira suave a los laterales. Siempre tiende a ganar la red aún sin pasar a los rivales con un globo.' },
        2: { nombre: '2ª Categoría', aptitud: 'Pegan plano o slice tanto de drive como de revés siendo muy hábiles.', direccion: 'Direccionan hacia cualquier lado con igual maestría. Globo cruzado o paralelo a voluntad en forma "llovida" o al rincón. El sobrepique es totalmente direccionado.', velocidad: 'Fuerte cuando es necesario de ambos lados, incluso buscan el cuerpo del rival para que impacten incómodos. Suavidad hacia los laterales muy rasante para que el rival levante y así contraatacar.', factor: 'Error: disminuye de 8 o 9 a 1.', par: 'Pegan slice o plano de drive y revés con total habilidad. Direccionan a voluntad siempre para ganar el tanto. Imprimen cambios de velocidad para presionar desde atrás. Sus movimientos son siempre tendientes hacia la red para ganarla.' }
      }
    },
    pared: {
      nombre: 'Salida de Pared',
      categorias: {
        7: { nombre: '7ª Categoría', aptitud: 'Habitualmente levanta en globo tanto de drive como de revés. El volver contra pared de fondo se usa de forma abusiva y con resultado incierto.', direccion: 'No posee direccionamiento en drive, revés ni globo.', velocidad: 'No posee habilidad para cambiar velocidades. Siempre impacta fuerte.', factor: 'Levantadas: margen de error amplio por falta de habilidad y maestría.', par: 'Se abusa de globos de drive y de revés. De drive sale fuerte y plano. No se levantan pelotas exigidas. Sin movimientos de ataque después del golpe salvo que el rival deba salir de pared de fondo.' },
        6: { nombre: '6ª Categoría', aptitud: 'En drive se impacta plano y en revés se "acompaña" la pelota. Volver contra pared de fondo con factor de caída 5/2, permite pegarlo con mayor confianza.', direccion: 'De drive busca todas las direcciones; de revés básicamente el medio. Los globos se tratan de buscar cruzados. Contra pared sin direccionamiento.', velocidad: 'Comienza a variar la velocidad tanto de revés como de drive.', factor: 'Levantadas: comienza a levantar pelotas a muy baja altura, por lo general en globo o contra pared.', par: 'Juega de drive y revés. De revés acompaña la pelota generalmente al medio. El globo impactado cruzado; contra pared sin direccionamiento. Comienza a levantar pelotas a poca altura. No ataca si no superó al rival. Cuando lo supera se desplaza verticalmente a comienzo de Zona I.' },
        5: { nombre: '5ª Categoría', aptitud: 'De drive o revés sale de pared con slice. La salida contra pared de fondo se usa con frecuencia por poder lograr buen factor de caída (5/3).', direccion: 'Busca todas las direcciones con gran porcentaje de acierto. De revés cambia el ángulo. Aún no direcciona el contra pared.', velocidad: 'Cambia velocidad tanto de drive como de revés, pegando plano o con slice.', factor: 'Levantadas: levanta pelotas de baja altura tanto de drive como de revés. Usa el globo en este golpe.', par: 'Tanto de drive como de revés sale plano o con slice, hacia todas las direcciones y manejando la velocidad según la conveniencia. Factor de levantada bueno, saliendo con pelotas flojas hacia costados o al medio. Ataca pelotas no firmes ya sea globo o rasante, flojas o fuertes.' },
        4: { nombre: '4ª Categoría', aptitud: 'Ha adquirido el desarrollo necesario para impactar tanto de drive como de revés en forma rasante. Contra pared de fondo logra un factor de caída que permite pegar con gran confianza.', direccion: 'De drive busca todas las direcciones. De revés acentúa la pelota al medio. Los globos tanto cruzados como paralelos.', velocidad: 'Tanto de drive como de revés impacta fuerte y "aflojando" hacia costados o al medio.', factor: 'Levantadas: levanta pelotas a muy baja altura por lo general con globos o contra pared con buenos resultados.', par: 'Impacta de drive y revés con gran habilidad imprimiendo diferentes velocidades, direccionando a ángulos, alambres y medio. Comienza a levantar pelotas a baja altura direccionándolas cruzadas y paralelas. Intenta avanzar a Zona II luego de salir con globo o tiro rasante.' },
        3: { nombre: '3ª Categoría', aptitud: 'Impacta plano o con slice tanto de drive como de revés.', direccion: 'Tanto de drive como de revés muy buen direccionamiento, busca alambres, ángulos y el medio. Los globos paralelos y cruzados.', velocidad: 'Los realiza tanto de drive como de revés, logrando manejo del slice.', factor: 'Levantadas: los realiza a muy baja altura utilizando drive y revés, saliendo con globo o pelota rasante.', par: 'Impacta de drive y revés plano o slice. Direcciona sin dificultad a alambres, ángulos y medio. Imprime cambios de velocidad. Levanta pelotas a muy escasa altura. Luego de impactar intenta tomar la red con movimientos verticales para ganar el tanto.' },
        2: { nombre: '2ª Categoría', aptitud: 'Pega plano o con slice tanto de drive como de revés sin dificultad.', direccion: 'Direcciona sin dificultad a ángulos, alambres y medio en forma rasante. El globo es dirigido paralelo y cruzado en forma "llovida" dificultando su devolución.', velocidad: 'Los realiza según las circunstancias sin dificultad, tanto de drive como de revés. Al medio más fuerte; a los laterales suave; incluso busca el cuerpo del rival.', factor: 'Levantadas: levanta pelotas de muy baja altura saliendo sin problemas con tiros rasantes, globos cruzados o paralelos.', par: 'Impacta de drive y revés con gran habilidad. Plano o slice. Imprime velocidad según circunstancias y ubicación del rival. Levanta pelotas a muy escasa altura. Sus movimientos verticales son siempre tendientes a ganar la red.' }
      }
    }
  };

  function generarCategoriaHTML(golpeKey) {
    const golpe = MANUAL_CATEGORIAS[golpeKey];
    if (!golpe) return '<p>Sin datos</p>';
    const colores = { 7: 'cat-color-7', 6: 'cat-color-6', 5: 'cat-color-5', 4: 'cat-color-4', 3: 'cat-color-3', 2: 'cat-color-2' };
    const etiquetas = { 7: 'Principiante', 6: 'Básico', 5: 'Intermedio Bajo', 4: 'Intermedio', 3: 'Avanzado', 2: 'Elite' };
    let html = '';
    for (const [num, cat] of Object.entries(golpe.categorias)) {
      html += `
        <div class="manual-cat-card">
          <div class="manual-cat-header ${colores[num]}" onclick="this.nextElementSibling.classList.toggle('open')">
            <span class="cat-badge cat-${num}">${num}ª</span>
            <span class="cat-titulo">${cat.nombre}</span>
            <span class="cat-subtitulo">${etiquetas[num]} ▼</span>
          </div>
          <div class="manual-cat-body">
            <div class="cat-grid">
              <div class="cat-item">
                <h5>🎯 Aptitud de Golpe-Impacto</h5>
                <p>${cat.aptitud}</p>
              </div>
              <div class="cat-item">
                <h5>🧭 Capacidad de Direccionamiento</h5>
                <p>${cat.direccion}</p>
              </div>
              <div class="cat-item">
                <h5>⚡ Cambios de Velocidad</h5>
                <p>${cat.velocidad}</p>
              </div>
              <div class="cat-item">
                <h5>📊 Factor Específico</h5>
                <p>${cat.factor}</p>
              </div>
            </div>
            <div class="cat-par">
              <strong>Par completo (golpe + desplazamiento):</strong> ${cat.par}
            </div>
          </div>
        </div>`;
    }
    return html;
  }


  // ====================================================================
  // DATOS Y LÓGICA DEL D.I.E.
  // ====================================================================
  var NIVELES = ['defensiva','neutral','ofensiva','ganadora'];
  var LABEL = { defensiva:'Defensiva', neutral:'Neutral', ofensiva:'Ofensiva', ganadora:'Ganadora' };

  // Techo de respuesta: lo recibido -> índice máximo permitido
  var TECHO = { ganadora:0, ofensiva:1, neutral:2, defensiva:3 };

  // Rango de intención por golpe
  var GOLPES_BASE = [
    { nombre:'🏐 Smash', rango:['defensiva','neutral','ofensiva','ganadora'] },
    { nombre:'🏸 Volea', rango:['defensiva','neutral','ofensiva','ganadora'] },
    { nombre:'🎯 Pegada de Fondo', rango:['defensiva','neutral','ofensiva','ganadora'] },
    { nombre:'🧱 Salida de Pared', rango:['defensiva','neutral','ofensiva','ganadora'] }
  ];
  var GOLPES_ESPECIAL = [
    { nombre:'☂️ Globo', rango:['defensiva','neutral','ofensiva'], nota:'Casi siempre defensivo o neutral. Ofensivo solo si lo ajustás mucho; ganador, rarísimo.' },
    { nombre:'💥 Remate x3 / x4', rango:['ganadora'], nota:'Su único fin es sacar la bola de la cancha: no admite otra intención.' }
  ];

  var dieModo = 'responder';   // 'responder' | 'trampa'

  function construirRangoGolpes() {
    var base = document.getElementById('rangoBase');
    var esp = document.getElementById('rangoEspecial');
    if (!base || !esp) return;
    base.innerHTML = GOLPES_BASE.map(filaRango).join('');
    esp.innerHTML = GOLPES_ESPECIAL.map(filaRango).join('');
  }

  function filaRango(g) {
    var celdas = NIVELES.map(function(n) {
      var on = g.rango.indexOf(n) !== -1;
      return '<div class="rango-celda ' + (on ? 'on' : 'off') + '" data-n="' + n + '">' + LABEL[n] + '</div>';
    }).join('');
    var nota = g.nota ? '<div class="rango-nota">' + g.nota + '</div>' : '';
    return '<div class="rango-fila"><div class="rango-nombre">' + g.nombre + '</div><div class="rango-barra">' + celdas + '</div>' + nota + '</div>';
  }

  function dieSetModo(modo, btn) {
    dieModo = modo;
    document.querySelectorAll('.die-modo-btn').forEach(function(b){ b.classList.remove('active'); });
    if (btn) btn.classList.add('active');

    var instruccion = document.getElementById('dieInstruccion');
    var recibeLabel = document.getElementById('dieRecibeLabel');
    var respondeLabel = document.getElementById('dieRespondeLabel');
    var veredicto = document.getElementById('dieVeredicto');

    // Reset visual
    document.querySelectorAll('#dieRecibeFila .chip').forEach(function(c){ c.classList.remove('activo'); });
    document.querySelectorAll('#dieRespondeFila .respuesta').forEach(function(r){ r.classList.remove('permitida','prohibida','techo'); });

    if (modo === 'responder') {
      instruccion.innerHTML = 'Si el rival te manda una bola… <strong>(tocá una)</strong>';
      recibeLabel.textContent = 'Recibís';
      respondeLabel.textContent = 'Tu respuesta puede ser';
      veredicto.innerHTML = 'Tocá una bola para ver la recomendación.';
    } else {
      instruccion.innerHTML = 'Vos le ofrecés una bola al rival… <strong>(tocá una)</strong>';
      recibeLabel.textContent = 'Ofrecés';
      respondeLabel.textContent = 'Hasta dónde puede llegar el rival';
      veredicto.innerHTML = 'Tocá la bola que ofrecés para ver qué trampa le tendés.';
    }
  }

  function dieRecibir(nivel, btn) {
    document.querySelectorAll('#dieRecibeFila .chip').forEach(function(c){ c.classList.remove('activo'); });
    if (btn) btn.classList.add('activo');
    if (dieModo === 'responder') pintarResponder(nivel);
    else pintarTrampa(nivel);
  }

  // MODO RESPONDER: lo recibido marca mi techo
  function pintarResponder(recibido) {
    var techoIdx = TECHO[recibido];
    var respuestas = document.querySelectorAll('#dieRespondeFila .respuesta');
    respuestas.forEach(function(r){
      var idx = NIVELES.indexOf(r.dataset.n);
      r.classList.remove('permitida','prohibida','techo');
      if (idx <= techoIdx) { r.classList.add('permitida'); if (idx === techoIdx) r.classList.add('techo'); }
      else r.classList.add('prohibida');
    });
    var permitidas = NIVELES.slice(0, techoIdx + 1);
    var veredicto = document.getElementById('dieVeredicto');
    if (permitidas.length === 1) {
      veredicto.innerHTML = 'Te llega una bola <strong>' + recibido + '</strong>: tu única salida sensata es <strong>defensiva</strong>. Aguantá y esperá la próxima.';
    } else {
      var txt = permitidas.map(function(p){ return '<strong>' + p + '</strong>'; }).join(' o ');
      veredicto.innerHTML = 'Te llega una bola <strong>' + recibido + '</strong>: podés responder con ' + txt + '. Pasar de <strong>' + NIVELES[techoIdx] + '</strong> es arriesgar de más.';
    }
  }

  // MODO TRAMPA: yo ofrezco; el rival tiene un techo; si se pasa, me devuelve bola floja
  // Tabla de proporcionalidad (cuánto se pasa el rival -> qué me vuelve):
  //   1 escalón  -> neutral
  //   2 escalones -> defensiva
  //   3 escalones -> defensiva (total)
  var DEVOLUCION = { 1:'neutral', 2:'defensiva', 3:'defensiva' };

  function pintarTrampa(ofrecido) {
    var techoIdx = TECHO[ofrecido];   // hasta dónde puede llegar el rival legítimamente
    var respuestas = document.querySelectorAll('#dieRespondeFila .respuesta');
    respuestas.forEach(function(r){
      var idx = NIVELES.indexOf(r.dataset.n);
      r.classList.remove('permitida','prohibida','techo');
      if (idx <= techoIdx) { r.classList.add('permitida'); if (idx === techoIdx) r.classList.add('techo'); }
      else r.classList.add('prohibida');
    });
    var veredicto = document.getElementById('dieVeredicto');

    if (ofrecido === 'ganadora') {
      veredicto.innerHTML = 'Ofrecés una bola <strong>ganadora</strong>: no hay trampa que tender, estás definiendo el punto vos. Aun así, si la ejecución falla, podés venderte y darle el contraataque al rival.';
      return;
    }

    // El rival "ideal" respeta el techo. La trampa aparece si se pasa.
    var maxExceso = 3 - techoIdx; // cuántos escalones por encima del techo puede llegar
    var devuelve = DEVOLUCION[maxExceso] || 'defensiva';
    var miTechoTrasError = TECHO[devuelve];
    var miMejor = NIVELES[miTechoTrasError];

    veredicto.innerHTML =
      'Ofrecés una bola <strong>' + ofrecido + '</strong>: el rival debería responder como mucho <strong>' + NIVELES[techoIdx] + '</strong>. ' +
      'Si se vende y se pasa, su sobre-exigencia te devuelve una bola <strong>' + devuelve + '</strong>… y ahí tu techo sube hasta <strong>' + miMejor + '</strong>. Esa es la trampa.';
  }


  // ====================================================================
  // NAVEGACIÓN Y TOGGLES
  // ====================================================================
  function mostrarBloqueManual(bloque, btn) {
    document.querySelectorAll('.manual-bloque').forEach(function(b){ b.style.display = 'none'; });
    document.querySelectorAll('.manual-nav-btn').forEach(function(b){ b.classList.remove('active'); });
    var target = document.getElementById('manual-bloque-' + bloque);
    if (target) target.style.display = 'block';
    if (btn) btn.classList.add('active');
    // Al entrar al bloque D.I.E., construir el rango de golpes (una vez)
    if (bloque === 'die') construirRangoGolpes();
  }

  function toggleManualSeccion(header) {
    var body = header.nextElementSibling;
    body.classList.toggle('collapsed');
    var icon = header.querySelector('.toggle-icon');
    if (icon) icon.textContent = body.classList.contains('collapsed') ? '▶' : '▼';
  }

  function mostrarGolpeManual(golpeKey, btn) {
    document.querySelectorAll('.manual-golpe-content').forEach(function(el){ el.style.display = 'none'; });
    document.querySelectorAll('.manual-golpe-tab').forEach(function(el){ el.classList.remove('active'); });
    var target = document.getElementById('manual-golpe-' + golpeKey);
    if (target) target.style.display = 'block';
    if (btn) btn.classList.add('active');
  }

  // ===== Exposición global =====
  window.prepararVistaManual = prepararVistaManual;
  window.toggleManualSeccion = toggleManualSeccion;
  window.mostrarGolpeManual = mostrarGolpeManual;
  window.mostrarBloqueManual = mostrarBloqueManual;
  window.dieSetModo = dieSetModo;
  window.dieRecibir = dieRecibir;
})();
