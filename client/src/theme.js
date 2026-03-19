export const themes = {
  dark: {
    bg: '#0a0a0f', card: '#111118', border: '#222', text: '#e0e0e0',
    sub: '#888', muted: '#555', dim: '#444', accent: '#00ff88',
    accentBg: '#00ff8822', blue: '#00ccff', blueBg: '#00ccff22',
    red: '#ff4444', redBg: '#ff444422', orange: '#ff6644',
    yellow: '#ffaa00', input: '#0a0a12', btnText: '#000',
  },
  light: {
    bg: '#f5f5f8', card: '#ffffff', border: '#e0e0e8', text: '#1a1a2e',
    sub: '#555', muted: '#888', dim: '#bbb', accent: '#00994d',
    accentBg: '#00994d15', blue: '#0077aa', blueBg: '#0077aa15',
    red: '#cc3333', redBg: '#cc333315', orange: '#cc5522',
    yellow: '#cc8800', input: '#f0f0f5', btnText: '#fff',
  },
}

export const getTheme = (mode) => themes[mode] || themes.dark
