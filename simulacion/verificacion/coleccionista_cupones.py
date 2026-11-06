# Compara los sobres que necesita la estrategia solo sobres para completar el set base contra la fórmula del problema
# del coleccionista de cupones con probabilidades distintas.
#
# Si q es la probabilidad de que una carta salga al menos una vez en un sobre, después de abrir n sobres la carta sigue
# faltando con probabilidad (1 - q)^n, y el set está completo con probabilidad igual al producto, sobre todas las
# cartas, de 1 - (1 - q)^n. La cantidad de sobres N cumple E[N] = suma desde n = 0 de P(N > n) y
# E[N^2] = suma desde n = 0 de (2n + 1) P(N > n), donde P(N > n) es lo que le falta al producto para llegar a uno.
#
# La fórmula trata a las cartas como independientes dentro de un mismo sobre. En el generador no lo son del todo,
# porque las cartas de un mismo pozo se sacan sin repetir y compiten por el mismo lugar, así que se espera una
# diferencia pequeña además del error por muestreo.
from dataclasses import dataclass

import numpy as np

from simulacion.estrategias.solo_sobres import SoloSobres
from simulacion.modelo.motor import simular
from simulacion.verificacion.comparacion import error_relativo, intervalo_confianza_media

# Se suman términos hasta que la probabilidad de seguir sin completar el set es menor que esta tolerancia
TOLERANCIA_COLA = 1e-12
SOBRES_POR_BLOQUE = 1_000


@dataclass(frozen=True)
class SobresEsperados:
    media: float
    desviacion_estandar: float


@dataclass(frozen=True)
class ComparacionColeccionista:
    replicas: int
    media_formula: float
    desviacion_formula: float
    media_simulada: float
    desviacion_simulada: float
    limite_inferior_ic95: float
    limite_superior_ic95: float
    error_relativo: float


def probabilidad_set_incompleto(probabilidad_por_sobre, cantidades_sobres):
    # Se trabaja con logaritmos para que el producto de cientos de factores cercanos a uno no pierda precisión. Con cero
    # sobres el logaritmo de ya haber visto la carta es menos infinito, y eso deja la probabilidad en uno como debe ser.
    log_faltar = np.log1p(-probabilidad_por_sobre)
    with np.errstate(divide="ignore"):
        log_ya_salio = np.log1p(-np.exp(np.outer(cantidades_sobres, log_faltar)))
    return -np.expm1(log_ya_salio.sum(axis=1))


def sobres_esperados_para_completar(probabilidad_por_sobre):
    suma_probabilidades = 0.0
    suma_ponderada = 0.0
    inicio = 0
    while True:
        cantidades_sobres = np.arange(inicio, inicio + SOBRES_POR_BLOQUE)
        incompleto = probabilidad_set_incompleto(probabilidad_por_sobre, cantidades_sobres)
        suma_probabilidades += incompleto.sum()
        suma_ponderada += ((2 * cantidades_sobres + 1) * incompleto).sum()
        if incompleto[-1] < TOLERANCIA_COLA:
            break
        inicio += SOBRES_POR_BLOQUE
    varianza = suma_ponderada - suma_probabilidades**2
    return SobresEsperados(media=float(suma_probabilidades), desviacion_estandar=float(np.sqrt(varianza)))


def simular_solo_sobres(catalogo, mercado, semillas):
    estrategia = SoloSobres()
    return [simular(estrategia, catalogo, mercado, semilla) for semilla in semillas]


def comparar_con_coleccionista(probabilidades, resultados_solo_sobres):
    esperados = sobres_esperados_para_completar(probabilidades.probabilidad_al_menos_una_copia)
    sobres_simulados = np.array([resultado.sobres_abiertos for resultado in resultados_solo_sobres], dtype=float)
    media_simulada = float(sobres_simulados.mean())
    limite_inferior, limite_superior = intervalo_confianza_media(sobres_simulados)
    return ComparacionColeccionista(
        replicas=len(sobres_simulados),
        media_formula=esperados.media,
        desviacion_formula=esperados.desviacion_estandar,
        media_simulada=media_simulada,
        desviacion_simulada=float(sobres_simulados.std(ddof=1)),
        limite_inferior_ic95=limite_inferior,
        limite_superior_ic95=limite_superior,
        error_relativo=error_relativo(media_simulada, esperados.media),
    )
