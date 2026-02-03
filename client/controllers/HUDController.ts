import { Controller, OnStart } from "@flamework/core";
import { Players, TweenService, UserInputService, Debris } from "@rbxts/services";
import { GlobalEvents, GlobalFunctions } from "shared/network";
import { ShopData } from "shared/constants/ShopData";

const TWEEN_INFO = new TweenInfo(0.6, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);

@Controller({})
export class HUDController implements OnStart {
    private player = Players.LocalPlayer;
    private playerGui = this.player.WaitForChild("PlayerGui") as PlayerGui;
    
    private mainHUD = this.playerGui.WaitForChild("MainHUD") as ScreenGui;
    private effectsGui = this.playerGui.WaitForChild("ActiveEffectsGui") as ScreenGui;
    private clickEffectsGui = this.playerGui.WaitForChild("ClickEffectsGui") as ScreenGui;

    onStart() {
        this.setupPotionTimers();
        this.setupClickEffects();
        this.setupStatsDisplay();
        this.setupMenuButtons();
        this.setupInventory();
    }

    private setupPotionTimers() {
        const container = this.effectsGui.WaitForChild("EffectsContainer") as Frame;
        const template = this.effectsGui.WaitForChild("Template") as Frame;
        template.Visible = false;

        GlobalEvents.client.UsePotion.connect((potionName, duration) => {
            let color = Color3.fromRGB(170, 0, 255);
            if (potionName.match("Speed")[0]) color = Color3.fromRGB(0, 170, 255);
            else if (potionName.match("Licks")[0]) color = Color3.fromRGB(255, 170, 0);

            this.startTimer(container, template, potionName, duration, color);
        });
    }

    private startTimer(container: Frame, template: Frame, name: string, duration: number, color: Color3) {
        const entry = template.Clone();
        entry.Name = name;
        entry.Visible = true;
        entry.Parent = container;
        entry.BackgroundColor3 = color;

        const label = entry.FindFirstChild("TimerLabel") as TextLabel;
        let timeLeft = duration;

        task.spawn(() => {
            while (timeLeft > 0) {
                if (label) label.Text = `${name}: ${timeLeft}s`;

                if (timeLeft <= 5) {
                    label.TextColor3 = new Color3(1, 0, 0);
                    TweenService.Create(label, new TweenInfo(0.5), { TextTransparency: 0.5 }).Play();
                    task.wait(0.5);
                    TweenService.Create(label, new TweenInfo(0.5), { TextTransparency: 0 }).Play();
                    task.wait(0.5);
                } else {
                    task.wait(1);
                }
                timeLeft--;
            }
            entry.Destroy();
        });
    }

    private setupClickEffects() {
        const template = this.clickEffectsGui.WaitForChild("EffectTemplate") as Frame;
        template.Visible = false;

        UserInputService.InputBegan.Connect((input, gpe) => {
            if (gpe) return;
            if (input.UserInputType === Enum.UserInputType.MouseButton1 || input.UserInputType === Enum.UserInputType.Touch) {
                const mouseLoc = UserInputService.GetMouseLocation();
                this.spawnEffect(template, mouseLoc);
            }
        });
    }

    private spawnEffect(template: Frame, position: Vector2) {
        const tongueName = this.player.GetAttribute("EquippedTongue") as string || "Basic Tongue";
        const item = ShopData.Items.find(i => i.Name === tongueName && i.Type === "Tongue");
        const tongueMulti = item ? (item as any).Multiplier : 1;
        const potionMulti = (this.player.GetAttribute("LicksMultiplier") as number) || 1;
        
        const total = math.floor(tongueMulti * potionMulti);

        const randomX = math.random(-50, 50);
        const randomY = math.random(-50, 50);

        const clone = template.Clone();
        clone.Name = "Effect";
        clone.Parent = this.clickEffectsGui;
        clone.Visible = true;
        clone.Position = UDim2.fromOffset(position.X + randomX, position.Y + randomY);

        const text = clone.FindFirstChildOfClass("TextLabel");
        if (text) {
            text.Text = `+${total}`;
            if (potionMulti > 1) text.TextColor3 = Color3.fromRGB(255, 170, 0);
        }

        const targetPos = clone.Position.add(UDim2.fromScale(0, -0.2));
        TweenService.Create(clone, TWEEN_INFO, { Position: targetPos }).Play();
        
        const children = clone.GetChildren();
        children.forEach(c => {
            if (c.IsA("TextLabel") || c.IsA("ImageLabel")) {
                TweenService.Create(c, TWEEN_INFO, { Transparency: 1 }).Play();
            }
        });

        Debris.AddItem(clone, 0.7);
    }

    private setupStatsDisplay() {
        const leaderstats = this.player.WaitForChild("leaderstats");
        const licks = leaderstats.WaitForChild("Licks") as IntValue;
        const coins = leaderstats.WaitForChild("Coins") as IntValue;
        const rebirths = leaderstats.WaitForChild("Rebirths") as IntValue;

        const frame11 = this.mainHUD.WaitForChild("11") as Frame;
        const licksLabel = frame11.FindFirstChild("LicksValue", true) as TextLabel;
        const coinsLabel = frame11.FindFirstChild("CoinsValue", true) as TextLabel;
        const rebirthsLabel = frame11.FindFirstChild("RebirthsValue", true) as TextLabel;

        const update = () => {
            if (licksLabel) licksLabel.Text = this.formatNumber(licks.Value);
            if (coinsLabel) coinsLabel.Text = this.formatNumber(coins.Value);
            if (rebirthsLabel) rebirthsLabel.Text = this.formatNumber(rebirths.Value);
        };

        update();
        licks.Changed.Connect(update);
        coins.Changed.Connect(update);
        rebirths.Changed.Connect(update);
    }

    private formatNumber(n: number): string {
        const suffixes = ["k", "M", "B", "T", "Qa"];
        if (n < 1000) return tostring(n);
        
        for (let i = 0; i < suffixes.size(); i++) {
            const v = math.pow(1000, i + 1);
            if (n < math.pow(1000, i + 2)) {
                return string.format("%.1f%s", n / v, suffixes[i]);
            }
        }
        return tostring(n);
    }

    private setupMenuButtons() {
        const frame11 = this.mainHUD.WaitForChild("11") as Frame;
        
        const btn1 = frame11.FindFirstChild("ShopButton1", true) as ImageButton;
        const frame1 = frame11.FindFirstChild("ShopFrame1") as Frame;
        if (btn1 && frame1) {
            btn1.MouseButton1Click.Connect(() => frame1.Visible = !frame1.Visible);
        }

        const btn2 = frame11.FindFirstChild("ShopButton2", true) as ImageButton;
        const frame2 = frame11.FindFirstChild("ShopFrame2") as Frame;
        if (btn2 && frame2) {
            btn2.MouseButton1Click.Connect(() => frame2.Visible = !frame2.Visible);
        }

        const bagBtn = frame11.FindFirstChild("OpenBagButton", true) as ImageButton;
        const bagFrame = this.mainHUD.FindFirstChild("BagFrame") as Frame;
        if (bagBtn && bagFrame) {
            bagBtn.MouseButton1Click.Connect(() => bagFrame.Visible = !bagFrame.Visible);
        }
    }

    private setupInventory() {
        const bagFrame = this.mainHUD.FindFirstChild("BagFrame") as Frame;
        if (!bagFrame) return;

        const container = bagFrame.WaitForChild("ScrollingFrame") as ScrollingFrame;
        const template = container.WaitForChild("Template") as Frame;
        template.Visible = false;

        bagFrame.GetPropertyChangedSignal("Visible").Connect(() => {
            if (bagFrame.Visible) {
                this.refreshBag(container, template);
            }
        });
    }

    private async refreshBag(container: ScrollingFrame, template: Frame) {
        container.GetChildren().forEach(c => {
            if (c.IsA("Frame") && c.Name !== "Template") c.Destroy();
        });

        const data = await GlobalFunctions.client.GetInventoryFunction.invoke();
        
        data.OwnedTongues.forEach(name => this.createItem(name, 1, container, template));
        
        for (const [name, count] of pairs(data.Potions)) {
            if (count > 0) this.createItem(name, count, container, template);
        }
    }

    private createItem(name: string, count: number, container: ScrollingFrame, template: Frame) {
        const itemData = ShopData.Items.find(i => i.Name === name);
        if (!itemData) return;

        const clone = template.Clone();
        clone.Name = name;
        clone.Parent = container;
        clone.Visible = true;

        const nameLabel = clone.FindFirstChild("ItemName") as TextLabel;
        if (nameLabel) nameLabel.Text = count > 1 ? `${name} (x${count})` : name;

        const icon = clone.FindFirstChild("Icon") as ImageLabel;
        if (icon) icon.Image = itemData.ImageId;

        const btn = clone.FindFirstChild("BuyButton") as TextButton;
        if (btn) {
            if (itemData.Type === "Product") {
                btn.Text = "Use";
                btn.BackgroundColor3 = Color3.fromRGB(170, 0, 255);
                btn.MouseButton1Click.Connect(async () => {
                    btn.Text = "...";
                    const result = await GlobalFunctions.client.ShopFunction.invoke("UsePotion", name);
                    if (result === "Success") {
                        btn.Text = "Active!";
                        task.wait(0.5);
                        this.refreshBag(container, template);
                    } else {
                        btn.Text = "Error";
                    }
                });
            } else {
                btn.Text = "Equip";
                btn.BackgroundColor3 = Color3.fromRGB(0, 255, 0);
                btn.MouseButton1Click.Connect(async () => {
                    const result = await GlobalFunctions.client.ShopFunction.invoke("BuyTongue", name);
                    if (result) {
                        btn.Text = "Equipped";
                        task.wait(1);
                        btn.Text = "Equip";
                    }
                });
            }
        }
    }
}