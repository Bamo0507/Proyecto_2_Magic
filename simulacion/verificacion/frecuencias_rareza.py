# Compara qué tan seguido sale cada rareza en la ranura rara del generador contra las tasas que publica Wizards of
# the Coast. El pozo de la ranura rara y las tasas oficiales se anotan en configuracion_set.json de cada set.
#
# Una carta de la ranura rara es variante si no pertenece al set base (versiones sin borde, retro y demás); si
# pertenece, cuenta como rara o mítica según su rareza. Además de la frecuencia simulada se reporta la tasa que dan
# los pesos de los datos, para separar el error de muestreo del generador de la diferencia entre los datos y Wizards.
from collections import Counter
from dataclasses import dataclass

import numpy as np

from simulacion.modelo.catalogo import leer_json
from simulacion.modelo.generador_sobres import GeneradorSobres
from simulacion.verificacion.comparacion import error_relativo, intervalo_confianza_proporcion

CATEGORIA_POR_RAREZA = {"rare": "rara", "mythic": "mitica"}
CATEGORIA_VARIANTE = "variante"


@dataclass(frozen=True)
class RanuraRara:
    pozo: str
    tasas_oficiales: dict[str, float]
    fuente: str


@dataclass(frozen=True)
class ComparacionRareza:
    categoria: str
    cartas_simuladas: int
    sobres_abiertos: int
    frecuencia_simulada: float
    limite_inferior_ic95: float
    limite_superior_ic95: float
    tasa_pesos_datos: float
    tasa_oficial: float
    error_relativo: float


def leer_ranura_rara(carpeta_set):
    ranura = leer_json(carpeta_set / "configuracion_set.json")["ranura_rara"]
    return RanuraRara(ranura["pozo"], ranura["tasas_oficiales"], ranura["fuente"])


def categoria_ranura_rara(catalogo, identificador):
    if not catalogo.es_carta_del_set_base(identificador):
        return CATEGORIA_VARIANTE
    rareza = catalogo.cartas[identificador]["rareza"]
    if rareza not in CATEGORIA_POR_RAREZA:
        raise ValueError(f"La carta {identificador} del set base salió en la ranura rara con rareza {rareza}")
    return CATEGORIA_POR_RAREZA[rareza]


def tasas_segun_pesos(catalogo, nombre_pozo):
    pozo = catalogo.pozos[nombre_pozo]
    tasas = Counter()
    for identificador, probabilidad in zip(pozo.identificadores, pozo.probabilidades):
        tasas[categoria_ranura_rara(catalogo, identificador)] += float(probabilidad)
    return tasas


def contar_ranura_rara(catalogo, nombre_pozo, cantidad_sobres, semilla):
    generador_sobres = GeneradorSobres(catalogo, np.random.default_rng(semilla))
    conteos = Counter()
    for numero_sobre in range(cantidad_sobres):
        for carta in generador_sobres.abrir_sobre_por_pozo()[nombre_pozo]:
            conteos[categoria_ranura_rara(catalogo, carta.identificador)] += 1
    return conteos


def comparar_frecuencias_ranura_rara(catalogo, ranura_rara, cantidad_sobres, semilla):
    conteos = contar_ranura_rara(catalogo, ranura_rara.pozo, cantidad_sobres, semilla)
    tasas_datos = tasas_segun_pesos(catalogo, ranura_rara.pozo)
    cartas_en_ranura = sum(conteos.values())
    comparaciones = []
    for categoria, tasa_oficial in ranura_rara.tasas_oficiales.items():
        frecuencia = conteos[categoria] / cartas_en_ranura
        limite_inferior, limite_superior = intervalo_confianza_proporcion(conteos[categoria], cartas_en_ranura)
        comparaciones.append(
            ComparacionRareza(
                categoria=categoria,
                cartas_simuladas=conteos[categoria],
                sobres_abiertos=cantidad_sobres,
                frecuencia_simulada=frecuencia,
                limite_inferior_ic95=float(limite_inferior),
                limite_superior_ic95=float(limite_superior),
                tasa_pesos_datos=tasas_datos[categoria],
                tasa_oficial=tasa_oficial,
                error_relativo=error_relativo(frecuencia, tasa_oficial),
            )
        )
    return comparaciones
