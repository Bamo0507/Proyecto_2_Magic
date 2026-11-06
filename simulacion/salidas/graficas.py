# Genera las gráficas del informe a partir de los CSV de resultados, así se pueden rehacer sin volver a simular.
# Requiere haber corrido antes el escenario base, la sensibilidad y la verificación.
#
#   faltantes_por_sobre.png      comportamiento, cartas faltantes contra sobres abiertos y dónde para la regla
#   costo_por_estrategia.png     comparación de escenarios, costo neto de cada réplica con su media e IC 95%
#   sensibilidad.png             costo neto ante cambios del precio de la caja y de la comisión de venta
#   verificacion_coleccionista.png   sobres para completar el set, simulación contra la fórmula
import csv
from collections import defaultdict

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from simulacion.configuracion import CARPETA_RESULTADOS, CARPETA_SET_ACTIVO
from simulacion.modelo.catalogo import Catalogo
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.modelo.referencia_real import leer_referencia_real

CARPETA_GRAFICAS = CARPETA_RESULTADOS / "graficas"
PUNTOS_POR_PULGADA = 200

COLOR_SERIE_1 = "#2a78d6"
COLOR_SERIE_2 = "#eb6834"
COLOR_SERIE_3 = "#1baf7a"
COLOR_NEUTRO = "#8a8984"
COLOR_TEXTO = "#0b0b0b"
COLOR_TEXTO_SECUNDARIO = "#52514e"
COLOR_REJILLA = "#e4e3df"
COLOR_FONDO = "#fcfcfb"

plt.rcParams.update({
    "figure.facecolor": COLOR_FONDO,
    "axes.facecolor": COLOR_FONDO,
    "axes.edgecolor": COLOR_REJILLA,
    "axes.labelcolor": COLOR_TEXTO_SECUNDARIO,
    "axes.titlecolor": COLOR_TEXTO,
    "axes.titlesize": 12,
    "axes.titleweight": "bold",
    "axes.titlelocation": "left",
    "axes.grid": True,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "grid.color": COLOR_REJILLA,
    "grid.linewidth": 0.8,
    "xtick.color": COLOR_TEXTO_SECUNDARIO,
    "ytick.color": COLOR_TEXTO_SECUNDARIO,
    "legend.frameon": False,
    "legend.labelcolor": COLOR_TEXTO_SECUNDARIO,
    "font.size": 10,
    "lines.linewidth": 2,
})


def leer_csv(nombre):
    with (CARPETA_RESULTADOS / nombre).open(encoding="utf-8") as archivo:
        return list(csv.DictReader(archivo))


def guardar(figura, nombre):
    CARPETA_GRAFICAS.mkdir(parents=True, exist_ok=True)
    figura.tight_layout()
    figura.savefig(CARPETA_GRAFICAS / nombre, dpi=PUNTOS_POR_PULGADA)
    plt.close(figura)


def formato_dolares(eje):
    eje.xaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter("${x:,.0f}"))


def graficar_faltantes_por_sobre(catalogo):
    historial = defaultdict(list)
    for fila in leer_csv("historial_faltantes.csv"):
        historial[(fila["estrategia"], fila["semilla"])].append(
            (int(fila["sobres_abiertos"]), int(fila["cartas_faltantes"]))
        )
    sobres_maximos = 600
    eje_sobres = np.arange(sobres_maximos + 1)
    probabilidad_por_sobre = calcular_probabilidades_por_sobre(catalogo).probabilidad_al_menos_una_copia
    faltantes_esperadas = ((1 - probabilidad_por_sobre)[None, :] ** eje_sobres[:, None]).sum(axis=1)

    figura, eje = plt.subplots(figsize=(8, 4.6))
    trayectorias_solo_sobres = [puntos for (estrategia, semilla), puntos in historial.items() if estrategia == "solo_sobres"]
    for puntos in trayectorias_solo_sobres:
        sobres, faltantes = zip(*puntos)
        eje.plot(sobres, faltantes, color=COLOR_SERIE_1, alpha=0.18, linewidth=1)
    eje.plot([], [], color=COLOR_SERIE_1, linewidth=1, label="Solo sobres, una línea por réplica")
    eje.plot(
        eje_sobres, faltantes_esperadas, color=COLOR_SERIE_2, linestyle="--",
        label="Faltantes esperadas según las probabilidades exactas",
    )
    paradas = [puntos[-1] for (estrategia, semilla), puntos in historial.items() if estrategia == "parada_optima"]
    sobres_parada, faltantes_parada = zip(*paradas)
    eje.scatter(
        sobres_parada, faltantes_parada, s=40, color=COLOR_SERIE_3, edgecolor=COLOR_FONDO, linewidth=1.5, zorder=3,
        label="Punto donde para la parada óptima",
    )
    eje.set_xlim(0, sobres_maximos)
    eje.set_ylim(0, catalogo.cantidad_cartas_base + 5)
    eje.set_xlabel("Sobres abiertos")
    eje.set_ylabel("Cartas del set base que faltan")
    eje.set_title(f"Cartas faltantes al abrir sobres, {len(trayectorias_solo_sobres)} réplicas")
    eje.legend(loc="upper right")
    guardar(figura, "faltantes_por_sobre.png")


def graficar_costo_por_estrategia(referencia_real):
    resultados = leer_csv("resultados.csv")
    resumenes = leer_csv("resumen_estrategias.csv")
    resumenes.sort(key=lambda resumen: float(resumen["costo_neto_medio"]), reverse=True)

    figura, eje = plt.subplots(figsize=(8, 4.2))
    generador = np.random.default_rng(0)
    for posicion, resumen in enumerate(resumenes):
        color = COLOR_SERIE_1 if resumen["estrategia"] == "parada_optima" else COLOR_NEUTRO
        costos = [float(fila["costo_neto"]) for fila in resultados if fila["estrategia"] == resumen["estrategia"]]
        desplazamiento = generador.uniform(-0.15, 0.15, len(costos))
        eje.scatter(costos, posicion + desplazamiento, s=14, color=color, alpha=0.45, linewidth=0)
        media = float(resumen["costo_neto_medio"])
        limite_inferior = float(resumen["limite_inferior_ic95"])
        limite_superior = float(resumen["limite_superior_ic95"])
        eje.errorbar(
            media, posicion, xerr=[[media - limite_inferior], [limite_superior - media]], fmt="o", markersize=8,
            color=color, markeredgecolor=COLOR_FONDO, markeredgewidth=1.5, capsize=4, elinewidth=2, zorder=3,
        )
        eje.annotate(
            f"${media:,.0f}", (max(max(costos), limite_superior), posicion), xytext=(10, 0),
            textcoords="offset points", va="center", color=COLOR_TEXTO, fontsize=9,
        )
    if referencia_real is not None:
        eje.axvline(referencia_real.precio_desde_usd, color=COLOR_SERIE_2, linestyle="--", linewidth=1.5)
        # La etiqueta va abajo, donde la fila de solo sobres deja libre la zona cercana a la línea
        eje.annotate(
            f"{referencia_real.fuente.split(',')[0]}, ${referencia_real.precio_desde_usd:,.0f}",
            (referencia_real.precio_desde_usd, 0.02), xycoords=eje.get_xaxis_transform(), xytext=(5, 0),
            textcoords="offset points", va="bottom", color=COLOR_SERIE_2, fontsize=9, fontweight="bold",
        )
    eje.set_yticks(range(len(resumenes)), [resumen["nombre_legible"] for resumen in resumenes])
    eje.grid(axis="y", visible=False)
    formato_dolares(eje)
    eje.set_xlabel("Costo neto para completar el set base (USD)")
    eje.set_title(f"Costo neto por estrategia, {resumenes[0]['replicas']} réplicas, media e IC 95%")
    guardar(figura, "costo_por_estrategia.png")


def valor_donde_la_caja_deja_ganancia(filas, columna_x):
    # Interpola entre las dos variantes donde el precio de la caja cruza su precio umbral; la venta neta es lineal en
    # el precio y en la comisión, así que la interpolación lineal da el punto de cruce
    valores_x = np.array([float(fila[columna_x]) for fila in filas])
    margen = np.array([float(fila["precio_umbral_caja"]) - float(fila["precio_caja"]) for fila in filas])
    for posicion in range(len(filas) - 1):
        if (margen[posicion] > 0) != (margen[posicion + 1] > 0):
            fraccion = margen[posicion] / (margen[posicion] - margen[posicion + 1])
            return float(valores_x[posicion] + fraccion * (valores_x[posicion + 1] - valores_x[posicion]))
    return None


def graficar_sensibilidad():
    filas = leer_csv("sensibilidad.csv")
    paneles = (
        ("factor_precio_caja", "precio_caja", "Precio de la caja (USD)", "${x:,.0f}"),
        ("comision_venta", "comision_venta", "Comisión de venta de TCGplayer", "{x:.2%}"),
    )
    figura, ejes = plt.subplots(1, 2, figsize=(10, 4.4), sharey=True)
    for eje, (parametro, columna_x, etiqueta_x, formato_x) in zip(ejes, paneles):
        propias = sorted(
            (fila for fila in filas if fila["parametro"] == parametro), key=lambda fila: float(fila[columna_x])
        )
        valores_x = [float(fila[columna_x]) for fila in propias]
        series = (
            ("costo_neto_mejor_sin_optimizar", "Mejor estrategia sin optimizar", COLOR_NEUTRO, "s"),
            ("costo_neto_parada_optima", "Parada óptima", COLOR_SERIE_1, "o"),
        )
        for columna, etiqueta, color, marcador in series:
            eje.plot(
                valores_x, [float(fila[columna]) for fila in propias], color=color, marker=marcador, markersize=7,
                label=etiqueta,
            )
        eje.fill_between(
            valores_x, [float(fila["parada_limite_inferior_ic95"]) for fila in propias],
            [float(fila["parada_limite_superior_ic95"]) for fila in propias], color=COLOR_SERIE_1, alpha=0.12,
            linewidth=0,
        )
        umbral = valor_donde_la_caja_deja_ganancia(propias, columna_x)
        if umbral is not None:
            eje.axvspan(eje.get_xlim()[0], umbral, color=COLOR_NEUTRO, alpha=0.1, linewidth=0)
            eje.annotate(
                "Zona gris, la caja deja\nganancia solo con la reventa", (0, 0), xycoords="axes fraction",
                xytext=(6, 8), textcoords="offset points", ha="left", color=COLOR_TEXTO_SECUNDARIO, fontsize=8,
            )
        eje.axhline(0, color=COLOR_TEXTO_SECUNDARIO, linewidth=0.8)
        eje.xaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter(formato_x))
        eje.set_xticks(valores_x)
        eje.set_xlabel(etiqueta_x)
    ejes[0].yaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter("${x:,.0f}"))
    ejes[0].set_ylabel("Costo neto medio (USD)")
    ejes[0].set_title("Sensibilidad al precio de la caja")
    ejes[1].set_title("Sensibilidad a la comisión de venta")
    ejes[1].legend(loc="center right")
    guardar(figura, "sensibilidad.png")


def graficar_verificacion_coleccionista():
    sobres = np.array([int(fila["sobres_abiertos"]) for fila in leer_csv("verificacion_solo_sobres.csv")])
    comparacion = leer_csv("verificacion_coleccionista.csv")[0]
    figura, eje = plt.subplots(figsize=(8, 4.2))
    eje.hist(sobres, bins=40, color=COLOR_SERIE_1, edgecolor=COLOR_FONDO, linewidth=1)
    media_formula = float(comparacion["media_formula"])
    media_simulada = float(comparacion["media_simulada"])
    eje.axvline(media_formula, color=COLOR_SERIE_2, linestyle="--", label=f"Fórmula del coleccionista, {media_formula:.1f}")
    eje.axvline(media_simulada, color=COLOR_TEXTO, linewidth=1.5, label=f"Media simulada, {media_simulada:.1f}")
    eje.grid(axis="x", visible=False)
    eje.set_xlabel("Sobres necesarios para completar el set base")
    eje.set_ylabel("Réplicas")
    eje.set_title(f"Sobres para completar el set solo con sobres, {len(sobres)} réplicas")
    eje.legend(loc="upper right")
    guardar(figura, "verificacion_coleccionista.png")


catalogo = Catalogo(CARPETA_SET_ACTIVO)
referencia_real = leer_referencia_real(CARPETA_SET_ACTIVO)
graficar_faltantes_por_sobre(catalogo)
graficar_costo_por_estrategia(referencia_real)
graficar_sensibilidad()
graficar_verificacion_coleccionista()
print(f"Gráficas guardadas en {CARPETA_GRAFICAS}")
