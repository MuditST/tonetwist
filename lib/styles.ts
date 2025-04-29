export interface StyleOption {
  value: string;
  label: string;
  description: string;
  avatar: string;
  promptDescription: string;
  voiceId: string;
  apiKeyIndex: 1 | 2 | 3;
}

const DEFAULT_VOICE_ID = 'PPzYpIqttlTYA83688JI';
const DEFAULT_API_KEY_INDEX = 1;

export const enhancementStyles: StyleOption[] = [
  {
    "value": "pirate",
    "label": "Captain Sea-Scoundrel",
    "description": "A jovial sea dog with a gristly Cornwall accent, extended vowels and long ARR's!", 
    "avatar": "🏴‍☠️",
    "promptDescription": "A mischievous pirate captain with a hoarse, rugged voice, full of swagger and swashbuckling tales. Use plenty of 'Arrr!' and nautical terms. This voice should evoke the spirit of braving the high seas and discovering hidden treasures.",
    "voiceId": "PPzYpIqttlTYA83688JI",
    "apiKeyIndex": 1
  },
  {
    "value": "seductive", 
    "label": "The Alluring Villain", 
    "description": "A seductive and dangerous voice, dripping with the allure of a captivating villain. Perfect for anime or game characters.", // Slightly rephrased
    "avatar": "💋",
    "promptDescription": "A seductive and dangerous female voice, dripping with allure and mystery. Ideal for anime-style villains or characters that exude confidence and danger. The tone should be bold, dramatic, and captivating.",
    "voiceId": "eVItLK1UvXctxuaRV2Oq",
    "apiKeyIndex": 1
  },
  {
    "value": "heroic",
    "label": "Heroic Adventurer",
    "description": "A charismatic male voice oozing with confidence and determined charm.", 
    "avatar": "🎬",
    "promptDescription": "A charismatic and determined voice, perfect for a classic anime protagonist. Full of passion and confidence, this voice should feel like it's leading an epic adventure or a fierce battle. Think strong, energetic, and heroic.",
    "voiceId": "zYcjlYFOd3taleS0gkk3",
    "apiKeyIndex": 1
  },
  {
    "value": "african", 
    "label": "The Vibrant Storyteller", 
    "description": "An energetic African voice, full of rhythm and excitement, perfect for vibrant storytelling.", 
    "avatar": "🌍",
    "promptDescription": "A lively, energetic voice with an African accent, full of rhythm and excitement. Perfect for creating a vibrant atmosphere, this voice will bring energy and enthusiasm to any scene, ideal for storytelling or high-energy narratives.",
    "voiceId": "NVp9wQor3NDIWcxYoZiW",
    "apiKeyIndex": 2
  },
  {
    "value": "british", 
    "label": "Lady of the Isles",
    "description": "A warm, natural British voice—perfect for relaxed conversations or friendly narration.",
    "avatar": "💂‍♀️",
    "promptDescription": "A charming British voice, elegant and warm, perfect for casual storytelling or friendly narration. The tone should be natural, engaging, and pleasant, with a touch of class.",
    "voiceId": "exsUS4vynmxd379XN4yO",
    "apiKeyIndex": 2
  },
  {
    "value": "cowboy", 
    "label": "Dusty Trail Rider",
    "description": "A deep, rugged voice with weathered warmth, perfect for tales filled with character.",
    "avatar": "🤠",
    "promptDescription": "A deep, raspy baritone voice, shaped by life on the frontier. This rugged cowboy tone should evoke resilience and adventure, perfect for stories about hardship, freedom, and the spirit of the Wild West.",
    "voiceId": "LNV6ahDtkAOqwn1X3R7a",
    "apiKeyIndex": 2
  },
  {
    "value": "russian", 
    "label": "The Silent Operative",
    "description": "A cool, calculating voice with a distinct Slavic depth, ideal for espionage thrillers.",
    "avatar": "🕵️‍♂️",
    "promptDescription": "A cool, calculating Russian spy with a deep, authoritative voice. Perfect for espionage, high-stakes situations, or covert operations. This voice should bring an air of mystery and calculated precision.",
    "voiceId": "XjdmlV0OFXfXE6Mg2Sb7",
    "apiKeyIndex": 3
  },
  {
    "value": "robot", 
    "label": "Cyborg Assistant",
    "description": "A clear, articulate female AI voice with a futuristic, slightly robotic tone.", 
    "avatar": "🤖",
    "promptDescription": "A futuristic, robotic female voice, calm and precise. Ideal for AI assistants or sci-fi narration, this voice should be articulate and composed, evoking the precision and calm of an advanced digital entity from the future.",
    "voiceId": "ZD29qZCdYhhdqzBLRKNH",
    "apiKeyIndex": 3
  },
  {
    "value": "indian", 
    "label": "The News Anchor",
    "description": "A serious, clear, and authoritative Indian English voice, ideal for professional reporting.", 
    "avatar": "📺",
    "promptDescription": "A refined Indian English voice, delivering each line with clarity, authority, and a professional tone. This voice is perfect for news reports, documentaries, or serious, informative content.",
    "voiceId": "fnVy7xrReCoUNJxjQsd6",
    "apiKeyIndex": 3
  }
]


export const getVoiceConfig = (value: string): { voiceId: string; apiKeyIndex: 1 | 2 | 3 } => {
    const style = enhancementStyles.find(s => s.value === value);
    return {
        voiceId: style?.voiceId || DEFAULT_VOICE_ID,
        apiKeyIndex: style?.apiKeyIndex || DEFAULT_API_KEY_INDEX
    };
}


export const getPromptDescription = (value: string): string => {
    const style = enhancementStyles.find(s => s.value === value);
    
    return style?.promptDescription || 'its original style';
}

