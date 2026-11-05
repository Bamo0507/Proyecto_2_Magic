# Estrategia de referencia que abre sobres sueltos hasta completar el set base, sin comprar ninguna carta suelta. Es el
# caso del problema del coleccionista de cupones, por eso sirve para verificar el generador contra la fórmula.
from simulacion.estrategias.base import Accion


class SoloSobres:
    nombre = "solo_sobres"
    nombre_legible = "Solo sobres"

    def decidir(self, coleccion):
        return Accion.PARAR if coleccion.esta_completa else Accion.SOBRE
