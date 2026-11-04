# Carga los datos congelados de un set (cartas, composición de los sobres y producto sellado) y los deja indexados.
#
# Términos del dominio que se usan en todo el código
#   Cada carta se identifica con el código del set y su número de colección, por ejemplo mh3:15.
#   El set base son las cartas numeradas del 1 al número máximo del set; son las que hay que completar.
#   Las demás cartas que pueden salir en un sobre (versiones alternativas, cartas invitadas) quedan fuera del set,
#   se pueden vender pero no cuentan para completarlo.
#   Foil es la versión brillante de una carta, que tiene su propio precio.
#   Producto sellado es lo que se compra sin abrir, un sobre suelto o una caja de varios sobres.
#   Un sobre se arma sacando cartas de varios pozos. Cada pozo agrupa cartas con su probabilidad de salir, y cada
#   composición de sobre dice cuántas cartas se sacan de cada pozo y qué tan seguido sale esa composición.
import json
from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class PozoDeCartas:
    identificadores: tuple[str, ...]
    es_foil_por_carta: np.ndarray
    probabilidades: np.ndarray
    probabilidades_acumuladas: np.ndarray
    todas_igual_de_probables: bool


@dataclass(frozen=True)
class ComposicionSobre:
    cartas_por_pozo: dict[str, int]
    probabilidad: float


@dataclass(frozen=True)
class ProductoSellado:
    tipo: str
    nombre: str
    precio: float
    cantidad_sobres: int


def leer_json(ruta):
    return json.loads(ruta.read_text())


def es_carta_del_set_base(identificador, codigo_set_base, numero_maximo_set_base):
    codigo_set, numero = identificador.split(":")
    return codigo_set == codigo_set_base and numero.isdigit() and 1 <= int(numero) <= numero_maximo_set_base


def construir_pozo(pozo_en_json):
    identificadores_con_acabado = list(pozo_en_json["cartas"])
    pesos = np.array(
        [pozo_en_json["cartas"][identificador] for identificador in identificadores_con_acabado], dtype=float
    )
    probabilidades = pesos / pesos.sum()
    return PozoDeCartas(
        identificadores=tuple(identificador.removesuffix(":foil") for identificador in identificadores_con_acabado),
        es_foil_por_carta=np.array([identificador.endswith(":foil") for identificador in identificadores_con_acabado]),
        probabilidades=probabilidades,
        probabilidades_acumuladas=np.cumsum(probabilidades),
        todas_igual_de_probables=bool(np.all(pesos == pesos[0])),
    )


def construir_composiciones(composiciones_en_json):
    peso_total = sum(composicion["peso"] for composicion in composiciones_en_json)
    return [
        ComposicionSobre(composicion["cartas_por_pozo"], composicion["peso"] / peso_total)
        for composicion in composiciones_en_json
    ]


def construir_productos(productos_en_json):
    return {
        tipo: ProductoSellado(tipo, producto["nombre"], producto["precio"], producto["cantidad_sobres"])
        for tipo, producto in productos_en_json.items()
    }


class Catalogo:
    def __init__(self, carpeta_set):
        configuracion = leer_json(carpeta_set / "configuracion_set.json")
        datos_cartas = leer_json(carpeta_set / "cartas.json")
        datos_composicion = leer_json(carpeta_set / "composicion_sobres.json")
        datos_sellados = leer_json(carpeta_set / "precios_sellados.json")

        self.nombre_set = configuracion["nombre"]
        self.codigo_set_base = configuracion["codigo_set_base"]
        self.numero_maximo_set_base = configuracion["numero_maximo_set_base"]
        self.fecha_precios = datos_cartas["fecha_consulta"]
        self.cartas = datos_cartas["cartas"]

        self.identificadores_base = self.ordenar_identificadores_base()
        self.posicion_en_set_base = {
            identificador: posicion for posicion, identificador in enumerate(self.identificadores_base)
        }
        self.precios_normales_base = self.precios_del_set_base(es_foil=False)
        self.precios_foil_base = self.precios_del_set_base(es_foil=True)

        self.pozos = {nombre: construir_pozo(pozo) for nombre, pozo in datos_composicion["pozos"].items()}
        self.composiciones = construir_composiciones(datos_composicion["composiciones"])
        productos = construir_productos(datos_sellados["productos"])
        self.sobre = productos["sobre"]
        self.caja = productos["caja"]

    def es_carta_del_set_base(self, identificador):
        return es_carta_del_set_base(identificador, self.codigo_set_base, self.numero_maximo_set_base)

    def ordenar_identificadores_base(self):
        identificadores = sorted(
            (identificador for identificador in self.cartas if self.es_carta_del_set_base(identificador)),
            key=lambda identificador: int(identificador.split(":")[1]),
        )
        if len(identificadores) != self.numero_maximo_set_base:
            raise ValueError(
                f"Se esperaban {self.numero_maximo_set_base} cartas del set base y hay {len(identificadores)}"
            )
        return identificadores

    def precios_del_set_base(self, es_foil):
        return np.array([self.precio(identificador, es_foil) for identificador in self.identificadores_base])

    @property
    def cantidad_cartas_base(self):
        return len(self.identificadores_base)

    def precio(self, identificador, es_foil):
        # Si no hay precio para ese acabado se usa el del otro acabado, y si no hay ninguno la carta vale cero
        carta = self.cartas[identificador]
        precio_pedido = carta["precio_foil"] if es_foil else carta["precio_normal"]
        precio_otro_acabado = carta["precio_normal"] if es_foil else carta["precio_foil"]
        if precio_pedido is not None:
            return precio_pedido
        return precio_otro_acabado if precio_otro_acabado is not None else 0.0
