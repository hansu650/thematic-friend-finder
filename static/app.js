"use strict";
(function () {
  document.querySelectorAll("[data-dialog]").forEach(function (button) {
    button.addEventListener("click", function () {
      var dialog = document.getElementById(button.dataset.dialog);
      if (dialog) dialog.showModal();
    });
  });
  document.querySelectorAll("[data-close]").forEach(function (button) {
    button.addEventListener("click", function () { button.closest("dialog").close(); });
  });
  document.querySelectorAll("dialog").forEach(function (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        var box = dialog.getBoundingClientRect();
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
      }
    });
  });
  document.querySelectorAll("[data-dismiss]").forEach(function (button) {
    button.addEventListener("click", function () { button.parentElement.remove(); });
  });

  var card = document.getElementById("person-card");
  var decisions = document.getElementById("decision-form");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (card && decisions) {
    var start = null;
    var busy = false;
    function choose(kind) {
      if (!busy) decisions.requestSubmit(decisions.querySelector('[value="' + kind + '"]'));
    }
    decisions.addEventListener("submit", function (event) {
      if (busy) { event.preventDefault(); return; }
      event.preventDefault();
      busy = true;
      var kind = event.submitter ? event.submitter.value : "skip";
      var input = document.createElement("input");
      input.type = "hidden"; input.name = "kind"; input.value = kind;
      decisions.appendChild(input);
      decisions.setAttribute("aria-busy", "true");
      decisions.querySelectorAll("button").forEach(function (button) { button.disabled = true; });
      if (!reduced) {
        card.style.transform = "translateX(" + (kind === "like" ? "110" : "-110") + "px) rotate(" + (kind === "like" ? "7" : "-7") + "deg)";
        card.style.opacity = "0";
      }
      window.setTimeout(function () { decisions.submit(); }, reduced ? 0 : 170);
    });
    card.addEventListener("keydown", function (event) {
      if (event.target !== card || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault(); choose(event.key === "ArrowRight" ? "like" : "skip");
      }
    });
    card.addEventListener("pointerdown", function (event) {
      if (busy || event.target.closest("button,a,input") || event.button !== 0) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
      card.setPointerCapture(event.pointerId);
    });
    card.addEventListener("pointermove", function (event) {
      if (!start || busy) return;
      var dx = event.clientX - start.x;
      var dy = event.clientY - start.y;
      if (Math.abs(dx) > Math.abs(dy) && !reduced) {
        card.style.transform = "translateX(" + dx * 0.55 + "px) rotate(" + dx * 0.025 + "deg)";
        card.querySelector(".stamp-like").style.opacity = String(Math.max(0, Math.min(dx / 180, 1)));
        card.querySelector(".stamp-skip").style.opacity = String(Math.max(0, Math.min(-dx / 180, 1)));
      }
    });
    function resetCard() {
      card.style.transform = "";
      card.querySelectorAll(".swipe-stamp").forEach(function (stamp) { stamp.style.opacity = ""; });
    }
    card.addEventListener("pointerup", function (event) {
      if (!start || busy) return;
      var dx = event.clientX - start.x, dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 90 && Math.abs(dx) > Math.abs(dy) * 1.3) choose(dx > 0 ? "like" : "skip");
      else resetCard();
    });
    card.addEventListener("pointercancel", function () { start = null; resetCard(); });
  }

  var chat = document.querySelector("[data-chat]");
  if (chat) {
    var history = document.getElementById("chat-history");
    var form = document.getElementById("message-form");
    var body = document.getElementById("message-body");
    var status = document.getElementById("chat-status");
    var last = Number(chat.dataset.lastId);
    var closed = false, refreshing = false;
    history.scrollTop = history.scrollHeight;
    function setStatus(text, error) { status.textContent = text; status.classList.toggle("error", !!error); }
    function stopConversation() {
      closed = true;
      form.querySelectorAll("button,textarea").forEach(function (control) { control.disabled = true; });
      setStatus("这段联系已关闭，不能继续发送消息。", true);
    }
    function renderMessage(item) {
      if (history.querySelector('[data-message-id="' + item.id + '"]')) return;
      var empty = history.querySelector("[data-chat-empty]");
      if (empty) empty.remove();
      var row = document.createElement("div");
      row.className = "chat-message" + (item.mine ? " mine" : "");
      row.dataset.messageId = String(item.id);
      var text = document.createElement("p");
      text.textContent = item.body;
      var time = document.createElement("time");
      time.dateTime = item.time;
      time.textContent = new Date(item.time).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      row.append(text, time);
      history.appendChild(row);
    }
    async function refresh(forceBottom) {
      if (closed || refreshing) return;
      refreshing = true;
      var stick = forceBottom || history.scrollHeight - history.scrollTop - history.clientHeight < 90;
      try {
        var response = await fetch(chat.dataset.feed + "?after=" + last, { headers: { "Accept": "application/json" }, credentials: "same-origin" });
        if (response.status === 404 || response.status === 403 || response.redirected) { stopConversation(); return; }
        if (!response.ok) throw new Error("refresh");
        var data = await response.json();
        data.messages.forEach(function (item) { renderMessage(item); last = Math.max(last, item.id); });
        if (stick) history.scrollTop = history.scrollHeight;
        setStatus("不急着回复，按自己的节奏聊。", false);
      } catch (_) {
        if (!closed) setStatus("暂时无法更新消息，正在等待恢复连接。", true);
      } finally { refreshing = false; }
    }
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (closed || form.dataset.sending === "yes") return;
      if (!body.value.trim()) { body.focus(); return; }
      var submitted = body.value;
      var send = form.querySelector("button[type=submit]");
      form.dataset.sending = "yes"; send.disabled = true;
      try {
        var response = await fetch(form.action, { method: "POST", body: new FormData(form), credentials: "same-origin", headers: { "Accept": "application/json" } });
        if (response.status === 404 || response.status === 403 || response.redirected) { stopConversation(); return; }
        if (!response.ok) { var error = await response.json(); throw new Error(error.error || "发送失败，请重试。"); }
        if (body.value === submitted) body.value = "";
        await refresh(true);
        body.focus();
      } catch (error) {
        if (!closed) setStatus(error.message === "Failed to fetch" ? "连接中断，消息可能尚未发送，请先检查记录。" : error.message, true);
      } finally { form.dataset.sending = "no"; if (!closed) send.disabled = false; }
    });
    document.querySelectorAll("[data-icebreaker]").forEach(function (button) {
      button.addEventListener("click", function () { body.value = button.dataset.icebreaker; body.focus(); });
    });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(false); });
    window.setInterval(function () { if (!document.hidden && !closed) refresh(false); }, 3000);
  }
})();
