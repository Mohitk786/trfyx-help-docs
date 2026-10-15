// Linear-style table of contents: a marker on the left rail that slides
// smoothly to the heading currently in view.
(function () {
  var root = null;
  var marker = null;
  var attrObserver = null;

  function findActive() {
    if (!root) return null;
    var deepest = root.querySelector("[data-active-deepest]");
    if (deepest) return deepest.querySelector("a") || deepest;
    var all = root.querySelectorAll('[data-active]:not([data-active="false"]), a.text-primary');
    if (!all.length) return null;
    var last = all[all.length - 1];
    return last.querySelector("a") || last;
  }

  function update() {
    if (!root || !marker) return;
    var active = findActive();
    if (!active) {
      marker.style.opacity = "0";
      return;
    }
    var rootRect = root.getBoundingClientRect();
    var rect = active.getBoundingClientRect();
    var top = rect.top - rootRect.top + root.scrollTop;
    marker.style.height = rect.height + "px";
    marker.style.transform = "translateY(" + top + "px)";
    marker.style.opacity = "1";
  }

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      update();
    });
  }

  function bind() {
    var el = document.getElementById("table-of-contents-content");
    if (el === root && marker && el.contains(marker)) return;
    if (attrObserver) attrObserver.disconnect();
    root = el;
    marker = null;
    if (!root) return;
    marker = document.createElement("span");
    marker.className = "trfyx-toc-marker";
    marker.setAttribute("aria-hidden", "true");
    root.appendChild(marker);
    attrObserver = new MutationObserver(schedule);
    attrObserver.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-active", "data-active-deepest", "class"],
    });
    schedule();
  }

  var bindQueued = false;
  function scheduleBind() {
    if (bindQueued) return;
    bindQueued = true;
    requestAnimationFrame(function () {
      bindQueued = false;
      bind();
    });
  }

  function start() {
    bind();
    new MutationObserver(scheduleBind).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("mintlify:navigate", scheduleBind);
    window.addEventListener("resize", schedule);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
