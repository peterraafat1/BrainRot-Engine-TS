import { Service, OnStart } from "@flamework/core";
import { Workspace, ServerStorage, TweenService, Debris } from "@rbxts/services";
import { GlobalEvents } from "shared/network";
import { PlayerService } from "./PlayerService";
import { ShopData } from "shared/constants/ShopData";

@Service({})
export class CombatService implements OnStart {
    constructor(private playerService: PlayerService) {}

    onStart() {
        GlobalEvents.server.on("LickAction", (player) => this.handleLick(player));

        task.delay(3, () => this.initFloatingMonsters());
    }

    private handleLick(player: Player) {
        const data = this.playerService.getPlayerData(player);
        if (!data) return;

        const char = player.Character;
        const root = char?.FindFirstChild("HumanoidRootPart") as BasePart;
        if (!root) return;

        let currentMultiplier = 1;
        const equippedItem = ShopData.Items.find(i => i.Name === data.EquippedTongue && i.Type === "Tongue");
        if (equippedItem && equippedItem.Type === "Tongue") {
            currentMultiplier = equippedItem.Multiplier;
        }

        const potionMulti = player.GetAttribute("LicksMultiplier") as number || 1;
        const baseDamage = 10 * currentMultiplier * (1 + (data.Rebirths * 0.1));
        const lickGain = 1 * currentMultiplier * potionMulti;

        this.playerService.updatePlayerData(player, (d) => {
            d.Licks += math.floor(lickGain);
        });

        const overlapParams = new OverlapParams();
        overlapParams.FilterDescendantsInstances = [char!];
        overlapParams.FilterType = Enum.RaycastFilterType.Exclude;

        const parts = Workspace.GetPartBoundsInRadius(root.Position, 15, overlapParams);
        const hitHumanoids = new Set<Humanoid>();

        parts.forEach(part => {
            const model = part.Parent as Model;
            const hum = model.FindFirstChild("Humanoid") as Humanoid;
            
            if (hum && hum.Health > 0 && model.GetAttribute("IsEnemy") && !hitHumanoids.has(hum)) {
                hitHumanoids.add(hum);
                this.damageEnemy(player, model, hum, baseDamage);
            }
        });
    }

    private damageEnemy(player: Player, model: Model, hum: Humanoid, damage: number) {
        if (!model.FindFirstChild("OriginalPos")) {
            const val = new Instance("CFrameValue");
            val.Name = "OriginalPos";
            val.Value = model.GetPivot();
            val.Parent = model;
        }

        hum.TakeDamage(damage);
        
        const highlight = new Instance("Highlight");
        highlight.Parent = model;
        highlight.FillColor = new Color3(1, 0, 0);
        Debris.AddItem(highlight, 0.15);

        if (hum.Health <= 0 && !hum.GetAttribute("IsDead")) {
            hum.SetAttribute("IsDead", true);
            this.handleEnemyDeath(player, model);
        }
    }

    private handleEnemyDeath(player: Player, model: Model) {
        const enemyName = model.Name;
        const originalPos = (model.FindFirstChild("OriginalPos") as CFrameValue)?.Value;
        const parent = model.Parent;

        const coinMulti = player.GetAttribute("CoinMultiplier") as number || 1;
        this.playerService.updatePlayerData(player, (d) => {
            d.Coins += (100 * coinMulti);
        });

        task.delay(2, () => {
            model.Destroy();
            this.spawnEnemy(enemyName, originalPos, parent);
        });
    }

    private spawnEnemy(name: string, cframe: CFrame, parent: Instance | undefined) {
        const prototype = ServerStorage.WaitForChild("Enemies").FindFirstChild(name) as Model;
        if (prototype && parent) {
            const clone = prototype.Clone();
            clone.PivotTo(cframe);
            clone.Parent = parent;
            this.startFloating(clone);
        }
    }

    private initFloatingMonsters() {
        for (const child of Workspace.GetDescendants()) {
            if (child.IsA("Model") && child.GetAttribute("IsEnemy")) {
                this.startFloating(child);
            }
        }
    }
    
    private startFloating(model: Model) {
        if (model.GetAttribute("FloatingTween")) return;

        const cframeValue = new Instance("CFrameValue");
        cframeValue.Value = model.GetPivot();
        cframeValue.Parent = model;

        cframeValue.Changed.Connect((val) => {
            if (model.Parent) model.PivotTo(val);
            else cframeValue.Destroy();
        });

        const info = new TweenInfo(math.random(1.5, 2.5), Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true);
        const goal = { Value: cframeValue.Value.mul(new CFrame(0, math.random(1, 2), 0)) };
        
        TweenService.Create(cframeValue, info, goal).Play();
        model.SetAttribute("FloatingTween", true);
    }
}