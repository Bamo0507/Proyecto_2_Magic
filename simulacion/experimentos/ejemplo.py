# Corrida de ejemplo, una simulación con la regla de parada óptima frente a comprar todo el set base suelto.
from simulacion.configuracion import CARPETA_SET_ACTIVO
from simulacion.estrategias.parada_optima import ReglaUnPasoAdelante
from simulacion.modelo.catalogo import Catalogo
from simulacion.modelo.coleccion import Coleccion
from simulacion.modelo.mercado import Mercado
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.modelo.motor import simular
from simulacion.semillas import SEMILLA_EJEMPLO

catalogo = Catalogo(CARPETA_SET_ACTIVO)
mercado = Mercado(catalogo)
estrategia = ReglaUnPasoAdelante(calcular_probabilidades_por_sobre(catalogo), mercado, catalogo)

costo_comprar_todo_suelto = mercado.costo_comprar_set_completo()
ganancias_iniciales = estrategia.ganancias_esperadas_por_accion(Coleccion(catalogo))
resultado = simular(estrategia, catalogo, mercado, SEMILLA_EJEMPLO)

print(f"{catalogo.nombre_set}, precios al {catalogo.fecha_precios}")
print(f"Sobre ${catalogo.sobre.precio}, caja de {catalogo.caja.cantidad_sobres} sobres ${catalogo.caja.precio}")
print(f"Comprar las {catalogo.cantidad_cartas_base} cartas sueltas ${costo_comprar_todo_suelto:.2f}")
ganancias_legibles = {accion.value: round(ganancia, 2) for accion, ganancia in ganancias_iniciales.items()}
print(f"Ganancia esperada al inicio {ganancias_legibles}")
print(f"{estrategia.nombre_legible} con semilla {SEMILLA_EJEMPLO}")
print(f"  cajas {resultado.cajas_abiertas}, sobres en total {resultado.sobres_abiertos}")
print(f"  cartas compradas sueltas {resultado.cartas_compradas_sueltas}, por ${resultado.costo_cartas_sueltas:.2f}")
print(f"  gasto en sobres y cajas ${resultado.gasto_en_sobres_y_cajas:.2f}")
print(f"  ingreso por vender repetidas y cartas fuera del set ${resultado.ingreso_venta_neta:.2f}")
print(f"  costo neto ${resultado.costo_neto:.2f}")
print(f"  valor de mercado de lo sobrante ${resultado.valor_mercado_sobrantes:.2f}")
print(f"  valor de mercado de la colección ${resultado.valor_mercado_coleccion:.2f}")
