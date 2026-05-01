// Правь значения здесь — остальной код можно не трогать.
window.SITE_CONFIG = {
  brand: "WHITE KOL",
  domain: "lucky-bear.online",
  hero: {
    kicker: "Добро пожаловать в",
    title: "WHITE KOL — мини-игра в браузере",
    description:
      "Простая аркада на реакцию. Лови точки, набирай очки, бей свой рекорд. Без регистрации, прямо со страницы.",
  },
  buttons: {
    primary: { label: "Играть", href: "#game" },
    secondary: { label: "Как играть", href: "#rules" },
  },
  nav: [
    { label: "Игра", href: "#game" },
    { label: "Правила", href: "#rules" },
    { label: "Контакты", href: "#contacts" },
  ],
  cta: { label: "Связаться", href: "#contacts" },
  contacts: {
    text: "По вопросам — пиши на почту.",
    email: "hello@lucky-bear.online",
  },
  game: {
    durationSec: 30,
    spawnEveryMs: 750,
    targetLifeMs: 1100,
  },
};
