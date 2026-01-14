import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useAuth } from './AuthContext';

interface Item {
    id: string;
    name: string;
    count: number;
    icon: string;
}

interface Character {
    skinColor: string;
    hairStyle: number;
    name: string;
    gameData?: {
        position: { x: number, y: number };
    };
}

interface GameContextType {
    inventory: Item[];
    addItem: (id: string, name: string, icon: string, amount: number) => void;
    removeItem: (id: string, amount: number) => boolean;
    playerPos: { x: number, y: number };
    movePlayer: (x: number, y: number) => void;
    xp: number;
    level: number;
    addXp: (amount: number) => void;
    saveGame: () => Promise<void>;
    buyItem: (item: Item, cost: number) => Promise<boolean>;
    character: Character | null;
}

const GameContext = createContext<GameContextType>({
    inventory: [],
    addItem: () => { },
    removeItem: () => false,
    playerPos: { x: 20, y: 20 },
    movePlayer: () => { },
    xp: 0,
    level: 1,
    addXp: () => { },
    saveGame: async () => { },
    buyItem: async () => false,
    character: null,
});

export function GameProvider({ children }: { children: ReactNode }) {
    const { userId } = useAuth();
    const [inventory, setInventory] = useState<Item[]>([]);
    const [playerPos, setPlayerPos] = useState({ x: 20, y: 20 });
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(1);
    const [character, setCharacter] = useState<Character | null>(null);
    const [loaded, setLoaded] = useState(false);

    // Ref to track if we need to save
    const dirtyRef = useRef(false);

    // Load Game Data
    useEffect(() => {
        if (userId && !loaded) {
            fetch('/api/game/load', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.gameData) {
                        if (data.gameData.inventory) setInventory(data.gameData.inventory);
                        if (data.gameData.position) setPlayerPos(data.gameData.position);
                        if (data.gameData.xp) setXp(data.gameData.xp);
                        if (data.gameData.level) setLevel(data.gameData.level);
                    }
                    if (data.character) {
                        setCharacter({
                            ...data.character,
                            name: data.name || 'Cavernícola'
                        });
                    }
                    setLoaded(true);
                })
                .catch(err => console.error("Failed to load game data", err));
        }
    }, [userId, loaded]);

    // Auto-Save Interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (dirtyRef.current && userId) {
                saveGame();
            }
        }, 10000); // Save every 10 seconds if dirty

        return () => clearInterval(interval);
    }, [userId, inventory, playerPos, xp, level]);

    const saveGame = async () => {
        if (!userId) return;
        try {
            await fetch('/api/game/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    gameData: {
                        inventory,
                        position: playerPos,
                        xp,
                        level
                    }
                })
            });
            dirtyRef.current = false;
            console.log("Game Saved");
        } catch (e) {
            console.error("Save failed", e);
        }
    };

    const addItem = (id: string, name: string, icon: string, amount: number) => {
        setInventory(prev => {
            dirtyRef.current = true;
            const existing = prev.find(i => i.id === id);
            if (existing) {
                return prev.map(i => i.id === id ? { ...i, count: i.count + amount } : i);
            }
            return [...prev, { id, name, icon, count: amount }];
        });
    };

    const removeItem = (id: string, amount: number) => {
        let success = false;
        setInventory(prev => {
            const existing = prev.find(i => i.id === id);
            if (existing && existing.count >= amount) {
                success = true;
                dirtyRef.current = true;
                if (existing.count === amount) {
                    return prev.filter(i => i.id !== id);
                }
                return prev.map(i => i.id === id ? { ...i, count: i.count - amount } : i);
            }
            return prev;
        });
        return success;
    };

    const movePlayer = (x: number, y: number) => {
        setPlayerPos({ x, y });
        dirtyRef.current = true;
    };

    const addXp = (amount: number) => {
        setXp(prev => {
            dirtyRef.current = true;
            const newXp = prev + amount;
            const xpRequired = level * 100;
            if (newXp >= xpRequired) {
                setLevel(l => l + 1);
                return newXp - xpRequired;
            }
            return newXp;
        });
    };

    const buyItem = async (item: Item, cost: number) => {
        if (!userId) return false;
        try {
            const res = await fetch('/api/user/spend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount: cost, reason: `Bought ${item.name}` })
            });

            if (res.ok) {
                addItem(item.id, item.name, item.icon, item.count);
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const unlockCavern = async (cost: number) => {
        // Logic to unlock cavern, maybe spend money too
        return true;
    };

    return (
        <GameContext.Provider value={{ inventory, addItem, removeItem, playerPos, movePlayer, xp, level, addXp, saveGame, buyItem, character }}>
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => useContext(GameContext);
