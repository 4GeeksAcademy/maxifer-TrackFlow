# Sistema de color TrackFlow

Fuente de verdad para colores de interfaz usando Tailwind + variables CSS.

## Tokens oficiales

Definicion en `:root` de `index.html` y `application.html`:

- `--tf-bg`: `#0f172a`
- `--tf-surface`: `#111827`
- `--tf-border`: `#1e293b`
- `--tf-text`: `#f8fafc`
- `--tf-text-muted`: `#cbd5e1`
- `--tf-text-soft`: `#94a3b8`
- `--tf-brand`: `#10b981`
- `--tf-brand-hover`: `#34d399`
- `--tf-accent`: `#f59e0b`
- `--tf-accent-strong`: `#b45309`
- `--tf-error`: `#fb7185`
- `--tf-market-muted`: `#475569`

Tokens RGB para opacidades:

- `--tf-bg-rgb`: `15 23 42`
- `--tf-brand-rgb`: `16 185 129`
- `--tf-accent-rgb`: `245 158 11`
- `--tf-text-rgb`: `248 250 252`
- `--tf-error-rgb`: `251 113 133`

## Convencion Tailwind

Usar clases arbitrarias con variables:

- `bg-[var(--tf-bg)]`
- `text-[var(--tf-text-muted)]`
- `border-[var(--tf-border)]`
- `focus:ring-[var(--tf-brand)]`
- `border-[color:rgb(var(--tf-brand-rgb)/0.4)]`

## Regla de mantenimiento

- No introducir nuevos colores hardcodeados (`#hex` o `rgb(...)`) en clases Tailwind o JS.
- Si se necesita un color nuevo, primero crear token `--tf-*` y luego consumirlo con Tailwind.
- Excepcion permitida: utilidades neutrales de Tailwind para blancos/negros/transparencias (`text-white`, `bg-white/10`, etc.).
