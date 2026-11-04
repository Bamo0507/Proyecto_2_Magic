# Contrato común de las estrategias, cada una decide la siguiente acción a partir del estado de la colección.
from enum import Enum
from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from simulacion.modelo.coleccion import Coleccion


class Accion(Enum):
    SOBRE = "sobre"
    CAJA = "caja"
    PARAR = "parar"


class Estrategia(Protocol):
    nombre: str
    nombre_legible: str

    def decidir(self, coleccion: "Coleccion") -> Accion: ...
