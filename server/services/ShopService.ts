import { Service, OnStart } from "@flamework/core";
import { GlobalFunctions } from "shared/network";
import { PlayerService } from "./PlayerService";
import { GateService } from "./GateService";
import { ShopData, BoxItem } from "shared/constants/ShopData";

@Service({})
export class ShopService implements OnStart {
    constructor(
        private playerService: PlayerService,
        private gateService: GateService 
    ) {}

    onStart() {
        GlobalFunctions.server.BuyItem = (player, action, itemName, price) => {
            if (action === "BuyGate") return this.buyGate(player, itemName as string, price as number);
            return "Failed";
        };

        GlobalFunctions.server.ShopFunction = (player, action, itemName) => {
            if (action === "BuyTongue") return this.buyTongue(player, itemName as string);
            if (action === "UsePotion") return this.usePotion(player, itemName as string);
            return "Failed";
        };

        GlobalFunctions.server.RebirthFunction = (player, action) => {
            return this.handleRebirth(player, action);
        };
        
        GlobalFunctions.server.OpenBoxFunction = (player, boxName) => {
            return this.openBox(player, boxName as string);
        };
    }

    private buyGate(player: Player, gateName: string, price: number): string {
        return this.gateService.tryPurchaseGate(player, gateName, price);
    }

    private buyTongue(player: Player, tongueName: string) {
        const item = ShopData.Items.find(i => i.Name === tongueName);
        const data = this.playerService.getPlayerData(player);
        
        if (item && data && data.Licks >= item.Price) {
            this.playerService.updatePlayerData(player, (d) => {
                d.Licks -= item.Price;
                if (!d.OwnedTongues.includes(tongueName)) {
                    d.OwnedTongues.push(tongueName);
                }
                d.EquippedTongue = tongueName;
            });
            return { Status: "Success", Inventory: data.OwnedTongues };
        }
        return "TooPoor";
    }

    private usePotion(player: Player, potionName: string) {
        return "Success"; 
    }
    
    private openBox(player: Player, boxName: string) {
        const box = ShopData.Items.find(i => i.Name === boxName && i.Type === "Box") as BoxItem;
        const data = this.playerService.getPlayerData(player);

        if (!box || !data || data.Coins < box.Price) return "TooPoor";

        this.playerService.updatePlayerData(player, d => d.Coins -= box.Price);

        let totalWeight = 0;
        box.Contents.forEach(c => totalWeight += c.Weight);
        const random = math.random() * totalWeight;
        
        let currentWeight = 0;
        for (const content of box.Contents) {
            currentWeight += content.Weight;
            if (random <= currentWeight) {
                this.playerService.updatePlayerData(player, d => {
                    if (!d.OwnedTongues.includes(content.Name)) {
                        d.OwnedTongues.push(content.Name);
                    }
                });
                return { Success: true, ItemName: content.Name, Rarity: content.Rarity };
            }
        }
        return "Failed";
    }

    private handleRebirth(player: Player, action: string) {
        const data = this.playerService.getPlayerData(player);
        if (!data) return 0;
        
        const price = 500 * (data.Rebirths + 1);

        if (action === "GetPrice") return price;
        
        if (action === "DoRebirth" && data.Licks >= price) {
            this.playerService.updatePlayerData(player, d => {
                d.Rebirths += 1;
                d.Licks = 0;
                d.Coins = 0;
                d.OwnedTongues = ["Basic Tongue"];
                d.EquippedTongue = "Basic Tongue";
            });
            return { Success: true, NewPrice: 500 * (data.Rebirths + 1) };
        }
        return { Success: false, Needed: price };
    }
}