(() => {
  const h = React.createElement;

  // Garde l'adresse de ton VPS dans config.js (ignoré par Git).
  const cockpitUrl = window.MAXYMDINO_CONFIG?.cockpitUrl || "";

  const projects = [
    {
      label: "PROJET 01",
      title: "Nouveau projet",
      description: "Ton prochain outil ou site prendra place ici.",
      icon: "spark",
      state: "soon"
    },
    {
      label: "PROJET 02",
      title: "Laboratoire",
      description: "Un espace pour tes expériences et idées.",
      icon: "lab",
      state: "soon"
    },
    {
      label: "PROJET 03",
      title: "À définir",
      description: "Cette carte pourra pointer vers un autre service.",
      icon: "grid",
      state: "soon"
    }
  ];

  function Icon({ name, className = "" }) {
    const paths = {
      cockpit: "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 14.5v-9ZM8 20h8m-4-4v4M4 8h16m-12-2h.01M11 6h.01M14 6h.01",
      arrow: "M5 12h14m-6-6 6 6-6 6",
      spark: "m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Zm6 11 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z",
      lab: "M9 3h6m-5 0v6.2L5.7 17a2 2 0 0 0 1.8 3h9a2 2 0 0 0 1.8-3L14 9.2V3m-6.5 11h9",
      grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"
    };
    return h("svg", {
      className: `icon ${className}`,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.6",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true"
    }, h("path", { d: paths[name] || paths.spark }));
  }

  function Header() {
    return h("header", { className: "topbar" },
      h("a", { className: "brand", href: "#accueil", "aria-label": "MAXYMDINO, accueil" },
        h("span", { className: "brand-mark", "aria-hidden": "true" }, "M"),
        h("span", { className: "brand-word" }, "MAXYMDINO"),
        h("span", { className: "brand-separator" }),
        h("span", { className: "brand-caption" }, "JOURNAL DE VOYAGE / 001")
      ),
      h("div", { className: "compass-hud", "aria-label": "Boussole, cap nord" },
        h("span", null, "W"),
        h("i", null),
        h("span", { className: "compass-north" }, "N"),
        h("i", null),
        h("span", null, "E"),
        h("span", { className: "compass-pointer", "aria-hidden": "true" }, "⌖")
      ),
      h("div", { className: "topbar-right" },
        h("span", { className: "system-label" }, "ÉTAT DU SERVEUR"),
        h("span", { className: "status-dot", "aria-label": "En ligne" })
      )
    );
  }

  function ProjectCard({ project, index }) {
    const Tag = project.href ? "a" : "article";
    const content = [
      h("div", { className: "project-card-top", key: "top" },
        h("span", { className: "project-index" }, project.label),
        h("span", { className: "project-state" }, project.href ? "OUVRIR" : "BIENTÔT")
      ),
      h("div", { className: "project-icon-wrap", key: "icon" }, h(Icon, { name: project.icon })),
      h("h3", { key: "title" }, project.title),
      h("p", { key: "description" }, project.description),
      h("div", { className: "project-card-bottom", key: "bottom" },
        h("span", null, project.href ? "ACCÉDER AU PROJET" : "EMPLACEMENT RÉSERVÉ"),
        h("span", { className: "plus-mark", "aria-hidden": "true" }, "+")
      )
    ];
    return h(Tag, {
      className: `project-card project-card-${index + 1}`,
      key: project.label,
      ...(project.href ? { href: project.href, target: "_blank", rel: "noopener noreferrer" } : {}),
      "aria-label": project.href ? `Ouvrir ${project.title} dans un nouvel onglet` : `${project.title}, à venir`
    }, content);
  }

  function App() {
    return h("div", { className: "site-shell", id: "accueil" },
      h(Header),
      h("div", { className: "workspace-layout" },
        h("nav", { className: "quest-menu", "aria-label": "Navigation du hub" },
          h("p", { className: "quest-menu-heading" }, "MENU DE CAMPAGNE"),
          h("a", { className: "quest-link", href: "#accueil" },
            h("span", { className: "quest-glyph", "aria-hidden": "true" }, "ᛟ"),
            h("span", null, "Journal"),
            h("span", { className: "quest-key" }, "01")
          ),
          h("a", { className: "quest-link quest-link-active", href: "#projets" },
            h("span", { className: "quest-glyph", "aria-hidden": "true" }, "✦"),
            h("span", null, "Carte"),
            h("span", { className: "quest-key" }, "02")
          ),
          h(cockpitUrl ? "a" : "span", {
            className: `quest-link${cockpitUrl ? "" : " quest-link-disabled"}`,
            ...(cockpitUrl ? { href: cockpitUrl, target: "_blank", rel: "noopener noreferrer" } : { "aria-disabled": "true" })
          },
            h("span", { className: "quest-glyph", "aria-hidden": "true" }, "ᚠ"),
            h("span", null, "Serveur"),
            h("span", { className: "quest-key" }, "03")
          ),
          h("div", { className: "quest-menu-footer" },
            h("span", { className: "quest-rune", "aria-hidden": "true" }, "✦"),
            h("span", null, "NORD / 45° 30′ N")
          )
        ),
        h("main", { className: "main-content" },
        h("section", { className: "hero", "aria-labelledby": "hero-title" },
          h("div", { className: "hero-copy" },
            h("p", { className: "eyebrow" }, h("span", { className: "eyebrow-line" }), "PORTAIL DE CAMPAGNE"),
            h("h1", { id: "hero-title" }, "Tes mondes.", h("br"), h("span", null, "À portée de main.")),
            h("p", { className: "hero-description" }, "Le point de départ de tes aventures numériques. Rejoins ton serveur et retrouve ici tes projets, comme les étapes d’un même voyage."),
            h("a", { className: "text-link", href: "#projets" }, "Voir les destinations", h(Icon, { name: "arrow" }))
          ),
          h("div", { className: "hero-visual", "aria-hidden": "true" },
            h("div", { className: "mountain-range mountain-back" }),
            h("div", { className: "mountain-range mountain-front" }),
            h("div", { className: "orbit orbit-one" }),
            h("div", { className: "orbit orbit-two" }),
            h("div", { className: "orbit orbit-three" }),
            h("div", { className: "visual-cross cross-one" }, "+"),
            h("div", { className: "visual-cross cross-two" }, "+"),
            h("div", { className: "visual-label visual-label-top" }, "CARTE / 01"),
            h("div", { className: "visual-label visual-label-bottom" }, "NORD · 45° 30′ N"),
            h("div", { className: "hub-core" }, h("span", null, "M"), h("small", null, "TON PORTAIL"))
          )
        ),

        h("section", { className: "projects-section", id: "projets", "aria-labelledby": "projects-title" },
          h("div", { className: "section-heading" },
            h("div", null,
              h("p", { className: "eyebrow" }, h("span", { className: "eyebrow-line" }), "CARTE DES SERVICES"),
              h("h2", { id: "projects-title" }, "Tes destinations")
            ),
            h("span", { className: "section-count" }, "01 DISPONIBLE / 04 LIEUX")
          ),
          h("div", { className: "project-grid" },
            h(cockpitUrl ? "a" : "article", {
              className: `cockpit-card${cockpitUrl ? "" : " cockpit-card-unconfigured"}`,
              ...(cockpitUrl ? { href: cockpitUrl, target: "_blank", rel: "noopener noreferrer" } : {}),
              "aria-label": cockpitUrl ? "Ouvrir Cockpit dans un nouvel onglet" : "Cockpit non configuré, renseigner l'adresse dans config.js"
            },
              h("div", { className: "cockpit-card-head" },
                h("span", { className: "project-index" }, "SERVEUR / 01"),
                h("span", { className: "live-pill" }, h("span", { className: "status-dot" }), "EN LIGNE")
              ),
              h("div", { className: "cockpit-card-content" },
                h("div", { className: "cockpit-icon" }, h(Icon, { name: "cockpit" })),
                h("div", null,
                  h("p", { className: "card-kicker" }, cockpitUrl ? "FORTERESSE / FEDORA 44" : "CONSOLE / À CONFIGURER"),
                  h("h3", null, "Cockpit"),
                  h("p", { className: "cockpit-description" }, cockpitUrl ? "Gère ton VPS Fedora, ses services et ses ressources." : "Renseigne ton adresse Cockpit dans config.js pour activer ce passage.")
                )
              ),
              h("div", { className: "cockpit-card-footer" },
                h("span", null, cockpitUrl ? "ENTRER DANS LA CONSOLE" : "CONFIGURER LA CONSOLE"),
                h("span", { className: "card-arrow" }, h(Icon, { name: "arrow" }))
              ),
              h("span", { className: "card-decoration", "aria-hidden": "true" }, "9090")
            ),
            ...projects.map((project, index) => h(ProjectCard, { project, index, key: project.label }))
          )
        ),

        h("section", { className: "bottom-note", "aria-label": "Note de voyage" },
          h("span", { className: "note-stamp" }, "QUÊTE"),
          h("p", null, "De nouvelles destinations apparaîtront au fil du voyage."),
          h("span", { className: "note-coordinate" }, "73° 34′ W / JOUR 001")
        )
        )
      ),
      h("footer", { className: "footer" },
        h("span", null, "© 2026 MAXYMDINO"),
        h("span", { className: "footer-center" }, "JOURNAL DU VOYAGEUR"),
        h("span", null, "CAMPAGNE / 001")
      )
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
