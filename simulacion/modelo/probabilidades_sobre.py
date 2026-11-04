# Calcula de forma exacta, con las mismas reglas del generador de sobres, qué tan probable es que cada carta salga
# en un sobre y cuántas copias se esperan de ella.
#
# Si de un pozo se saca una sola carta, la probabilidad de cada carta es su peso dividido entre el peso total. Si se
# sacan varias sin repetir y todas pesan igual, cada carta sale con probabilidad igual a las cartas que se sacan entre
# las cartas que tiene el pozo. Como los pozos se sortean por separado, la probabilidad de no ver una carta en el sobre
# es el producto de las probabilidades de no verla en cada pozo, y la de verla al menos una vez es lo que le falta a
# ese producto para llegar a uno. Al final se promedia según qué tan seguido sale cada composición de sobre.
from collections import defaultdict
from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class ProbabilidadesSobre:
    probabilidad_al_menos_una_copia: np.ndarray
    copias_normales_esperadas: np.ndarray
    copias_foil_esperadas: np.ndarray
    copias_esperadas_fuera_del_set: dict[tuple[str, bool], float]


def probabilidad_de_salir_en_pozo(pozo, cantidad, nombre_pozo):
    if cantidad == 1:
        return pozo.probabilidades
    if not pozo.todas_igual_de_probables:
        raise ValueError(f"El pozo {nombre_pozo} saca {cantidad} cartas con pesos distintos y no tiene cálculo exacto")
    if len(set(pozo.identificadores)) != len(pozo.identificadores):
        raise ValueError(f"El pozo {nombre_pozo} saca {cantidad} cartas y repite una carta en normal y foil")
    return np.full(len(pozo.identificadores), cantidad / len(pozo.identificadores))


def calcular_probabilidades_por_sobre(catalogo):
    cantidad_base = catalogo.cantidad_cartas_base
    probabilidad_al_menos_una_copia = np.zeros(cantidad_base)
    copias_normales_esperadas = np.zeros(cantidad_base)
    copias_foil_esperadas = np.zeros(cantidad_base)
    copias_esperadas_fuera_del_set = defaultdict(float)

    for composicion in catalogo.composiciones:
        probabilidad_ninguna_copia = np.ones(cantidad_base)
        for nombre_pozo, cantidad in composicion.cartas_por_pozo.items():
            pozo = catalogo.pozos[nombre_pozo]
            probabilidad_en_pozo = np.zeros(cantidad_base)
            probabilidades_de_salir = probabilidad_de_salir_en_pozo(pozo, cantidad, nombre_pozo)
            cartas_del_pozo = zip(pozo.identificadores, pozo.es_foil_por_carta, probabilidades_de_salir)
            for identificador, es_foil, probabilidad in cartas_del_pozo:
                copias_esperadas = composicion.probabilidad * probabilidad
                posicion = catalogo.posicion_en_set_base.get(identificador)
                if posicion is None:
                    copias_esperadas_fuera_del_set[(identificador, bool(es_foil))] += copias_esperadas
                    continue
                probabilidad_en_pozo[posicion] += probabilidad
                if es_foil:
                    copias_foil_esperadas[posicion] += copias_esperadas
                else:
                    copias_normales_esperadas[posicion] += copias_esperadas
            probabilidad_ninguna_copia *= 1 - probabilidad_en_pozo
        probabilidad_al_menos_una_copia += composicion.probabilidad * (1 - probabilidad_ninguna_copia)

    return ProbabilidadesSobre(
        probabilidad_al_menos_una_copia,
        copias_normales_esperadas,
        copias_foil_esperadas,
        dict(copias_esperadas_fuera_del_set),
    )
