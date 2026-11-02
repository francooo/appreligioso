// Tokens do design system Lumina (app/assets/lumina-web/estilos/lumina-tokens.css).
export const colors = {
  // Base
  navy: '#1E3A5F',
  navyTextLight: '#C7D1DF',
  gold: '#E39B45',
  goldText: '#D98A3A',
  goldLight: '#F0B872',
  background: '#FBF5EC', // creme
  paper: '#FFFDF9',
  sand: '#FAF2E6',
  sandHover: '#F3E7D6',
  peach: '#FBEBD6',
  tagText: '#B8742B',
  white: '#FFFFFF',

  // Bordas e divisores
  cardBorder: '#EFE4D4',
  inputBorder: '#E3DACB',
  divider: '#F3EADC',

  // Texto
  title: '#1E3A5F',
  body: '#3C4A60',
  text: '#5B6577', // apoio
  muted: '#8A7F72', // suave
  placeholder: '#A3A7AE',

  // Estados
  success: '#3E8B6A',
  danger: '#B4533C',

  // Ilustração
  dune1: '#F2DFCB',
  dune2: '#EDD2B9',
  dune3: '#E8C7AB',
  sunSoft: '#F8D3A0',

  inputBg: '#FFFFFF',
};

export const fonts = {
  serif: 'SourceSerif4_600SemiBold',
  serifMedium: 'SourceSerif4_500Medium',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
};

export const type = {
  display: { fontFamily: fonts.serif, fontSize: 58, lineHeight: 61, letterSpacing: -1.1 },
  title: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 42 },
  quote: { fontFamily: fonts.serifMedium, fontSize: 30, lineHeight: 39 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 27 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 26 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  eyebrow: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 15, letterSpacing: 2.6 },
  meta: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
} as const;

export const space = { e1: 4, e2: 8, e3: 12, e4: 16, e5: 20, e6: 24, e8: 32, e11: 44 };

export const radii = { field: 8, list: 14, card: 16, pill: 999 };

export const sizes = { button: 48, field: 44, sidebar: 232 };

export const shadows = {
  card: '0px 20px 50px -30px rgba(80, 55, 30, 0.25)',
  popover: '0px 24px 48px -20px rgba(60, 40, 20, 0.35)',
  focus: '0px 0px 0px 3px #FBEBD6',
};

// Compatibilidade com os componentes existentes.
export const shadow = shadows.card;
export const radius = radii.field;
