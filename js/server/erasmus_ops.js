// 目标聚焦操作层 (Operational Target-Focus) — erasmus-v2.0-zh.6
// Target-focused operations layer (Operational Target-Focus) — erasmus-v2.0-zh.6
//
// 与 erasmus_complete_ai_execution_engine.py 同源: 各战略的目标优先级表来自
// Same source as erasmus_complete_ai_execution_engine.py: each strategy's target priority table comes from
// 伊拉斯谟 PDF 图表转录 (01/02/03/07/08/09 决策轴), 本文件把这些目标清单落成
// the Erasmus PDF chart transcription (01/02/03/07/08/09 decision axis); this file turns those target lists into
// 可执行的主攻轴线 (convoy/岛链), 供:
// an executable main attack axis (convoy/island chain), for:
//   1. js/server/bots/erasmus.js 在“选目标格/选进攻单位”时把行动聚焦到当前
//   1. js/server/bots/erasmus.js, when "picking target hex / picking attack unit", focuses action on the current
//      轴线的最优先未夺目标 (消除到处乱打、无主线的空转攻势);
//      axis's highest-priority uncaptured target (eliminates scattered attacks and idle offensives with no main axis);
//   2. js/server/offensive.js 无头地面/海上推进的 target_score 就近目标转向
//   2. js/server/offensive.js headless ground/naval advance target_score turns toward the nearest target
//      (让陆军/两栖部队沿主轴线推进, 而不是奔离轴的最近敌军)。
//      (so army/amphibious units advance along the main axis, rather than toward the nearest enemy off-axis).
//
// 设计: 无跨窗口记忆 —— 每次调用按当前地图状态(G/控制位)重算“当前主轴”与
// Design: no cross-window memory — each call recomputes the "current main axis" and
// “最优先未夺目标”。同闭包内共享, 引擎与 bot 都能调用 (function 声明提升)。
// the "highest-priority uncaptured target" from the current map state (G/control bits). Shared within the same closure; both engine and bot can call it (function declaration hoisting).
// 数字 token 按 hex id -> 内部 idx; 其余按地图 name 精确匹配 (+别名)。
// Numeric tokens map hex id -> internal idx; the rest are exact-matched by map name (+aliases).

var EOP_IDX_BY_NAME = null
const EOP_ALIASES = {
    "Sasebo": "Kynshu",          // 佐世保 = Kynshu (3307)
    // Sasebo = Kynshu (3307)
    "Timor": "Koepang",
    "Uluthi": "Ulithi",
    "Gili-Gili": "Gili Gili",
    "Buin": "Bougainville",      // 无独立 hex
    // Buin has no independent hex
    "Tinian": "Saipan",          // Saipan/Tinian 同格
    // Saipan/Tinian share the same hex
    "New Hebrides": "Espiritu Santo",
    "Palau Islands": "Palau",
    "Noumea": null,              // 不在 1942-45 长剧本地图, 跳过
    // Not on this 1942-45 long campaign map, skip
    "Salamaua": null,
    "Finschhafen": null,
}

const EOP_AXES = {
    // 盟军: 中太平洋主线 -> 马里亚纳 -> 硫磺岛/冲绳 -> 登陆日本。
    // Allies: Central Pacific main line -> Marianas -> Iwo Jima/Okinawa -> invade Japan.
    // 对应图表“中太平洋战略 / 跳岛作战 / 登陆日本”三张目标表按序拼接;
    // Concatenates the three target tables "Central Pacific strategy / island-hopping / invade Japan" in order;
    // 每个命名格(或有名字的夺控格)被攻下即计入 PoW 的 G.capture。
    // each named hex (or named capture hex) taken counts toward PoW's G.capture.
    AP: {
        id: "AP_CENPAC_MAIN", role: "Allies",
        note: "中太平洋主线→日本 (Wake→Tarawa→Kwajalein→Eniwetok→Palau→Ulithi→Saipan→Iwo→Okinawa→日本本土)",
        tokens: ["Wake", "Tarawa", "Kwajalein", "Eniwetok", "Palau", "Ulithi",
                 "Saipan", "Iwo Jima", "Okinawa",
                 "Kynshu", "Tokyo", "Ominato", 3606, "Nagoya", "Kyoto", "Kure", "Osaka"],
    },
    // 日本: 南方资源夺控 (东印度/马来亚/菲律宾投降目标)。
    // Japan: capture the southern resources (Dutch East Indies/Malaya/Philippines surrender objectives).
    JP_RESOURCE: {
        id: "JP_SOUTH_RESOURCE", role: "Japan",
        note: "南方资源夺控 (东印度→马来亚→菲律宾, 至日本控制≥13资源)",
        tokens: ["Balikpapan", "Tarakan", "Batavia", "Tjilatjap", "Soerabaja",
                 "Bangka", "Palembang", "Medan",
                 "Kuantan", "Singapore",
                 "Manila", "Davao"],
    },
}

// ---- 地图名字 -> 内部 idx 一次性索引 --------------------------------------
// ---- map name -> internal idx one-time index --------------------------------------
function eop_ensure_name_index() {
    if (EOP_IDX_BY_NAME) return
    const m = {}
    if (typeof map === "undefined") { EOP_IDX_BY_NAME = m; return }
    for (let i = 0; i < map.length; i++) {
        const nm = map[i].name
        if (nm) m[nm.toLowerCase()] = (typeof hex_to_int === "function") ? hex_to_int(map[i].id) : null
    }
    EOP_IDX_BY_NAME = m
}

// 解析一个目标 token -> 内部 idx; 解析不到返回 null (调用方跳过, 不炸)。
// Resolve a target token -> internal idx; return null if unresolvable (caller skips, no crash).
function eop_resolve_token(token) {
    if (typeof token === "number") return (typeof hex_to_int === "function") ? hex_to_int(token) : null
    const t = String(token).trim()
    const num = t.match(/^(\d{4})$/)
    if (num) return (typeof hex_to_int === "function") ? hex_to_int(+num[1]) : null
    eop_ensure_name_index()
    const alias = Object.prototype.hasOwnProperty.call(EOP_ALIASES, t) ? EOP_ALIASES[t] : undefined
    if (alias === null) return null
    const key = (alias === undefined ? t : alias).toLowerCase()
    return EOP_IDX_BY_NAME[key] !== undefined ? EOP_IDX_BY_NAME[key] : null
}

// 回合级状态机外部链覆盖 (erasmus-v2.0-zh.7): erasmus_state.js 在 gate 开时于
// Turn-level state machine external chain override (erasmus-v2.0-zh.7): erasmus_state.js, when the gate is on,
// 每方首卡窗钉住整回合战略, 把该战略的优先目标链(epoch token 表)作为"外部主轴"
// pins the whole-turn strategy at each side's first-card window, using that strategy's priority target chain (epoch token table)
// 覆盖固定 EOP_AXES。gate 关时必须清空(否则同进程跨剧本串台)。
// as the "external main axis" to override the fixed EOP_AXES. Must be cleared when the gate is off (otherwise state leaks across scenarios in the same process).
var EOP_OVERRIDE = { Japan: null, Allies: null }

function eop_set_strategy_chain(role, override) {
    EOP_OVERRIDE[role] = override || null
}
function eop_clear_all_chains() {
    EOP_OVERRIDE = { Japan: null, Allies: null }
}

// 当前主轴的完整目标链。外部链覆盖(erasmus_state)直接携带已解析好的有序 idx
// Complete target chain of the current main axis. External chain override (erasmus_state) carries the already-resolved ordered idx
// chain(=parse_goals 全部 hex, 忠实 py target_chain), 不走 token 二次解析;
// chain (= all hexes from parse_goals, faithful to py target_chain), no secondary token resolution;
// 默认 EOP_AXES 走 name/4-digit token -> idx。
// default EOP_AXES goes name/4-digit token -> idx.
function eop_axis_chain(role) {
    const axis = eop_axis(role)
    if (!axis) return []
    if (Array.isArray(axis.chain) && axis.chain.length) return axis.chain.slice()
    const out = []
    for (const tk of axis.tokens) {
        const idx = eop_resolve_token(tk)
        if (idx !== null && !out.includes(idx)) out.push(idx)
    }
    return out
}

// 该方当前应当遵循的主轴; 无主轴(如日本资源已足、转入防守)返回 null。
// The main axis this side should currently follow; returns null when there is no main axis (e.g. Japan's resources are sufficient, switching to defense).
function eop_axis(role) {
    const ov = EOP_OVERRIDE[role]
    // 状态机显式给出一个战略时，即使其目标链为空（事件、已完成驻军、暂时没有本州
    // When the state machine explicitly gives a strategy, even if its target chain is empty (event, completed garrison, temporarily no
    // 登陆部队），也必须阻断旧的默认资源轴。旧判断会把空链战略悄悄替换成 JP_RESOURCE。
    // home-island invasion force), the old default resource axis must be blocked. The old logic would silently replace an empty-chain strategy with JP_RESOURCE.
    if (ov) {
        return { id: ov.name || (role + "_AXIS"), role: role,
            note: ov.note ? `${ov.name} — ${ov.note}` : (ov.name || role + "轴"),
            kind: ov.kind || null, tokens: ov.tokens || [], chain: ov.chain || [], targetMeta: ov.targetMeta || [] }
    }
    if (role === "Allies") return EOP_AXES.AP
    // 日本: 控制资源 < 13 时抢南方资源; 达标后转入防守, 不再无谓远征。
    // Japan: seize southern resources while controlled resources < 13; switch to defense once met, no more pointless expeditions.
    let jpRes = 99
    if (typeof get_jp_resources === "function") {
        try { jpRes = get_jp_resources() } catch (e) { jpRes = 99 }
    }
    if (jpRes < 13) return EOP_AXES.JP_RESOURCE
    return null
}

// 该方最优先的“未夺控”目标 (轴线链首)。链首已控则顺延到下一个, 即
// This side's highest-priority "uncaptured" target (head of the axis chain). If the chain head is already controlled, advance to the next — i.e.
// “目标达成前不换目标”——达成(夺控)才放行下一目标。
// "don't change target until it is achieved" — only releasing the next target once the current one is achieved (captured).
// role: "Japan" | "Allies" (或 faction 数值 0/1)。
// role: "Japan" | "Allies" (or faction number 0/1).
function eop_focus(role) {
    if (typeof G === "undefined" || !G || !G.supply_cache) return null
    const faction = role === "Japan" ? JP : role === "Allies" ? AP : role
    const mine = faction === JP ? JP : AP
    for (const idx of eop_axis_chain(mine === JP ? "Japan" : "Allies")) {
        if (idx < 0 || idx > LAST_BOARD_HEX) continue
        const meta = eop_target_meta(mine === JP ? "Japan" : "Allies", idx)
        if (meta) {
            if (eop_target_pending(mine === JP ? "Japan" : "Allies", idx, meta)) return idx
            continue
        }
        // 压制目标的完成条件是敌方 AZOI 不再覆盖该格，并非必须夺取控制权。
        // A suppress target is complete when enemy AZOI no longer covers the hex, not when control is necessarily seized.
        // 因此 Jolo 即便仍由盟军控制，只要覆盖它的航空/航母 ZOI 已被消灭，就应顺延
        // So even if Jolo is still Allied-controlled, as long as the air/carrier ZOI covering it has been eliminated, advance
        // 到 Makassar；夺占类目标仍严格以控制权为完成条件。
        // to Makassar; capture-type targets still strictly require control as the completion condition.
        if (meta && (meta.kind === "SUPPRESS" || meta.kind === "SUPPRESS_HQ")) {
            // 开局马尼拉采用图表脚注允许的“占领基地以压制 HQ”。在真正夺占前
            // The opening Manila uses the chart footnote "occupy the base to suppress HQ". Before actually capturing it,
            // 不能仅因某一编队进入/临时消除 AZOI 就把整支任务部队切到下一目标。
            // don't switch the whole task force to the next target just because some formation entered/temporarily removed AZOI.
            if (meta.requiresOccupation && !is_space_controlled(idx, mine)) return idx
            if (typeof has_zoi === "function" && has_zoi(idx, 1 - mine)) return idx
            continue
        }
        // 最终国防圈[2]：只考虑仍由日本控制的地点。己控地点必须有对应兵种驻军；
        // Final defense perimeter [2]: only consider locations still controlled by Japan. Own-controlled locations must have the matching branch garrisoned;
        // 敌控地点既不算完成条件，也不转化成夺回目标。
        // enemy-controlled locations neither count as complete nor become recapture targets.
        if (meta && meta.kind === "GARRISON") {
            if (!is_space_controlled(idx, mine)) continue
            const required = meta.garrisonClass || "ground"
            let occupied = false
            for (let u = 1; u < pieces.length; ++u) {
                const p = pieces[u]
                if (p && p.faction === mine && p.class === required && G.location[u] === idx) { occupied = true; break }
            }
            if (!occupied) return idx
            continue
        }
        if (!is_space_controlled(idx, mine)) return idx
    }
    return null
}
function eop_focus_faction(faction) {
    return eop_focus(faction === JP ? "Japan" : faction === AP ? "Allies" : faction)
}

// ---- 选目标格 (action_hex 参数) ------------------------------------------
// ---- pick target hex (action_hex param) ------------------------------------------
// 优先当前焦点; 焦点不可达时, 在候选里选距离焦点最近的格(逐步靠近主轴),
// Prefer the current focus; when the focus is unreachable, pick the candidate hex closest to the focus (gradually approach the main axis),
// 而不是随机散打。无焦点(= 无主轴或主轴已全达成)时返回 undefined 让原逻辑决定。
// rather than attacking at random. With no focus (= no main axis or axis fully achieved) return undefined and let the original logic decide.
function eop_pick_action_hex(candidates, role) {
    if (!Array.isArray(candidates) || candidates.length === 0) return undefined
    const focus = eop_focus(role)
    if (focus === null) return undefined
    let best = null, bestD = Infinity
    for (const h of candidates) {
        let d
        if (h === focus) d = 0
        else if (typeof get_distance === "function") d = get_distance(h, focus)
        else d = Math.abs(h - focus)
        if (d < bestD || (d === bestD && (best === null || h < best))) { bestD = d; best = h }
    }
    return best !== null ? best : undefined
}

// ---- 选进攻/激活单位 ------------------------------------------------------
// ---- pick attack/activation unit ------------------------------------------------------
// 敌方单位落点(任意军种), 供"靠前线"就近打分; 引擎未提供迭代器时退化为直接扫 pieces。
// Enemy unit locations (any branch), for "near the front" proximity scoring; falls back to scanning pieces directly when the engine provides no iterator.
function eop_enemy_locs(mine) {
    if (typeof G === "undefined" || !G || !G.location) return []
    const enemy = mine === JP ? AP : JP
    const out = []
    for (let u = 1; u < pieces.length; u++) {
        const p = pieces[u]
        if (!p || p.faction !== enemy) continue
        const h = G.location[u]
        if (h >= 0 && h <= LAST_BOARD_HEX) out.push(h)
    }
    return out
}
function eop_min_dist(hex, locs) {
    if (typeof get_distance !== "function" || !locs.length) return 99
    let best = 99
    for (let i = 0; i < locs.length; i++) {
        const d = get_distance(hex, locs[i])
        if (d < best) best = d
    }
    return best
}

// 进攻单位/会战申报单位: 主键 = 到最近敌单位的距离(越靠前线, 激活后当回合即可开战夺格,
// Attack/battle-declaring unit: primary key = distance to nearest enemy unit (the closer to the front, the sooner it can fight and capture after activation,
// 而非空跑一整轮又无会战可报), 次键 = 到焦点距离(保留战略方向)。此前只按"距焦点最近"
// rather than idling a whole round with no battle to declare), secondary key = distance to focus (preserve strategic direction). Previously only "nearest to focus"
// 挑单位, 而焦点(如拉包尔)常远在战线后方, 挑出的单位离任何敌军都远 → 移动后够不着敌格
// was used to pick units, but the focus (e.g. Rabaul) is often far behind the lines, so the picked unit was far from any enemy → couldn't reach an enemy hex after moving
// → ~半攻势"Confirm offensive"直接跳过会战 → 每回合夺格数远低于 PoW 所需 4。
// → about half the offensives' "Confirm offensive" skipped the battle directly → captures per turn far below the 4 PoW requires.
function eop_pick_unit(candidates, role, activeUnits, focusOverride) {
    if (!Array.isArray(candidates) || candidates.length === 0) return undefined
    const focus = Number.isInteger(focusOverride) ? focusOverride : eop_focus(role)
    if (typeof G === "undefined" || !G || !G.location) return undefined
    const mine = role === "Japan" ? JP : AP
    const axis = eop_axis(role)
    const focusMeta = focus === null ? null : eop_target_meta(role, focus)
    candidates = candidates.filter(u=>eop_unit_matches_target(u,role,focusMeta,focus))
    if (!candidates.length) return undefined
    if (focus !== null && axis && (axis.kind === "GARRISON" || axis.kind === "DEFEND")) {
        const required = focusMeta && focusMeta.kind === "GARRISON" && !focusMeta.garrisonRequirement ? (focusMeta.garrisonClass || "ground") : null
        const home = candidates.filter(u => {
            const p = pieces[u], h = G.location[u], md = h >= 0 && h <= LAST_BOARD_HEX ? get_map_data(h) : null
            if (!p || p.faction !== mine || !md) return false
            if (required) return p.class === required
            return md.region === "Japan" && (p.class === "ground" || p.class === "air" || p.class === "naval")
        })
        if (home.length) {
            const cls = p => axis.kind === "DEFEND" ? (p.class === "ground" ? 0 : p.class === "air" ? 1 : 2) : 0
            home.sort((a, b) => cls(pieces[a]) - cls(pieces[b])
                || get_distance(G.location[a], focus) - get_distance(G.location[b], focus)
                || (Number(pieces[b].cf) || 0) - (Number(pieces[a].cf) || 0) || a - b)
            return home[0]
        }
        // 本土防御没有合适单位时宁可不选，也不能退回最近敌军/南方资源轴。
        // When homeland defense has no suitable unit, better not to pick at all than to fall back to the nearest-enemy / southern-resource axis.
        return undefined
    }
    const enemyLocs = eop_enemy_locs(mine)
    const activated = Array.isArray(activeUnits) ? activeUnits : []
    // 两栖登陆护航 (TF_FORMATIONS「带海上/带航空海上支援的登陆」至少 1 海军单位):
    // Amphibious landing escort (TF_FORMATIONS "landing with naval / naval-air support" requires at least 1 naval unit):
    // 敌占港口/岛屿格的两栖夺控若不带海军护航, 引擎 broken_aa 会
    // an amphibious capture of an enemy-held port/island hex without naval escort triggers the engine's broken_aa
    // “Amphibious Assault failed due to lack of naval escort” 把登陆部队打回吃损失。
    // "Amphibious Assault failed due to lack of naval escort", sending the landing force back to take losses.
    // 只在激活窗启用(调用方传入 activeUnits), 且仅完整全图剧本(gate on) —— SP/Burma
    // Only enabled during the activation window (caller passes activeUnits), and only in full-map scenarios (gate on) — SP/Burma
    // 子图剧本保持 zh.6 行为不变(golden 不动)。
    // sub-map scenarios keep zh.6 behavior unchanged (golden untouched).
    const mdFocus = (focus !== null && typeof get_map_data === "function") ? get_map_data(focus) : null
    // 敌占或空敌控港口都算"需两栖登陆": 即使当前格无敌军, 敌方反应(Intercept)仍可能
    // Both enemy-occupied and empty enemy-controlled ports count as "needs amphibious landing": even with no enemy in the hex, enemy reaction (Intercept) may
    // 把海军调进来, 无护航的登陆照样在会战判 "Amphibious Assault failed"。故只在
    // bring in naval units, so an unescorted landing still gets "Amphibious Assault failed" in battle. So escort triggers as soon as the port
    // "未控制港口"即触发护航, 不要求格内有敌军。
    // is "not controlled", without requiring an enemy unit in the hex.
    const landing = Array.isArray(activeUnits) && focus !== null && !is_space_controlled(focus, mine)
        && mdFocus && mdFocus.port
        && (typeof esm_gate_on === "function" ? esm_gate_on() : false)
    const actNaval = activated.find(u => pieces[u] && pieces[u].class === "naval")
    const groundCandLocs = new Set()
    for (const u of candidates) { const p = pieces[u]; if (p && p.class === "ground") groundCandLocs.add(G.location[u]) }

    // 1) 先补海军护航: 只补与地面候选同格的海军(无头推进把同格海陆编成同组一起上岛)。
    // 1) First add naval escort: only add naval units in the same hex as a ground candidate (headless advance groups same-hex sea/land into one group to hit the island).
    //    非同格海军补了也白补 —— 无头推进按“同格编组”, 非同格海军会单独一组, 而纯海军组
    //    Adding a non-co-located naval unit is pointless — headless advance groups "by same hex", so a non-co-located naval unit would form its own group, and a pure naval group
    //    只能攻“敌海军格”(headless_target_score), 够不着只守地面的敌港, 地面仍无护航吃失败。
    //    can only attack an "enemy naval hex" (headless_target_score), unable to reach an enemy port defended only by ground, leaving the ground unit unescorted to fail.
    if (landing && !actNaval) {
        let best = null
        for (const u of candidates) {
            const p = pieces[u]
            if (p && p.class === "naval" && groundCandLocs.has(G.location[u])) {
                if (best === null || u < best) best = u
            }
        }
        if (best !== null) return best
        // 海军不必与登陆军出发时同格：它可以从另一基地移动到同一战斗格提供
        // The naval unit need not start in the same hex as the landing force: it can move from another base to the same battle hex to provide
        // 护航/海上支援。无头执行器会分别移动编队，再在同一格合并会战。
        // escort/naval support. The headless executor moves formations separately, then merges them into the same hex for battle.
        const naval = candidates.filter(u => pieces[u] && pieces[u].class === "naval")
        naval.sort((a, b) => get_distance(G.location[a], focus) - get_distance(G.location[b], focus)
            || (Number(pieces[b].cf) || 0) - (Number(pieces[a].cf) || 0) || a - b)
        if (naval.length) return naval[0]
    }

    const fd = h => (focus === null ? 99 : (typeof get_distance === "function") ? get_distance(h, focus) : Math.abs(h - focus))
    const scored = []
    for (const u of candidates) {
        const loc = G.location[u]
        if (!(loc >= 0 && loc <= LAST_BOARD_HEX)) continue
        scored.push([u, eop_min_dist(loc, enemyLocs), fd(loc)])
    }
    if (!scored.length) return undefined
    // 图表已经给出当前目标时，编队必须先围绕该目标组织；旧排序把“离任意敌军最近”
    // When the chart already gives a current target, the formation must be organized around that target; the old sort put "nearest to any enemy"
    // 放在首键，导致马尼拉为焦点时仍不断激活靠近婆罗洲小据点的单位。只有无明确
    // as the primary key, so with Manila as focus it kept activating units near small Borneo outposts. Only with no explicit
    // 目标（事件/一般前推）时才采用最近敌军排序。
    // target (event / general advance) should the nearest-enemy sort be used.
    if (focusMeta) scored.sort((a, b) => a[2] - b[2] || a[1] - b[1] || a[0] - b[0])
    else scored.sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[0] - b[0])
    // B: 焦点是敌占格(需“夺占”而非纯消耗)时, 若候选里有“到最近敌军距离”不比最优单位远太多的
    // B: when the focus is an enemy-held hex (needs "capture" rather than pure attrition), if candidates include an amphibious ground unit
    // 两栖地面(海军陆战队 asp / 可战略海运 strat_move), 优先选它组成登陆力量 —— 否则每次
    // (marine asp / strategic sea transport strat_move) whose "distance to nearest enemy" isn't much worse than the best, prefer it to form the landing force — otherwise each
    // 攻势总挑最近敌军的纯空/海军, 只会对岛屿做远距空袭, 永远无法登岛占格。
    // offensive always picks the nearest-enemy pure air/naval unit, only doing long-range airstrikes on islands and never landing to capture the hex.
    // 只在 node 端用环境开关做 A/B; 浏览器 PvE(process 未定义)时默认开启该偏置。
    // A/B only via env switch on the node side; browser PvE (process undefined) enables this bias by default.
    const biasOn = (typeof process === "undefined") || process.env.B_BIAS !== "0"
    if (biasOn && focus !== null && !is_space_controlled(focus, mine)) {
        const refD = scored[0][1]
        const cap = focusMeta ? Infinity : Math.max(3, refD + 3)
        const isGroundLanding = u => { const p = pieces[u]; return p && p.class === "ground" && (p.asp || p.strat_move) }
        // 登陆且已有海军护航时, 优先选与任一已激活海军同格的地面(编成同组一起上岛),
        // When landing and already having naval escort, prefer a ground unit co-located with any activated naval unit (form one group to hit the island),
        // 避免海陆分处两格导致地面单独硬登陆。
        // to avoid sea and land in two different hexes leaving the ground unit to force a landing alone.
        let pick = null
        if (landing && actNaval) {
            const escortLocs = new Set()
            for (const u of activated) { const p = pieces[u]; if (p && p.class === "naval") escortLocs.add(G.location[u]) }
            pick = scored.find(([u, ed]) => ed <= cap && escortLocs.has(G.location[u]) && isGroundLanding(u))
        }
        if (!pick) pick = scored.find(([u, ed]) => ed <= cap && isGroundLanding(u))
        if (pick) return pick[0]
    }
    return scored[0][0]
}

// 前推调度单位选择（文档 §5）：无立即可参战目标时的「战略移动/转场/推进」兜底。
// Forward-scheduling unit selection (doc §5): fallback for "strategic move / transfer / advance" when there is no immediately fightable target.
// 不套用 eop_unit_matches_target 的目标语义过滤（requiredUnits / escortPairs / unitFilter
// Does not apply eop_unit_matches_target's target-semantic filter (requiredUnits / escortPairs / unitFilter
// 等只约束「特定目标编队」，不约束「向前调动」）；只按阵线/焦点距离评分，让坐拥后方的
// etc. only constrain "specific-target formations", not "forward movement"); scores only by front/focus distance, letting rear-based
// 单位在空窗期仍向前线推进，避免「打出牌但 0 单位调度」的空攻势。
// units still advance to the front during idle windows, avoiding the "card played but 0 units scheduled" empty offensive.
function eop_pick_forward_unit(candidates, role, focusOverride) {
    if (!Array.isArray(candidates) || candidates.length === 0) return undefined
    if (typeof G === "undefined" || !G || !G.location) return undefined
    const mine = role === "Japan" ? JP : AP
    const focus = Number.isInteger(focusOverride) ? focusOverride : eop_focus(role)
    const cands = []
    for (const u of candidates) {
        const p = pieces[u]
        if (!p || p.faction !== mine) continue
        const h = G.location[u]
        if (h >= 0 && h <= LAST_BOARD_HEX) cands.push(u)
    }
    if (!cands.length) return undefined
    const enemyLocs = eop_enemy_locs(mine)
    const hasFocus = focus !== null && Number.isInteger(focus)
    const fd = h => hasFocus ? (typeof get_distance === "function" ? get_distance(h, focus) : Math.abs(h - focus)) : 99
    const scored = cands.map(u => [u, eop_min_dist(G.location[u], enemyLocs), fd(G.location[u])])
    // 有明确焦点优先靠近焦点（保留战略方向）；无焦点/一般前推优先靠近最近敌军。
    // With an explicit focus prefer approaching the focus (preserve strategic direction); with no focus / general advance prefer approaching the nearest enemy.
    scored.sort((a, b) => (hasFocus ? a[2] - b[2] || a[1] - b[1] : a[1] - b[1] || a[2] - b[2]) || a[0] - b[0])
    return scored[0][0]
}

// 两栖登陆无护航可用 → 阻断硬登陆 (TF_FORMATIONS「无支援登陆」仅限空目标且无敌方反应;
// Amphibious landing with no escort available → block a hard landing (TF_FORMATIONS "unsupported landing" is only for an empty target with no enemy reaction;
// 敌占/敌控港口的两栖夺控若本窗既无已激活海军、待激活候选里也无海军, 继续激活两栖地面
// an amphibious capture of an enemy-held/controlled port where this window has neither an activated naval unit nor a naval unit among the pending candidates; further activating amphibious ground
// 只会被 broken_aa 判 "Amphibious Assault failed" 吃损失)。返回 true 让选牌窗在尚未激活
// would only take broken_aa's "Amphibious Assault failed" losses). Returns true so the card window ends early via done (empty offensive, no units spent)
// 任何单位时提前 done 收尾(空攻势, 不耗单位)。仅完整全图剧本(gate on)。
// before activating any unit. Full-map scenarios only (gate on).
function eop_landing_no_escort(role, view) {
    if (typeof esm_gate_on !== "function" || !esm_gate_on()) return false
    if (!view || !view.offensive) return false
    const mine = role === "Japan" ? JP : AP
    const focus = eop_focus(role)
    if (focus === null) return false
    const meta = eop_target_meta(role, focus)
    if (!meta || !meta.requiresOccupation) return false
    const md = (typeof get_map_data === "function") ? get_map_data(focus) : null
    if (!md || !md.port) return false
    if (is_space_controlled(focus, mine)) return false
    // 可新增单位里是否同时存在海军和两栖地面。护航舰不要求与登陆军从同一港口
    // Whether both naval and amphibious ground units exist among the addable units. The escort need not depart from the same port
    // 出发；引擎只在会战结算时检查目标格内是否有进攻方海军。旧的“必须同格出发”
    // as the landing force; the engine only checks at battle resolution whether an attacker naval unit is in the target hex. The old "must depart co-located"
    // 预检会错误取消台湾陆军 + 南海舰队这类合法编成，制造空攻势。
    // pre-check wrongly cancels legal groupings like a Taiwan army + South China Sea fleet, creating an empty offensive.
    const cand = Array.isArray(view.actions && view.actions.unit) ? view.actions.unit : []
    const unsel = new Set(Array.isArray(view.unselect) ? view.unselect : [])
    let hasNaval = false, hasGround = false
    for (const u of cand) {
        if (unsel.has(u)) continue
        let p = null
        try { p = pieces[u] } catch (e) {}
        if (!p || p.class === "air") continue
        if (p.class === "naval") hasNaval = true
        else if (p.class === "ground" && (p.asp || p.strat_move)) hasGround = true
    }
    if (!hasGround) return false   // 无两栖地面可激活 → 不会发生无护航登陆
    // no amphibious ground unit to activate → no unescorted landing can occur
    return !hasNaval
}

// ---- 引擎无头推进就近转向 ------------------------------------------------
// ---- engine headless advance nearest-turn ------------------------------------------------
// 供 js/server/offensive.js 调用: 攻击方有主轴时, 用“到焦点的距离”作为
// For js/server/offensive.js: when the attacker has a main axis, use "distance to focus" as the
// 同等优先目标内的次级排序键, 引导地面/海军/登陆沿主轴推进。守卫在无主轴时
// secondary sort key among equally-prioritized targets, guiding ground/naval/landing units along the axis. With no main axis
// (focus null) 返回 -1, 调用方保留原策略无关行为。
// (focus null) return -1 and the caller keeps its original strategy-agnostic behavior.
function eop_advance_tiebreak(hex, faction) {
    if (typeof G === "undefined" || !G) return -1
    const focus = eop_focus_faction(faction)
    if (focus === null) return -1
    return (typeof get_distance === "function") ? get_distance(hex, focus) : -1
}

// 轨迹可读: 主轴 id + 焦点(便于审计 AI 是否聚焦)。
// Readable trace: main axis id + focus (for auditing whether the AI is focused).
function eop_trace(role) {
    const axis = eop_axis(role)
    return { axis: axis ? axis.id : null, axis_note: axis ? axis.note : null, focus: eop_focus(role) }
}

// 激活上限较高时，第5/11页要求“为每个目标编成一个任务部队”。激活窗尚未宣告
// With a higher activation limit, page 5/11 requires "forming a task force per target". The activation window has not yet declared
// 战斗格，不能依赖 battle_hexes 轮换；按每 4 个激活单位（至少两支地面、护航、
// a battle hex, so it can't rely on battle_hexes rotation; pre-assign every 4 activated units (at least two ground, escort,
// 空海支援）预分配到下一个未完成目标，使 8/9 点事件形成两个独立且不过薄的编队。
// air-sea support) to the next incomplete target, so an 8/9-point event forms two independent, not-too-thin formations.
function eop_activation_focus_faction(faction, selectedCount, view, candidates) {
    const role = faction === JP ? "Japan" : "Allies"
    const axis = eop_axis(role)
    if (!axis || !Array.isArray(axis.chain)) return eop_focus(role)
    const pending = axis.chain.filter(h => eop_target_pending(role,h,eop_target_meta(role,h)))
    if (!pending.length) return null
    const first=eop_target_meta(role,pending[0])
    if (first?.strictSequential) return pending[0]
    const eligible=first?.targetGroup!==undefined ? pending.filter(h=>eop_target_meta(role,h)?.targetGroup===first.targetGroup) : pending
    const active=new Set((view?.offensive?.active_units || G.offensive?.active_units || []).flat())
    const available=Array.isArray(candidates)?candidates.filter(u=>!active.has(u)):null
    if(view && available){
        const reserved=new Set()
        for(const h of eligible){
            const meta=eop_target_meta(role,h)
            if(meta?.extraActivationOnly){
                const hq=view.offensive?.active_hq?.[faction] || G.offensive?.active_hq?.[faction]
                if(!hq || get_distance(G.location[hq],h)>Number(pieces[hq]?.cr||0))continue
            }
            if(meta?.requiredUnits){
                if(meta.requiredUnits.every(u=>G.location[u]===h || active.has(u))){
                    meta.requiredUnits.forEach(u=>reserved.add(u));continue
                }
                if(!available.some(u=>eop_unit_matches_target(u,role,meta,h)))continue
                return h
            }
            if(meta?.kind==="GARRISON"){
                let projected=(view.ai?.units||[]).map(u=>({...u}))
                for(const u of projected){
                    if(eop_garrison_satisfied(role,h,meta,projected))break
                    if(active.has(u.id)&&!reserved.has(u.id)&&eop_unit_matches_target(u,role,meta,h)){
                        u.location=h;reserved.add(u.id)
                    }
                }
                if(eop_garrison_satisfied(role,h,meta,projected))continue
            }
            const plan=composeTaskForce(h,null,null,view,available,role)
            if(!plan.complete && plan.unit!==undefined && plan.unit!==null)return h
            // 第一目标不可行（无单位能立即参战）时，不再把本牌激活预算锁死在它身上
            // When the first target is infeasible (no unit can fight immediately), don't lock this card's activation budget onto it
            // 造成 0 激活；继续遍历下一个可行动目标（文档 §7）。extraActivationOnly /
            // causing 0 activations; continue to the next actionable target (doc §7). extraActivationOnly /
            // REDEPLOY / GARRISON 已在前序分支各自 continue/return。
            // REDEPLOY / GARRISON already continue/return in their preceding branches.
        }
        return null
    }
    return eligible[Math.min(eligible.length-1,Math.floor(Math.max(0,Number(selectedCount)||0)/4))]
}

function eop_target_meta(role, hex) {
    const axis = eop_axis(role)
    return axis && Array.isArray(axis.targetMeta) ? axis.targetMeta.find(target => target.hex === hex) || null : null
}

// Shared by activation, task-force composition and actual movement. Semantic
// restrictions remain hard filters even when a preferred candidate is unavailable.
function eop_unit_matches_target(unit, role, meta, target) {
    if (!meta) return true
    const id = typeof unit === "number" ? unit : unit?.id
    const p = typeof unit === "number" ? pieces[unit] : unit
    if (!p || p.faction !== (role === "Japan" ? JP : AP)) return false
    const location = Number.isInteger(p.location) ? p.location : G.location[id]
    if (Array.isArray(meta.requiredUnits) && !meta.requiredUnits.includes(id)) return false
    if (meta.unitFilter === "COMMONWEALTH_OR_US_ARMY" && !["army", "br", "au", "ind", "bu"].includes(p.service)) return false
    if (meta.requiresFriendlyControl && !is_space_controlled(target, p.faction)) return false
    if (meta.kind === "GARRISON") {
        const req = meta.garrisonRequirement
        if (req ? !((req.groundSteps && p.class === "ground") || (req.airSteps && p.class === "air")) : p.class !== (meta.garrisonClass || "ground")) return false
    }
    if (meta.kind === "NAVAL" && p.class !== "naval" && p.class !== "air") return false
    if (meta.targetClasses && p.class !== "air" && p.class !== "naval") return false
    if (meta.escortPairs) {
        if (!meta.escortPairs.some(pair => (pair.ground === id || pair.carrier === id)
            && G.location[pair.ground] === pair.origin && G.location[pair.carrier] === pair.origin)) return false
    }
    if (meta.maxDistance && get_distance(location, target) > meta.maxDistance) return false
    if (meta.preserveLastCarrier && (p.type === "cv" || p.type === "cvl" || p.type === "cve")) {
        let carriers = 0
        for (let u=1;u<pieces.length;u++) if (pieces[u]?.faction===p.faction && /^cv/.test(pieces[u].type||"") && G.location[u]>=0 && G.location[u]<=LAST_BOARD_HEX) carriers++
        if (carriers <= 1) return false
    }
    return true
}

function eop_unit_steps(unit, id) {
    const reduced = typeof unit.reduced === "boolean" ? unit.reduced
        : !!(G.reduced && (typeof set_has === "function" ? set_has(G.reduced,id) : G.reduced.includes(id)))
    return reduced ? 1 : 2
}

// 清单 #24：大部队地面步数 —— 防御强度 lf≥12 才计入；full=2 / reduced=1 step。
// Checklist #24: large-force ground steps — only counted when defense strength lf≥12; full=2 / reduced=1 step.
// 替换「单位枚数」统计：reduced 单位只算 1 step，未减损算 2 step；lf<12 的小单位不计入。
// Replaces the "unit count" statistic: a reduced unit counts 1 step, unreduced counts 2 steps; small units with lf<12 are not counted.
// regionPred 接 region 字符串(与 esm_region 同口径)；regionOf 供单测注入(默认 esm_region)。
// regionPred takes a region string (same caliber as esm_region); regionOf is injectable for unit tests (default esm_region).
function eop_count_large_force_steps(faction, regionPred, regionOf) {
    const region = typeof regionOf === "function" ? regionOf : (typeof esm_region === "function" ? esm_region : h => h)
    let steps = 0
    for (let u = 1; u < pieces.length; ++u) {
        const p = pieces[u], loc = G.location[u]
        if (!p || p.faction !== faction || p.class !== "ground" || Number(p.lf || 0) < 12) continue
        if (!(loc >= 0 && loc <= LAST_BOARD_HEX)) continue
        if (regionPred && !regionPred(region(loc))) continue
        steps += eop_unit_steps(p, u)
    }
    return steps
}
function eop_garrison_satisfied(role, hex, meta, units) {
    const mine=role==="Japan"?JP:AP
    const list=units || pieces.map((p,id)=>p && ({...p,id,location:G.location[id]}))
    const at=list.filter(p=>p && p.faction===mine && p.location===hex)
    const req=meta.garrisonRequirement
    if (!req) return at.some(p=>p.class===(meta.garrisonClass||"ground"))
    const checks=[]
    for(const cls of ["ground","air"]) if(req[cls+"Steps"]) checks.push(at.filter(p=>p.class===cls).reduce((n,p)=>n+eop_unit_steps(p,p.id),0)>=req[cls+"Steps"])
    return checks.length>0 && (req.operator==="OR" ? checks.some(Boolean) : checks.every(Boolean))
}
function eop_target_pending(role, hex, meta) {
    const mine=role==="Japan"?JP:AP
    if (!meta) return !is_space_controlled(hex,mine)
    if ((meta.ignoreIfEnemy || meta.requiresFriendlyControl || meta.kind==="GARRISON") && !is_space_controlled(hex,mine)) return false
    if (meta.kind==="GARRISON") return !eop_garrison_satisfied(role,hex,meta)
    if (meta.kind==="REDEPLOY" && meta.requiredUnits) return meta.requiredUnits.some(u=>G.location[u]>=0 && G.location[u]<=LAST_BOARD_HEX && G.location[u]!==hex)
    if (meta.kind==="REDEPLOY") return true
    if (meta.kind==="NAVAL" || meta.targetClasses) return pieces.some((p,u)=>p && p.faction!==mine && G.location[u]===hex && (meta.targetClasses ? meta.targetClasses.some(c=>c===p.class || c==="carrier"&&/^cv/.test(p.type||"")) : p.class==="naval"))
    if (meta.kind==="SUPPRESS" || meta.kind==="SUPPRESS_HQ") return !!(meta.requiresOccupation && !is_space_controlled(hex,mine)) || (typeof has_zoi==="function" && has_zoi(hex,1-mine))
    return !is_space_controlled(hex,mine)
}

// 清单 #19：目标完成判定的唯一口径。按目标类型分派——SUPPRESS/SUPPRESS_HQ→AZOI 覆盖
// Checklist #19: the single source of truth for target completion. Dispatch by target type — SUPPRESS/SUPPRESS_HQ→AZOI coverage
// (has_zoi) 或夺控；GARRISON→驻军步数；NAVAL→清除敌海军；REDEPLOY→requiredUnits 到位；
// (has_zoi) or capture; GARRISON→garrison steps; NAVAL→clear enemy naval; REDEPLOY→requiredUnits in place;
// 其余(CONTROL/CONQUEST)→己方控制。禁止把战略目标一律简化成「占格」。= !eop_target_pending。
// everything else (CONTROL/CONQUEST)→friendly control. Never reduce strategic targets to "capture the hex". = !eop_target_pending.
function eop_is_target_complete(role, hex, meta) {
    return !eop_target_pending(role, hex, meta)
}

// 一张 EC 可为多个目标分别编成任务部队。当前首要目标已经建立战斗格后，
// One EC can form task forces for multiple targets. Once the current primary target has established a battle hex,
// 后续“有地面占领能力”的编队应沿同一图表链转向下一未完成且尚未宣战的
// later "ground-capable occupation" formations should turn along the same chart chain to the next incomplete, not-yet-declared
// 目标；航空兵/航母的格外远程投入仍由 choose_attack_hex 优先支援首要格。
// target; extra long-range commitment of air/carrier is still prioritized by choose_attack_hex to support the primary hex.
function eop_next_focus_faction(faction, excludedHexes, recordedPlan) {
    const role=faction===JP?"Japan":"Allies"
    const axis=recordedPlan&&Array.isArray(recordedPlan.chain)
        ?{chain:recordedPlan.chain,targetMeta:recordedPlan.targetMeta||[]}:eop_axis(role)
    if(!axis||!Array.isArray(axis.chain))return null
    const excluded=new Set(Array.isArray(excludedHexes)?excludedHexes:[])
    const current=recordedPlan&&Number.isInteger(recordedPlan.focus)?recordedPlan.focus:eop_focus(role)
    const metadata=h=>axis.targetMeta?.find(x=>x.hex===h)||null
    const pending=axis.chain.filter(h=>eop_target_pending(role,h,metadata(h)))
    if(!pending.length)return null
    const first=metadata(pending[0])
    if(first?.strictSequential)return null
    const eligible=first?.targetGroup!==undefined?pending.filter(h=>metadata(h)?.targetGroup===first.targetGroup):pending
    for(const h of eligible) if(h!==current&&!excluded.has(h))return {hex:h,meta:metadata(h)}
    return null
}

// 已在东京 8 格内盟军机场待命的 B29 是战略轰炸胜利链的必要资产。普通攻势若再次
// A B29 already staged at an Allied airfield within 8 hexes of Tokyo is a necessary asset for the strategic bombing victory chain. If a normal offensive
// 激活它，无头移动层只能把纯航空编成送回下一回合轨，导致下一战略轰炸阶段缺席。
// re-activates it, the headless movement layer can only send the pure-air formation back to the next-turn track, causing it to miss the next strategic bombing phase.
// 因此把“已就位且格内无日军”的 B29 从普通激活候选中保护起来。
// So protect a B29 that is "already positioned with no Japanese unit in the hex" from normal activation candidates.
function eop_preserve_ready_b29(u, role) {
    if (role !== "Allies") return false
    const p = pieces[u], h = G.location[u]
    if (!p || !p.b29 || !(h >= 0 && h <= LAST_BOARD_HEX)) return false
    const md = get_map_data(h)
    if (!md || !md.airfield || !is_space_controlled(h, AP) || get_distance(h, TOKYO) > 8) return false
    for (let x = 1; x < pieces.length; ++x)
        if (pieces[x] && pieces[x].faction === JP && G.location[x] === h) return false
    return true
}

// 防止“夏威夷航空兵折返跑”。若一支盟军航空兵仍在有 HQ 的远后方基地，而当前
// Prevent the "Hawaii air unit shuttle run". If an Allied air unit is still at a far-rear base with an HQ, and the current
// 图表目标超出它本次移动后仍可投入战斗的范围，激活它不会给当前任务部队增加
// chart target is beyond the range where it can still join combat after this move, activating it adds no combat strength to the current task force;
// 战力；移动器随后只能把它送回原基地，白白消耗激活点。这里仅排除这种不可达
// the mover can then only send it back to its original base, wasting an activation point. This only excludes such unreachable
// 候选，不阻止它在目标进入可达范围后出击，也不影响 B29 专用保护。
// candidates — it neither prevents it from sortieing once the target is within reach, nor affects the B29-specific protection.
function eop_preserve_rear_air(u, role, target) {
    if (role !== "Allies" || !Number.isInteger(target)) return false
    const p = pieces[u], h = G.location[u]
    if (!p || p.class !== "air" || !(h >= 0 && h <= LAST_BOARD_HEX)) return false
    let hasHq = false
    for (let x = 1; x < pieces.length; ++x) {
        if (pieces[x] && pieces[x].faction === AP && pieces[x].class === "hq" && G.location[x] === h) {
            hasHq = true
            break
        }
    }
    if (!hasHq) return false
    const extended = Math.max(1, Number(p.ebr) || Number(p.br) || 1)
    // 一次航空移动最多把距离缩短 extended；随后还须在 extended 内支援会战。
    // One air move can shorten the distance by at most extended; it must then support the battle within extended.
    if (get_distance(h, target) <= extended * 2) return false
    // R9：距目标超过一移+一攻的后方航空兵，只有当它能沿机场链多段转场到「攻击航程内」
    // R9: a rear air unit more than one-move + one-attack away from the target is only pushed forward if it can multi-leg transfer along an airfield chain to an airfield
    // 的机场（下一会战即可投入）才前推；仅「更靠近但仍够不着」的一格格空跑不再放行，
    // "within attack range" (ready to join the next battle); a single-hex hop that merely gets "closer but still out of reach" is no longer allowed,
    // 否则夏威夷空军每回合被激活向前挪一格、下一回合又够不着，形成折返跑。前推本身
    // otherwise the Hawaii air force would be activated each turn to hop one hex forward yet still be out of reach next turn, forming a shuttle run. The push itself
    // 走 eop_pick_forward_unit 的故意战略转移，而非把它塞进立即参战编队。
    // goes through eop_pick_forward_unit's deliberate strategic transfer, not stuffing it into an immediate-combat formation.
    if (typeof queryAirTransferReachability === "function") {
        try {
            const transfer = queryAirTransferReachability(u)
            for (const hex of transfer.reachableHexes) {
                if (get_distance(hex, target) <= extended) return false
            }
        } catch (e) { /* 查询失败保守保护，避免折返跑 / conservative protection on query failure, avoid shuttle run */ return true }
    }
    return true
}

// Public-view planning interfaces used by the chart executor. They deliberately
// consume view.ai/public legal candidates rather than the mutable game state.
function evaluateTargetFeasibility(target, card, hq, view) {
    const units=Array.isArray(view?.ai?.units)?view.ai.units:[], roleFaction=view?.active === "Allies" ? AP : JP
    const meta=eop_target_meta(view?.active,target)
    const cf=u=>u.reduced?(Number(u.rcf)||Math.ceil((Number(u.cf)||0)/2)):(Number(u.cf)||0)
    const allDefenders=units.filter(u=>u.location===target&&u.faction!==roleFaction)
    const defenders=meta?.kind==="SUPPRESS_HQ"?allDefenders.filter(u=>u.class==="air"||u.class==="naval"):allDefenders
    const defense=defenders.reduce((s,u)=>s+cf(u),0)
    const md=(target!==null&&target!==undefined&&typeof get_map_data==="function")?get_map_data(target):null
    const damageLevel=meta?.damageLevel||0.5
    const suppress=meta?.kind==="SUPPRESS"||meta?.kind==="SUPPRESS_HQ"
    const requiresOccupation=!!meta?.requiresOccupation
    const coastal=!!(md&&(md.port||md.island))
    const amphibious=determineBattleMode(target,roleFaction).amphibious
    // 第5/11页：兵力标准须把可能反应的敌军计入。以公开单位的战斗航程筛出能到目标的
    // Page 5/11: the force standard must count enemy units that could react. Use public units' combat range to filter the
    // 航空/海军，并计入其中最强一支，避免把一架飞机对现有守军刚好达标误判为完整编队。
    // air/naval units that can reach the target, and count the single strongest of them, avoiding misjudging one plane exactly matching the current garrison as a complete formation.
    const reactionPool=units.filter(u=>u.faction!==roleFaction&&u.location!==target&&(u.class==="air"||u.class==="naval")
        && typeof get_distance==="function"&&get_distance(u.location,target)<=Math.max(1,Number(u.br)||Number(u.ebr)||1))
    // 提示板要求把所有能够反应到目标的敌军纳入伤害等级，而不是只取最强一支。
    // The reference board requires including all enemy units able to react to the target in the damage level, not just the single strongest.
    const potentialReactionStrength=reactionPool.reduce((s,u)=>s+cf(u),0)
    const airSeaDefense=defenders.filter(u=>u.class==="air"||u.class==="naval").reduce((s,u)=>s+cf(u),0)
    const relevantDefense=(requiresOccupation?airSeaDefense:defense)+potentialReactionStrength
    return {target,meta,damageLevel,legal:target!==null&&target!==undefined,coastal,amphibious,defense,suppress,requiresOccupation,
        garrisonClass:meta?.garrisonClass||null,
        groundDefense:defenders.filter(u=>u.class==="ground").reduce((s,u)=>s+cf(u),0),
        airSeaDefense,
        potentialReaction:potentialReactionStrength>0,potentialReactionStrength,
        requiredGroundMath:Math.max(1,defenders.filter(u=>u.class==="ground").reduce((s,u)=>s+cf(u),0)),
        requiredAirSeaMath:Math.max(1,Math.ceil(relevantDefense/damageLevel))}
}
// ---- Page 5 / Page 11 任务部队 predicate 精确化 (PR2) ----------------------
// ---- Page 5 / Page 11 task-force predicate refinement (PR2) ----------------------
// 与 evaluateTargetFeasibility 的粗代理不同，这些求值器只依赖 RTT 规则查询层
// Unlike evaluateTargetFeasibility's rough proxy, these evaluators rely only on the RTT rule query layer
// (rules_query.js) 的精确合法性/移动/反应结果，不再用 aiStage/aiBattle/resource/
// (rules_query.js) for exact legality/move/reaction results, no longer using aiStage/aiBattle/resource/
// get_distance 作为“能不能打”的代理。返回 undefined 表示该谓词在当前状态不可判定，
// get_distance as a proxy for "can it fight". Returning undefined means the predicate is undecidable in the current state,
// 由 predicate_value 退回 view.ai.predicates 兜底。
// falling back to view.ai.predicates via predicate_value.

const EOP_EXACT_TASKFORCE_PREDICATES = [
    "CAN_GROUND_ADVANCE", "GROUND_CAN_ENTER_EXIT", "TARGET_IS_SR",
    "ENEMY_AIR_OR_CARRIER_CAN_REACT", "ENEMY_NAVAL_GROUND_CAN_REACT",
    "FORCE_MEETS_BATTLE_SUPPORT_STANDARD", "TARGET_DAMAGE_LEVEL_MET",
]

// 单位当前战斗值（减损用 rcf，否则 cf）。
// Unit's current combat value (rcf when reduced, otherwise cf).
function eop_unit_cf(u) {
    return u.reduced ? (Number(u.rcf) || Math.ceil((Number(u.cf) || 0) / 2)) : (Number(u.cf) || 0)
}

// 地面单位进入目标后仍能合法退出：进入合法，且至少存在一个相邻合法可达格。
// A ground unit can still legally exit after entering the target: entry is legal and at least one adjacent legal reachable hex exists.
function eop_can_ground_enter_exit(unitId, target, reach) {
    const canEnter = !!reach.costByHex[target]
    if (!canEnter) return { canEnter: false, canExit: false, entryCost: undefined, exitHexes: [] }
    const md = get_map_data(target)
    const neighbors = (md && Array.isArray(md.nh)) ? md.nh : []
    const exitHexes = neighbors.filter(n => Number.isInteger(n) && n !== target && reach.costByHex[n] !== undefined)
    return { canEnter: true, canExit: exitHexes.length > 0, entryCost: reach.costByHex[target], exitHexes }
}

// 战斗模式判定（文档 §5/R7）：区分「两栖登陆」与「相邻陆路地面推进」。
// Battle-mode determination (doc §5/R7): distinguishes "amphibious landing" from "adjacent overland ground advance".
// 引擎地图 data_map.js 用 island:true 标记无陆路、须两栖登陆的格（冲绳/硫磺岛/塞班/
// The engine map data_map.js uses island:true to mark hexes with no overland route that require amphibious landing (Okinawa/Iwo Jima/Saipan/
// 马尔代夫等）；沿岸但非岛的敌控港口/城市格可经陆路相邻进入，属 GROUND_ADVANCE，
// Maldives etc.); a coastal-but-not-island enemy-controlled port/city hex can be entered overland from an adjacent hex, classified GROUND_ADVANCE,
// 不应被强制要求海军护航。faction/opts 预留：Phase 5 用真实移动路径细化时传入。
// and must not be forced to require naval escort. faction/opts are reserved: passed in when Phase 5 refines with real movement paths.
function determineBattleMode(target, faction, opts) {
    const md = (target !== null && target !== undefined && Number.isInteger(target)) ? get_map_data(target) : null
    const amphibious = !!(md && md.island)
    return { mode: amphibious ? "AMPHIBIOUS_ASSAULT" : "GROUND_ADVANCE", amphibious, island: !!(md && md.island) }
}

// 战斗支援标准：只判兵种构成，不判总战斗力（与 Damage Level 拆开）。
// Battle support standard: only checks unit-class composition, not total combat strength (separated from Damage Level).
function eop_meets_battle_support_standard(meta, activeUnits, target, faction) {
    const hasGround = activeUnits.some(u => u.class === "ground")
    const hasNaval = activeUnits.some(u => u.class === "naval")
    const hasRangedSupport = activeUnits.some(u => u.class === "air" || (u.class === "naval" && Number(u.br) > 0))
    const requiresOccupation = !!(meta && meta.requiresOccupation)
    const suppress = !!(meta && (meta.kind === "SUPPRESS" || meta.kind === "SUPPRESS_HQ"))
    // 沿岸≠两栖：只有岛屿（无陆路）才须两栖登陆并要求海军护航；相邻陆路可进的
    // Coastal ≠ amphibious: only islands (no overland route) require amphibious landing and naval escort; an enemy-controlled
    // 敌控港口/沿岸格是地面推进，不要求海军（文档 §5/R7）。
    // port/coastal hex enterable overland from an adjacent hex is a ground advance and does not require naval units (doc §5/R7).
    const amphibious = determineBattleMode(target, faction).amphibious
    const landing = requiresOccupation && amphibious && !is_space_controlled(target, faction)
    const missing = []
    if (requiresOccupation && !hasGround) missing.push("ground")
    if (landing && !hasNaval) missing.push("naval")
    if (suppress && !hasRangedSupport) missing.push("air-sea")
    return { met: missing.length === 0, missing }
}

// 伤害等级：攻击有效战斗力是否达到目标 Damage Level；占领目标另须地面 2x 生存。
// Damage level: whether the attack's effective combat strength meets the target's Damage Level; occupation targets additionally require ground 2x survival.
function eop_evaluate_damage_level(meta, attackers, defenders, reactionIds, byId, target, reactionStrengthOverride) {
    const cf = eop_unit_cf
    const requiresOccupation = !!(meta && meta.requiresOccupation)
    const damageLevel = (meta && meta.damageLevel) || 1
    const airSeaDefense = defenders.filter(u => u.class === "air" || u.class === "naval").reduce((s, u) => s + cf(u), 0)
    const groundDefense = defenders.filter(u => u.class === "ground").reduce((s, u) => s + cf(u), 0)
    const totalDefense = airSeaDefense + groundDefense
    // 反应兵力默认按精确反应候选逐个累计；reactionStrengthOverride 供无引擎查询层
    // Reaction strength is by default accumulated from exact reaction candidates one by one; reactionStrengthOverride is for when there is no engine query layer
    // (单测 vm 沙箱) 时回退到 evaluateTargetFeasibility 的航程粗筛值。
    // (unit-test vm sandbox), falling back to evaluateTargetFeasibility's range-based rough value.
    const reactionStrength = reactionStrengthOverride !== undefined ? reactionStrengthOverride
        : (reactionIds || []).reduce((s, id) => { const u = byId.get(id); return s + (u ? cf(u) : 0) }, 0)
    const attackerAirSea = attackers.filter(u => u.class === "air" || u.class === "naval").reduce((s, u) => s + cf(u), 0)
    const attackerGround = attackers.filter(u => u.class === "ground").reduce((s, u) => s + cf(u), 0)
    const relevantDefense = (requiresOccupation ? airSeaDefense : totalDefense) + reactionStrength
    const airSeaMet = attackerAirSea >= Math.ceil(relevantDefense / damageLevel)
    // 2x 生存不再作为「能否进攻」的硬门槛（文档 §4）：它把「敌方取得 2x 战果后仍有一个
    // 2x survival is no longer a hard threshold for "can it attack" (doc §4): it wrongly equates "one attacking ground unit
    // 攻击地面单位存活」错误等价成「攻击地面 CF ≥ 2× 防守地面 CF」，会严重压制进攻。
    // survives after the enemy scores 2x results" with "attacking ground CF ≥ 2× defending ground CF", severely suppressing attacks.
    // groundSurvivalMet 仍返回，供风险评分/排序使用，但不参与 met 判定。
    // groundSurvivalMet is still returned for risk scoring/sorting, but does not participate in the met judgment.
    const groundSurvivalMet = !requiresOccupation ? true : (attackerGround >= Math.max(1, 2 * groundDefense))
    // #8：占领目标的 met 必须同时判「地面能否吃掉守军」。此前只比空海战力，地面不足也判
    // #8: occupation-target met must also check "can ground eliminate the defenders". Previously only air-sea strength was compared, so insufficient ground was still judged
    // complete → 少得登不下来还硬上 → 成功夺格率过低。按 ground_battle_table(期望乘数≈1.05)
    // complete → forcing a landing that can't be sustained → capture success rate too low. Use ground_battle_table (expected multiplier ≈1.05)
    // 取 1:1 为最低可攻门槛，不用 2x 硬闸(会压制进攻)；空岛只需任一地面 CF≥1 即可占领。
    // taking 1:1 as the minimum attackable threshold, not the 2x hard gate (which suppresses attacks); an empty island needs only any ground CF≥1 to occupy.
    // 地面战力判定不得除 damageLevel：damageLevel 是「空海压制等级」(SUPPRESS_HQ 马尼拉=0.25、
    // The ground-strength check must not divide by damageLevel: damageLevel is the "air-sea suppression level" (SUPPRESS_HQ Manila=0.25,
    // 新加坡=0.5)，只约束空海 damage level，与地面 step-loss 战果表(乘数≈1.05)无关。把它
    // Singapore=0.5), only constraining the air-sea damage level, unrelated to the ground step-loss result table (multiplier ≈1.05). Dividing it
    // 除进地面门槛会让马尼拉要求 4× 地面、新加坡 2×，导致日军陆军迟迟不上马尼拉/新加坡。
    // into the ground threshold would require 4× ground for Manila and 2× for Singapore, causing the Japanese army to delay attacking Manila/Singapore.
    const groundMet = !requiresOccupation || attackerGround >= Math.max(1, groundDefense)
    const met = airSeaMet && groundMet
    return { met, airSeaMet, groundMet, groundSurvivalMet, attackerAirSea, attackerGround, airSeaDefense, groundDefense, reactionStrength }
}

// ============================================================================
// Page 6 / Page 12 反应与 PBM 精确求值器 (PR4)
// Page 6 / Page 12 reaction and PBM exact evaluator (PR4)
// ============================================================================

// 反应兵力标准 (清单 #11)：纯函数，无引擎全局依赖，可经 vm 单测。
// Reaction force standard (checklist #11): pure function, no engine-global dependency, unit-testable via vm.
// 返回 { airSeaOneXMet, airCountMet, groundTwoXRequired, groundTwoXMet, complete }。
// Returns { airSeaOneXMet, airCountMet, groundTwoXRequired, groundTwoXMet, complete }.
//   airSeaOneXMet   己方空海战斗力 ≥ 敌方空海战斗力 (1x 标准)
//   airSeaOneXMet   own air-sea combat strength ≥ enemy air-sea combat strength (1x standard)
//   airCountMet     己方空军数量 ≥ 敌方空军数量
//   airCountMet     own air count ≥ enemy air count
//   groundTwoXRequired  D10 0-4 → 地面须 2x 生存；5-9 → 无地面要求 (图表 1-4/5-9, 0 按低段)
//   groundTwoXRequired  D10 0-4 → ground must survive 2x; 5-9 → no ground requirement (chart 1-4/5-9, 0 treated as low band)
//   groundTwoXMet   己方地面 CF ≥ 2× 敌方地面 CF (无地面要求时恒 true)
//   groundTwoXMet   own ground CF ≥ 2× enemy ground CF (always true when no ground requirement)
function eop_evaluate_reaction_force_standard(input) {
    const sel = (input && input.selectedReactionUnits) || []
    const atk = (input && input.attackingUnits) || []
    const d10 = (input && Number.isInteger(input.d10)) ? input.d10 : 5
    const cf = eop_unit_cf
    const ownAS = sel.filter(u => u.class === "air" || u.class === "naval").reduce((s, u) => s + cf(u), 0)
    const enemyAS = atk.filter(u => u.class === "air" || u.class === "naval").reduce((s, u) => s + cf(u), 0)
    const ownAir = sel.filter(u => u.class === "air").length
    const enemyAir = atk.filter(u => u.class === "air").length
    const airSeaOneXMet = ownAS >= enemyAS
    const airCountMet = ownAir >= enemyAir
    const groundTwoXRequired = d10 <= 4
    const ownGround = sel.filter(u => u.class === "ground").reduce((s, u) => s + cf(u), 0)
    const enemyGround = atk.filter(u => u.class === "ground").reduce((s, u) => s + cf(u), 0)
    const groundTwoXMet = !groundTwoXRequired || ownGround >= Math.max(1, 2 * enemyGround)
    const complete = airSeaOneXMet && airCountMet && groundTwoXMet
    return { airSeaOneXMet, airCountMet, groundTwoXRequired, groundTwoXMet, complete }
}

// 天气反应标准 (清单 #13)：d10 < 2×真实激活单位数 (CDSS 例：4 个移动单位→需掷 < 8)。
// Weather reaction standard (checklist #13): d10 < 2× real activated unit count (CDSS example: 4 moving units → need to roll < 8).
// 输入只用真实激活单位数 + D10 + 情报修正(奇袭 -2)；禁止会战格数 / Logistic Value / 代理值。
// Input uses only the real activated unit count + D10 + intelligence modifier (surprise -2); battle-hex count / Logistic Value / proxies are forbidden.
function eop_weather_reaction_standard(input) {
    const activatedCount = Math.max(0, Number((input && input.activatedCount) || 0))
    const die = (input && Number.isInteger(input.die)) ? input.die : 9
    const surprise = !!(input && input.surprise)
    return (die - (surprise ? 2 : 0)) < activatedCount * 2
}

// 潜艇目标优先级 (清单 #15)：CV→BB→CA→DD；同类按防御值(lf)降序，稳定 id 破平。
// Submarine target priority (checklist #15): CV→BB→CA→DD; within a class by defense value (lf) descending, stable id breaks ties.
// 输入来自 querySubmarineTargets().legalTargets，只排序不造目标。
// Input comes from querySubmarineTargets().legalTargets; only sorts, never fabricates targets.
function eop_pick_submarine_target(legalTargets) {
    if (!Array.isArray(legalTargets) || !legalTargets.length) return undefined
    const rank = u => { const t = String(u.type || u.name || "").toLowerCase(); return /^cv/.test(t) ? 0 : /bb/.test(t) ? 1 : /^ca/.test(t) ? 2 : /dd/.test(t) ? 3 : 4 }
    return legalTargets.slice().sort((a, b) => rank(a) - rank(b)
        || (Number(b.lf) || 0) - (Number(a.lf) || 0)
        || (a.id ?? 0) - (b.id ?? 0))[0]
}

// 精确求值 7 个任务部队 predicate（只读；返回 undefined 表示退回兜底）。
// Exact evaluation of 7 task-force predicates (read-only; returning undefined means falling back).
function eop_exact_taskforce_predicates(view, context) {
    const out = {}
    for (const id of EOP_EXACT_TASKFORCE_PREDICATES) out[id] = undefined
    if (!view || !view.ai) return out
    const role = context && context.role ? context.role : view.active
    const faction = role === "Japan" ? JP : AP
    const enemy = 1 - faction
    const target = view.ai.focus
    if (target === null || target === undefined || !Number.isInteger(target)) return out
    if (typeof G === "undefined" || !G || !G.offensive || !Array.isArray(G.offensive.active_cards) || !G.offensive.active_cards[0]) return out
    const units = Array.isArray(view.ai.units) ? view.ai.units : []
    const byId = new Map(units.map(u => [u.id, u]))
    const meta = eop_target_meta(role, target)
    const activeIds = (G.offensive.active_units && Array.isArray(G.offensive.active_units[faction])) ? G.offensive.active_units[faction].slice() : []
    const activeUnits = activeIds.map(id => byId.get(id)).filter(Boolean)
    const defenders = units.filter(u => u.location === target && u.faction === enemy)

    // 反应候选（精确）。
    // Reaction candidates (exact).
    const reaction = queryReactionCandidates({ reactionFaction: enemy, targetHex: target })
    const reactionIds = reaction.air.concat(reaction.carrier, reaction.naval, reaction.ground)
    out.ENEMY_AIR_OR_CARRIER_CAN_REACT = (reaction.air.length + reaction.carrier.length) > 0
    out.ENEMY_NAVAL_GROUND_CAN_REACT = (reaction.naval.length + reaction.ground.length) > 0

    // SR。
    out.TARGET_IS_SR = !!querySpecialReaction({ reactingFaction: enemy, target }).eligible

    // 地面可达性（精确）：存在能合法推进到目标的己方地面单位。
    // Ground reachability (exact): whether an own ground unit can legally advance to the target.
    let canGroundAdvance = false
    let groundCanEnterExit = false
    for (const u of units) {
        if (u.faction !== faction || u.class !== "ground") continue
        if (!Number.isInteger(u.location) || u.location < 0 || u.location > LAST_BOARD_HEX) continue
        const reach = queryGroundReachability(u.id, { move_type: ANY_MOVE })
        if (reach.reachableHexes && reach.reachableHexes.indexOf(target) >= 0) {
            canGroundAdvance = true
            if (eop_can_ground_enter_exit(u.id, target, reach).canExit) groundCanEnterExit = true
        }
    }
    out.CAN_GROUND_ADVANCE = canGroundAdvance
    out.GROUND_CAN_ENTER_EXIT = groundCanEnterExit

    // 支援标准（兵种构成）与伤害等级（战斗力 + 地面 2x 生存）。
    // Support standard (unit-class composition) and damage level (combat strength + ground 2x survival).
    const support = eop_meets_battle_support_standard(meta, activeUnits, target, faction)
    out.FORCE_MEETS_BATTLE_SUPPORT_STANDARD = support.met
    const dmg = eop_evaluate_damage_level(meta, activeUnits, defenders, reactionIds, byId, target)
    out.TARGET_DAMAGE_LEVEL_MET = dmg.met

    return out
}

// 第6/12页反应 predicate 精确求值 (PR4)。只读；返回 undefined 表示退回 view.ai.predicates。
// Exact evaluation of the page 6/12 reaction predicates (PR4). Read-only; returning undefined means falling back to view.ai.predicates.
const EOP_EXACT_REACTION_PREDICATES = [
    "REACTION_FORCE_STANDARD_MET", "WEATHER_STANDARD_MET",
    "EARLY_DEFENSE_DONE_AND_KAMIKAZE_STANDARD",
    "HAS_VALID_SUBMARINE_TARGET", "HAS_SUBMARINE_CARD_AND_TARGET",
]

function eop_exact_reaction_predicates(view, context, nodeId) {
    const out = {}
    for (const id of EOP_EXACT_REACTION_PREDICATES) out[id] = undefined
    if (!view || !view.ai) return out
    if (typeof G === "undefined" || !G || !G.offensive) return out
    const role = context && context.role ? context.role : view.active
    const faction = role === "Japan" ? JP : AP
    const enemy = 1 - faction
    if (nodeId === undefined || nodeId === null) nodeId = context && context.nodeId
    const units = Array.isArray(view.ai.units) ? view.ai.units : []
    const byId = new Map(units.map(u => [u.id, u]))
    const seed = context && context.seed, ordinal = context && context.actionOrdinal
    const hash = text => (typeof erasmus_hash === "function" ? erasmus_hash(text) % 10 : 5)

    // WEATHER_STANDARD_MET：真实攻击方激活单位数 + D10 + 情报修正(奇袭)。
    // WEATHER_STANDARD_MET: real attacker activated unit count + D10 + intelligence modifier (surprise).
    const attackingIds = (Array.isArray(G.offensive.active_units) && Array.isArray(G.offensive.active_units[enemy])) ? G.offensive.active_units[enemy] : []
    out.WEATHER_STANDARD_MET = eop_weather_reaction_standard({
        activatedCount: attackingIds.length,
        die: hash(`${seed}:${ordinal}:${nodeId}:WEATHER-D10`),
        surprise: G.offensive.intelligence === SURPRISE,
    })

    // REACTION_FORCE_STANDARD_MET：己方可反应候选 vs 攻击方已承诺单位。
    // REACTION_FORCE_STANDARD_MET: own reactable candidates vs attacker's committed units.
    if (Array.isArray(G.offensive.battle_hexes) && G.offensive.battle_hexes.length) {
        const attackingUnits = attackingIds.map(id => byId.get(id)).filter(Boolean)
        let reactionUnits = []
        if (typeof queryReactionCandidates === "function") {
            try {
                const reaction = queryReactionCandidates({ reactionFaction: faction })
                reactionUnits = reaction.air.concat(reaction.carrier, reaction.naval, reaction.ground).map(id => byId.get(id)).filter(Boolean)
            } catch (e) { reactionUnits = [] }
        }
        const std = eop_evaluate_reaction_force_standard({
            selectedReactionUnits: reactionUnits, attackingUnits,
            d10: hash(`${seed}:${ordinal}:${nodeId}:RF-D10`),
        })
        out.REACTION_FORCE_STANDARD_MET = std.complete
    }

    // 神风标准 (清单 #14)：合法 BB/CV 目标 + 可减损日军航空单位。
    // Kamikaze standard (checklist #14): legal BB/CV target + a reducible Japanese air unit.
    let kamikazeMet = false
    if (typeof queryKamikazeStandard === "function") {
        try { kamikazeMet = !!queryKamikazeStandard().met } catch (e) { kamikazeMet = false }
    }
    // 潜艇合法目标 (清单 #15)：攻击方已承诺海军单位。
    // Submarine legal target (checklist #15): the attacker's committed naval units.
    let subTargets = []
    if (typeof querySubmarineTargets === "function") {
        try { subTargets = querySubmarineTargets({ attackerFaction: enemy }).legalTargets || [] } catch (e) { subTargets = [] }
    }
    out.HAS_VALID_SUBMARINE_TARGET = subTargets.length > 0
    out.HAS_SUBMARINE_CARD_AND_TARGET = out.HAS_VALID_SUBMARINE_TARGET && !!view.ai.predicates.HAS_SUBMARINE_CARD
    // I+J：早期防御完成 + 神风标准。早期防御完成取战略层权威信号，缺省退回 false
    // I+J: early defense done + kamikaze standard. Early-defense-done takes the strategic layer's authoritative signal, defaulting to false
    // (不擅自把"有神风卡"当成"满足神风标准")。
    // (never treating "has a kamikaze card" as "meets the kamikaze standard" on its own).
    const earlyDefenseDone = typeof eop_early_defense_done === "function" ? !!eop_early_defense_done(role, view, context) : false
    out.EARLY_DEFENSE_DONE_AND_KAMIKAZE_STANDARD = earlyDefenseDone && kamikazeMet

    return out
}

// 日本"早期防御完成"：第6页 I 框。取第1页 B 框"DEI 投降格全部占领"同一口径——
// Japan's "early defense done": page 6 box I. Uses the same criterion as page 1 box B "all DEI surrender hexes occupied" —
// 早期南方扩张/防御圈完成即视为早期防御完成。无权威信号时保守返回 false。
// completion of the early southern expansion/defense perimeter counts as early defense done. Conservatively returns false when there is no authoritative signal.
function eop_early_defense_done(role, view, context) {
    if (role !== "Japan") return false
    if (typeof nations === "undefined" || !nations || !nations.DEI || !Array.isArray(nations.DEI.keys)) return false
    try { return nations.DEI.keys.every(k => is_space_controlled(hex_to_int(k), JP)) } catch (e) { return false }
}

// 战略层残余启发式精确化 (PR5)。清单 #19/#22/#23/#25：IS_LAST_TARGET/CBI_DEFENSE_COMPLETE/
// Strategic-layer residual heuristic refinement (PR5). Checklists #19/#22/#23/#25: IS_LAST_TARGET/CBI_DEFENSE_COMPLETE/
// ORANGE_PLAN_CRITERIA/PERIMETER_TARGET_1_COMPLETE 在全战役态已由 erasmus_state 精确求值，
// ORANGE_PLAN_CRITERIA/PERIMETER_TARGET_1_COMPLETE are already exactly evaluated by erasmus_state in full-campaign mode,
// 但 game.js 的 view.ai.predicates 兜底把它们强制为 false(SP/Burma 兼容态)或按「占格/有会战」
// but game.js's view.ai.predicates fallback forces them to false (SP/Burma compatibility mode) or computes them coarsely
// 粗算(IS_LAST_TARGET)。此处把同一精确求值器接到 predicate_value 优先层：不可判定时返回
// as "hex captured / has battle" (IS_LAST_TARGET). Here the same exact evaluator is wired into predicate_value's priority layer: when undecidable it returns
// undefined → 退回 view.ai.predicates，不擅自造值。
// undefined → fall back to view.ai.predicates, never fabricating a value.
const EOP_EXACT_STRATEGIC_PREDICATES = [
    "IS_LAST_TARGET", "CBI_DEFENSE_COMPLETE", "ORANGE_PLAN_CRITERIA", "PERIMETER_TARGET_1_COMPLETE",
]

function eop_exact_strategic_predicates(view, context, nodeId) {
    const out = {}
    for (const id of EOP_EXACT_STRATEGIC_PREDICATES) out[id] = undefined
    if (typeof G === "undefined" || !G) return out
    const role = context && context.role ? context.role : view && view.active
    if (role !== "Japan" && role !== "Allies") return out

    // IS_LAST_TARGET：主轴链上唯一尚未完成的目标数 === 1。完成判定统一走
    // IS_LAST_TARGET: the number of incomplete targets on the main-axis chain === 1. Completion uniformly goes through
    // eop_is_target_complete(不再把 SUPPRESS/AZOI 等目标简化成「占格」)。
    // eop_is_target_complete (no longer reducing SUPPRESS/AZOI etc. targets to "capture the hex").
    if (typeof eop_is_target_complete === "function" && typeof eop_axis === "function") {
        try {
            const axis = eop_axis(role)
            if (axis && Array.isArray(axis.chain) && axis.chain.length) {
                const pending = axis.chain.filter(h => !eop_is_target_complete(role, h, eop_target_meta(role, h)))
                out.IS_LAST_TARGET = pending.length === 1
            }
        } catch (e) { /* 保持 undefined → 兜底 / keep undefined → fallback */ }
    }

    // CBI / Orange / Perimeter：复用 erasmus_state 权威 ctx(与全战役态同源)。
    // CBI / Orange / Perimeter: reuse erasmus_state's authoritative ctx (same source as full-campaign mode).
    if (typeof esm_build_ctx === "function") {
        try {
            const seed = (context && context.seed) || ""
            const ctx = esm_build_ctx(role, null, `${seed}:${nodeId || ""}:strategic`)
            if (role === "Japan") {
                out.PERIMETER_TARGET_1_COMPLETE = !!ctx.jp_M_perimeter_target_1_complete
            } else {
                out.CBI_DEFENSE_COMPLETE = !!ctx.al_E_cbi_def_established
                out.ORANGE_PLAN_CRITERIA = !!(ctx.al_J_phil_not_surrendered && ctx.al_K_service_agreement
                    && ctx.al_L_has_2_carriers && ctx.al_M_us_corps_near_carrier && ctx.al_N_aus_no_jp_ground)
            }
        } catch (e) { /* 保持 undefined → 兜底 / keep undefined → fallback */ }
    }
    return out
}

// 规划模式枚举（文档 §2）：把「立即参战 / 准备下一目标 / 调动 / 驻防 / 防御 / 航空转场 /
// Planning-mode enum (doc §2): explicitly distinguishes "attack now / prepare next target / redeploy / garrison / defend / air transfer /
// 战略移动 / AZOI 网络」等不同规划阶段显式区分，禁止再按 kind 字符串做 if-bypass。
// strategic move / AZOI network" etc., forbidding further if-bypass by kind string.
const EOP_PLAN_MODE = { ATTACK_NOW:"attack-now", PREPARE_NEXT_TARGET:"prepare-next-target",
    REDEPLOY:"redeploy", GARRISON:"garrison", DEFEND:"defend", AZOI_NETWORK:"azoi-network",
    AIR_TRANSFER:"air-transfer", STRATEGIC_MOVE:"strategic-move" }

// 开发/测试断言开关：生产环境恒 false，断言零开销。
// Dev/test assertion switch: always false in production, zero assertion overhead.
const EOP_DEV = typeof process !== "undefined" && process.env
    && (process.env.EOTS_DEV === "1" || process.env.NODE_ENV === "test")

// PR3：任务部队候选的「立即参战」硬过滤——仅限 ATTACK_NOW。用 RTT 规则查询层的
// PR3: hard "attack now" filter for task-force candidates — ATTACK_NOW only. Uses the RTT rule query layer's
// queryCombatParticipation 判可达性（地面/海军走引擎 BFS，航空走战斗航程），任何查询
// queryCombatParticipation to judge reachability (ground/naval via engine BFS, air via combat range); any query
// 异常都保守放行，绝不因查询崩溃而误剔候选。文档 §2 禁止把它当通用硬闸套到
// error is conservatively allowed through, never dropping a candidate because a query crashed. Doc §2 forbids applying it as a generic hard gate to
// REDEPLOY/GARRISON/DEFEND/AZOI/AIR_TRANSFER/STRATEGIC_MOVE 上（那些走可前推/可到达查询）。
// REDEPLOY/GARRISON/DEFEND/AZOI/AIR_TRANSFER/STRATEGIC_MOVE (those use push-forward/reachability queries).
function eop_filter_attack_now_participants(unitsById, target, role, mode) {
    if (EOP_DEV && mode !== undefined && mode !== EOP_PLAN_MODE.ATTACK_NOW) {
        throw new Error("eop_filter_attack_now_participants 仅限 ATTACK_NOW，got " + mode)
    }
    if (target === null || target === undefined || !Number.isInteger(target)) return unitsById
    return unitsById.filter(u => {
        try { return typeof queryCombatParticipation !== "function" || queryCombatParticipation(u.id, target, {}).legal }
        catch (e) { return true }
    })
}

function composeTaskForce(target, card, hq, view, candidates, role) {
    if((target===null || target===undefined) && eop_axis(role))return {complete:true,strict:true,unit:null,formation:"objectives-scheduled"}
    const units=Array.isArray(view?.ai?.units)?view.ai.units:[], byId=new Map(units.map(u=>[u.id,u]))
    const active=new Set((view?.offensive?.active_units||[]).flat()), f=evaluateTargetFeasibility(target,card,hq,view)
    candidates=(candidates||[]).filter(id=>eop_unit_matches_target(byId.get(id)||id,role,f.meta,target))
    const committed=[...active].map(id=>byId.get(id)).filter(Boolean)
    const cf=u=>u.reduced?(Number(u.rcf)||Math.ceil((Number(u.cf)||0)/2)):(Number(u.cf)||0)
    const strikeStrength=committed.filter(u=>u.class==="air"||u.class==="naval").reduce((s,u)=>s+cf(u),0)
    const groundStrength=committed.filter(u=>u.class==="ground").reduce((s,u)=>s+cf(u),0)
    const hasGround=committed.some(u=>u.class==="ground"),hasNaval=committed.some(u=>u.class==="naval")
    if(f.meta?.escortPairs){
        const pairs=f.meta.escortPairs.filter(pair=>G.location[pair.ground]===pair.origin && G.location[pair.carrier]===pair.origin
            && get_distance(pair.origin,target)<=f.meta.maxDistance)
        const pair=pairs.find(p=>active.has(p.ground)||active.has(p.carrier))
            ||pairs.find(p=>candidates.includes(p.ground)&&candidates.includes(p.carrier))
        const complete=!!pair&&active.has(pair.ground)&&active.has(pair.carrier)
        const unit=pair?[pair.ground,pair.carrier].find(id=>!active.has(id)&&candidates.includes(id)):undefined
        return {complete,strict:true,required:2,strength:pair?Number(active.has(pair.ground))+Number(active.has(pair.carrier)):0,
            unit:complete?null:unit,formation:"orange-army-carrier-convoy",groundStrength,strikeStrength,potentialReactionStrength:0}
    }
    if(f.meta?.kind==="GARRISON" || f.meta?.kind==="REDEPLOY"){
        const already=f.meta.kind==="GARRISON"?eop_garrison_satisfied(role,target,f.meta,units):!eop_target_pending(role,target,f.meta)
        const moved=candidates.map(id=>byId.get(id)).filter(u=>u && u.location!==target)
        // REDEPLOY(撤离/调动)是战略移动(SR)，不是会战：requiredUnits 只需被激活并沿
        // REDEPLOY (withdraw/redeploy) is strategic movement (SR), not a battle: requiredUnits only need to be activated and moved
        // SR/headless 路径移向目标，不能套用 queryCombatParticipation 的会战参与过滤，
        // toward the target along the SR/headless path, and must not use queryCombatParticipation's battle-participation filter,
        // 否则地面单位无法"会战参与"到隔海目标 → pool 空 → unit undefined → 激活窗被迫
        // otherwise a ground unit can't "participate in battle" at a cross-sea target → pool empty → unit undefined → activation window forced
        // done，形成"打出牌但 0 单位调度"的空攻势。GARRISON 需实际进入目标格，保留过滤。
        // to done, forming a "card played but 0 units scheduled" empty offensive. GARRISON must actually enter the target hex, so keep the filter.
        const pool=f.meta.kind==="REDEPLOY"?moved:eop_filter_attack_now_participants(moved,target,role,EOP_PLAN_MODE.ATTACK_NOW)
        pool.sort((a,b)=>(f.meta.garrisonRequirement?.airSteps ? (a.class==="air"?0:1)-(b.class==="air"?0:1):0)
            || get_distance(a.location,target)-get_distance(b.location,target)||a.id-b.id)
        return {complete:already,strict:true,required:1,strength:already?1:0,unit:already?null:pool[0]?.id,
            formation:f.meta.kind.toLowerCase(),groundStrength,strikeStrength,potentialReactionStrength:0}
    }
    const landing=f.requiresOccupation&&f.amphibious&&view?.ai?.focusControlledBy!==view?.active
    const need=f.suppress?f.requiredAirSeaMath:f.requiresOccupation?f.requiredGroundMath:(f.groundDefense>0?f.requiredGroundMath:f.requiredAirSeaMath)
    const math=f.suppress?strikeStrength:f.requiresOccupation?groundStrength:Math.max(groundStrength,strikeStrength)
    // 占领军不仅要有地面与登陆护航；只要目标上有空海兵力或可能发生
    // The occupation force needs not only ground and landing escort; as long as the target has air-sea strength or a possible
    // 空海反应，还必须补足图表伤害等级所需的空海战力。航空兵/航母可在
    // air-sea reaction, it must also supply the air-sea combat strength required by the chart's damage level. Air/carrier can
    // 战斗格外投入，故这里只要求其加入任务部队，不要求移动进目标格。
    // commit from outside the battle hex, so here they only need to join the task force, not move into the target hex.
    const supportRequired=f.requiresOccupation
    // PR3：任务部队“是否达标”改用与第 5/11 页 predicate 完全一致的 RTT 精确求值器：
    // PR3: whether the task force "meets standard" now uses the RTT exact evaluator identical to the page 5/11 predicate:
    //   支援标准只判兵种构成(eop_meets_battle_support_standard)；伤害等级另判有效战斗力
    //   the support standard only checks unit-class composition (eop_meets_battle_support_standard); the damage level separately checks effective combat strength
    //   且占领须地面 2x 生存(eop_evaluate_damage_level)。两者拆开，不再手算 CF 阈值。
    //   and occupation requires ground 2x survival (eop_evaluate_damage_level). The two are split, no more hand-computed CF thresholds.
    //   反应兵力改用引擎精确反应候选(queryReactionCandidates)，而非 get_distance 粗筛。
    //   Reaction strength now uses the engine's exact reaction candidates (queryReactionCandidates), not a get_distance rough filter.
    const faction=role==="Japan"?JP:AP, enemy=1-faction
    const defenders=units.filter(u=>u.location===target&&u.faction===enemy)
    let reactionIds=[], reactionStrengthOverride
    try {
        if (typeof queryReactionCandidates === "function") {
            const reaction=queryReactionCandidates({reactionFaction:enemy,targetHex:target})
            reactionIds=reaction.air.concat(reaction.carrier,reaction.naval,reaction.ground)
        } else {
            reactionStrengthOverride=f.potentialReactionStrength
        }
    } catch (e) { reactionStrengthOverride=f.potentialReactionStrength }
    const support=eop_meets_battle_support_standard(f.meta,committed,target,faction)
    const dmg=eop_evaluate_damage_level(f.meta,committed,defenders,reactionIds,byId,target,reactionStrengthOverride)
    if(support.met&&dmg.met)return {complete:true,required:need,strength:math,unit:null,
        formation:landing?"supported-amphibious-assault":f.suppress?"air-sea-strike":"minimum-sufficient",
        groundStrength,strikeStrength,potentialReactionStrength:f.potentialReactionStrength,supportRequired}
    let pool=(candidates||[]).map(id=>byId.get(id)).filter(Boolean)
    pool=pool.filter(u=>{
        try{return typeof eop_preserve_rear_air!=="function"||!eop_preserve_rear_air(u.id,role,target)}catch(e){return true}
    })
    // 第5/11页脚注：非本土/非印度 HQ 与地面单位同格时，至少保留一个未激活地面单位守卫 HQ。
    // Page 5/11 footnote: when a non-home/non-India HQ is co-located with ground units, keep at least one unactivated ground unit guarding the HQ.
    pool=pool.filter(u=>{
        if(u.class!=="ground")return true
        const at=units.filter(x=>x.location===u.location&&x.faction===u.faction)
        const hq=at.some(x=>x.class==="hq"), region=typeof get_map_data==="function"?String(get_map_data(u.location)?.region||""):""
        if(!hq)return true
        if(role==="Japan"&&/Japan/i.test(region))return true
        if(role==="Allies"&&/India/i.test(region))return true
        const unactivated=at.filter(x=>x.class==="ground"&&!active.has(x.id))
        return unactivated.length>1
    })
    // 恢复 1.0 的后方调度：不在此处用「立即参战」当硬闸把后方/转场单位整批删掉，
    // Restore 1.0's rear scheduling: don't use "attack now" here as a hard gate to delete rear/transfer units wholesale,
    // 否则本牌打不到目标的后方兵力无法沿 SR/转场前推，形成「打出牌但 0 单位调度」。
    // otherwise rear forces that can't reach the target this card would be unable to push forward along SR/transfer, forming a "card played but 0 units scheduled".
    // 同一兵种先选最靠近目标者（下方 distance 排序）已保证优先就近单位；真正不可达的
    // Within the same class pick the one nearest the target (the distance sort below) already ensures near units are preferred; truly unreachable
    // 单位由移动器/choose_attack_hex 的 br/ebr 与 BFS 可达性兜底剔除，不需要这里硬删。
    // units are dropped by the mover/choose_attack_hex's br/ebr and BFS reachability fallback, no need to hard-delete here.
    let amphibiousPick
    if(landing&&typeof eop_pick_unit==="function")amphibiousPick=eop_pick_unit(pool.map(u=>u.id),role,[...active],target)
    const classRank=u=>f.suppress?({air:0,naval:1,ground:2}[u.class]??3)
        :f.requiresOccupation?(!hasGround?({ground:0,naval:1,air:2}[u.class]??3):(!hasNaval&&landing?({naval:0,air:1,ground:2}[u.class]??3):({air:0,naval:1,ground:2}[u.class]??3)))
        :({air:0,naval:1,ground:2}[u.class]??3)
    // 同一兵种先选最靠近当前图表目标者，再比较战力；否则会从本土抽一个高战力但
    // Within the same class first pick the one nearest the current chart target, then compare combat strength; otherwise a high-strength but
    // 本攻势根本到不了菲律宾的陆军，最终形成“高激活、零会战”。
    // home-island army that can never reach the Philippines this offensive would be picked, ending in "high activation, zero battle".
    const distance=u=>typeof get_distance==="function"&&target!==null&&target!==undefined
        ?get_distance(u.location,target):99
    pool.sort((a,b)=>classRank(a)-classRank(b)||distance(a)-distance(b)||cf(b)-cf(a)||a.id-b.id)
    // #3：占领目标但地面兵力不足、且已无可补充地面时标记 insufficient，激活窗据此提前
    // #3: for an occupation target with insufficient ground strength and no more ground to add, mark insufficient so the activation window ends early
    // done 空攻势，避免「少得登不下来还硬上」白耗激活点(与 eop_landing_no_escort 同理)。
    // with an empty offensive, avoiding wasting activation points on "can't sustain the landing yet still forcing it" (same rationale as eop_landing_no_escort).
    const insufficient = f.requiresOccupation && !dmg.groundMet && !pool.some(u => u.class === "ground")
    return {complete:false,strict:true,required:need,strength:math,unit:amphibiousPick??pool[0]?.id,
        formation:landing?"supported-amphibious-assault":f.requiresOccupation?"ground-with-support":"air-sea-strike",
        groundStrength,strikeStrength,potentialReactionStrength:f.potentialReactionStrength,supportRequired,insufficient}
}

function selectOperationalHq(view,candidates,role){
    if(!Array.isArray(candidates)||!candidates.length)return undefined
    const byId=new Map((view?.ai?.units||[]).map(u=>[u.id,u])),focus=view?.ai?.focus
    const axis=eop_axis(role),name=String(axis?.id||axis?.note||"").toLowerCase()
    // axis.id 主要是中文战略名。旧代码只识别英文，结果除 CBI/DEI 等英文偶合外
    // axis.id is mostly a Chinese strategy name. The old code only recognized English, so except for CBI/DEI etc. English coincidences
    // 几乎总落入 Central Pacific HQ，令其它 HQ 闲置、兵力看似“指挥部太后”。
    // it almost always fell into Central Pacific HQ, leaving other HQs idle and the force looking "too far back".
    const preferred=role==="Allies"?(
        /(cbi|中缅印)/i.test(name)?/seac/i:
        /(dei|东印度|菲律宾|重返)/i.test(name)?/south west/i:
        /(南太平洋)/i.test(name)?/(south pacific|anzac|south west)/i:
        /(中太平洋|跳岛|轰炸|b29|登陆日本)/i.test(name)?/central pacific/i:
        /(印度|缅甸)/i.test(name)?/seac/i:/central pacific|south west/i)
        :(/(cbi|india|中缅印|印度)/i.test(name)?/south hq/i:/(central|中太平洋|马绍尔)/i.test(name)?/combined fleet/i:/south hq|south seas/i)
    const mine=role==="Japan"?JP:AP
    const commandable=id=>{const hq=byId.get(id);if(!hq)return 0
        const range=Math.max(0,Number(hq.cr)||0)
        return (view?.ai?.units||[]).filter(u=>u.faction===mine&&u.class!=="hq"&&u.location>=0
            &&(!(Number(hq.supply)||0)||((Number(u.supply)||0)&Number(hq.supply)))
            &&typeof get_distance==="function"&&get_distance(hq.location,u.location)<=range).length}
    // 夺占(requiresOccupation)目标——敌占岛屿/资源格——必须由地面单位实施两栖登陆。
    // A capture (requiresOccupation) target — enemy-held island/resource hex — must be taken by ground units via amphibious landing.
    // 图表虽注“优先 Cen Pac HQ”，但 1942 年 Central Pacific 只有海空、无地面军，
    // The chart notes "prefer Cen Pac HQ", but in 1942 Central Pacific has only air-sea units and no ground force,
    // 硬选它会激活 8 个海空单位却“无单位可达敌战格”。夺占目标下优先能指挥地面军的 HQ。
    // so forcing it would activate 8 air-sea units yet "no unit can reach the enemy battle hex". Under a capture target prefer an HQ that can command ground forces.
    const focusMeta=focus!==null&&focus!==undefined&&typeof eop_target_meta==="function"?eop_target_meta(role,focus):null
    const needsGround=!!(focusMeta&&focusMeta.requiresOccupation)
    const groundCommandable=id=>{const hq=byId.get(id);if(!hq)return 0
        const range=Math.max(0,Number(hq.cr)||0)
        return (view?.ai?.units||[]).filter(u=>u.faction===mine&&u.class==="ground"&&u.location>=0
            &&(!(Number(hq.supply)||0)||((Number(u.supply)||0)&Number(hq.supply)))
            &&typeof get_distance==="function"&&get_distance(hq.location,u.location)<=range).length}
    // REDEPLOY(撤离)类战略要调动的单位是明确编号的 requiredUnits，并非“指挥部范围内
    // The units a REDEPLOY (withdraw) strategy must move are the explicitly numbered requiredUnits, not "any force within
    // 任意兵力”。旧排序只按范围内单位总数挑 HQ，导致撤离马来亚/菲律宾时选到兵多但
    // the HQ's range". The old sort picked HQs only by total units in range, so when withdrawing from Malaya/Philippines it picked the troop-heavy but
    // 根本不含待撤离单位的 Central Pacific HQ，产生“激活 0 单位”的空攻势。这里把
    // totally lacking the units-to-withdraw Central Pacific HQ, producing an "activate 0 units" empty offensive. Here the HQs
    // “能指挥到待撤离单位”的 HQ 提到最前，其余照旧。
    // that "can command the units to be withdrawn" are moved to the front, the rest unchanged.
    const required=new Set()
    if(Array.isArray(axis?.targetMeta))for(const t of axis.targetMeta)
        if(t&&t.kind==="REDEPLOY"&&Array.isArray(t.requiredUnits))for(const u of t.requiredUnits)required.add(u)
    const requiredCount=id=>{if(!required.size)return 0
        const hq=byId.get(id);if(!hq)return 0
        const range=Math.max(0,Number(hq.cr)||0)
        return (view?.ai?.units||[]).filter(u=>required.has(u.id)&&u.faction===mine&&u.location>=0
            &&(!(Number(hq.supply)||0)||((Number(u.supply)||0)&Number(hq.supply)))
            &&typeof get_distance==="function"&&get_distance(hq.location,u.location)<=range).length}
    const score=id=>{const u=byId.get(id),d=u&&focus!==null&&focus!==undefined&&typeof get_distance==="function"?get_distance(u.location,focus):99
        const preview=typeof erasmus_preview_activatable_units==="function"?erasmus_preview_activatable_units(id):null
        const n=Array.isArray(preview)?preview.length:commandable(id)
        // 先排除“名义上符合战略、实际上范围内没有任何兵力”的 HQ；多个可用 HQ
        // First exclude HQs that "nominally match the strategy but actually have no force in range"; among the remaining
        // 再按图表指定 HQ、目标距离和效能排序。夺占目标优先要“有地面军”的 HQ。
        // sort by chart-designated HQ, distance to target and effectiveness. Capture targets prefer an HQ "with ground forces".
        return [n>0?0:1,-requiredCount(id),needsGround?(groundCommandable(id)>0?0:1):0,
            u&&preferred.test(String(u.name||""))?0:1,-n,d,-(u?.cm||0),-(u?.cr||0),id]}
    return candidates.slice().sort((a,b)=>{const x=score(a),y=score(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0})[0]
}
function planReaction(view,candidates,action,role,strategy){
    if(!Array.isArray(candidates)||!candidates.length)return undefined
    const units=Array.isArray(view?.ai?.units)?view.ai.units:[],byId=new Map(units.map(u=>[u.id,u]))
    const mine=role==="Japan"?JP:AP, enemy=1-mine
    if(action==="card"){
        const cardsMeta=Array.isArray(view?.ai?.ownCards)?view.ai.ownCards.slice():[]
        for(const id of candidates)if(!cardsMeta.some(c=>c.id===id)&&typeof cards!=="undefined"&&cards[id])cardsMeta.push({id,name:cards[id].name,intelligence:cards[id].intelligence,reaction:cards[id].reaction})
        const wanted=String(strategy||"")
        if(wanted.includes("CARD_PRIORITY")){
            const rank=c=>{
                const n=String(c?.name||"")
                if(role==="Allies")return /intelligence|情报/i.test(n)||c?.intelligence!==undefined?0:/counter|反攻/i.test(n)?1:/ambush|伏击/i.test(n)?2:/submarine/i.test(n)?3:4
                return /jn.?25|intelligence|情报/i.test(n)||c?.intelligence!==undefined?0:/counter|反击/i.test(n)?1:/kamikaze|神风/i.test(n)?2:/submarine/i.test(n)?3:4
            }
            const byId=new Map(cardsMeta.map(c=>[c.id,c]))
            return candidates.slice().sort((a,b)=>rank(byId.get(a))-rank(byId.get(b))||a-b)[0]
        }
        const re=wanted.includes("WEATHER")?/weather/i:wanted.includes("KAMIKAZE")?/kamikaze/i
            :wanted.includes("SUBMARINE")?/submarine/i:wanted.includes("AMBUSH")?/(ambush|伏击)/i
            :wanted.includes("COUNTER")?/(counter|反攻)/i:/(jn.?25|intelligence|情报)/i
        const ids=new Set(cardsMeta.filter(c=>re.test(String(c.name||""))).map(c=>c.id))
        const hit=candidates.filter(id=>ids.has(id)).sort((a,b)=>a-b)
        return hit[0]
    }
    if(action==="action_hex"||action==="hex"){
        // 反应会战格优先级 (清单 #12)：HQ→Resource→Port→Airfield→Other。不能只取 sorted[0]，
        // Reaction battle-hex priority (checklist #12): HQ→Resource→Port→Airfield→Other. Can't just take sorted[0],
        // 最高优先级目标可能凑不够合法反应兵力；按优先级逐个检查反应兵力标准能否达到，
        // the highest-priority target may not be able to assemble a legal reaction force; check each target in priority order whether the reaction standard is met,
        // 能达则选，否则顺延下一目标。
        // pick it if met, otherwise move on to the next target.
        const tier=h=>{
            const md=typeof get_map_data==="function"?get_map_data(h):{}
            const own=units.filter(u=>u.location===h&&u.faction===mine)
            return own.some(u=>u.class==="hq")?0:md.resource?1:md.port?2:md.airfield?3:4
        }
        const ordered=candidates.slice().sort((a,b)=>tier(a)-tier(b)||a-b)
        if(typeof queryReactionCandidates!=="function"||typeof eop_evaluate_reaction_force_standard!=="function")return ordered[0]
        const attackers=(view?.offensive?.active_units||[]).flat().map(id=>byId.get(id)).filter(u=>u&&u.faction===enemy)
        for(const h of ordered){
            try{
                const reaction=queryReactionCandidates({reactionFaction:mine,targetHex:h})
                const sel=reaction.air.concat(reaction.carrier,reaction.naval,reaction.ground).map(id=>byId.get(id)).filter(Boolean)
                // 用 D10=0 的最严情形(地面须 2x)判"能否达到反应兵力标准"。
                // Use the strictest D10=0 case (ground must 2x) to judge "can it meet the reaction force standard".
                const std=eop_evaluate_reaction_force_standard({selectedReactionUnits:sel,attackingUnits:attackers,d10:0})
                if(std.complete)return h
            }catch(e){ return h }
        }
        return ordered[0]
    }
    // 反应兵力标准 (清单 #11)：用共享求值器判定当前缺口，每次加入最能填补缺口的
    // Reaction force standard (checklist #11): use the shared evaluator to judge the current gap, each time adding the one legal unit
    // 一个合法单位；complete 时不再补兵。空海战力不足→航空/海军；空军数量不足→航空；
    // that best fills the gap; stop adding once complete. Air-sea strength short → air/naval; air count short → air;
    // 地面 2x 要求未满足→地面。
    // ground 2x requirement unmet → ground.
    const active=new Set((view?.offensive?.active_units||[]).flat())
    const selected=[...active].map(id=>byId.get(id)).filter(u=>u&&u.faction===mine)
    const attackers=[...active].map(id=>byId.get(id)).filter(u=>u&&u.faction===enemy)
    const cf=u=>u?(u.reduced?(Number(u.rcf)||Math.ceil((Number(u.cf)||0)/2)):(Number(u.cf)||0)):0
    const d10=typeof erasmus_hash==="function"?erasmus_hash(`${view?.seed??0}:${view?.actionOrdinal??0}:RF-D10`)%10:5
    const std=eop_evaluate_reaction_force_standard({selectedReactionUnits:selected,attackingUnits:attackers,d10})
    const rank=u=>{
        if(!u)return 9 // 候选单位不在 view.ai.units 投影内(如已被消灭/移出): 排最末，避免空引用崩溃 / candidate not in view.ai.units projection (e.g. eliminated/moved out): rank last, avoid null-deref crash
        if(!std.airSeaOneXMet)return (u.class==="air"||u.class==="naval")?0:2
        if(!std.airCountMet)return u.class==="air"?1:2
        if(std.groundTwoXRequired&&!std.groundTwoXMet)return u.class==="ground"?0:2
        return u.class==="air"?1:u.class==="naval"?2:3
    }
    return candidates.slice().sort((a,b)=>rank(byId.get(a))-rank(byId.get(b))||cf(byId.get(b))-cf(byId.get(a))||a-b)[0]
}

// 第6/12页 PBM 的单位顺序。落点的六级/三级优先级由 offensive.js 在计算真实合法路径后
// Unit ordering for page 6/12 PBM. The six-tier/three-tier destination priority is scored by offensive.js after computing real legal paths;
// 评分；这里负责在交互式 unit 窗严格按“航空→海上→失败AA地面”选择，并在同类中选择
// here we strictly select "air → naval → failed-AA ground" in the interactive unit window, and within the same class pick the
// 最强航空或稳定的最低 id。函数只读取 view.ai 的只读投影。
// strongest air or the stable lowest id. This function only reads view.ai's read-only projection.
function planPostBattleMovement(view,candidates,action,role){
    if(!Array.isArray(candidates)||!candidates.length)return undefined
    if(action!=="unit")return undefined
    const units=Array.isArray(view?.ai?.units)?view.ai.units:[],byId=new Map(units.map(u=>[u.id,u]))
    const failed=new Set(view?.ai?.pbm?.failedAAUnits||[])
    const cf=u=>u?(u.reduced?(Number(u.rcf)||Math.ceil((Number(u.cf)||0)/2)):(Number(u.cf)||0)):0
    const rank=u=>u?.class==="air"?0:u?.class==="naval"?1:(u?.class==="ground"&&failed.has(u.id)?2:3)
    return candidates.slice().sort((a,b)=>rank(byId.get(a))-rank(byId.get(b))
        ||(rank(byId.get(a))===0?cf(byId.get(b))-cf(byId.get(a)):0)||a-b)[0]
}

// 第6/12页航空/海军 PBM 落点评分 (清单 #16/#17/#18)。落点必须先在 queryPbmDestinations
// Air/naval PBM destination scoring for page 6/12 (checklists #16/#17/#18). The destination must first be judged legal in queryPbmDestinations
// 里被 RTT 判定合法，这里只做图表优先级评分；硬约束(一机场一空军等)由 offensive.js 的
// via RTT; here we only score by chart priority. Hard constraints (one air unit per airfield, etc.) are expressed by offensive.js's
// erasmus_pbm_target_score 以返回 null(=legal false) 表达，而非扣分。返回 null 表示该格
// erasmus_pbm_target_score returning null (= legal false), not by subtracting points. Returning null means the hex
// 非法或不属于该兵种，不应被选。
// is illegal or not of this unit class, and should not be selected.
function scoreAirPbmDestination(unit, hex, ctx) {
    if (typeof erasmus_pbm_target_score !== "function") return null
    const piece = pieces[unit]
    if (!piece || piece.class !== "air") return null
    const source = G.location[unit]
    const faction = piece.faction
    const plan = (ctx && ctx.targetPlan) || null
    return erasmus_pbm_target_score(hex, faction, piece, source, plan)
}

function scoreNavalPbmDestination(unit, hex, ctx) {
    if (typeof erasmus_pbm_target_score !== "function") return null
    const piece = pieces[unit]
    if (!piece || piece.class !== "naval") return null
    const source = G.location[unit]
    const faction = piece.faction
    const plan = (ctx && ctx.targetPlan) || null
    return erasmus_pbm_target_score(hex, faction, piece, source, plan)
}
