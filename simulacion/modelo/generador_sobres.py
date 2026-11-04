# Abre sobres al azar siguiendo la composición del set, sacando las cartas de cada pozo según sus probabilidades.
from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True, slots=True)
class CartaAbierta:
    identificador: str
    es_foil: bool


class GeneradorSobres:
    def __init__(self, catalogo, generador_aleatorio):
        self.catalogo = catalogo
        self.generador_aleatorio = generador_aleatorio
        self.probabilidades_acumuladas_composiciones = np.cumsum(
            [composicion.probabilidad for composicion in catalogo.composiciones]
        )

    def sortear_posicion(self, probabilidades_acumuladas):
        # Se tira un número al azar entre 0 y 1 y se busca en qué tramo de las probabilidades acumuladas cae. El
        # mínimo evita salirse de la lista cuando el redondeo deja la última acumulada apenas por debajo de 1.
        numero_al_azar = self.generador_aleatorio.random()
        posicion = int(np.searchsorted(probabilidades_acumuladas, numero_al_azar, side="right"))
        return min(posicion, len(probabilidades_acumuladas) - 1)

    def sacar_de_pozo(self, pozo, cantidad):
        # Cuando se saca una sola carta basta con el sorteo por tramos, que es más rápido. Cuando se sacan varias, se
        # hace sin reemplazo, porque la impresión de los sobres evita que la misma carta se repita dentro de un sobre.
        if cantidad == 1:
            return [self.sortear_posicion(pozo.probabilidades_acumuladas)]
        return self.generador_aleatorio.choice(
            len(pozo.identificadores),
            size=cantidad,
            replace=False,
            p=None if pozo.todas_igual_de_probables else pozo.probabilidades,
        ).tolist()

    def abrir_sobre(self):
        posicion_composicion = self.sortear_posicion(self.probabilidades_acumuladas_composiciones)
        composicion = self.catalogo.composiciones[posicion_composicion]
        cartas = []
        for nombre_pozo, cantidad in composicion.cartas_por_pozo.items():
            pozo = self.catalogo.pozos[nombre_pozo]
            for posicion in self.sacar_de_pozo(pozo, cantidad):
                cartas.append(CartaAbierta(pozo.identificadores[posicion], bool(pozo.es_foil_por_carta[posicion])))
        return cartas

    def abrir_producto(self, producto):
        return [carta for numero_sobre in range(producto.cantidad_sobres) for carta in self.abrir_sobre()]
