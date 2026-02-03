import { Networking } from "@flamework/networking";

interface ServerEvents {
	LickAction(): void;
}

interface ClientEvents {
	GateUpdate(gateName: string): void;
	UsePotion(potionName: string, duration: number): void;
	RobuxPurchaseSignal(itemName: string, type: string, wonItem: string, rarity: string): void;
}

interface ServerFunctions {
	BuyItem(action: string, itemName: string, price: number): string;
	ShopFunction(action: string, itemName: string): unknown; 
	GetInventoryFunction(): { OwnedTongues: string[]; Potions: Record<string, number> };
	OpenBoxFunction(boxName: string): unknown;
	RebirthFunction(action: "GetPrice" | "DoRebirth"): number | { Success: boolean; NewPrice?: number; Needed?: number };
}

interface ClientFunctions {}

export const GlobalEvents = Networking.createEvent<ServerEvents, ClientEvents>();
export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();