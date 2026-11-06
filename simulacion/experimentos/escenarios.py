# Arma las estrategias que se comparan en los experimentos y las corre con una lista de semillas.
#
# Condiciones del diseño experimental
#   Sin optimizar, las estrategias que no toman decisiones: comprar todo suelto, abrir solo sobres y abrir solo cajas
#   hasta completar el set. La mejor de las tres es el escenario base.
#   Mejorada, la regla de parada óptima de mirar un paso adelante con sobres y cajas.
#   De contraste, la misma regla sin cajas, que separa el efecto de parar a tiempo del descuento de la caja.
#
# Todas las estrategias usan las mismas semillas, así cada réplica de una estrategia se puede emparejar con la réplica
# de otra que tuvo el mismo azar al inicio.
from dataclasses import dataclass

from simulacion.estrategias.comprar_sueltas import CompraSuelta
from simulacion.estrategias.parada_optima import ReglaUnPasoAdelante
from simulacion.estrategias.solo_cajas import SoloCajas
from simulacion.estrategias.solo_sobres import SoloSobres
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.modelo.motor import simular

ESTRATEGIAS_SIN_OPTIMIZAR = (CompraSuelta.nombre, SoloSobres.nombre, SoloCajas.nombre)
ESTRATEGIA_MEJORADA = "parada_optima"
ESTRATEGIA_SIN_CAJAS = "parada_optima_sin_cajas"


@dataclass(frozen=True)
class Escenario:
    catalogo: object
    mercado: object
    estrategias: tuple

    @property
    def regla_parada(self):
        return next(estrategia for estrategia in self.estrategias if estrategia.nombre == ESTRATEGIA_MEJORADA)


def armar_escenario(catalogo, mercado):
    probabilidades = calcular_probabilidades_por_sobre(catalogo)
    estrategias = (
        CompraSuelta(),
        SoloSobres(),
        SoloCajas(),
        ReglaUnPasoAdelante(probabilidades, mercado, catalogo),
        ReglaUnPasoAdelante(probabilidades, mercado, catalogo, permitir_cajas=False),
    )
    return Escenario(catalogo, mercado, estrategias)


def correr_escenario(escenario, semillas):
    return [
        simular(estrategia, escenario.catalogo, escenario.mercado, semilla)
        for estrategia in escenario.estrategias
        for semilla in semillas
    ]
