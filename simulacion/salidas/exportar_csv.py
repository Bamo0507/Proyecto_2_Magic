# Guarda en CSV los resultados de las simulaciones y de la verificación, para armar las gráficas y la web.
#
# resultados.csv tiene una fila por simulación con todos los campos de Resultado menos el historial. El historial de
# cartas faltantes va aparte en formato largo, una fila por cada producto abierto, porque cada simulación tiene un
# largo distinto. Las simulaciones se unen entre ambos archivos por estrategia y semilla.
import csv
from dataclasses import asdict, fields

from simulacion.modelo.motor import Resultado

CAMPOS_RESULTADO = [campo.name for campo in fields(Resultado) if campo.name != "historial_faltantes"]
CAMPOS_HISTORIAL = ["estrategia", "semilla", "sobres_abiertos", "cartas_faltantes"]


def escribir_csv(ruta, nombres_columnas, filas):
    ruta.parent.mkdir(parents=True, exist_ok=True)
    with ruta.open("w", newline="", encoding="utf-8") as archivo:
        escritor = csv.DictWriter(archivo, fieldnames=nombres_columnas)
        escritor.writeheader()
        escritor.writerows(filas)


def guardar_resultados(resultados, ruta):
    filas = ({campo: getattr(resultado, campo) for campo in CAMPOS_RESULTADO} for resultado in resultados)
    escribir_csv(ruta, CAMPOS_RESULTADO, filas)


def guardar_historial_faltantes(resultados, ruta):
    filas = (
        {
            "estrategia": resultado.estrategia,
            "semilla": resultado.semilla,
            "sobres_abiertos": sobres_abiertos,
            "cartas_faltantes": cartas_faltantes,
        }
        for resultado in resultados
        for sobres_abiertos, cartas_faltantes in resultado.historial_faltantes
    )
    escribir_csv(ruta, CAMPOS_HISTORIAL, filas)


def guardar_registros(registros, ruta):
    # Para listas de dataclasses de un mismo tipo, como las comparaciones de la verificación
    filas = [asdict(registro) for registro in registros]
    escribir_csv(ruta, [campo.name for campo in fields(registros[0])], filas)
