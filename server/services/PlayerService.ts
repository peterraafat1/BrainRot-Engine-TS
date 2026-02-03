import { Service, OnStart } from "@flamework/core";
import { Players, DataStoreService } from "@rbxts/services";
import { PlayerData, DEFAULT_DATA } from "shared/types";
import { GlobalEvents } from "shared/network";

const DATA_KEY = "BrainRot_Final_V102";
const MyDataStore = DataStoreService.GetDataStore(DATA_KEY);

@Service({})
export class PlayerService implements OnStart {
    private sessionData = new Map<number, PlayerData>();

    onStart() {
        Players.PlayerAdded.Connect((player) => this.loadData(player));
        Players.PlayerRemoving.Connect((player) => this.saveData(player, true));
        
        game.BindToClose(() => {
            for (const player of Players.GetPlayers()) {
                this.saveData(player, true);
            }
            task.wait(3);
        });
    }

    public getPlayerData(player: Player): PlayerData | undefined {
        return this.sessionData.get(player.UserId);
    }

    public updatePlayerData(player: Player, callback: (data: PlayerData) => void) {
        const data = this.sessionData.get(player.UserId);
        if (data) {
            callback(data);
            this.updateLeaderstats(player, data);
        }
    }

    private async loadData(player: Player) {
        const ls = new Instance("Folder");
        ls.Name = "leaderstats";
        ls.Parent = player;

        const licks = new Instance("IntValue", ls); licks.Name = "Licks";
        const coins = new Instance("IntValue", ls); coins.Name = "Coins";
        const rebirths = new Instance("IntValue", ls); rebirths.Name = "Rebirths";

        try {
            const [savedData] = MyDataStore.GetAsync(DATA_KEY + "-" + player.UserId) as [PlayerData];
            
            const finalData = { ...DEFAULT_DATA, ...savedData }; 
            this.sessionData.set(player.UserId, finalData);

            this.updateLeaderstats(player, finalData);
            
            task.wait(2);
            finalData.UnlockedGates.forEach(gate => {
                GlobalEvents.server.get(player).GateUpdate(gate);
            });

        } catch (e) {
            this.sessionData.set(player.UserId, table.clone(DEFAULT_DATA));
        }
    }

    private saveData(player: Player, removeCache: boolean) {
        const data = this.sessionData.get(player.UserId);
        if (data) {
            try {
                MyDataStore.SetAsync(DATA_KEY + "-" + player.UserId, data);
            } catch (e) {
            }
            if (removeCache) {
                this.sessionData.delete(player.UserId);
            }
        }
    }

    private updateLeaderstats(player: Player, data: PlayerData) {
        const ls = player.FindFirstChild("leaderstats");
        if (ls) {
            (ls.FindFirstChild("Licks") as IntValue).Value = data.Licks;
            (ls.FindFirstChild("Coins") as IntValue).Value = data.Coins;
            (ls.FindFirstChild("Rebirths") as IntValue).Value = data.Rebirths;
        }
    }
}