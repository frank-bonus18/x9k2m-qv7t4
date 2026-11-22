# 后室：回不去 · 静态站点全量镜像

源站：https://backrooms.trenquil.com/ ｜ 构建号 `f1ced28183f1` ｜ 抓取：2026-11-22
文件 428 个，合计 37,612,117 字节（约 35.9 MB）

## 这是什么

这是那个游戏**整个前端**的完整拷贝，包含全部代码、字体、贴图、模型和世界生成器。
下载后放到任意静态服务器上就能跑，不依赖原站。

**但它不含后端。** 原因写在下面「关于"后端"」一节。

## 怎么运行

```bash
cd game_mirror
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000/
```

Windows 双开 serve.bat 也可以。注意：**必须用 http 起服务，直接双击 index.html（file://）会白屏**，
因为代码用了 ES module + fetch(MANIFEST.json)，浏览器在 file:// 下会拒绝。

## 目录结构

```
index.html                    入口（内含语言判定与字体预载脚本）
assets/                       全部构建产物
  index-BT_lKVZA.js           主入口（菜单、HUD、音频合成、渲染调度）
  boot-BU4ymIed.js            游戏主体（250 KB，最大的一个：关卡、玩家、交互）
  three-BRESfFDH.js           three.js 运行时（579 KB）
  overlays-BkDuzKB5.js         UI 浮层（196 KB）
  map / logbook / settings / share / credits / composer / save / protocol / types
  KTX2Loader / GLTFLoader / meshopt_decoder / basis_transcoder(.js+.wasm)  贴图与模型解码
  worker-Jqf59Z6d.js          Web Worker
  index-CJ810jYq.css          样式（39 KB）
fonts/                        方正像素 12px 字体（中文 + 拉丁，woff2）
art/                          10 张菜单 / 便笺插图
logbook/                      图鉴索引 index.json + 7 张实体/物品像素图
models/creatures.glb          17 种实体的模型（144 KB）
posters/                      MANIFEST.json + 38 张关卡海报贴花（CC 授权，含作者信息）
textures/                     MANIFEST.json + 29 种材质 × 512/1024 × albedo/normal/orm × ktx2/webp = 348 个文件
wasm/worldgen.13c170e9b8.wasm 世界生成器（699 KB，纯客户端 wasm）
manifest.txt                  每个文件的字节数与 sha256 前 16 位，可用来核对完整性
headers.txt                   源站响应头（含 CSP，说明它允许连 wss://backrooms.trenquil.com）
```

## 关于"后端"

先把结论说清楚：**这个游戏没有可下载的后端，因为它的后端不是网页服务，而是一个实时 WebSocket 房间服务器，源码不在客户端里。**

从代码里能确认的事实：

- `index.html` 的 CSP 里写着 `connect-src 'self' blob: data: wss://backrooms.trenquil.com`
  → 唯一的外部连接就是这条 wss。
- `assets/protocol-CgqRT8CC.js` 是**客户端侧的二进制协议编解码**，能反推出服务端收发什么：
  - 帧类型 `1` 位置上报，`3` / `4` 玩家快照（近场用 1/20 米精度的 int16 差分，远场用整米）
  - 帧类型 `5` 生物帧、`6` 生物快照（17 种实体按 12 字节一条）
  - 测绘用 32 字节 bitset 表示 48×48 的格子，key 格式 `层级:区块x,区块z`
  - 玩家 id 是 1–65535 的 uint16，快照上限 48 人
- 这些数据**只在服务器内存里**：在线人数、总测绘格子数、世界编号与纪元号（就是存档里的 `gen`）、联机留言板。
- 世界生成本身**不在服务端**，在 `wasm/worldgen.13c170e9b8.wasm` 里 —— 这部分我已经抓下来了，可以离线跑。

所以「下载后端」这件事，实际能做的是：拿到完整客户端 + 协议格式 + 服务器地址。
要让 `wss://backrooms.trenquil.com/ws` 真的应答，还得有那台服务器，而它的代码从未下发到客户端。
如果你需要的是一个能自己跑起来的联机服务端，那得自己按上面的协议重写一个 —— 需要的话我可以照这个协议给你写一份 Node.js 的参考实现。

此外，这些**没有**抓到，因为它们本来就不存在或不可取：
- `manifest.webmanifest` / `robots.txt` / `og.png`：源站 404，没做。
- `assets/zones/*.json`、`content/zones/*.json`：代码里是可选加载，源站 404（区域材质清单未发布）。
- `*.map` 源码映射：未发布。
- 真·服务端代码、数据库、世界状态：不在客户端。

## 完整性核对

`manifest.txt` 里每个文件都有 sha256 前 16 位。抽查任意文件：

```bash
sha256sum textures/baseboard/albedo_512.ktx2 | cut -c1-16   # 与 manifest.txt 对比
```

---

# 全图版改动（本目录）

相对上面那份原样镜像，本目录只改了 **1 个文件里的 1 处**，另加 1 个页面。

## 1. `go.html`（新增）
层级直达页：20 个按钮，点一下直接进对应层级。链接形如 `./index.html?zone=pool`。

这条能力是游戏自带的：`boot-BU4ymIed.js` 在正常模式下会读 `?zone=` 参数，
然后 `locate(zone)` 用客户端 wasm 世界生成器螺旋搜索最近的该层级区块并传送，
所以不需要真的先走到连接口。另外游戏里 `[` `]` 键可上下换层，数字 `1`–`0` 直达前 10 层。

## 2. `assets/index-BT_lKVZA.js`（打补丁）
在测绘库 `M=class extends j{...}` 上注入了一个构造函数：

```js
constructor(){super();this.__revealAll()}
__revealAll(){
  let R=16,F=20;                       // 半径 16 个区块 × 20 层
  for(let f=0;f<F;f++){
    let bits=new Uint8Array(32).fill(255), mine=new Uint8Array(32);
    for(let cx=-R;cx<=R;cx++)for(let cz=-R;cz<=R;cz++){
      this.chunks.set(f+":"+cx+","+cz,{gen:1,bits,count:1024,anchored:false,mine});
      this.perFloor.set(f,(this.perFloor.get(f)??0)+1024);
      this.totalCells+=1024;
    }
  }
  this.changed();                      // 触发地图重绘
}
```

原理：地图绘制只认测绘库里 `chunks` 的 32 字节位图（每个区块 16×16=256 格… 实际位图按 48×48 米区块存 1024 位），
位图全 1 就是"全走过"。填满后：
- 打开地图整片都是已测绘区域，一个格子都不用走；
- 每层 `perFloor>0`，层级列表里 20 层全部解锁可点（未解锁层原本是灰的且按钮禁用）；
- `changed()` 让地图立即重绘。

数据规模：20 层 × 33×33 区块 = 21,780 个区块；每层 1,115,136 格，全部 22,302,720 格。
内存约 2.4 MB（区块对象 + 两张 32 字节位图）。

## 还原成原版
把 `assets/index-BT_lKVZA.js` 换回 `../game_mirror/assets/index-BT_lKVZA.js`，
再删掉 `go.html` 即可，其余文件未改动。

## 已知边界
- 这个"全图"只影响本地地图显示，不会同步到服务器，也不改变别人看到的统计。
- 层级直达靠客户端生成器寻路，个别层级如果 48 区块内搜不到对应区域会传送失败（此时手按 `[` `]` 换层）。
