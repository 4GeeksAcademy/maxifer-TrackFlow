Directorio de Proveedores — API con Almacenamiento Ligero
Antes de comenzar: Lee CONTEXT-3.md antes de escribir una sola línea de código — define los campos exactos del proveedor, las categorías válidas, los estados permitidos y los datos iniciales que debe cargar el seeder.

El reto

Ya tenemos endpoints FastAPI funcionando y sabemos cómo estructurar una API. La plataforma de la empresa sigue creciendo — y con ella, la necesidad de eliminar los puntos de fallo que frenan al equipo. Uno de los más evidentes: los datos críticos del negocio siguen viviendo en hojas de cálculo que cada persona tiene en su ordenador, actualiza por su cuenta y comparte por email. El resultado es siempre el mismo — versiones desincronizadas, decisiones tomadas con datos distintos y tiempo perdido intentando saber cuál es el fichero correcto. Es el momento de sustituir eso por una base de datos con una única fuente de verdad, accesible a todos desde la API — sin SQL todavía, pero con estructura real desde el primer día.

El área de compras de la empresa gestiona actualmente su directorio de proveedores en una hoja de cálculo. La información clave —qué suministra cada proveedor, en qué país opera, cuál es su tarifa vigente y si está activo o suspendido— se actualiza de forma manual, inconsistente y sin trazabilidad. Cuando el precio de un ingrediente o componente sube, el equipo se entera tarde. Cuando hay que incorporar un proveedor nuevo, nadie sabe dónde registrarlo oficialmente.

Nuestro tech lead ha decidido construir una API de gestión de proveedores usando FastAPI + TinyDB + Pydantic. La decisión de usar TinyDB es deliberada: no siempre hace falta una base de datos de gran escala para resolver bien un problema. Una solución ligera, que no demanda recursos excesivos y puede desplegarse de inmediato, puede ser exactamente la herramienta correcta para el trabajo. La solución debe arrancar con datos reales desde el primer momento —no con una base de datos vacía— y tiene que rechazar cualquier entrada que no cumpla la estructura definida.

Nota del tech lead:

"Necesito el directorio operativo antes del jueves. Usa TinyDB — ya migraremos a Postgres cuando tengamos el ORM listo. El seeder tiene que cargar todos los proveedores del CONTEXT desde el arranque; no quiero ver una base de datos vacía en la demo. Pydantic valida todo lo que entra: si un proveedor no tiene país o su estado no es uno de los dos valores permitidos, la API lo rechaza con un 422 antes de que toque la base de datos. Dos endpoints de búsqueda imprescindibles: filtrar por país y filtrar por categoría de producto. Y cuando se actualice una tarifa, quiero que quede registrado el timestamp del cambio — ese dato lo va a necesitar el equipo para auditorías."

Trabajaremos dentro de las carpetas /services/api (backend) y /uis/backoffice (frontend) del monorepo.

No hay código de inicio. El proyecto parte desde cero.

