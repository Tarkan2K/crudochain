# MANUAL TÉCNICO MAESTRO: CRUDOCHAIN & CRUDOGAMES ECOSYSTEM
**Versión:** 2.0.0 (Node.js Edition)
**Estado:** Producción / Beta

---

## 1. VISIÓN EJECUTIVA
**Crudochain** es una plataforma web integrada que fusiona el entretenimiento de los videojuegos con una economía digital simulada y pagos reales. El objetivo es crear un ecosistema donde los usuarios puedan jugar, adquirir activos (tokens CRDO) y participar en una comunidad, utilizando tecnologías web modernas y escalables.

---

## 2. ARQUITECTURA DEL SISTEMA (FULL STACK)

La arquitectura actual elimina la complejidad de componentes nativos (C++) para centrarse en un stack web robusto, mantenible y de alto rendimiento.

### 2.1. Backend (API & Lógica de Negocio)
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Base de Datos:** MongoDB (Atlas o Local)
*   **Autenticación:** JWT (JSON Web Tokens)
*   **Funciones:**
    *   Gestión de usuarios y perfiles.
    *   Procesamiento de pagos (Webhooks de Mercado Pago).
    *   Gestión de inventarios y "economía blanda" (saldos en DB).

### 2.2. Frontend (Interfaz de Usuario)
*   **Framework:** Next.js (React)
*   **Estilos:** TailwindCSS
*   **Motor de Juegos:** Phaser (para juegos 2D integrados en el navegador).
*   **Comunicación:** REST API para datos transaccionales.

---

## 3. MÓDULO DE PAGOS Y ECONOMÍA
*Actualmente el núcleo funcional de monetización.*

### 3.1. Integración Mercado Pago
Permite la compra de tokens internos ($CRDO) usando moneda local (CLP/USD).
*   **Flujo:**
    1.  Usuario selecciona pack de tokens en Frontend.
    2.  Backend genera preferencia de pago en Mercado Pago.
    3.  Usuario completa el pago.
    4.  Webhook recibe notificación `payment.created`.
    5.  Backend valida y suma saldo al `user.balance` en MongoDB.

### 3.2. Economía Interna (Soft-Ledger)
En esta fase, la "blockchain" es un libro mayor centralizado en MongoDB.
*   **Ventajas:** Rapidez instantánea, cero costo de gas, fácil recuperación de cuentas.
*   **Seguridad:** Validaciones en servidor para evitar manipulación de saldos.

---

## 4. MÓDULO DE JUEGOS (CRUDOGAMES)

### 4.1. Arquitectura de Juegos
*   **Cliente:** Los juegos se ejecutan en el cliente usando **Phaser**.
*   **Persistencia:** Al terminar una partida o evento, el cliente envía el resultado firmado al backend.
*   **Seguridad:** El backend valida la puntuación/resultado (Anti-Cheat básico) y actualiza el perfil del usuario.

### 4.2. Planes Futuros (Mundocrudo)
Implementación de un mundo multijugador usando **WebSockets (Socket.io)** para sincronización de posición y chat en tiempo real, manteniendo la lógica en Node.js.

---

## 5. CAMBIOS RESPECTO A VERSIÓN ANTERIOR (DEPRECACIÓN C++)
*   **Eliminado:** Motor C++ (CasinoEngine, Blockchain personalizada).
*   **Motivo:** Complejidad innecesaria y falta de integración.
*   **Reemplazo:** Toda la lógica de negocio se ha migrado a Node.js/JavaScript, permitiendo un desarrollo más rápido y unificado.

---

## 6. INSTALACIÓN Y DESPLIEGUE

### Requisitos
*   Node.js v18+
*   MongoDB

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
