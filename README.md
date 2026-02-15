# Crudochain

**Crudochain** es una plataforma web integrada que combina elementos de videojuegos, economía de tokens y comunidad.

## Tecnologias

El proyecto utiliza un stack moderno y eficiente:

*   **Frontend**: Next.js (React), Tailwind CSS, Framer Motion, Phaser (para juegos).
*   **Backend**: Node.js, Express, MongoDB.
*   **Pagos**: Integración completa con Mercado Pago.

## Estructura del Proyecto

*   `/frontend`: Aplicación cliente en Next.js.
*   `/backend`: Servidor API RESTful y lógica de base de datos.
*   `/documentation`: Documentación técnica y manuales (si aplica).

## Instalacion y Uso

### Backend

1.  Navega a la carpeta `backend`:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura las variables de entorno en un archivo `.env` (basado en `.env.example` si existe).
4.  Inicia el servidor:
    ```bash
    npm start
    ```

### Frontend

1.  Navega a la carpeta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

## Caracteristicas

*   **Autenticación**: Registro y login de usuarios seguro.
*   **Tienda de Tokens**: Adquisición de CRDO mediante Mercado Pago.
*   **Juegos**: Acceso a juegos web integrados.
*   **Perfil**: Personalización de avatar y seguimiento de estadísticas.

## Proximamente

*   Mundocrudo (Metaverso)
*   Swap de Tokens
*   Publicación de juegos por usuarios

### Nota sobre el Futuro (Migracion a C++)

Aunque la version actual utiliza Node.js para agilizar el desarrollo de esta fase, el **objetivo final** es migrar el nucleo del sistema (Backend de alto rendimiento y motor de juegos) a **C++**.

Se ha preservado el diseño técnico original en el archivo `MANUAL_TECNICO_LEGACY.md` como referencia para esta futura re-implementacion, que incluira:
*   Blockchain propia / Sidechain.
*   Motor de Casino provably fair en C++.
*   Matching Engine de alta frecuencia.

---
Desarrollado por el equipo de Crudochain.
