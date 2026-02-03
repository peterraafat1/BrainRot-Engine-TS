export interface TongueConfig {
    Price: number;
    LickGain: number;
    Damage: number;
    Cooldown: number;
}

export interface BoxDrop {
    Name: string;
    Chance: number;
}

export interface BoxConfig {
    Price: number;
    Currency: "Coins" | "Licks" | "Robux";
    Drops: BoxDrop[];
}

export const GameSettings = {
    Tongues: {
        Basic: { Price: 0, LickGain: 1, Damage: 10, Cooldown: 0.5 },
        Skibidi: { Price: 0, LickGain: 2, Damage: 25, Cooldown: 0.4 },
        Rizzler: { Price: 0, LickGain: 3, Damage: 100, Cooldown: 0.2 },
    } as Record<string, TongueConfig>,

    Boxes: {
        "Lick Block": {
            Price: 199,
            Currency: "Coins",
            Drops: [
                { Name: "Basic", Chance: 60 },
                { Name: "Skibidi", Chance: 30 },
                { Name: "Rizzler", Chance: 10 },
            ],
        },
    } as Record<string, BoxConfig>,
};