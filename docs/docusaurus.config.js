// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "TSF Documentation",
  tagline: "Dinosaurs are cool",
  favicon: "img/TSF.svg",

  // Set the production url of your site here
  url: "https://heitorcand.github.io",
  baseUrl: "/TheSimpleFund-BAF/",

  // GitHub pages deployment config.
  organizationName: "heitorcand",
  projectName: "TheSimpleFund-BAF",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  // 🔹 Habilita Mermaid no markdown
  markdown: {
    mermaid: true,
  },

  // 🔹 Adiciona o tema de Mermaid
  themes: ["@docusaurus/theme-mermaid"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          routeBasePath: "/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: "img/TSF.svg",
      navbar: {
        title: "The Simple Fund Documentation",
        logo: {
          alt: "The Simple Fund logo",
          srcDark: "img/TSF.svg",
          src: "img/TSF_dark.svg",
        },
        items: [
          {
            href: "https://github.com/heitorcand/TheSimpleFund-BAF",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "More",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/heitorcand/TheSimpleFund-BAF",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} The Simple Fund, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
