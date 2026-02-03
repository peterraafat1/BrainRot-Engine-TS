type Color3 = { R: number; G: number; B: number };
const Color3 = {
    fromRGB: (r: number, g: number, b: number) => ({ R: r, G: g, B: b } as Color3),
};

export type CurrencyType = "Licks" | "Coins" | "Robux";
export type ItemRarity = "Common" | "Rare" | "Epic" | "Legendary";
export type ItemCategory = "Tongue" | "Box" | "Product" | "Pass";

export interface BoxContentDrop {
    Name: string;
    Rarity: ItemRarity;
    Weight: number;
}

export interface BaseShopItem {
    Name: string;
    Price: number;
    Description: string;
    ImageId: string;
    Limited: boolean;
    Type: ItemCategory;
    Hidden?: boolean;
}

export interface TongueItem extends BaseShopItem {
    Type: "Tongue";
    Currency: "Licks";
    Multiplier: number;
    Rarity: ItemRarity;
    DMG?: number;
}

export interface BoxItem extends BaseShopItem {
    Type: "Box";
    Currency: "Coins";
    Contents: BoxContentDrop[];
}

export interface ProductItem extends BaseShopItem {
    Type: "Product";
    ProductId: number;
    RewardAmount?: number;
}

export interface GamePassItem extends BaseShopItem {
    Type: "Pass";
    ProductId: number;
}

export type ShopItem = TongueItem | BoxItem | ProductItem | GamePassItem;

export const ShopData = {
    Rarities: {
        Common: { Color: Color3.fromRGB(180, 180, 180) },
        Rare: { Color: Color3.fromRGB(0, 170, 255) },
        Epic: { Color: Color3.fromRGB(170, 0, 255) },
        Legendary: { Color: Color3.fromRGB(255, 170, 0) },
    },

    Items: [
        {
            Name: "Basic Tongue",
            Type: "Tongue",
            Currency: "Licks",
            Price: 0,
            Multiplier: 1,
            Rarity: "Common",
            Limited: false,
            ImageId: "rbxassetid://133153338815205",
            Description: "Licks 1x\nDMG: 10",
            DMG: 10,
        },
        {
            Name: "Tongue7",
            Type: "Tongue",
            Currency: "Licks",
            Price: 60,
            Multiplier: 7,
            Rarity: "Legendary",
            Limited: false,
            ImageId: "rbxassetid://137856156810981",
            Description: "Licks 7x\nDMG: 70",
            DMG: 70,
        },
        {
            Name: "Tongue8 (Hidden)",
            Type: "Tongue",
            Currency: "Licks",
            Hidden: true,
            Price: 10,
            Multiplier: 50,
            Rarity: "Legendary",
            Limited: false,
            ImageId: "rbxassetid://123456789",
            Description: "Licks 50x",
        },
        {
            Name: "Noob Box",
            Type: "Box",
            Currency: "Coins",
            Price: 50,
            Limited: false,
            ImageId: "rbxassetid://88203062320430",
            Description: "Chance for rare tongues!",
            Contents: [
                { Name: "Basic Tongue", Rarity: "Common", Weight: 100 },
                { Name: "Tongue2", Rarity: "Rare", Weight: 40 },
                { Name: "Tongue3", Rarity: "Legendary", Weight: 5 },
            ],
        },
        {
            Name: "Pro Box",
            Type: "Box",
            Currency: "Coins",
            Price: 100,
            Limited: false,
            ImageId: "rbxassetid://128210198517276",
            Description: "For Pros Only!",
            Contents: [
                { Name: "Tongue2", Rarity: "Common", Weight: 80 },
                { Name: "Tongue3", Rarity: "Rare", Weight: 30 },
                { Name: "Tongue4", Rarity: "Legendary", Weight: 2 },
            ],
        },
        {
            Name: "Double Coins Potion",
            Type: "Product",
            ProductId: 3497833920,
            Price: 49,
            Limited: false,
            ImageId: "rbxassetid://111795928316356",
            Description: "2x Coins for 60s",
        },
        {
            Name: "10,000 Coins",
            Type: "Product",
            ProductId: 654321,
            Price: 89,
            Limited: false,
            ImageId: "rbxassetid://123456789",
            Description: "Medium Coin Pack",
            RewardAmount: 10000,
        },
        {
            Name: "Auto Lick",
            Type: "Pass",
            ProductId: 333444,
            Price: 399,
            Limited: false,
            ImageId: "rbxassetid://987654321",
            Description: "Auto lick functionality",
        },
    ] as ShopItem[], 
};