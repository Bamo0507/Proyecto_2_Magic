# Estrategia de referencia que abre cajas completas hasta completar el set base, sin comprar ninguna carta suelta. Es
# igual a solo sobres pero comprando de a 36 sobres con el descuento de la caja.
from simulacion.estrategias.base import Accion


class SoloCajas:
    nombre = "solo_cajas"
    nombre_legible = "Solo cajas"

    def decidir(self, coleccion):
        return Accion.PARAR if coleccion.esta_completa else Accion.CAJA
