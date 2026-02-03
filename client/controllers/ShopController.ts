import { Controller, OnStart } from "@flamework/core";
import { Players, MarketplaceService, TweenService, ReplicatedStorage } from "@rbxts/services";
import { GlobalFunctions, GlobalEvents } from "shared/network";
import { ShopData, ShopItem } from "shared/constants/ShopData";

const COLORS = {
    Tongue: Color3.fromRGB(0, 255, 100),
    Box: Color3.fromRGB(255, 170, 0),
    Idle: Color3.fromRGB(35, 35, 35),
    TextInactive: Color3.fromRGB(180, 180, 180),
    ActiveText: new Color3(1, 1, 1),
};

@Controller({})
export class ShopController implements OnStart {
    private player = Players.LocalPlayer;
    private playerGui = this.player.WaitForChild("PlayerGui") as PlayerGui;
    private mainHUD = this.playerGui.WaitForChild("MainHUD") as ScreenGui;
    
    private isMenuOpen = false;

    onStart() {
        this.setupRebirthSystem();
        this.setupShop1();
        this.setupShop2();
        this.setupPurchaseListeners();
    }

    private setupRebirthSystem() {
        const frame = this.mainHUD.WaitForChild("11") as Frame;
        const rebirthBtn = frame.FindFirstChild("RebirthButton", true) as ImageButton;
        if (!rebirthBtn) return;

        const priceLabel = rebirthBtn.FindFirstChild("PriceLabel") as TextLabel;
        
        this.updateRebirthPrice(priceLabel);

        rebirthBtn.MouseButton1Click.Connect(async () => {
            rebirthBtn.TweenSize(UDim2.fromScale(0.9, 0.9), "Out", "Quad", 0.1, true);
            task.wait(0.1);
            rebirthBtn.TweenSize(UDim2.fromScale(1, 1), "Out", "Quad", 0.1, true);

            if (priceLabel) priceLabel.Text = "...";

            const result = await GlobalFunctions.client.RebirthFunction.invoke("DoRebirth");

            if (typeIs(result, "table")) {
                if (result.Success) {
                    if (priceLabel) priceLabel.Text = "Success!";
                    task.wait(1.5);
                    this.updateRebirthPrice(priceLabel);
                } else {
                    if (priceLabel) priceLabel.Text = `Need 👅${this.formatNumber(result.Needed as number)}`;
                    task.wait(1.5);
                    this.updateRebirthPrice(priceLabel);
                }
            }
        });
    }

    private async updateRebirthPrice(label: TextLabel) {
        const price = await GlobalFunctions.client.RebirthFunction.invoke("GetPrice");
        if (label && typeIs(price, "number")) {
            label.Text = "👅" + this.formatNumber(price);
        }
    }

    private setupShop1() {
        const shopFrame = this.mainHUD.WaitForChild("ShopFrame1") as Frame;
        const container = shopFrame.FindFirstChild("ScrollingFrame") as ScrollingFrame;
        const template = container.FindFirstChild("Template") as Frame;
        template.Visible = false;

        const tongueBtn = shopFrame.FindFirstChild("TonguesBtn", true) as TextButton;
        const boxBtn = shopFrame.FindFirstChild("BoxesBtn", true) as TextButton;

        const loadTab = (type: "Tongue" | "Box") => {
            container.GetChildren().forEach(c => { if (c.IsA("Frame") && c.Name !== "Template") c.Destroy(); });

            this.updateTabVisuals(type === "Tongue" ? tongueBtn : boxBtn, true, type);
            this.updateTabVisuals(type === "Tongue" ? boxBtn : tongueBtn, false, type === "Tongue" ? "Box" : "Tongue");

            const items = ShopData.Items.filter(i => i.Type === type);
            items.forEach(item => this.createShopItem(item, container, template, false));
        };

        if (tongueBtn) tongueBtn.MouseButton1Click.Connect(() => loadTab("Tongue"));
        if (boxBtn) boxBtn.MouseButton1Click.Connect(() => loadTab("Box"));

        loadTab("Tongue");
    }

    private updateTabVisuals(btn: TextButton, isActive: boolean, type: string) {
        if (!btn) return;
        const targetColor = isActive ? (type === "Tongue" ? COLORS.Tongue : COLORS.Box) : COLORS.Idle;
        const stroke = btn.FindFirstChild("UIStroke") as UIStroke;
        
        TweenService.Create(btn, new TweenInfo(0.3), { 
            BackgroundColor3: targetColor, 
            TextColor3: isActive ? COLORS.ActiveText : COLORS.TextInactive 
        }).Play();

        if (stroke) {
            TweenService.Create(stroke, new TweenInfo(0.3), { 
                Transparency: isActive ? 0 : 0.5,
                Color: targetColor
            }).Play();
        }
    }

    private setupShop2() {
        const shopFrame = this.mainHUD.WaitForChild("ShopFrame2") as Frame;
        const container = shopFrame.FindFirstChild("ScrollingFrame") as ScrollingFrame;
        const template = container.FindFirstChild("Template") as Frame;
        template.Visible = false;

        const populate = () => {
            container.GetChildren().forEach(c => { if (c.IsA("Frame") && c.Name !== "Template") c.Destroy(); });
            
            const items = ShopData.Items.filter(i => i.Type === "Product" || i.Type === "Pass");
            items.forEach(item => this.createShopItem(item, container, template, true));
        };

        shopFrame.GetPropertyChangedSignal("Visible").Connect(() => {
            if (shopFrame.Visible) populate();
        });
        
        populate();
    }

    private createShopItem(item: ShopItem, container: ScrollingFrame, template: Frame, isRobux: boolean) {
        const clone = template.Clone();
        clone.Name = item.Name;
        clone.Parent = container;
        clone.Visible = true;

        (clone.FindFirstChild("ItemName") as TextLabel).Text = item.Name;
        (clone.FindFirstChild("Icon") as ImageLabel).Image = item.ImageId;
        
        const priceLabel = clone.FindFirstChild("PriceLabel") as TextLabel;
        if (priceLabel) priceLabel.Text = isRobux ? `R$ ${item.Price}` : (item.Type === "Tongue" ? `👅 ${this.formatNumber(item.Price)}` : `💰 ${item.Price}`);

        const buyBtn = clone.FindFirstChild("BuyButton") as TextButton;
        if (buyBtn) {
            buyBtn.MouseButton1Click.Connect(async () => {
                if (isRobux) {
                    this.isMenuOpen = true;
                    if (item.Type === "Pass") {
                        MarketplaceService.PromptGamePassPurchase(this.player, item.ProductId);
                    } else {
                        MarketplaceService.PromptProductPurchase(this.player, item.ProductId);
                    }
                } else if (item.Type === "Box") {
                    const result = await GlobalFunctions.client.OpenBoxFunction.invoke(item.Name);
                    if (typeIs(result, "table") && result.Success) {
                        this.playGachaAnimation(buyBtn, result.ItemName as string);
                    } else {
                        buyBtn.Text = "Too Poor!";
                        task.wait(1);
                        buyBtn.Text = "Buy";
                    }
                } else if (item.Type === "Tongue") {
                    const result = await GlobalFunctions.client.ShopFunction.invoke("BuyTongue", item.Name);
                    if (typeIs(result, "table") && result.Status === "Success") {
                        buyBtn.Text = "Owned";
                        buyBtn.BackgroundColor3 = Color3.fromRGB(100, 255, 100);
                    } else {
                        buyBtn.Text = "Too Poor";
                        task.wait(1);
                        buyBtn.Text = "Buy";
                    }
                }
            });
        }
    }

    private setupPurchaseListeners() {
        MarketplaceService.PromptProductPurchaseFinished.Connect(() => this.isMenuOpen = false);
        MarketplaceService.PromptGamePassPurchaseFinished.Connect(() => this.isMenuOpen = false);

        GlobalEvents.client.RobuxPurchaseSignal.connect((itemName, type, wonItem, rarity) => {
            if (this.isMenuOpen) {
                while (this.isMenuOpen) task.wait(0.1);
            }

            if (type === "Box") {
                const sfx = new Instance("Sound");
                sfx.SoundId = "rbxassetid://12221967";
                sfx.Parent = ReplicatedStorage;
                sfx.PlayOnRemove = true;
                sfx.Destroy();
            }
        });
    }

    private playGachaAnimation(btn: TextButton, wonItemName: string) {
        btn.Text = "Rolling...";
        for (let i = 0; i < 10; i++) {
            btn.BackgroundColor3 = Color3.fromHSV(math.random(), 0.8, 1);
            task.wait(0.05);
        }
        btn.Text = `WON: ${wonItemName}`;
        task.wait(2);
        btn.Text = "Buy";
        btn.BackgroundColor3 = COLORS.Box;
    }

    private formatNumber(n: number): string {
        const suffixes = ["K", "M", "B", "T", "QD"];
        let index = 0;
        while (n >= 1000 && index < suffixes.size()) {
            n /= 1000;
            index++;
        }
        return index > 0 ? string.format("%.1f%s", n, suffixes[index - 1]) : tostring(n);
    }
}