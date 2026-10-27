(() => {
  const h = React.createElement;
  const cockpitUrl = window.MAXYMDINO_CONFIG?.cockpitUrl || "";
  // Ajoute href: "https://…" pour activer un projet.
  const projects = [
    { label: "PROJET 01", title: "Nouveau projet", description: "Ton prochain outil ou site prendra place ici.", icon: "spark" },
    { label: "PROJET 02", title: "Laboratoire", description: "Un espace pour tes expériences et idées.", icon: "lab" },
    { label: "PROJET 03", title: "À définir", description: "Cette carte pourra pointer vers un autre service.", icon: "grid" }
  ];
  function Icon({ name }) {
    const paths = { cockpit: "M4 5h16v11H4zM4 8h16M9 20h6m-3-4v4M7 6.5h.01M10 6.5h.01", spark: "m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 11 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14Z", lab: "M9 3h6m-5 0v6L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9V3M8 14h8", grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" };
    return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, h("path", { d: paths[name] }));
  }
  function App() {
    const count = projects.filter(p => p.href).length + (cockpitUrl ? 1 : 0);
    return h("div", { className: "site", id: "accueil" },
      h("header", { className: "header" }, h("a", { className: "brand", href: "#accueil" }, h("span", { className: "brand-mark" }, "M"), h("strong", null, "MAXYMDINO"), h("span", { className: "brand-caption" }, "PERSONAL HUB / 001")), h("span", { className: "header-status" }, "PORTAIL PERSONNEL", h("i", null))),
      h("main", { className: "container" },
        h("section", { className: "hero" }, h("div", { className: "hero-copy" }, h("p", { className: "eyebrow" }, "TON ESPACE NUMÉRIQUE"), h("h1", null, "Un seul endroit.", h("br"), h("span", null, "Mille possibles.")), h("p", { className: "hero-description" }, "Le point de départ de tes projets. Accède à ton serveur et retrouve bientôt tes outils favoris, réunis dans un hub simple."), h("a", { className: "hero-link", href: "#raccourcis" }, "Explorer le hub", h("span", { "aria-hidden": "true" }, "→"))),
          h("div", { className: "hero-art", "aria-hidden": "true" }, h("div", { className: "art-frame frame-one" }), h("div", { className: "art-frame frame-two" }), h("span", { className: "art-label" }, "FIG. 01 / HUB"), h("div", { className: "orbit orbit-one" }), h("div", { className: "orbit orbit-two" }), h("div", { className: "orbit orbit-three" }), h("div", { className: "art-core" }, h("strong", null, "M"), h("small", null, "NODE 01")), h("span", { className: "art-plus plus-one" }, "+"), h("span", { className: "art-plus plus-two" }, "+"), h("span", { className: "art-caption" }, "CONNECT · CREATE · REPEAT"))),
        h("section", { className: "shortcuts", id: "raccourcis", "aria-labelledby": "shortcuts-title" }, h("div", { className: "section-heading" }, h("div", null, h("p", { className: "eyebrow" }, "TABLEAU DE BORD"), h("h2", { id: "shortcuts-title" }, "Tes raccourcis")), h("span", { className: "count" }, String(count).padStart(2, "0"), " ACTIF", count > 1 ? "S" : "", " / 04 SLOTS")),
          h("div", { className: "grid" },
            h(cockpitUrl ? "a" : "article", { className: "cockpit-card", ...(cockpitUrl ? { href: cockpitUrl, target: "_blank", rel: "noopener noreferrer", "aria-label": "Ouvrir Cockpit dans un nouvel onglet" } : {}) }, h("div", { className: "card-top" }, h("span", null, "SERVEUR / 01"), h("span", { className: "cockpit-status" }, cockpitUrl ? "● CONFIGURÉ" : "À CONFIGURER")), h("div", { className: "cockpit-content" }, h("span", { className: "cockpit-icon" }, h(Icon, { name: "cockpit" })), h("div", null, h("span", { className: "kicker" }, "ADMINISTRATION LINUX"), h("h3", null, "Cockpit"), h("p", null, cockpitUrl ? "Gère ton VPS Fedora, ses services et ses ressources." : "Ajoute ton adresse dans config.js pour ouvrir la console."))), h("span", { className: "decoration", "aria-hidden": "true" }, "9090"), h("div", { className: "card-bottom" }, h("span", null, cockpitUrl ? "OUVRIR LA CONSOLE" : "CONFIGURER LA CONSOLE"), h("span", { className: "arrow" }, "→"))),
            ...projects.map((project, index) => h(project.href ? "a" : "article", { key: project.label, className: `project-card project-${index + 1}`, ...(project.href ? { href: project.href, target: "_blank", rel: "noopener noreferrer", "aria-label": `Ouvrir ${project.title} dans un nouvel onglet` } : {}) }, h("div", { className: "card-top" }, h("span", null, project.label), h("span", { className: "badge" }, project.href ? "OUVRIR" : "BIENTÔT")), h("span", { className: "project-icon" }, h(Icon, { name: project.icon })), h("h3", null, project.title), h("p", null, project.description), h("div", { className: "card-bottom" }, h("span", null, project.href ? "ACCÉDER AU PROJET" : "EMPLACEMENT RÉSERVÉ"), h("span", { className: "plus" }, "+"))))
          ), h("div", { className: "bottom-note" }, h("span", { className: "stamp" }, "À SUIVRE"), h("p", null, "Tes prochains projets trouveront leur place ici."), h("span", { className: "coordinates" }, "45° 30′ N / 73° 34′ W"))
        )
      ), h("footer", { className: "footer" }, h("span", null, "© 2026 MAXYMDINO"), h("span", null, "FAIT POUR EXPLORER"), h("span", null, "HUB BUILD 001"))
    );
  }
  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
