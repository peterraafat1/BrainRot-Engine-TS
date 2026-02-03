import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";

@Controller({})
export class CharacterController implements OnStart {
    
    onStart() {
        const player = Players.LocalPlayer;

        if (player.Character) {
            this.handleCharacterSpawn(player.Character);
        }

        player.CharacterAdded.Connect((char) => {
            this.handleCharacterSpawn(char);
        });
    }

    private handleCharacterSpawn(character: Model) {
        const player = Players.LocalPlayer;
        
        const humanoid = character.WaitForChild("Humanoid", 10) as Humanoid;
        const backpack = player.WaitForChild("Backpack", 10);

        if (!humanoid || !backpack) return;

        const equippedName = player.GetAttribute("EquippedTongue") as string || "Basic Tongue";

        task.delay(0.5, () => {
            const tool = backpack.FindFirstChild(equippedName);
            
            if (tool && tool.IsA("Tool")) {
                humanoid.EquipTool(tool);
            } else {
                const anyTool = backpack.FindFirstChild("Basic Tongue");
                if (anyTool && anyTool.IsA("Tool")) {
                    humanoid.EquipTool(anyTool);
                }
            }
        });
    }
}