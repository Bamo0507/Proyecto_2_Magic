# Exporta para la sección Validación de la web el contraste con el precio real de un set completo y la verificación
# del simulador, leyendo los CSV de resultados para que la web no tenga cifras escritas a mano.
#
# Requiere haber corrido antes el escenario base y la verificación, igual que las gráficas.
#
# Las claves del JSON van en inglés porque son el contrato con el código de la web.
import csv
import json

from simulacion.configuracion import CARPETA_DATOS_WEB, CARPETA_RESULTADOS, CARPETA_SET_ACTIVO
from simulacion.modelo.catalogo import leer_json
from simulacion.modelo.referencia_real import leer_referencia_real


def leer_csv(nombre):
    with (CARPETA_RESULTADOS / nombre).open(encoding="utf-8") as archivo:
        return list(csv.DictReader(archivo))


def numero(valor, decimales=4):
    if valor in ("", None):
        return None
    return round(float(valor), decimales)


def intervalo(fila, decimales=4):
    inferior = numero(fila["limite_inferior_ic95"], decimales)
    superior = numero(fila["limite_superior_ic95"], decimales)
    return None if inferior is None or superior is None else [inferior, superior]


def exportar_referencia():
    referencia = leer_referencia_real(CARPETA_SET_ACTIVO)
    if referencia is None:
        return None
    return {
        "source": referencia.fuente,
        "url": referencia.url,
        "date": referencia.fecha_consulta,
        "currency": referencia.moneda,
        "priceOriginal": referencia.precio_desde_original,
        "exchangeRate": referencia.tipo_cambio_usd_por_unidad,
        "priceUsd": round(referencia.precio_desde_usd, 2),
        "offers": referencia.ofertas_disponibles,
        "cardsIncluded": referencia.cartas_incluidas,
        "baseSetSize": leer_json(CARPETA_SET_ACTIVO / "configuracion_set.json")["numero_maximo_set_base"],
    }


def exportar_comparacion():
    return [
        {
            "key": fila["columna"],
            "strategy": fila["estrategia"],
            "cost": numero(fila["costo_usd"], 2),
            "ci95": intervalo(fila, 2),
            "changeVsBase": numero(fila["cambio_absoluto_vs_base"], 2),
            "changeRateVsBase": numero(fila["cambio_porcentual_vs_base"]),
        }
        for fila in leer_csv("comparacion_vida_real.csv")
    ]


def exportar_coleccionista():
    fila = leer_csv("verificacion_coleccionista.csv")[0]
    return {
        "replicates": int(fila["replicas"]),
        "formulaMean": numero(fila["media_formula"], 1),
        "formulaSd": numero(fila["desviacion_formula"], 1),
        "simulatedMean": numero(fila["media_simulada"], 1),
        "simulatedSd": numero(fila["desviacion_simulada"], 1),
        "ci95": intervalo(fila, 1),
        "relativeError": numero(fila["error_relativo"]),
    }


def exportar_rareza():
    return [
        {
            "key": fila["categoria"],
            "packs": int(fila["sobres_abiertos"]),
            "simulatedRate": numero(fila["frecuencia_simulada"]),
            "ci95": intervalo(fila),
            "dataRate": numero(fila["tasa_pesos_datos"]),
            "officialRate": numero(fila["tasa_oficial"]),
            "relativeError": numero(fila["error_relativo"]),
        }
        for fila in leer_csv("verificacion_rareza.csv")
    ]


def exportar_por_carta():
    fila = leer_csv("verificacion_por_carta_resumen.csv")[0]
    return {
        "packs": int(fila["sobres_abiertos"]),
        "cards": int(fila["cartas_comparadas"]),
        "shareInsideCi": numero(fila["proporcion_dentro_del_ic95"]),
        "meanRelativeError": numero(fila["error_relativo_medio"]),
        "maxRelativeError": numero(fila["error_relativo_maximo"]),
        "expectedSale": numero(fila["venta_esperada_calculada"], 3),
        "simulatedSale": numero(fila["venta_media_simulada"], 3),
        "saleCi95": [numero(fila["venta_limite_inferior_ic95"], 3), numero(fila["venta_limite_superior_ic95"], 3)],
        "saleRelativeError": numero(fila["venta_error_relativo"]),
    }


def exportar_consistencia():
    return [
        {"test": fila["prueba"], "cases": int(fila["casos"]), "failures": int(fila["fallas"])}
        for fila in leer_csv("verificacion_consistencia.csv")
    ]


validacion = {
    "realReference": exportar_referencia(),
    "realComparison": exportar_comparacion(),
    "couponCollector": exportar_coleccionista(),
    "rarity": exportar_rareza(),
    "perCard": exportar_por_carta(),
    "consistency": exportar_consistencia(),
}
CARPETA_DATOS_WEB.mkdir(parents=True, exist_ok=True)
ruta = CARPETA_DATOS_WEB / "validation.json"
ruta.write_text(json.dumps(validacion, ensure_ascii=False, separators=(",", ":")))

print(f"Validación exportada a {ruta}, {ruta.stat().st_size / 1024:.1f} KB")
print(f"  referencia {validacion['realReference']}")
print(f"  coleccionista {validacion['couponCollector']}")
print(f"  por carta {validacion['perCard']}")
