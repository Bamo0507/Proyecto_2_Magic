# Estado de la colección durante la simulación, copias de cada carta del set base, cartas fuera del set y gasto.
from collections import Counter

import numpy as np


class Coleccion:
    def __init__(self, catalogo):
        self.catalogo = catalogo
        self.copias_normales = np.zeros(catalogo.cantidad_cartas_base, dtype=int)
        self.copias_foil = np.zeros(catalogo.cantidad_cartas_base, dtype=int)
        self.cartas_fuera_del_set = Counter()
        self.compras_por_producto = Counter()
        self.sobres_abiertos = 0
        self.gasto_en_sobres_y_cajas = 0.0

    def agregar_cartas(self, cartas):
        for carta in cartas:
            posicion = self.catalogo.posicion_en_set_base.get(carta.identificador)
            if posicion is None:
                self.cartas_fuera_del_set[(carta.identificador, carta.es_foil)] += 1
            elif carta.es_foil:
                self.copias_foil[posicion] += 1
            else:
                self.copias_normales[posicion] += 1

    def registrar_compra(self, producto):
        self.compras_por_producto[producto.tipo] += 1
        self.sobres_abiertos += producto.cantidad_sobres
        self.gasto_en_sobres_y_cajas += producto.precio

    @property
    def cartas_conseguidas(self):
        return (self.copias_normales + self.copias_foil) > 0

    @property
    def cartas_faltantes(self):
        return ~self.cartas_conseguidas

    @property
    def cantidad_faltantes(self):
        return int(self.cartas_faltantes.sum())

    @property
    def esta_completa(self):
        return self.cantidad_faltantes == 0
