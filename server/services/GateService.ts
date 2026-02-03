import { Service, OnStart } from "@flamework/core";
import { PlayerService } from "./PlayerService";
import { GlobalEvents } from "shared/network";
import { Workspace } from "@rbxts/services";

@Service({})
export class GateService implements OnStart {
    constructor(private playerService: PlayerService) {}

    onStart() {}

    public tryPurchaseGate(player: Player, gateName: string, price: number): string {
        const gateModel = Workspace.FindFirstChild(gateName, true); 
        
        if (!gateModel) {
            return "Failed";
        }

        const playerData = this.playerService.getPlayerData(player);
        if (!playerData) return "Error";

        if (playerData.Licks >= price) {
            this.playerService.updatePlayerData(player, (data) => {
                data.Licks -= price;
                
                if (!data.UnlockedGates.includes(gateName)) {
                    data.UnlockedGates.push(gateName);
                }
            });

            GlobalEvents.server.get(player).GateUpdate(gateName);
            return "Success";
        } else {
            return "TooPoor";
        }
    }
}