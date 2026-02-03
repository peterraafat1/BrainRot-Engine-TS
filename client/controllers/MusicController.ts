import { Controller, OnStart } from "@flamework/core";
import { SoundService, TweenService, ContentProvider } from "@rbxts/services";

const CONFIG = {
    BGM_ID: "rbxassetid://1848354536",
    CLICK_ID: "rbxassetid://4210586953",
    VOLUME: 0.5,
    FADE_TIME: 2,
};

@Controller({})
export class MusicController implements OnStart {
    private bgmTrack: Sound | undefined;

    onStart() {
        this.startBackgroundMusic();
    }

    private startBackgroundMusic() {
        const sound = new Instance("Sound");
        sound.Name = "BackgroundMusic";
        sound.SoundId = CONFIG.BGM_ID;
        sound.Looped = true;
        sound.Volume = 0;
        sound.Parent = SoundService;
        
        this.bgmTrack = sound;

        task.spawn(() => {
            ContentProvider.PreloadAsync([sound]);
            sound.Play();
            
            TweenService.Create(sound, new TweenInfo(CONFIG.FADE_TIME), {
                Volume: CONFIG.VOLUME,
            }).Play();
        });
    }

    public playClickSound() {
        const sfx = new Instance("Sound");
        sfx.SoundId = CONFIG.CLICK_ID;
        sfx.Parent = SoundService;
        
        sfx.PlayOnRemove = true;
        sfx.Destroy();
    }

    public toggleMusic(muted: boolean) {
        if (this.bgmTrack) {
            this.bgmTrack.Volume = muted ? 0 : CONFIG.VOLUME;
        }
    }
}