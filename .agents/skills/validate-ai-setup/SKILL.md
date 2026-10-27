---
name: validate-ai-setup
description: Verificar estructura, enlaces y rutas canónicas de la configuración AI-ready de TrackFlow antes de entregar cambios de memoria o arquitectura.
---

# Validar configuración AI-ready

## Objetivo único
Detectar automáticamente inconsistencias estructurales de la infraestructura de
asistencia de TrackFlow sin modificar archivos, datos ni referencias Git.

## Inputs
- `--root <directorio>`: raíz del repositorio; por defecto el directorio actual. Resolver rutas relativas desde el directorio actual.
- `--check-branch`: opcional; exigir la rama `feature/agent-memory-bank` para entregar este hito. Omitir en CI sobre main o checkout detached.
- No admite otras opciones; error de uso produce código 1.

## Ejecución
Desde la raíz, ejecutar `node .agents/skills/validate-ai-setup/scripts/validate.mjs --root .`.
Añadir `--check-branch` al preparar la entrega del hito. Para comprobar el propio
validador ejecutar `node --test .agents/skills/validate-ai-setup/scripts/validate.test.mjs`.
El script funciona con Node 22 y módulos estándar, sin instalación de paquetes.
Con otra raíz utilizar la ruta absoluta al script y pasar la raíz como argumento.

## Criterios de aceptación verificables
- Cero archivos obligatorios ausentes o vacíos: briefing, AGENTS.md, los tres documentos de memoria, regla y esta skill.
- Frontmatter de skill con nombre válido y descripción no vacía; regla con `alwaysApply: true` y descripción no vacía, sin campos repetidos ni YAML fuera del formato simple soportado por el validador.
- Cero enlaces Markdown locales rotos o fuera de la raíz en los documentos obligatorios; ignorar enlaces externos y comprobar existencia del archivo para enlaces con fragmento.
- Existen las tres rutas canónicas y las entradas de landing, backoffice y tracker; no existen las antiguas entradas públicas en raíz ni `uis/talent-pipeline-tracker`.
- En modo entrega, la rama exacta coincide; en modo normal no se consulta la rama.
- Se muestra PASS/FAIL por comprobación; código 0 únicamente si todas pasan, 1 en otro caso.

La revisión semántica del negocio y la autorización de cambios protegidos siguen
siendo responsabilidad del agente y del desarrollador: este comando valida
estructura, no la veracidad de afirmaciones ni la calidad de las decisiones.
