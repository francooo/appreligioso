// Gerado a partir de assets/lumina-web/lumina-data.js (conteúdo de exemplo por tradição de fé).
export type TraditionKey = "catolica" | "evangelica" | "espirita" | "judaica" | "islamica" | "budista" | "livre";

export type Tradition = {
  name: string;
  verse: string;
  ref: string;
  book: string;
  prayers: string[];
  times: string[];
  sub: string;
  plan: string;
  step: string;
  pct: string;
  intentName: string;
  intents: string[];
  library: string[];
  plans: [title: string, duration: string][];
  sections: string[];
};

export const TRADITIONS: Record<TraditionKey, Tradition> = {
  "catolica": {
    "name": "Católica",
    "verse": "“Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.”",
    "ref": "Mateus 11:28",
    "book": "Bíblia Sagrada",
    "prayers": [
      "Oração da manhã",
      "Ângelus",
      "Exame de consciência"
    ],
    "times": [
      "06:30",
      "12:00",
      "21:00"
    ],
    "sub": "Um momento guiado para rezar e entregar o dia a Deus.",
    "plan": "Evangelho do dia",
    "step": "Lucas 15 · Dia 8 de 21",
    "pct": "38%",
    "intentName": "Intenções",
    "intents": [
      "Saúde da minha mãe",
      "Sabedoria no novo trabalho",
      "Paz para a família"
    ],
    "library": [
      "Pai-Nosso",
      "Ave-Maria",
      "Santo Terço",
      "Salve Rainha"
    ],
    "plans": [
      [
        "Evangelho de Marcos",
        "16 dias"
      ],
      [
        "Salmos de consolo",
        "21 dias"
      ],
      [
        "Advento: preparar o coração",
        "28 dias"
      ],
      [
        "Vidas de santos",
        "30 dias"
      ]
    ],
    "sections": [
      "Gênesis",
      "Êxodo",
      "Salmos",
      "Provérbios",
      "Isaías",
      "Mateus",
      "Lucas",
      "João"
    ]
  },
  "evangelica": {
    "name": "Evangélica",
    "verse": "“O Senhor é o meu pastor; nada me faltará.”",
    "ref": "Salmos 23:1",
    "book": "Bíblia",
    "prayers": [
      "Devocional da manhã",
      "Pausa com Deus",
      "Oração antes de dormir"
    ],
    "times": [
      "06:30",
      "12:00",
      "22:00"
    ],
    "sub": "Leitura, louvor e oração para caminhar com Deus hoje.",
    "plan": "Bíblia em um ano",
    "step": "Hebreus 11 · Dia 306 de 365",
    "pct": "84%",
    "intentName": "Pedidos de oração",
    "intents": [
      "Saúde da minha mãe",
      "Direção no novo trabalho",
      "Célula de quinta-feira"
    ],
    "library": [
      "Pai-Nosso",
      "Salmo 91",
      "Oração de gratidão",
      "Oração pela família"
    ],
    "plans": [
      [
        "Bíblia em um ano",
        "365 dias"
      ],
      [
        "Provérbios em 31 dias",
        "31 dias"
      ],
      [
        "Sermão do Monte",
        "14 dias"
      ],
      [
        "Fé em tempos difíceis",
        "10 dias"
      ]
    ],
    "sections": [
      "Gênesis",
      "Salmos",
      "Provérbios",
      "Isaías",
      "Mateus",
      "João",
      "Romanos",
      "Hebreus"
    ]
  },
  "espirita": {
    "name": "Espírita",
    "verse": "“Fora da caridade não há salvação.”",
    "ref": "O Evangelho segundo o Espiritismo, cap. 15",
    "book": "Obras básicas",
    "prayers": [
      "Prece da manhã",
      "Momento de vibração",
      "Evangelho no Lar"
    ],
    "times": [
      "07:00",
      "12:00",
      "21:00"
    ],
    "sub": "Uma prece guiada para harmonizar pensamentos e sentimentos.",
    "plan": "O Evangelho segundo o Espiritismo",
    "step": "Cap. 5 · Bem-aventurados os aflitos",
    "pct": "20%",
    "intentName": "Vibrações",
    "intents": [
      "Saúde da minha mãe",
      "Equilíbrio no trabalho",
      "Harmonia no lar"
    ],
    "library": [
      "Prece de Cáritas",
      "Pai-Nosso",
      "Prece pelos enfermos",
      "Prece de agradecimento"
    ],
    "plans": [
      [
        "O Evangelho segundo o Espiritismo",
        "28 capítulos"
      ],
      [
        "O Livro dos Espíritos",
        "30 dias"
      ],
      [
        "Estudo das bem-aventuranças",
        "12 dias"
      ],
      [
        "Evangelho no Lar",
        "8 semanas"
      ]
    ],
    "sections": [
      "O Livro dos Espíritos",
      "O Livro dos Médiuns",
      "O Evangelho segundo o Espiritismo",
      "O Céu e o Inferno",
      "A Gênese",
      "Obras póstumas"
    ]
  },
  "judaica": {
    "name": "Judaica",
    "verse": "“Ouve, Israel: o Senhor é nosso Deus, o Senhor é Um.”",
    "ref": "Deuteronômio 6:4",
    "book": "Torá e Sidur",
    "prayers": [
      "Shacharit",
      "Minchá",
      "Maariv"
    ],
    "times": [
      "06:45",
      "16:30",
      "18:40"
    ],
    "sub": "Orações do dia com hebraico, transliteração e tradução.",
    "plan": "Parashá da semana",
    "step": "Aliyá 3 de 7",
    "pct": "43%",
    "intentName": "Pedidos de cura",
    "intents": [
      "Saúde da minha mãe",
      "Bênção no novo trabalho",
      "Preparar o Shabat"
    ],
    "library": [
      "Shemá",
      "Amidá",
      "Modé Ani",
      "Birkat Hamazon"
    ],
    "plans": [
      [
        "Parashá da semana",
        "semanal"
      ],
      [
        "Pirkei Avot",
        "6 capítulos"
      ],
      [
        "Tehilim (Salmos)",
        "30 dias"
      ],
      [
        "Preparação para o Shabat",
        "semanal"
      ]
    ],
    "sections": [
      "Bereshit",
      "Shemot",
      "Vayikra",
      "Bamidbar",
      "Devarim",
      "Tehilim",
      "Sidur",
      "Pirkei Avot"
    ]
  },
  "islamica": {
    "name": "Islâmica",
    "verse": "“Em verdade, com a dificuldade vem a facilidade.”",
    "ref": "Alcorão 94:6",
    "book": "Alcorão Sagrado",
    "prayers": [
      "Fajr",
      "Dhuhr · Asr",
      "Maghrib · Isha"
    ],
    "times": [
      "04:20",
      "12:05",
      "18:15"
    ],
    "sub": "Horários de oração da sua cidade, com lembrete e direção da Qibla.",
    "plan": "Leitura do Alcorão",
    "step": "Surata Al-Kahf · Juz 15",
    "pct": "50%",
    "intentName": "Súplicas (Duá)",
    "intents": [
      "Saúde da minha mãe",
      "Sustento no novo trabalho",
      "Paz para a família"
    ],
    "library": [
      "Al-Fátiha",
      "Áyat al-Kursi",
      "Duá da manhã",
      "Duá antes de dormir"
    ],
    "plans": [
      [
        "Alcorão completo",
        "30 juz"
      ],
      [
        "Suratas curtas",
        "14 dias"
      ],
      [
        "Os 99 nomes de Deus",
        "33 dias"
      ],
      [
        "Hadiths do dia",
        "30 dias"
      ]
    ],
    "sections": [
      "Al-Fátiha",
      "Al-Baqara",
      "Ál Imran",
      "An-Nisá",
      "Al-Kahf",
      "Maryam",
      "Yá-Sín",
      "Al-Mulk"
    ]
  },
  "budista": {
    "name": "Budista",
    "verse": "“O ódio nunca cessa pelo ódio; somente pelo amor ele cessa.”",
    "ref": "Dhammapada, verso 5",
    "book": "Cânone Pāli",
    "prayers": [
      "Meditação da manhã",
      "Pausa de atenção plena",
      "Metta antes de dormir"
    ],
    "times": [
      "06:00",
      "13:00",
      "21:30"
    ],
    "sub": "Uma meditação guiada para acalmar a mente e cultivar compaixão.",
    "plan": "Dhammapada",
    "step": "Capítulo 1 · Versos pareados",
    "pct": "30%",
    "intentName": "Dedicações",
    "intents": [
      "Saúde da minha mãe",
      "Clareza no novo trabalho",
      "Todos os seres em paz"
    ],
    "library": [
      "Refúgio nas Três Joias",
      "Metta Sutta",
      "Os Cinco Preceitos",
      "Dedicação de mérito"
    ],
    "plans": [
      [
        "Dhammapada",
        "26 capítulos"
      ],
      [
        "Introdução à meditação",
        "10 dias"
      ],
      [
        "O Nobre Caminho Óctuplo",
        "8 dias"
      ],
      [
        "Compaixão no dia a dia",
        "14 dias"
      ]
    ],
    "sections": [
      "Dhammapada",
      "Sutta Nipāta",
      "Majjhima Nikāya",
      "Saṃyutta Nikāya",
      "Aṅguttara Nikāya",
      "Jātaka"
    ]
  },
  "livre": {
    "name": "Espiritualidade livre",
    "verse": "“Respire. Este momento também é sagrado.”",
    "ref": "Reflexão Lumina",
    "book": "Textos de sabedoria",
    "prayers": [
      "Respiração da manhã",
      "Pausa consciente",
      "Gratidão da noite"
    ],
    "times": [
      "07:00",
      "12:30",
      "21:00"
    ],
    "sub": "Alguns minutos para respirar, agradecer e se reconectar.",
    "plan": "Gratidão em 21 dias",
    "step": "Dia 8 de 21",
    "pct": "38%",
    "intentName": "Intenções",
    "intents": [
      "Saúde da minha mãe",
      "Coragem no novo trabalho",
      "Paz para a família"
    ],
    "library": [
      "Respiração 4-7-8",
      "Oração da serenidade",
      "Escaneamento corporal",
      "Carta de gratidão"
    ],
    "plans": [
      [
        "Gratidão em 21 dias",
        "21 dias"
      ],
      [
        "Silêncio e presença",
        "7 dias"
      ],
      [
        "Recomeços",
        "10 dias"
      ],
      [
        "Textos contemplativos",
        "30 dias"
      ]
    ],
    "sections": [
      "Poesia e oração",
      "Filosofia e virtude",
      "Textos contemplativos",
      "Cartas e memórias"
    ]
  }
};

export const TRADITION_KEYS = Object.keys(TRADITIONS) as TraditionKey[];
export const DEFAULT_TRADITION: TraditionKey = "catolica";

export function getTradition(key: string | null | undefined): Tradition {
  return TRADITIONS[(key as TraditionKey) ?? DEFAULT_TRADITION] ?? TRADITIONS[DEFAULT_TRADITION];
}

export const MOODS = ["Em paz", "Grata", "Cansada", "Esperançosa"] as const;
export const INTENTION_TAGS = ["Família", "Saúde", "Trabalho", "Gratidão"] as const;
