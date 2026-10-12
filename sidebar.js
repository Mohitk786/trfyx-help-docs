// Collapsible sidebar sections: each group starts closed (except the one
// holding the current page) and opens/closes when its title is clicked.
(function () {
  var KEY = "trfyx-sidebar-open";
  var lastPath = null;

  function load() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function save(state) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function setOpen(header, list, open) {
    header.setAttribute("aria-expanded", open ? "true" : "false");
    list.setAttribute("data-collapsed", open ? "false" : "true");
  }

  function enhance() {
    var headers = document.querySelectorAll("#navigation-items .sidebar-group-header");
    if (!headers.length) return;
    var state = load();
    var pathChanged = lastPath !== location.pathname;
    lastPath = location.pathname;

    headers.forEach(function (header) {
      var list = header.nextElementSibling;
      if (!list || !list.classList.contains("sidebar-group")) return;
      var name = header.textContent.trim();
      var hasActive = !!list.querySelector('[aria-current="page"]');

      if (header.getAttribute("data-trfyx") !== "1") {
        header.setAttribute("data-trfyx", "1");
        header.setAttribute("role", "button");
        header.setAttribute("tabindex", "0");
        var toggle = function () {
          var open = header.getAttribute("aria-expanded") !== "true";
          var current = header.nextElementSibling;
          if (!current) return;
          setOpen(header, current, open);
          var s = load();
          s[name] = open;
          save(s);
        };
        header.addEventListener("click", toggle);
        header.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        });
        setOpen(header, list, hasActive || state[name] === true);
      } else if (pathChanged && hasActive) {
        setOpen(header, list, true);
      }
    });
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      enhance();
    });
  }

  function start() {
    enhance();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
