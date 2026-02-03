import { Controller, OnStart } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { GlobalEvents } from "shared/network";

@Controller({})
export class GateController implements OnStart {
    
    onStart() {
        GlobalEvents.client.GateUpdate.connect((gateName) => {
            this.removeGate(gateName);
        });
    }

    private removeGate(gateName: string) {
        const gate = Workspace.FindFirstChild(gateName, true);

        if (gate) {
            gate.Destroy();
        }
    }
}