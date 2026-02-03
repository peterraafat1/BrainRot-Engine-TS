# 🧠 BrainRot Engine (TS Refactor)

> A highly modular, production-ready gameplay framework built with **Roblox-TS** and **Flamework**.
> Refactored from a legacy Lua codebase to demonstrate modern software architecture principles.

## 🛠️ Tech Stack
- **Language:** TypeScript (Roblox-TS)
- **Framework:** Flamework (Dependency Injection, Networking)
- **State Management:** Service/Controller Pattern
- **Data Persistence:** Custom DataStore Wrapper with Session Caching

## 🏗️ Architecture Highlights

### 1. Server-Side Services (`src/server/services`)
- **PlayerService:** Centralized session management. Handles data loading, caching, and strict type validation for player stats (Licks, Coins, Rebirths).
- **ShopService:** Manages economy transactions with server-side validation to prevent exploits. Handles standard purchases and Gacha mechanics.
- **CombatService:** A secure, server-authoritative combat system using specialized hitboxes and anti-exploit sanity checks.
- **GateService:** Manages map progression state, decoupled from the shop logic for better maintainability.
- **LeaderboardService:** A generic, config-driven leaderboard system that adheres to the **DRY (Don't Repeat Yourself)** principle. One service powers Licks, Coins, and Rebirth boards.

### 2. Client-Side Controllers (`src/client/controllers`)
- **CombatController:** Implements `ContextActionService` for cross-platform support (PC, Mobile, Console). Features optimized animation handling.
- **GateController:** Listens to server state changes to handle local map replication and gate destruction.
- **CharacterController:** Dynamic asset equipping system that respects server-assigned attributes.
- **MusicController:** Manages audio with smooth tweening (fading) and memory-efficient sound lifecycle.

### 3. Shared Modules (`src/shared`)
- **Network:** Strictly typed networking events using Flamework's networking API.
- **DataTypes:** Centralized Interfaces for PlayerData and GameSettings to ensure type safety across the network boundary.

## 🔒 Security Features
- **Server Validation:** All purchases and combat actions are validated on the server.
- **Sanity Checks:** Distance checks and resource verification before processing any transaction.
- **Safe Remote Handling:** No direct object passing; all network traffic relies on string identifiers to prevent instance manipulation.

## 🚀 How to Run
1. Install dependencies: `npm install`
2. Sync with Roblox Studio: `rojo serve`
3. Compile TypeScript: `rbxtsc -w`