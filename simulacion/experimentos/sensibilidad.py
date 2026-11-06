# Análisis de sensibilidad del objetivo 3, mide cómo cambia la reducción del costo neto que logra la parada óptima
# cuando cambia el precio de la caja o la comisión de venta de TCGplayer.
#
# Se mueve un parámetro a la vez y el otro queda en su valor base. En cada variante se vuelve a elegir la mejor
# estrategia sin optimizar, porque depende de los precios. Con la caja
# barata o la comisión baja la caja puede costar menos que la reventa esperada de sus cartas (ver precio_umbral en la
# regla de parada); en esas variantes abrir cajas deja ganancia por sí solo y lo que limita la apertura es completar
# el set.
from dataclasses import asdict, dataclass

from simulacion.experimentos.analisis import comparar_pareado, mejor_estrategia, resumir_por_estrategia
from simulacion.configuracion import CARPETA_RESULTADOS, CARPETA_SET_ACTIVO
from simulacion.experimentos.escenarios import (
    ESTRATEGIA_MEJORADA,
    ESTRATEGIAS_SIN_OPTIMIZAR,
    armar_escenario,
    correr_escenario,
)
from simulacion.salidas.exportar_csv import escribir_csv, guardar_registros
from simulacion.modelo.catalogo import Catalogo
from simulacion.modelo.mercado import Mercado, ParametrosMercado
from simulacion.semillas import SEMILLAS_EXPERIMENTOS

FACTORES_PRECIO_CAJA = (0.8, 0.9, 1.0, 1.1, 1.2)
COMISIONES_VENTA = (0.0675, 0.0875, 0.1075, 0.1275, 0.1475)


@dataclass(frozen=True)
class Variante:
    parametro: str
    valor: float
    precio_caja: float
    comision_venta: float


@dataclass(frozen=True)
class ResumenVariante:
    parametro: str
    valor: float
    precio_caja: float
    comision_venta: float
    precio_umbral_caja: float
    caja_con_ganancia_por_reventa: bool
    mejor_sin_optimizar: str
    costo_neto_mejor_sin_optimizar: float
    costo_neto_parada_optima: float
    parada_limite_inferior_ic95: float
    parada_limite_superior_ic95: float
    cajas_abiertas_parada_medio: float
    reduccion_porcentual: float
    reduccion_porcentual_limite_inferior_ic95: float
    reduccion_porcentual_limite_superior_ic95: float


def armar_variantes(precio_caja_base, comision_base):
    por_precio = [
        Variante("factor_precio_caja", factor, round(precio_caja_base * factor, 2), comision_base)
        for factor in FACTORES_PRECIO_CAJA
    ]
    por_comision = [
        Variante("comision_venta", comision, precio_caja_base, comision) for comision in COMISIONES_VENTA
    ]
    return por_precio + por_comision


def correr_variante(catalogo_base, variante):
    catalogo = catalogo_base.con_precios(precio_caja=variante.precio_caja)
    mercado = Mercado(catalogo, ParametrosMercado(comision_venta=variante.comision_venta))
    escenario = armar_escenario(catalogo, mercado)
    resultados = correr_escenario(escenario, SEMILLAS_EXPERIMENTOS)
    resumenes = resumir_por_estrategia(resultados, escenario.estrategias)
    estrategia_base = mejor_estrategia(resumenes, ESTRATEGIAS_SIN_OPTIMIZAR)
    frente_a_base = comparar_pareado(resultados, estrategia_base, ESTRATEGIA_MEJORADA)
    parada = next(resumen for resumen in resumenes if resumen.estrategia == ESTRATEGIA_MEJORADA)
    precio_umbral = escenario.regla_parada.precio_umbral(catalogo.caja)
    resumen_variante = ResumenVariante(
        parametro=variante.parametro,
        valor=variante.valor,
        precio_caja=variante.precio_caja,
        comision_venta=variante.comision_venta,
        precio_umbral_caja=precio_umbral,
        caja_con_ganancia_por_reventa=variante.precio_caja < precio_umbral,
        mejor_sin_optimizar=estrategia_base,
        costo_neto_mejor_sin_optimizar=frente_a_base.costo_neto_referencia,
        costo_neto_parada_optima=parada.costo_neto_medio,
        parada_limite_inferior_ic95=parada.limite_inferior_ic95,
        parada_limite_superior_ic95=parada.limite_superior_ic95,
        cajas_abiertas_parada_medio=parada.cajas_abiertas_medio,
        reduccion_porcentual=frente_a_base.reduccion_porcentual,
        reduccion_porcentual_limite_inferior_ic95=frente_a_base.reduccion_porcentual_limite_inferior_ic95,
        reduccion_porcentual_limite_superior_ic95=frente_a_base.reduccion_porcentual_limite_superior_ic95,
    )
    filas_estrategias = [
        {"parametro": variante.parametro, "valor": variante.valor, **asdict(resumen)} for resumen in resumenes
    ]
    return resumen_variante, filas_estrategias


catalogo_base = Catalogo(CARPETA_SET_ACTIVO)
variantes = armar_variantes(catalogo_base.caja.precio, ParametrosMercado().comision_venta)
resumenes_variantes = []
filas_por_estrategia = []
for variante in variantes:
    resumen_variante, filas_estrategias = correr_variante(catalogo_base, variante)
    resumenes_variantes.append(resumen_variante)
    filas_por_estrategia.extend(filas_estrategias)

guardar_registros(resumenes_variantes, CARPETA_RESULTADOS / "sensibilidad.csv")
escribir_csv(
    CARPETA_RESULTADOS / "sensibilidad_por_estrategia.csv", list(filas_por_estrategia[0]), filas_por_estrategia
)

print(f"Sensibilidad, {len(variantes)} variantes con {len(SEMILLAS_EXPERIMENTOS)} semillas cada una")
for resumen in resumenes_variantes:
    marca = " (caja con ganancia por reventa)" if resumen.caja_con_ganancia_por_reventa else ""
    print(
        f"  {resumen.parametro} {resumen.valor:<6} caja ${resumen.precio_caja:7.2f}, base {resumen.mejor_sin_optimizar:16s}"
        f"${resumen.costo_neto_mejor_sin_optimizar:8.2f}, parada ${resumen.costo_neto_parada_optima:7.2f} "
        f"({resumen.cajas_abiertas_parada_medio:4.1f} cajas), reducción {resumen.reduccion_porcentual:6.1%} "
        f"[{resumen.reduccion_porcentual_limite_inferior_ic95:6.1%}, "
        f"{resumen.reduccion_porcentual_limite_superior_ic95:6.1%}]{marca}"
    )
print(f"CSV guardados en {CARPETA_RESULTADOS}")
