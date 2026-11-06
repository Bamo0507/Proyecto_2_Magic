# Estrategia de referencia que no abre ningún producto sellado y compra sueltas las cartas del set base desde el
# inicio. No tiene azar, así que todas sus réplicas dan el mismo costo.
from simulacion.estrategias.base import Accion


class CompraSuelta:
    nombre = "comprar_sueltas"
    nombre_legible = "Comprar sueltas"

    def decidir(self, coleccion):
        return Accion.PARAR
