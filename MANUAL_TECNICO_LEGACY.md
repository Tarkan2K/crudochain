# MANUAL TÉCNICO MAESTRO: CRUDOCHAIN & CRUDOGAMES ECOSYSTEM
**Versión:** 1.0.0 (Alpha)
**Autor:** Antigravity (Senior Web Blockchain Architect)
**Fecha:** 2026-01-07

---

## 1. VISIÓN EJECUTIVA
**Crudochain** no es solo una blockchain; es el ecosistema definitivo de entretenimiento y finanzas descentralizadas. Nuestra visión es fusionar la libertad de la creación de juegos (UGC - User Generated Content) con la emoción del trading y las apuestas de casino, todo sobre una infraestructura propia de alto rendimiento escrita en C++.

**Objetivos Clave:**
1.  **Soberanía Total:** Propia cadena de bloques (PoW/PoS híbrido en el futuro) sin depender de EVM o redes congestionadas.
2.  **Economía Circular:** El token $CRDO es la sangre del sistema, usado para gas, compras de juegos, apuestas y recompensas.
3.  **Entretenimiento Infinito:** Desde juegos AAA indie hasta mesas de póker de alta frecuencia.

---

## 2. ARQUITECTURA DEL SISTEMA (FULL STACK)

### 2.1. Core Blockchain (Backend - C++)
El corazón de la bestia. Optimizado para latencia ultra-baja y alto throughput.
*   **Lenguaje:** C++17/20.
*   **Consenso:** Proof of Work (actual), migrable a Proof of Authority para la escala del Casino.
*   **Criptografía:** Ed25519 (Monocypher) para firmas digitales de grado militar.
*   **Almacenamiento:** Arquitectura híbrida.
    *   *Hot Data (Mempool, Orderbook):* RAM.
    *   *Cold Data (Bloques, Historial):* MongoDB (vía Bridge Service).

### 2.2. Bridge Service (Middleware - Node.js)
El puente entre el metal desnudo de C++ y la persistencia moderna.
*   **Función:** Abstracción de base de datos y cola de mensajes.
*   **Stack:** Node.js + Express + Mongoose.

### 2.3. Frontend (Next.js 14+)
La cara visible. Una experiencia de usuario (UX) fluida, reactiva y visualmente impactante.
*   **Framework:** Next.js (App Router).
*   **Estilo:** TailwindCSS + Framer Motion (para animaciones de casino).
*   **Estado:** Zustand / React Query para sincronización en tiempo real con la chain.

---

## 3. MÓDULO 1: CRUDOGAMES (PLATAFORMA DE CREACIÓN)
*El "Roblox" de la Blockchain.*

### 3.1. Funcionalidad
Permite a los usuarios subir, vender y monetizar sus propios juegos.
*   **Publicación:** Los desarrolladores suben binarios o enlaces a juegos WebGL.
*   **Licenciamiento:** Cada copia del juego es un NFT (Non-Fungible Token) nativo en Crudochain.
*   **DRM Descentralizado:** La API verifica la propiedad del activo en la wallet antes de permitir la descarga/juego.

### 3.2. Modelo de Negocio (Smart Contract Logic)
*   **Precio de Venta:** Definido por el creador en $CRDO.
*   **Comisión (Tax):** 10% de cada venta va automáticamente a la **Treasury Wallet** de Crudochain.
*   **Pago al Creador:** 90% liquidado instantáneamente en su wallet.

### 3.3. Implementación Técnica (`GameFactory.h`)
La clase `GameFactory` en C++ gestiona el registro:
```cpp
struct GameMetadata {
    string gameId;
    string developerAddress;
    uint64_t price;
    string downloadUrl;
    vector<string> owners; // Lista de compradores
};
```

---

## 4. MÓDULO 2: CRUDO CASINO (NUEVA SECCIÓN)
*La casa siempre gana, pero aquí tú puedes ser la casa.*

### 4.1. Visión General
Una suite de juegos de azar provably fair (demostrablemente justos) integrados directamente en el protocolo.

### 4.2. Juegos Iniciales
1.  **Blackjack On-Chain:** Lógica de cartas gestionada por el servidor C++.
2.  **Video Poker:** Clásico Jacks or Better.
3.  **Slots (Tragamonedas):** Giros rápidos con RNG basado en hash de bloque.

### 4.3. Provably Fair RNG (Generación de Números Aleatorios)
Para garantizar la confianza, el azar no puede ser una caja negra.
*   **Semilla del Servidor:** Hash secreto generado por el backend.
*   **Semilla del Cliente:** Hash proporcionado por el usuario (o su firma).
*   **Nonce:** Número de jugada.
*   **Resultado:** `SHA256(ServerSeed + ClientSeed + Nonce)`.
*   *Verificación:* Al final de la sesión, se revela la ServerSeed para que el usuario verifique matemáticamente que no hubo manipulación.

### 4.4. Economía del Casino
*   **Bankroll:** Fondos de liquidez del sistema para pagar premios.
*   **House Edge (Ventaja de la Casa):** ~1-5% dependiendo del juego.
*   **Quema de Tokens:** El 50% de las ganancias de la casa se queman (envían a `0x00...dead`) para reducir el suministro de $CRDO y aumentar el valor para los holders.

---

## 5. ROADMAP DE IMPLEMENTACIÓN

### FASE 1: Cimientos del Casino (Backend)
- [ ] Crear clase `CasinoEngine` en C++.
- [ ] Implementar lógica de `Deck` (Mazo) y `Card` (Carta).
- [ ] Implementar endpoints API: `/casino/bet`, `/casino/deal`, `/casino/stand`.
- [ ] Integrar sistema de RNG Provably Fair.

### FASE 2: Interfaz de Usuario (Frontend)
- [ ] Crear página `/casino`.
- [ ] Diseñar componentes UI: `CardComponent`, `RouletteWheel`, `SlotMachine`.
- [ ] Conectar con API para apuestas en tiempo real.

### FASE 3: Expansión de CrudoGames
- [ ] Mejorar `GameFactory` para soportar actualizaciones de juegos.
- [ ] Implementar sistema de Reviews/Ratings on-chain.
- [ ] Crear SDK para que juegos externos reporten High Scores a la blockchain.

---

---
## 6. MÓDULO 3: GENESIS PRE-SALE & PAGOS (MERCADO PAGO)
*Fase de lanzamiento inicial y monetización fiat.*

### 6.1. Integración de Pagos
Para permitir la entrada de capital fresco (Fiat -> Crypto), hemos integrado **Mercado Pago** como pasarela de pagos para Chile/LATAM.

*   **Proveedor:** Mercado Pago SDK.
*   **Producto:** "Pack Fundador" (1.000 CLP = 1.000 CRDO).
*   **Flujo:**
    1.  Usuario hace click en "BUY $CRDO".
    2.  Backend crea una preferencia de pago (`/api/mercadopago/create`) vinculada al `userId` (MongoDB) o `email`.
    3.  Usuario paga en la pasarela segura.
    4.  Webhook (`/api/mercadopago/webhook`) recibe confirmación y acredita los tokens.

### 6.2. Base de Datos de Usuarios (Schema Update)
El modelo `User` en MongoDB ha evolucionado para soportar la economía real:
*   `crdoBalance` (Number): Saldo nativo de tokens $CRDO.
*   `isFounder` (Boolean): Flag especial para usuarios que participaron en la pre-venta. Otorga beneficios visuales (Badge) y acceso anticipado.

### 6.3. Restricciones de Lanzamiento
Para evitar spam en la creación de tokens (Launchpad), se ha implementado una barrera de entrada económica:
*   **Requisito:** Mínimo 500 CRDO en balance para lanzar un nuevo token.
*   **Objetivo:** Incentivar la compra del Pack Fundador y asegurar calidad en los proyectos listados.

---

*Este documento es un organismo vivo. Se actualizará con cada commit y avance en el código.*
