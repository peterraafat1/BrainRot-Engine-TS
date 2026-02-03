import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, Players, ContentProvider } from "@rbxts/services";
import { GlobalEvents } from "shared/network";

const COMBAT_CONFIG = {
    ANIM_ID: "rbxassetid://82701292823127",
    COOLDOWN: 0.5,
    ACTION_NAME: "LickAttack",
};

@Controller({})
export class CombatController implements OnStart {
    private isCooldown = false;
    private currentTrack: AnimationTrack | undefined;

    onStart() {
        ContextActionService.BindAction(
            COMBAT_CONFIG.ACTION_NAME,
            (_, state) => {
                if (state === Enum.UserInputState.Begin) {
                    this.attemptAttack();
                }
                return Enum.ContextActionResult.Pass;
            },
            true,
            Enum.UserInputType.MouseButton1,
            Enum.UserInputType.Touch,
            Enum.UserInputType.ButtonR2
        );
        
        ContextActionService.SetTitle(COMBAT_CONFIG.ACTION_NAME, "Lick 👅");

        const player = Players.LocalPlayer;
        if (player.Character) this.setupAnimation(player.Character);
        player.CharacterAdded.Connect((char) => this.setupAnimation(char));
    }

    private setupAnimation(character: Model) {
        const humanoid = character.WaitForChild("Humanoid", 10) as Humanoid;
        const animator = humanoid?.WaitForChild("Animator", 10) as Animator;

        if (animator) {
            const anim = new Instance("Animation");
            anim.AnimationId = COMBAT_CONFIG.ANIM_ID;
            
            ContentProvider.PreloadAsync([anim]);
            
            this.currentTrack = animator.LoadAnimation(anim);
            this.currentTrack.Priority = Enum.AnimationPriority.Action;
        }
    }

    private attemptAttack() {
        if (this.isCooldown) return;
        
        this.isCooldown = true;

        if (this.currentTrack) {
            this.currentTrack.Play();
        }

        GlobalEvents.client.LickAction.fire();

        task.delay(COMBAT_CONFIG.COOLDOWN, () => {
            this.isCooldown = false;
        });
    }
}