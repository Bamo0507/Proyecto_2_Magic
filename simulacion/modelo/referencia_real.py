# Precio real de un set completo ya armado, que sirve de referencia de la vida real para comparar contra los
# escenarios simulados. Se anota a mano en referencia_real.json de cada set, igual que los precios del sellado, y se
# convierte a dólares con el tipo de cambio de la misma fecha. Si el precio todavía no está anotado no hay referencia.
from dataclasses import dataclass

from simulacion.modelo.catalogo import leer_json


@dataclass(frozen=True)
class ReferenciaReal:
    fuente: str
    url: str
    fecha_consulta: str
    moneda: str
    precio_desde_original: float
    precio_tendencia_original: float | None
    tipo_cambio_usd_por_unidad: float
    ofertas_disponibles: int | None
    cartas_incluidas: int | None

    @property
    def precio_desde_usd(self):
        return self.precio_desde_original * self.tipo_cambio_usd_por_unidad

    @property
    def precio_tendencia_usd(self):
        if self.precio_tendencia_original is None:
            return None
        return self.precio_tendencia_original * self.tipo_cambio_usd_por_unidad


def leer_referencia_real(carpeta_set):
    ruta = carpeta_set / "referencia_real.json"
    if not ruta.exists():
        return None
    datos = leer_json(ruta)
    if datos["precio_desde"] is None or datos["fecha_consulta"] is None:
        return None
    tipo_cambio = 1.0 if datos["moneda"] == "USD" else datos["tipo_cambio_usd_por_unidad"]
    if tipo_cambio is None:
        raise ValueError(f"Falta el tipo de cambio de {datos['moneda']} a USD en {ruta}")
    return ReferenciaReal(
        fuente=datos["fuente"],
        url=datos["url"],
        fecha_consulta=datos["fecha_consulta"],
        moneda=datos["moneda"],
        precio_desde_original=datos["precio_desde"],
        precio_tendencia_original=datos["precio_tendencia"],
        tipo_cambio_usd_por_unidad=tipo_cambio,
        ofertas_disponibles=datos["ofertas_disponibles"],
        cartas_incluidas=datos["cartas_incluidas"],
    )
