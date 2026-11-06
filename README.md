# Proyecto 2, completar el set base de Modern Horizons 3

CC3074 Modelización y Simulación, Universidad del Valle de Guatemala.
Bryan Martínez (23542), Adriana Palacios (23044), Pedro Avila (23089).

Simulación de la compra de producto sellado de Modern Horizons 3 (MH3) para completar las 303 cartas del set base al menor costo neto, comparando la compra directa de cartas sueltas con abrir sobres o cajas y con una regla de parada óptima.

## Estructura

```
simulacion/
  configuracion.py         carpeta del set con el que se trabaja y carpeta de resultados
  semillas.py              semillas fijas de los experimentos y de la verificación
  datos/                   ¿con qué información trabajamos?
    descargar.py           descarga y congela los datos del set activo
    imagenes.py            links a la imagen de cada carta en Scryfall, sin volver a descargar precios
    mh3_play/              un set por carpeta (configuración, cartas, composición de sobres, precios de sellado,
                           referencia real)
  modelo/                  ¿cómo funciona el sistema?
    catalogo.py            carga los datos y define los términos del dominio
    generador_sobres.py    abre sobres al azar
    probabilidades_sobre.py   probabilidad exacta de cada carta por sobre
    mercado.py             precios de compra y venta con comisiones
    coleccion.py           estado de la colección
    referencia_real.py     precio de un set completo ya armado, la referencia de la vida real
    motor.py               ciclo de simulación y cierre de cuentas
  estrategias/             ¿cómo decide cada estrategia?
    base.py                contrato común de las estrategias
    parada_optima.py       regla de parada óptima de mirar un paso adelante
    solo_sobres.py         abrir sobres hasta completar el set, sin comprar sueltas
    solo_cajas.py          abrir cajas hasta completar el set, sin comprar sueltas
    comprar_sueltas.py     comprar todo el set base suelto
  experimentos/            ¿qué se compara y qué resultó?
    escenarios.py          estrategias que se comparan y cómo se corren
    analisis.py            resumen por estrategia, mejora pareada y tabla de la vida real
    escenario_base.py      todas las estrategias con las semillas de los experimentos
    sensibilidad.py        variantes del precio de la caja y de la comisión de venta
    ejemplo.py             una sola corrida de muestra de la parada óptima
  verificacion/            ¿el simulador es confiable?
    coleccionista_cupones.py   sobres para completar contra la fórmula del coleccionista de cupones
    frecuencias_rareza.py      rarezas de la ranura rara contra las tasas de Wizards
    probabilidades_por_carta.py   probabilidad de cada carta y venta esperada por sobre contra el generador
    consistencia.py        conservación de las cuentas y casos límite
    comparacion.py         error relativo e intervalos de confianza
    ejecutar.py            corre la verificación y guarda sus CSV
  salidas/                 ¿cómo se guardan y se muestran los resultados?
    exportar_csv.py        salidas en CSV
    graficas.py            gráficas del informe a partir de los CSV
    exportar_web.py        corrida de demostración sobre por sobre para la animación de la web
resultados/                CSV generados, una carpeta por set
web/                       interfaz en Next.js (ver web/README.md)
```

## Cómo reproducir

El entorno se arma con Nix: `nix develop` entra a un shell con Python 3.13 y crea `.venv` con `requirements.txt`.

```bash
nix develop
python -m simulacion.datos.descargar
python -m simulacion.experimentos.ejemplo
python -m simulacion.experimentos.escenario_base
python -m simulacion.experimentos.sensibilidad
python -m simulacion.verificacion.ejecutar
python -m simulacion.salidas.graficas
python -m simulacion.salidas.exportar_web
```

Las gráficas leen los CSV, así que van al final. Todo junto corre en menos de un minuto.

`exportar_web` deja en `web/public/data/simulation-run.json` la parada óptima con la semilla de ejemplo, sobre por sobre, con las cartas de cada sobre y cada decisión de la regla. La web solo anima ese archivo, así que lo que se ve en pantalla es la misma corrida del modelo; el script comprueba que su costo neto sea idéntico al del motor. Las imágenes no se descargan: la web las pide al servidor de Scryfall, y si alguna no carga muestra una carta impresa con el nombre y la rareza.

El paso de descarga es opcional, porque los datos congelados ya vienen en `simulacion/datos/mh3_play/`. Si se vuelve a correr, la fecha de consulta y los precios cambian.

Para simular otro set se crea su carpeta en `simulacion/datos/` con un `configuracion_set.json` y un `precios_sellados.json`, se apunta `CARPETA_SET_ACTIVO` a esa carpeta y se corre la descarga.

## Datos

| Archivo | Contenido | Fuente |
|---|---|---|
| `configuracion_set.json` | Código del set, número de cartas del set base y código del sobre en la fuente | Definido por el equipo |
| `cartas.json` | Precio normal y foil en USD de cada carta que puede salir en un sobre | Scryfall, que reporta el Market Price de TCGplayer |
| `composicion_sobres.json` | Composiciones de sobre, pozos de cartas y peso de cada carta | [magic-sealed-data](https://github.com/taw/magic-sealed-data), construido a partir del artículo oficial de Wizards of the Coast |
| `precios_sellados.json` | Market Price del sobre y de la caja de 36 | Páginas de producto de TCGplayer, anotado a mano |
| `referencia_real.json` | Precio de un set completo ya armado, con su fecha y tipo de cambio a USD | Cardmarket, anotado a mano (sin precio no hay referencia) |

## Salidas en CSV

Quedan en `resultados/<set>/` y se unen entre sí por `estrategia` y `semilla`. El detalle de cada archivo y de sus columnas está en [`resultados/mh3_play/README.md`](resultados/mh3_play/README.md).

| Archivo | Contenido |
|---|---|
| `resultados.csv` | Una fila por simulación de los experimentos con todos los campos de `Resultado` menos el historial |
| `historial_faltantes.csv` | Cartas faltantes contra sobres abiertos, una fila por producto abierto, para la gráfica de faltantes |
| `resumen_estrategias.csv` | Costo neto medio, desviación, IC 95% y medias de las demás salidas por estrategia |
| `mejora_parada_optima.csv` | Reducción del costo neto de la parada óptima frente a cada estrategia, pareada por semilla, en dólares y en porcentaje con IC 95% |
| `comparacion_vida_real.csv` | Referencia real, modelo base y modelo mejorado con el cambio absoluto y porcentual respecto del base |
| `sensibilidad.csv` | Por variante, mejor estrategia sin optimizar, parada óptima y reducción porcentual |
| `sensibilidad_por_estrategia.csv` | El resumen de cada estrategia en cada variante |
| `verificacion_solo_sobres.csv` | Las réplicas de solo sobres que usa la verificación, mismas columnas que `resultados.csv` |
| `verificacion_coleccionista.csv` | Sobres para completar según la fórmula y según la simulación, con IC del 95% y error relativo |
| `verificacion_rareza.csv` | Frecuencia simulada de cada rareza en la ranura rara, tasa según los pesos de los datos, tasa de Wizards y error relativo |
| `verificacion_por_carta.csv` | Probabilidad calculada y frecuencia simulada de cada carta del set base por sobre |
| `verificacion_por_carta_resumen.csv` | Proporción de cartas dentro del IC 95%, error relativo y venta neta por sobre calculada contra simulada |
| `verificacion_consistencia.csv` | Casos revisados y fallas de cada prueba de consistencia |
| `graficas/` | Las gráficas del informe en PNG |

## Verificación

- Sobres que necesita solo sobres para completar el set contra el coleccionista de cupones con probabilidades distintas, usando la probabilidad de cada carta por sobre de `calcular_probabilidades_por_sobre`. La fórmula supone que las cartas de un sobre salen de forma independiente; el generador saca sin repetir dentro de cada pozo, así que completa un poco más rápido y la diferencia no es solo de muestreo.
- Frecuencias de rara, mítica y variante en la ranura rara contra las tasas publicadas por Wizards, anotadas en `ranura_rara` de `configuracion_set.json`.
- Probabilidad de cada carta por sobre y venta neta esperada por sobre, que son las entradas de la regla de parada, contra lo que sale del generador.
- Pruebas de consistencia, el costo neto cuadra con lo gastado y lo vendido, el gasto cuadra con lo abierto, y los casos límite (comprar sueltas, caja o sellado a precio imposible) dan lo que se sabe sin simular.

## Diseño experimental

- Sin optimizar, comprar sueltas, solo sobres y solo cajas. La de menor costo neto medio es el escenario base.
- Mejorado, la parada óptima con sobres y cajas.
- De contraste, la parada óptima sin cajas, que separa el efecto de parar a tiempo del descuento de la caja.
- Todas las estrategias usan las mismas 31 semillas, y la mejora se mide pareada por semilla.
- Sensibilidad de un parámetro a la vez, precio de la caja de 80% a 120% y comisión de venta de 6.75% a 14.75%.

## Supuestos del modelo

- Comprador y vendedor en Estados Unidos sobre TCGplayer.
- Compra de cartas sueltas a Market Price con el mínimo de $0.40 de TCGplayer Direct, con envío gratis desde $50 y $3.99 por debajo.
- Venta de repetidas a Market Price menos 10.75% de comisión (tope de $75), 2.5% de transacción y $0.30 por pedido, y solo se vende si el neto es positivo.
- Una copia foil de una carta del set base cuenta para completarlo. Si salen varias copias de una carta, se guarda la que menos se recuperaría al venderla.
- Los sobres son independientes entre sí, incluso dentro de una caja.
- Se puede vender cualquier cantidad de cartas a Market Price, sin que el precio baje.
- La parada óptima para siempre con el set completo. Si la caja cuesta menos que la venta esperada de sus 36 sobres (precio umbral), abrirla deja ganancia por sí sola y la regla no pararía nunca.
- La regla ignora el envío de la compra final al decidir; el envío sí se cobra al cerrar las cuentas.
