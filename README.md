# Proyecto 2, completar el set base de Modern Horizons 3

CC3074 Modelización y Simulación, Universidad del Valle de Guatemala.
Bryan Martínez (23542), Adriana Palacios (23044), Pedro Avila (23089).

Simulación de la compra de producto sellado de Modern Horizons 3 (MH3) para completar las 303 cartas del set base al menor costo neto, comparando la compra directa de cartas sueltas con abrir sobres o cajas y con una regla de parada óptima.

## Estructura

```
simulacion/
  configuracion.py         carpeta del set con el que se trabaja y carpeta de resultados
  semillas.py              semillas fijas de los experimentos y de la verificación
  datos/
    descargar.py           descarga y congela los datos del set activo
    mh3_play/              un set por carpeta (configuración, cartas, composición de sobres, precios de sellado)
  modelo/
    catalogo.py            carga los datos y define los términos del dominio
    generador_sobres.py    abre sobres al azar
    probabilidades_sobre.py   probabilidad exacta de cada carta por sobre
    mercado.py             precios de compra y venta con comisiones
    coleccion.py           estado de la colección
  estrategias/
    base.py                contrato común de las estrategias
    parada_optima.py       regla de parada óptima de mirar un paso adelante
    solo_sobres.py         abrir sobres hasta completar el set, sin comprar sueltas
  verificacion/
    coleccionista_cupones.py   sobres para completar contra la fórmula del coleccionista de cupones
    frecuencias_rareza.py      rarezas de la ranura rara contra las tasas de Wizards
    comparacion.py         error relativo e intervalos de confianza
    ejecutar.py            corre la verificación y guarda sus CSV
  motor.py                 ciclo de simulación y cierre de cuentas
  exportar_csv.py          salidas en CSV
  ejecutar.py              corrida de ejemplo
  experimentos.py          todas las estrategias con las semillas de los experimentos
resultados/                CSV generados, una carpeta por set
web/                       interfaz en Next.js (ver web/README.md)
```

## Cómo reproducir

El entorno se arma con Nix: `nix develop` entra a un shell con Python 3.13 y crea `.venv` con `requirements.txt`.

```bash
nix develop
python -m simulacion.datos.descargar
python -m simulacion.ejecutar
python -m simulacion.experimentos
python -m simulacion.verificacion.ejecutar
```

El paso de descarga es opcional, porque los datos congelados ya vienen en `simulacion/datos/mh3_play/`. Si se vuelve a correr, la fecha de consulta y los precios cambian.

Para simular otro set se crea su carpeta en `simulacion/datos/` con un `configuracion_set.json` y un `precios_sellados.json`, se apunta `CARPETA_SET_ACTIVO` a esa carpeta y se corre la descarga.

## Datos

| Archivo | Contenido | Fuente |
|---|---|---|
| `configuracion_set.json` | Código del set, número de cartas del set base y código del sobre en la fuente | Definido por el equipo |
| `cartas.json` | Precio normal y foil en USD de cada carta que puede salir en un sobre | Scryfall, que reporta el Market Price de TCGplayer |
| `composicion_sobres.json` | Composiciones de sobre, pozos de cartas y peso de cada carta | [magic-sealed-data](https://github.com/taw/magic-sealed-data), construido a partir del artículo oficial de Wizards of the Coast |
| `precios_sellados.json` | Market Price del sobre y de la caja de 36 | Páginas de producto de TCGplayer, anotado a mano |

## Salidas en CSV

Quedan en `resultados/<set>/` y se unen entre sí por `estrategia` y `semilla`.

| Archivo | Contenido |
|---|---|
| `resultados.csv` | Una fila por simulación de los experimentos con todos los campos de `Resultado` menos el historial |
| `historial_faltantes.csv` | Cartas faltantes contra sobres abiertos, una fila por producto abierto, para la gráfica de faltantes |
| `verificacion_solo_sobres.csv` | Las réplicas de solo sobres que usa la verificación, mismas columnas que `resultados.csv` |
| `verificacion_coleccionista.csv` | Sobres para completar según la fórmula y según la simulación, con IC del 95% y error relativo |
| `verificacion_rareza.csv` | Frecuencia simulada de cada rareza en la ranura rara, tasa según los pesos de los datos, tasa de Wizards y error relativo |

## Verificación

- Sobres que necesita solo sobres para completar el set contra el coleccionista de cupones con probabilidades distintas, usando la probabilidad de cada carta por sobre de `calcular_probabilidades_por_sobre`. La fórmula supone que las cartas de un sobre salen de forma independiente; el generador saca sin repetir dentro de cada pozo, así que completa un poco más rápido y la diferencia no es solo de muestreo.
- Frecuencias de rara, mítica y variante en la ranura rara contra las tasas publicadas por Wizards, anotadas en `ranura_rara` de `configuracion_set.json`.

## Supuestos del modelo

- Comprador y vendedor en Estados Unidos sobre TCGplayer.
- Compra de cartas sueltas a Market Price con el mínimo de $0.40 de TCGplayer Direct, con envío gratis desde $50 y $3.99 por debajo.
- Venta de repetidas a Market Price menos 10.75% de comisión (tope de $75), 2.5% de transacción y $0.30 por pedido, y solo se vende si el neto es positivo.
- Una copia foil de una carta del set base cuenta para completarlo. Si salen varias copias de una carta, se guarda la que menos se recuperaría al venderla.
- Los sobres son independientes entre sí, incluso dentro de una caja.
