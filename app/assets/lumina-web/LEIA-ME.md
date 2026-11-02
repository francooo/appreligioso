# Lumina — Telas web

## Conteúdo
- `00 Design System Lumina.dc.html`: identidade visual, cores, tipografia, componentes e tom de voz.
- `01 Autenticacao e Home.dc.html`: telas W1 a W5 (criar conta, recuperar senha em 3 etapas, home).
- `02 Menus.dc.html`: telas W6 a W15 (Leituras, Orar, Diário, Perfil).
- `standalone/`: as mesmas páginas em arquivo único, que abrem offline com um clique duplo.
- `LuminaSun`, `LuminaDunes`, `LuminaSidebar`: elementos reutilizáveis (sol, dunas, menu lateral).
- `lumina-data.js`: conteúdo personalizado por tradição de fé.
- `estilos/lumina-tokens.css`: tokens (cores, fontes, espaçamentos, raios, sombras) prontos para desenvolvimento.
- `support.js`: runtime que faz os arquivos `.dc.html` rodarem.

## Como abrir
Use os arquivos da pasta `standalone/`. Os `.dc.html` são as fontes editáveis e precisam ser servidos por um servidor local (ex.: `npx serve`), pois carregam os elementos como arquivos separados.

## Fontes
Source Serif 4 (títulos) e DM Sans (interface), via Google Fonts.
