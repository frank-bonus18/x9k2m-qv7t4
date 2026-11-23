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
      "#hsx-btn{position:fixed;left:10px;top:10px;z-index:99999;width:44px;height:44px;border-radius:50%;",
      "background:rgba(20,18,12,.92);color:#e8e2cd;border:2px solid #d8a63a;font-size:18px;line-height:40px;",
      "text-align:center;cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;box-shadow:0 0 14px rgba(216,166,58,.5)}",
      "#hsx-panel{position:fixed;left:8px;top:60px;z-index:100000;width:min(330px,calc(100vw - 16px));",
      "max-height:calc(100vh - 76px);overflow:auto;background:rgba(12,10,8,.97);color:#e8e2cd;",
      "border:2px solid #d8a63a;border-radius:12px;padding:12px;font:13px/1.55 -apple-system,sans-serif;display:none}",
      "#hsx-panel h3{margin:0 0 10px;font-size:14px;color:#d8a63a;letter-spacing:.08em}",
      "#hsx-panel .lab{color:#a99f88;font-size:12px;margin:8px 0 4px}",
      "#hsx-panel .row{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 8px}",
      "#hsx-panel button{flex:1 1 auto;min-width:60px;padding:8px;border-radius:8px;border:1px solid #5a5442;",
      "background:#211e17;color:#e8e2cd;font-size:12.5px;cursor:pointer}",
      "#hsx-panel button.on{background:#d8a63a;color:#1c1a15;border-color:#d8a63a;font-weight:700}",
      "#hsx-panel select{width:100%;padding:8px;border-radius:8px;background:#211e17;color:#e8e2cd;border:1px solid #5a5442;margin-bottom:6px}",
      "#hsx-panel .tip{color:#8f8877;font-size:11.5px;line-height:1.6;border-top:1px solid #2a2620;padding-top:8px;margin-top:4px}",
      "#hsx-msg{min-height:16px;color:#d8a63a;font-size:12px;margin-top:6px}"
    ].join("");
    document.head.appendChild(s);
  }

  function ui(g) {
    css();
    var btn = document.createElement("button");
    btn.id = "hsx-btn"; btn.textContent = "⚙";
    var panel = document.createElement("div");
    panel.id = "hsx-panel";
    panel.innerHTML = [
      '<h3>作弊面板</h3>',
      '<div class="lab">飞行（可穿墙，自由升降）</div><div class="row" id="hsx-fly"></div>',
      '<div class="lab">移动速度</div><div class="row" id="hsx-speed"></div>',
      '<div class="lab">传送到层级</div><select id="hsx-zone"></select>',
      '<div class="row"><button id="hsx-go">传送</button></div>',
      '<div class="lab">召唤怪物（面前 7 米）</div><select id="hsx-kind"></select>',
      '<div class="row"><button id="hsx-spawn">召唤</button><button id="hsx-clear">清空</button></div>',
      '<div id="hsx-msg"></div>',
      '<div class="tip">地图：边走边点亮脚下 120 米范围（走多远就扩多大），已经走过的地方会保留。</div>'
    ].join("");
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    btn.onclick = function () {
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    };

    function msg(t) {
      document.getElementById("hsx-msg").textContent = t;
      try { g.api && g.api.toast && g.api.toast(t, 2200); } catch (e) {}
    }

    var ctl = g.engine.controller;

    // 飞行：升 / 悬 / 降 / 关
    var flyWrap = document.getElementById("hsx-fly");
    [["升", 5], ["悬", 0], ["降", -5], ["关", null]].forEach(function (p) {
      var b = document.createElement("button");
      b.textContent = p[1] === null ? "关闭飞行" : "飞行 " + p[0];
      b.onclick = function () {
        if (p[1] === null) {
          ctl.fly = false; ctl.flyV = undefined;
        } else {
          ctl.fly = true; ctl.flyV = p[1];
          ctl.grounded = false; ctl.vy = p[1];
        }
        [].forEach.call(flyWrap.children, function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        msg(p[1] === null ? "飞行已关闭" : "飞行 " + p[0] + "（" + (p[1] === 0 ? "悬停" : p[1] > 0 ? "上升" : "下降") + "）");
      };
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
      var sel = zs.options[zs.selectedIndex].text;
      try {
        var r = await g.engine.locate(zs.value);
        if (!r) return msg("这一层附近没找到可传送的区块");
        await g.engine.teleportToChunk(r.cx, r.cz, r.floor);
        msg("已传送：" + sel);
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
        var ent = g.spawn(ks.value, x, z, yaw);
        msg(ent ? "已召唤 " + ks.value : "召唤失败（该 kind 不可用）");
      } catch (e) { msg("召唤失败：" + e.message); }
    };
    document.getElementById("hsx-clear").onclick = function () {
      try {
        g.list.slice().forEach(function (e) { g.despawn(e); });
        msg("怪物已清空");
      } catch (e) { msg("清空失败：" + e.message); }
    };
  }

  var tries = 0;
  var timer = setInterval(function () {
    tries++;
    if (window.__hs_go && window.__hs_go.engine && window.__hs_go.engine.controller && window.__hs_panel_done !== true) {
      window.__hs_panel_done = true;
      clearInterval(timer);
      try { ui(window.__hs_go); } catch (e) { console.error("[cheat]", e); }
    }
    if (tries > 900) clearInterval(timer);
  }, 100);
})();
