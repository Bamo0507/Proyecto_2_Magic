# Proyecto 2, completar el set base de Modern Horizons 3

CC3074 Modelización y Simulación, Universidad del Valle de Guatemala.
Bryan Martínez (23542), Adriana Palacios (23044), Pedro Avila (23089).

Simulación de la compra de producto sellado de Modern Horizons 3 (MH3) para completar las 303 cartas del set base al menor costo neto, comparando la compra directa de cartas sueltas con abrir sobres o cajas y con una regla de parada óptima.

## Estructura

```
simulacion/
  configuracion.py         carpeta del set con el que se trabaja
  semillas.py              semillas fijas de los experimentos
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
  motor.py                 ciclo de simulación y cierre de cuentas
  ejecutar.py              corrida de ejemplo
web/                       interfaz (pendiente)
```

## Cómo reproducir

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python -m simulacion.datos.descargar
.venv/bin/python -m simulacion.ejecutar
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

## Supuestos del modelo

- Comprador y vendedor en Estados Unidos sobre TCGplayer.
- Compra de cartas sueltas a Market Price con el mínimo de $0.40 de TCGplayer Direct, con envío gratis desde $50 y $3.99 por debajo.
- Venta de repetidas a Market Price menos 10.75% de comisión (tope de $75), 2.5% de transacción y $0.30 por pedido, y solo se vende si el neto es positivo.
- Una copia foil de una carta del set base cuenta para completarlo. Si salen varias copias de una carta, se guarda la que menos se recuperaría al venderla.
- Los sobres son independientes entre sí, incluso dentro de una caja.
