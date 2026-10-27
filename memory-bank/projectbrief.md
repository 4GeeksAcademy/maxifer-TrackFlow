# TrackFlow: contexto de negocio

Fuente de negocio: [BRIEFING.md](../BRIEFING.md). Selección del proyecto:
[TrackFlow.md](../TrackFlow.md).

TrackFlow es una empresa de logística de última milla y almacenes fundada en 2009
en Los Ángeles. Opera en EE. UU. y España, con almacenes en Los Ángeles y Zaragoza,
aproximadamente 130 empleados y 9 millones de euros anuales de facturación.
Las marcas de e-commerce externalizan almacenamiento, preparación, empaquetado,
envío y devoluciones; los destinatarios necesitan información fiable de sus pedidos.

Los almacenes usan sistemas distintos y no comparten visibilidad de inventario.
La selección y consulta de ocho transportistas es manual; las devoluciones
(18–25% del volumen) requieren revisión individual. Atención al cliente dedica
tiempo a consultas repetitivas; comercial y dirección consolidan informes a mano.
Personas carece de incorporación y consultas internas consistentes entre países.
Tecnología mantiene integraciones heredadas y escasa observabilidad.

TrackFlow Tech debe unificar datos y automatizar operaciones para reducir errores,
tiempos de respuesta y trabajo manual, mejorar la exactitud del stock y permitir
decisiones con información actualizada. El reto seleccionado prioriza tracking,
devoluciones y atención automatizada, con alertas y recomendaciones de transportista.
No se han fijado objetivos numéricos de mejora: no inventar compromisos de servicio.

El repositorio ya ofrece landing, gestión de incidencias, inventario, autenticación
y tracker de contratación. Integración real con transportistas, agentes de soporte,
RAG, automatización de devoluciones e informes ejecutivos son objetivos futuros,
no capacidades que puedan darse por entregadas por este hito.

## Discrepancia pendiente
El briefing identifica al fundador/CEO como Thomas Harry al inicio y como Thomas
Espinoza en Dirección Ejecutiva. Mantener esta discrepancia visible hasta que el
responsable humano confirme el nombre; referirse al CEO sin elegir un apellido.

## Ubicación del producto
Sitio público: `uis/website`; interfaces internas: `uis/backoffice`; APIs y
servicios: `services`. No inventar árboles paralelos para nuevos desarrollos.
