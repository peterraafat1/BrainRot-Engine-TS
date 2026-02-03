export interface PlayerData {
	Licks: number;
	Coins: number;
	Rebirths: number;
	EquippedTongue: string;
	OwnedTongues: string[];
	UnlockedGates: string[];
	Potions: Record<string, number>; 
}

export const DEFAULT_DATA: PlayerData = {
	Licks: 0,
	Coins: 0,
	Rebirths: 0,
	EquippedTongue: "Basic Tongue",
	OwnedTongues: ["Basic Tongue"],
	UnlockedGates: [],
	Potions: {},
};