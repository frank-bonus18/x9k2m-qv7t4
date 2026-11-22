/* 后室：回不去 · 全图版 · 作弊面板（本地注入，不联网） */
(function () {
  var KINDS = [
    ["smiler", "笑魇"], ["partygoer", "派对客"], ["hound", "猎犬"],
    ["director", "教导主任"], ["zhugan", "竹竿"], ["maid", "女仆"],
    ["nurse", "护士"], ["blubcat", "蓝猫"], ["mound", "土堆"],
    ["fin", "利维坦"], ["guide", "引路灯"], ["silhouette", "剪影"]
  ];
  var ZONES = [
    ["yellow", "大厅 Lv0"], ["stairwell", "楼梯间 Lv1"], ["school", "学校 Lv2"],
    ["pool", "泳池 Lv3"], ["office", "办公层 Lv4"], ["habitable", "可居住区 Lv5"],
    ["pipes", "管道 Lv6"], ["fun", "游乐层 Lv7"], ["run", "奔跑走廊 Lv8"],
    ["bathhouse", "澡堂 Lv9"], ["station", "车站 Lv10"], ["hotel", "酒店 Lv11"],
    ["lightsout", "熄灯区 Lv12"], ["ocean", "海 Lv13"], ["cave", "洞穴 Lv14"],
    ["suburbs", "郊区 Lv15"], ["wheat", "麦田 Lv16"], ["city", "城市 Lv17"],
    ["hospital", "医院 Lv18"], ["metro", "地铁 Lv19"]
  ];

  function css() {
    var s = document.createElement("style");
    s.textContent = [
      "#hsx-btn{position:fixed;left:10px;top:10px;z-index:99999;width:46px;height:46px;border-radius:50%;",
      "background:rgba(20,18,12,.92);color:#e8e2cd;border:2px solid #d8a63a;font-size:20px;line-height:42px;",
      "text-align:center;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent}",
      "#hsx-panel{position:fixed;left:10px;top:64px;z-index:99999;width:min(320px,calc(100vw - 20px));",
      "max-height:calc(100vh - 80px);overflow:auto;background:rgba(14,12,9,.96);color:#e8e2cd;",
      "border:2px solid #4a4436;border-radius:12px;padding:12px;font:13px/1.6 -apple-system,sans-serif;display:none}",
      "#hsx-panel h3{margin:0 0 8px;font-size:14px;color:#d8a63a;letter-spacing:.08em}",
      "#hsx-panel .row{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 10px}",
      "#hsx-panel button{flex:1 1 auto;min-width:64px;padding:7px 8px;border-radius:8px;border:1px solid #5a5442;",
      "background:#211e17;color:#e8e2cd;font-size:12.5px;cursor:pointer}",
      "#hsx-panel button.on{background:#d8a63a;color:#1c1a15;border-color:#d8a63a;font-weight:700}",
      "#hsx-panel select{width:100%;padding:7px;border-radius:8px;background:#211e17;color:#e8e2cd;border:1px solid #5a5442}",
      "#hsx-panel .tip{color:#8f8877;font-size:11.5px;line-height:1.6}",
      "#hsx-panel .hint{color:#7f7867;font-size:11px;margin-top:2px}"
    ].join("");
    document.head.appendChild(s);
  }

  function ui(g) {
    css();
    var btn = document.createElement("button");
    btn.id = "hsx-btn"; btn.title = "作弊面板"; btn.textContent = "⚙";
    var panel = document.createElement("div");
    panel.id = "hsx-panel";
    panel.innerHTML = [
      '<h3>作弊面板</h3>',
      '<div>飞行（空格/跳跃键上升）</div><div class="row" id="hsx-fly"></div>',
      '<div>移动速度</div><div class="row" id="hsx-speed"></div>',
      '<div>传送层级</div><div class="row"><select id="hsx-zone"></select></div>',
      '<div class="row"><button id="hsx-go">传送到该层</button></div>',
      '<div>召唤怪物（面前 7 米）</div><div class="row"><select id="hsx-kind"></select></div>',
      '<div class="row"><button id="hsx-spawn">召唤</button><button id="hsx-clear">清空怪物</button></div>',
      '<div class="tip">地图：20 层 × 33×33 区块已全部预填（22,302,720 格），打开地图按「－」缩小看全貌。</div>',
      '<div class="hint" id="hsx-msg"></div>'
    ].join("");
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    btn.onclick = function () {
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    };

    function msg(t) {
      var el = document.getElementById("hsx-msg");
      if (el) el.textContent = t;
    }

    // 飞行
    var ctl = g.engine.controller;
    var flyWrap = document.getElementById("hsx-fly");
    [["关", false], ["开", true]].forEach(function (p) {
      var b = document.createElement("button");
      b.textContent = "飞行：" + p[0];
      b.onclick = function () {
        ctl.fly = p[1];
        if (p[1]) { ctl.jumpBuffer = 0.2; }
        [].forEach.call(flyWrap.children, function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        msg("飞行 " + (p[1] ? "已开启" : "已关闭"));
      };
      if (!p[1]) b.classList.add("on");
      flyWrap.appendChild(b);
    });

    // 速度
    var spdWrap = document.getElementById("hsx-speed");
    [["1×", 1], ["2.5×", 2.5], ["4×", 4]].forEach(function (p) {
      var b = document.createElement("button");
      b.textContent = p[0];
      b.onclick = function () {
        ctl.boost = p[1];
        [].forEach.call(spdWrap.children, function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        msg("速度 " + p[0]);
      };
      if (p[1] === 1) b.classList.add("on");
      spdWrap.appendChild(b);
    });

    // 层级
    var zs = document.getElementById("hsx-zone");
    ZONES.forEach(function (z) {
      var o = document.createElement("option");
      o.value = z[0]; o.textContent = z[1];
      zs.appendChild(o);
    });
    document.getElementById("hsx-go").onclick = async function () {
      msg("定位中…");
      try {
        var r = await g.engine.locate(zs.value);
        if (!r) return msg("该层附近没找到可传送区块");
        await g.engine.teleportToChunk(r.cx, r.cz, r.floor);
        msg("已传送：" + zs.options[zs.selectedIndex].text);
      } catch (e) { msg("传送失败：" + e.message); }
    };

    // 怪物
    var ks = document.getElementById("hsx-kind");
    KINDS.forEach(function (k) {
      var o = document.createElement("option");
      o.value = k[0]; o.textContent = k[0] + " · " + k[1];
      ks.appendChild(o);
    });
    document.getElementById("hsx-spawn").onclick = function () {
      try {
        var p = g.engine.player, yaw = p.yaw;
        var x = p.x - Math.sin(yaw) * 7, z = p.z - Math.cos(yaw) * 7;
        var e = g.spawn(ks.value, x, z, yaw);
        msg(e ? "已召唤 " + ks.value : "召唤失败（kind 无效）");
      } catch (e) { msg("召唤失败：" + e.message); }
    };
    document.getElementById("hsx-clear").onclick = function () {
      try {
        g.list.slice().forEach(function (e) { g.despawn(e); });
        msg("怪物已清空");
      } catch (e) { msg("清空失败：" + e.message); }
    };
  }

  // 等引擎与实体管理器就绪
  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    var g = window.__hs_go;
    if (g && g.engine && g.engine.controller && window.__hs_panel_done !== true) {
      window.__hs_panel_done = true;
      clearInterval(timer);
      try { ui(g); } catch (e) { console.error("[cheat]", e); }
    }
    if (tries > 600) clearInterval(timer); // 60s 内没就绪就放弃
  }, 100);
})();
