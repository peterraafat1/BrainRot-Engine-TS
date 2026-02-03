import { Service, OnStart } from "@flamework/core";
import { DataStoreService, Players, Workspace } from "@rbxts/services";

interface BoardConfig {
    StatName: string;
    StoreKey: string;
    PartName: string;
    Color: Color3;
    FormatPrefix: string;
    UpdateInterval: number;
}

const LEADERBOARDS: BoardConfig[] = [
    {
        StatName: "Licks",
        StoreKey: "GlobalLicks_Final_V1",
        PartName: "LickBoard",
        Color: Color3.fromRGB(255, 255, 255),
        FormatPrefix: "",
        UpdateInterval: 20,
    },
    {
        StatName: "Coins",
        StoreKey: "GlobalCoins_Final_V1",
        PartName: "CoinBoard",
        Color: Color3.fromRGB(255, 239, 150),
        FormatPrefix: "$",
        UpdateInterval: 20,
    },
    {
        StatName: "Rebirths",
        StoreKey: "GlobalRebirths_V1",
        PartName: "RebirthBoard",
        Color: Color3.fromRGB(150, 240, 255),
        FormatPrefix: "Rebirths: ",
        UpdateInterval: 30,
    },
];

@Service({})
export class LeaderboardService implements OnStart {
    
    onStart() {
        LEADERBOARDS.forEach((config) => {
            task.spawn(() => {
                while (true) {
                    this.savePlayersData(config);
                    this.updateBoard(config);
                    task.wait(config.UpdateInterval);
                }
            });
        });
    }

    private savePlayersData(config: BoardConfig) {
        const store = DataStoreService.GetOrderedDataStore(config.StoreKey);

        Players.GetPlayers().forEach((player) => {
            const leaderstats = player.FindFirstChild("leaderstats");
            const statValue = leaderstats?.FindFirstChild(config.StatName) as IntValue;

            if (statValue) {
                try {
                    store.SetAsync(tostring(player.UserId), statValue.Value);
                } catch (e) {
                }
            }
        });
    }

    private updateBoard(config: BoardConfig) {
        const boardPart = Workspace.WaitForChild(config.PartName, 5) as Part;
        if (!boardPart) return;

        const surfaceGui = boardPart.WaitForChild("SurfaceGui", 5) as SurfaceGui;
        const scrollFrame = surfaceGui?.WaitForChild("ScrollingFrame") as ScrollingFrame;
        const uiLayout = scrollFrame?.WaitForChild("UIListLayout") as UIListLayout;

        if (!scrollFrame || !uiLayout) return;

        scrollFrame.GetChildren().forEach((child) => {
            if (child.IsA("TextLabel")) child.Destroy();
        });

        const store = DataStoreService.GetOrderedDataStore(config.StoreKey);
        
        try {
            const pages = store.GetSortedAsync(false, 10);
            const topTen = pages.GetCurrentPage();

            topTen.forEach((data, index) => {
                const rank = index + 1;
                const amount = data.value;
                const userId = data.key as unknown as number;
                
                let playerName = "Loading...";
                try {
                    playerName = Players.GetNameFromUserIdAsync(userId);
                } catch {
                    playerName = "Unknown";
                }

                const label = new Instance("TextLabel");
                label.Parent = scrollFrame;
                label.Size = new UDim2(1, -10, 0, 100);
                label.BackgroundColor3 = config.Color;
                label.TextColor3 = new Color3(0, 0, 0);
                label.TextScaled = true;
                label.Font = Enum.Font.GothamBold;
                label.BorderSizePixel = 2;
                
                label.Text = ` #${rank} | ${playerName} : ${config.FormatPrefix}${amount}`;

                const padding = new Instance("UIPadding");
                padding.Parent = label;
                padding.PaddingLeft = new UDim(0, 15);
            });

            scrollFrame.CanvasSize = new UDim2(0, 0, 0, uiLayout.AbsoluteContentSize.Y + 20);

        } catch (e) {
        }
    }
}