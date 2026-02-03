import { Service, OnStart } from "@flamework/core";
import { ReplicatedStorage } from "@rbxts/services";

const REMOTES_FOLDER = ReplicatedStorage.WaitForChild("EquipAccessory") as RemoteEvent;
const ASSETS_FOLDER = ReplicatedStorage.WaitForChild("AccessoriesStorage") as Folder;

@Service({})
export class AccessoryService implements OnStart {
    
    onStart() {
        REMOTES_FOLDER.OnServerEvent.Connect((player, accessoryName) => {
            if (typeIs(accessoryName, "string")) {
                this.handleEquip(player, accessoryName);
            }
        });
    }

    private handleEquip(player: Player, accessoryName: string) {
        const character = player.Character;
        if (!character) return;

        const humanoid = character.FindFirstChildOfClass("Humanoid");
        if (!humanoid) return;

        for (const child of character.GetChildren()) {
            if (child.IsA("Accessory")) {
                if (ASSETS_FOLDER.FindFirstChild(child.Name)) {
                    child.Destroy();
                }
            }
        }

        const targetAccessory = ASSETS_FOLDER.FindFirstChild(accessoryName);
        
        if (targetAccessory && targetAccessory.IsA("Accessory")) {
            const clonedAccessory = targetAccessory.Clone();
            humanoid.AddAccessory(clonedAccessory);
        }
    }
}