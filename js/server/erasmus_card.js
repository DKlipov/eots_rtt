// 卡牌选择 / 分类 / 选行动窗口 —— 从 erasmus_state.js 抽离(解耦: 单文件过大)。
// Card selection / classification / action-window selection — extracted from erasmus_state.js (decoupling: single file was too large).
// 函数: esm_card_window_action / esm_choose_card / esm_set_card_pick / esm_card_selection_tree /
// Functions: esm_card_window_action / esm_choose_card / esm_set_card_pick / esm_card_selection_tree /
//   esm_card_activation_classes / esm_card_activation_capacity / classifyCards /
//   esm_event_strategy_card_pick / esm_china_ready / esm_semantic_card_pick /
//   esm_card_action_window_action / esm_atomic_event_pick / esm_trace_of / esm_log_strategy
// 与 erasmus_state.js 同属一个 inline 模块作用域, 依赖其 esm_* 查询/上下文函数与全局表。
// Shares one inline module scope with erasmus_state.js, relying on its esm_* query/context functions and global tables.
// ---- 选牌/选行动窗口的行为 --------------------------------------------------
// ---- card-pick / action-window selection behavior ---------------------------
// 依据已钉战略返回 { action, argument }(未钉或非法时返回 null → 调方走原路径)。
// Returns { action, argument } per the pinned strategy (returns null when unpinned or illegal → caller takes the original path).
function esm_card_window_action(strategy, view, context) {
    const legal = Object.keys(view.actions || {}).filter(a => { const v = view.actions[a]; return Array.isArray(v) ? v.length > 0 : Boolean(v) })
    let hand = Array.isArray(view.actions.card) ? view.actions.card.slice() : []
    if (!hand.length) return null
    const faction = esm_role_faction(strategy.role)
    const wantOps = strategy.kind === "CONQUEST" || strategy.kind === "ABSTRACT"
    const wantEvent = strategy.kind === "EVENT"
    if (strategy.kind === "PASS" && legal.includes("pass")) return { action: "pass", argument: undefined, via: strategy.name }

    // 用户指示：提升苏联牌(AP#79)权重。它既是 3OC 优质攻势牌，又是原子弹胜利的硬前提
    // User instruction: raise the weight of the Soviet card (AP#79). It is both a 3OC quality offensive card and the hard prerequisite for atomic victory
    // （作事件捕获哈尔滨/奉天并置 soviet_occurred）。早期(1942~1943前期, T<7)抽到：TOJO
    // (played as event to capture Harbin/Mukden and set soviet_occurred). Drawn early (1942–early 1943, T<7): TOJO
    // 尚不可能激活、事件打不出来，保留会长期占一手槽又白丢 3OC -> 按普通攻势牌消耗即可
    // cannot yet be activated and the event cannot be played, holding it would occupy a hand slot long-term while wasting the 3OC -> consume it as a normal offensive card
    // (reshuffle 回牌库，仍有再抽到的机会)。后期(1943秋后, T>=7)抽到：保留作为未来事件。
    // (reshuffled back into the deck, with a chance to be drawn again). Drawn late (after autumn 1943, T>=7): hold it as a future event.
    // 只要事件当前合法就立即执行；否则在仍有其他牌时从候选池剔除，防止 PoW 紧急攻势/通用
    // Play the event immediately whenever it is currently legal; otherwise remove it from the candidate pool while other cards remain, preventing PoW emergency offensive/generic
    // 选牌等任何路径把它当 OC 消耗。
    // card pick or any other path from consuming it as an OC.
    if (strategy.role === "Allies" && typeof SOVIET_INVADE !== "undefined" && hand.includes(SOVIET_INVADE)) {
        const classified = classifyCards(hand, strategy.role)
        const soviet = classified.find(x => x.id === SOVIET_INVADE)
        if (soviet && soviet.eventPlayable) {
            return esm_set_card_pick(strategy, soviet, "event", "AP10-S-EVENT", "盟军胜利条件：苏联入侵满洲事件")
        }
        if (G.turn >= 7) {
            if (hand.length > 1) {
                hand = hand.filter(c => c !== SOVIET_INVADE)
            } else if (legal.includes("pass")) {
                // 仅剩 AP#79 且 TOJO 未激活：宁可 PASS 也要把它留在手上，等 TOJO 激活后作事件打出。
                // Only AP#79 remains and TOJO is not activated: prefer PASS to keep it in hand, waiting to play it as event after TOJO activates.
                // 若当 OC 打出会 reshuffle 回牌库，错过“TOJO 激活 + 苏联牌在握”的原子弹窗口。
                // Playing it as OC would reshuffle it back into the deck, missing the "TOJO activated + Soviet card in hand" atomic window.
                return { action: "pass", argument: undefined, via: "盟军保留苏联入侵满洲(原子弹胜利条件)" }
            }
        }
    }

    // 原子弹胜利的历史前置：第8回合起引擎(get_allowed_actions)把“东条辞职”(JP#43)
    // Historical prerequisite for atomic victory: from turn 8 the engine (get_allowed_actions) forces "Tojo Resigns" (JP#43)
    // 强制为仅事件可打。图表“东条作为1OC”只适用于早期；第8回合后必须作为事件打出
    // to be playable as event only. The chart's "Tojo as 1OC" applies only in the early game; after turn 8 it must be played as event
    // 以激活 TOJO，否则苏联入侵满洲永远无法成为事件打出，原子弹标准第2条恒假。
    // to activate TOJO, otherwise Soviet Invasion of Manchuria can never be played as event and atomic criterion #2 is always false.
    // 该牌 remove:true 只在事件打出时生效(OC 打出会被 reshuffle 回牌库反复回到手牌)，
    // This card's remove:true only takes effect when played as event (played as OC it reshuffles back into the deck and returns to hand repeatedly),
    // 故作为事件打出也是唯一能真正把它清出游戏的方式。
    // so playing it as event is also the only way to truly remove it from the game.
    if (strategy.role === "Japan" && typeof TOJO_RESIGNS !== "undefined" && G.turn >= 8 && hand.includes(TOJO_RESIGNS)) {
        const classified = classifyCards(hand, strategy.role)
        const tojo = classified.find(x => x.id === TOJO_RESIGNS)
        if (tojo && tojo.eventPlayable) {
            return esm_set_card_pick(strategy, tojo, "event", "JP04-S-TOJO-EVENT", "日本：东条辞职事件(原子弹胜利前置)")
        }
    }

    // AP09 注释：占领战略轰炸基地必须使用当前最大的有效攻势卡。
    // AP09 note: occupying the strategic bombing base must use the current largest effective offensive card.
    // 先选可作为 EC 的军事事件（按 LV），没有时才选最大 OC。
    // First pick a military event usable as EC (by LV); only if none exists pick the largest OC.
    if(strategy.role==="Allies"&&strategy.name==="占领战略轰炸基地"){
        const classified=classifyCards(hand,strategy.role)
        const ec=classified.filter(c=>c.military&&c.eventPlayable).sort((a,b)=>b.lv-a.lv||b.ops-a.ops||a.id-b.id)
        const oc=classified.filter(c=>c.opsPlayable).sort((a,b)=>b.ops-a.ops||a.id-b.id)
        const chosen=ec[0]||oc[0]
        if(chosen){
            const node=ec[0]?(chosen.restricted?"AP10-S-RESTRICTED-EC":"AP10-S-UNRESTRICTED-EC")
                :(chosen.military&&chosen.restricted?"AP10-S-RESTRICTED-OC":"AP10-S-NONMIL-OC")
            return esm_set_card_pick(strategy,chosen,ec[0]?"event":"ops",node,"占领战略轰炸基地:最大有效攻势卡")
        }
    }

    // 条约谈判生存约束：PoW 是每回合结算的硬门槛；只要尚未达标，设置 FO、PASS
    // Treaty negotiation survival constraint: PoW is the hard threshold settled each turn; as long as it is not yet met, setting FO, PASS
    // 或低优先事件都会减少本回合补足夺格数的机会。因此从第一张可用牌起就用最大
    // or low-priority events all reduce the chance to make up the capture count this turn. Therefore, from the first available card use the largest
    // 有效攻势执行 progressPlan；达标后立刻恢复第10页正常选牌树。
    // effective offensive to run progressPlan; once met, immediately resume the normal page-10 card selection tree.
    // 这是对胜负规则的前视约束，不凭空增加目标、战力或合法动作。
    // This is a look-ahead constraint derived from the win/loss rules, not an invented goal, combat strength, or legal action.
    const powDeficit = Math.max(0, Number(G.pow || 0) - esm_pow_bank())
    if (strategy.role === "Allies" && powDeficit > 0) {
        const classified = classifyCards(hand, strategy.role)
        const ec = classified.filter(c => c.military && c.eventPlayable)
            .sort((a,b)=>b.lv-a.lv||b.ops-a.ops||a.id-b.id)
        const oc = classified.filter(c => c.opsPlayable)
            .sort((a,b)=>b.ops-a.ops||Number(a.military)-Number(b.military)||a.id-b.id)
        const chosen = ec[0] || oc[0]
        if (chosen) {
            strategy.powEmergency = { politicalWill: Number(G.political_will), required: Number(G.pow), bank: esm_pow_bank() }
            const node=ec[0]?(chosen.restricted?"AP10-S-RESTRICTED-EC":"AP10-S-UNRESTRICTED-EC")
                :(chosen.military&&chosen.restricted?"AP10-S-RESTRICTED-OC":"AP10-S-NONMIL-OC")
            return esm_set_card_pick(strategy, chosen, ec[0] ? "event" : "ops", node,
                `盟军PoW紧急攻势:${esm_pow_bank()}/${G.pow}，余牌${hand.length}，政治意志${G.political_will}`)
        }
    }

    // #7: 己方 ISR(对立状况)激活时, 无论战略轴是 CONQUEST/ABSTRACT/GARRISON/DEFEND 还是
    // #7: when own-side ISR (inter-service rivalry) is active, regardless of whether the strategy axis is CONQUEST/ABSTRACT/GARRISON/DEFEND or
    // EVENT, 都应在选牌窗立即用【己方阵营】的 isr_agreement 和解牌作事件清除。引擎
    // EVENT, immediately use the own-faction isr_agreement reconciliation card in the card window to clear it as event. The engine's
    // default_event(game.js)按 card.faction 清该方 ISR。否则这些牌会被非 EVENT 轴当 OC
    // default_event (game.js) clears that side's ISR by card.faction. Otherwise these cards would be played as OC on non-EVENT axes,
    // 打掉, 己方长期带着 ISR 减成(增援门槛、若干事件封锁)。此为卡牌选择 bug 的全局前置。
    // leaving the own side stuck with the ISR penalty (reinforcement gate, several event blockades). This is a global precondition for the card-selection bug.
    if (G.inter_service && G.inter_service[faction] === 1) {
        const isrClassified = classifyCards(hand, strategy.role)
        const agreement = isrClassified.find(c => {
            const card = cards[c.id] || {}
            return card.isr_agreement && card.faction === faction && c.allowed.includes("event")
        })
        if (agreement) {
            return esm_set_card_pick(strategy, agreement, "event",
                strategy.role === "Japan" ? "JP04-S-ISR-AGREEMENT" : "AP10-S-ISR-AGREEMENT",
                `${strategy.role}清除己方ISR:打己方isr_agreement和解牌`)
        }
    }

    const semanticPick = esm_semantic_card_pick(strategy, hand)
    if (semanticPick) return semanticPick

    // 第4/10页是每次出牌都必须重走的独立决策树，不能被当前决策轴的 CONQUEST/EVENT
    // Page 4/10 is an independent decision tree that must be re-walked on every card play, and cannot be short-circuited by the current decision axis's CONQUEST/EVENT
    // 类型短路。返回 null 才表示图表没有给出可执行牌，继续使用战略轴的事件清单。
    // type. Returning null means the chart gave no playable card; continue with the strategy axis's event list.
    const chartPick = esm_card_selection_tree(strategy, hand)
    if (chartPick) return chartPick

    // 日本第4页：手牌多于2张时，C/D 未命中后先检查 E“可执行的无限制军事事件”。
    // Japan page 4: when hand has more than 2 cards, after C/D miss, first check E "playable unrestricted military event".
    // 旧实现按决策轴战略类型直接挑 OC，完全绕过本页，因而会把反应牌当 OC，同时留下
    // The old implementation picked OC directly by decision-axis strategy type, completely bypassing this page, thus playing reaction cards as OC while leaving
    // 高后勤军事事件。命中 E 时按图表的 EC 选择标准取后勤值最高者，并把用途意图带到
    // high-logistics military events behind. On hitting E, take the highest logistics value per the chart's EC selection criteria, and carry the intent forward to
    // 下一“Select action”窗口。
    // the next "Select action" window.
    if (strategy.role === "Japan") {
        const classified = classifyCards(hand, strategy.role)
        if (classified.length > 2) {
            const unrestricted = classified.filter(c => c.unrestricted && c.eventPlayable)
            if (unrestricted.length) {
                unrestricted.sort((a, b) => b.lv - a.lv || b.ops - a.ops || a.id - b.id)
                const chosen = unrestricted[0]
                strategy.cardIntent = "event"
                strategy.selectedCard = chosen.id
                strategy.cardTreeNode = "JP04-S-UNRESTRICTED-EC"
                return { action: "card", argument: chosen.id, via: `日本卡牌选择:E→无限制军事事件EC(LV ${chosen.lv})` }
            }
        }
    }
    if (strategy.kind === "GARRISON" || strategy.kind === "DEFEND") {
        // 国防圈与最终防御都需要实际激活、移动和会战。第4页若已经选中可执行
        // Both the defense perimeter and final defense require actual activation, movement and battle. If page 4 has already picked a playable
        // 军事事件，chartPick 会在上方返回并保留 event 意图；其余情况必须选 OC，
        // military event, chartPick returns above and preserves the event intent; in other cases an OC must be picked,
        // 不能用低值事件把整个防御行动窗口耗掉。
        // and a low-value event must not be used to waste the entire defensive action window.
        return esm_choose_card(hand, "ops", legal, strategy)
            || esm_choose_card(hand, "event", legal, strategy)
    }
    if (strategy.kind === "ABSTRACT") {
        // D4: 推进B29/原子弹胜利 = 打 OC 攻势把基地/资源链推向完成(而非当事件空耗)。
        // D4: push B29/atomic victory = play OC offensive to drive the base/resource chain toward completion (rather than wasting it as an event).
        // 原子弹胜利: 手中持"苏联入侵满洲"(AP#79)且可作事件时优先事件打出。
        // Atomic victory: when holding "Soviet Invasion of Manchuria" (AP#79) and it is playable as event, prefer playing it as event.
        const at = esm_atomic_event_pick(strategy, hand)
        if (at) return at
        const r = esm_choose_card(hand, "ops", legal, strategy)
        if (r) return r
        return esm_choose_card(hand, "event", legal, strategy) || null
    }
    if (wantOps) {
        const r = esm_choose_card(hand, "ops", legal, strategy)
        if (r) return r
        return esm_choose_card(hand, "event", legal, strategy) || null
    }
    if (wantEvent) {
        // C: 事件战略按早期事件清单顺序定向选牌; 清单无可执行行 -> 退化为通用选牌。
        // C: event strategy picks cards directionally in early-event-list order; if the list has no playable row -> fall back to generic card pick.
        const dl = esm_event_strategy_card_pick(strategy, hand)
        if (dl) return dl
        const r = esm_choose_card(hand, "event", legal, strategy)
        if (r) return r
        return esm_choose_card(hand, "ops", legal, strategy) || null
    }
    return null
}

// 在 hand 中选一张可作 action 意图(经 get_allowed_actions 验证)的牌:
// Pick a card in hand usable for the action intent (verified via get_allowed_actions):
//   ops   -> 行动值(OV)最高的可打 OC 的牌
//   ops   -> the playable-OC card with the highest operations value (OV)
//   event -> 可作事件中最小的 OV(保住大 OC 牌; 事件效益已含在己方牌组)
//   event -> the smallest OV among event-playable cards (preserving big OC cards; event benefit is already in the own deck)
// 验证失败退化(不抛错): 选任一手牌(仍由上层确保合法 action)。
// Degrade gracefully on verification failure (no throw): pick any hand card (upper layer still ensures a legal action).
function esm_choose_card(hand, intent, legal, strategy) {
    const classified = classifyCards(hand, strategy.role)
    const byId = new Map(classified.map(c => [c.id, c]))
    const hasIntent = c => (byId.get(c)?.allowed || []).includes(intent)
    const ev = intent === "event"
    let pool = hand.filter(hasIntent)
    if (!pool.length) pool = hand.slice()
    if (!pool.length) return null
    const score = c => byId.get(c) || { ops:0, military:false, eventRank:99 }
    pool.sort((a, b) => {
        const x=score(a), y=score(b)
        if (ev) return x.eventRank-y.eventRank || x.ops-y.ops || a-b
        // 图表 OC：先用非军事牌；只有没有非军事牌时才进入军事牌池。
        // Chart OC: prefer non-military cards first; only enter the military card pool when no non-military card exists.
        return Number(x.military)-Number(y.military) || y.ops-x.ops || a-b
    })
    const chosen = pool[0]
    const viaAction = hasIntent(chosen) ? intent : (byId.get(chosen)?.allowed || []).includes("event") ? "event" : "ops"
    return { action: "card", argument: chosen, via: `${strategy.name}:${viaAction}` }
}

function esm_set_card_pick(strategy, card, intent, node, label) {
    strategy.cardIntent=intent
    strategy.selectedCard=card.id
    strategy.cardTreeNode=node
    return {action:"card",argument:card.id,via:label}
}

function esm_card_selection_tree(strategy, hand) {
    const side=strategy.role==="Japan"?"JP":"AP", prefix=side==="JP"?"JP04":"AP10"
    let c=classifyCards(hand,strategy.role)
    if(!c.length)return null
    if(side==="AP"&&c.length>1&&typeof SOVIET_INVADE!=="undefined"){
        const withoutSoviet=c.filter(x=>x.id!==SOVIET_INVADE)
        if(withoutSoviet.length)c=withoutSoviet
    }
    // JP04 注释：Operation MI 除非仍在早期且执行中太平洋/外围防御，或它是唯一可用牌，否则不纳入评估。
    // JP04 note: Operation MI is excluded from evaluation unless still in the early phase and executing Central Pacific / outer defense, or it is the only usable card.
    if(side==="JP"&&c.length>1&&!(strategy.phase==="early"&&/中太平洋|外围防御/.test(strategy.name)))
        c=c.filter(x=>!/^operation mi$/i.test(x.name))
    const bonusRank=x=>x.reinforcementBonus?0:x.otherBonus?1:2
    const sortEvent=(a,b)=>b.lv-a.lv||bonusRank(a)-bonusRank(b)||b.ops-a.ops||a.id-b.id
    const sortOps=(a,b)=>Number(a.military)-Number(b.military)||b.ops-a.ops||a.id-b.id
    // 第5页注释要求“为每个目标编成任务部队”。开局菲律宾/东印度是夺占
    // Page 5 note requires "forming a task force for each objective". Opening Philippines / East Indies are capture
    // 目标：EC 若限定在错误 HQ，或事件过滤掉地面/海军之一，就不能形成
    // objectives: if the EC is restricted to the wrong HQ, or the event filters out either ground or naval, it cannot form
    // 地面占领 + 海军护航（航空/航母可从格外参战）的完整编成。这样的牌
    // the complete composition of ground occupation + naval escort (air/carrier can join from outside the hex). Such cards
    // 保留 OC 用法，不能因牌面 LV 高就浪费为无效事件。
    // keep their OC usage and must not be wasted as ineffective events just because of a high printed LV.
    const openingOccupation=side==="JP"&&Number(G.turn)===2&&
        (strategy.targetMeta||[]).some(t=>t&&t.requiresOccupation)
    const event=c.filter(x=>x.eventPlayable&&(!openingOccupation||x.openingOccupationCompatible))
    const ops=c.filter(x=>x.opsPlayable)
    const unres=event.filter(x=>x.unrestricted), restricted=c.filter(x=>x.restricted)
    const eligibleEventIds=new Set(event.map(x=>x.id))
    const restrictedEvent=restricted.filter(x=>eligibleEventIds.has(x.id))
    const nonMilitaryOps=ops.filter(x=>!x.military)
    const played=!!(G.offensive&&G.offensive.active_cards&&G.offensive.active_cards.length)
    // AP L+M：每次非首张攻势牌前，若中国距投降≤2且有可用中国事件，立即打出。
    // AP L+M: before each non-first offensive card, if China is within 2 of surrender and a usable China event exists, play it immediately.
    if(side==="AP"&&played&&G.surrender&&G.surrender[nations.CHINA.id]>=3){
        const china=event.filter(x=>cards[x.id]&&cards[x.id].china)
        if(china.length)return esm_set_card_pick(strategy,china.sort(sortEvent)[0],"event",`${prefix}-S-CHINA`,"盟军卡牌选择:L+M→中国事件")
    }
    // 图中 B 以下只在手牌>2时进入先发/军事事件链。
    // In the chart, B and below enter the first-strike/military-event chain only when hand > 2.
    if(c.length>2){
        const firstGame=!(G.discard?.[JP]?.length||G.discard?.[AP]?.length||played)
        if(firstGame){
            const re=side==="JP"?/i.?go|second operational phase|第二阶段作战/i:/flintlock|shoestring|燧发枪|脚指甲/i
            const first=event.filter(x=>re.test(x.name))
            if(first.length)return esm_set_card_pick(strategy,first.sort(sortEvent)[0],"event",`${prefix}-S-FIRST`,`${strategy.role}卡牌选择:C+D→先发打击EC`)
        }
        if(unres.length)return esm_set_card_pick(strategy,unres.sort(sortEvent)[0],"event",`${prefix}-S-UNRESTRICTED-EC`,`${strategy.role}卡牌选择:E→无限制军事事件EC`)
        if(restricted.length){
            if(restrictedEvent.length)return esm_set_card_pick(strategy,restrictedEvent.sort(sortEvent)[0],"event",`${prefix}-S-RESTRICTED-EC`,`${strategy.role}卡牌选择:F+G→有限制军事事件EC`)
            const pool=nonMilitaryOps.length?nonMilitaryOps:ops
            if(pool.length)return esm_set_card_pick(strategy,pool.sort(sortOps)[0],"ops",`${prefix}-S-RESTRICTED-OC`,`${strategy.role}卡牌选择:F+G→受限事件OC`)
        }
        if(ops.length)return esm_set_card_pick(strategy,(nonMilitaryOps.length?nonMilitaryOps:ops).sort(sortOps)[0],"ops",`${prefix}-S-NONMIL-OC`,`${strategy.role}卡牌选择:F→无军事事件OC`)
    }
    // H：本回合已有 FO 时打非军事 OC。J：仅剩一牌且非第12回合，设置 FO。
    // H: when this turn already has an FO, play a non-military OC. J: when only one card remains and it is not turn 12, set an FO.
    const mine=esm_role_faction(strategy.role)
    if(G.future_offensive&&G.future_offensive[mine]>0&&ops.length)
        return esm_set_card_pick(strategy,(nonMilitaryOps.length?nonMilitaryOps:ops).sort(sortOps)[0],"ops",`${prefix}-S-NONMIL-OC`,`${strategy.role}卡牌选择:H→无军事事件OC`)
    if(c.length===1&&G.turn!==12&&c[0].futurePlayable)
        return esm_set_card_pick(strategy,c[0],"future_offensive",`${prefix}-S-FO`,`${strategy.role}卡牌选择:J→未来攻势`)
    // K：最后可用事件是反应牌时不浪费其事件能力，按 OC；否则进入事件战略。
    // K: when the last usable event is a reaction card, do not waste its event ability — play as OC; otherwise enter the event strategy.
    const usableEvents=event.filter(x=>!cards[x.id]?.reaction)
    if(!usableEvents.length&&ops.length)
        return esm_set_card_pick(strategy,(nonMilitaryOps.length?nonMilitaryOps:ops).sort(sortOps)[0],"ops",`${prefix}-S-NONMIL-OC`,`${strategy.role}卡牌选择:K→保留反应牌`)
    return null
}

// 在真正打牌前做一次只读的启动能力预检。引擎的精确启动区由
// Do a read-only activation-capability pre-check before actually playing the card. The engine's precise activation zone is
// get_activatable_units() 在攻势建立后计算；此处不能调用它（会改写 L 与
// computed by get_activatable_units() after the offensive is established; it cannot be called here (it would mutate L and
// supply_cache），所以按牌面限定 HQ、HQ 指挥范围、补给类型和 OOS 排除
// supply_cache), so use the card's printed HQ restriction, HQ command range, supply type, and OOS exclusion to rule out
// 明显的“事件可点击、但选完 HQ 后没有任何单位可启动”的空攻势。
// obvious "event is clickable, but after choosing HQ no unit can be activated" empty offensives.
// null 表示测试沙箱缺少地图对象，此时保持原有行为，避免把未知当作零。
// null means the test sandbox lacks map objects; keep original behavior in that case, avoiding treating unknown as zero.
function esm_card_activation_classes(card) {
    const source=String(card?.before_unit_activation||"")
    let ground=true,naval=true,air=true
    if(/piece\.class\s*===\s*["']air["']/.test(source)){ground=false;naval=false}
    if(/piece\.class\s*===\s*["']naval["']/.test(source)){ground=false;air=false}
    if(/piece\.class\s*===\s*["']ground["']/.test(source)){naval=false;air=false}
    if(/piece\.class\s*!==\s*["']ground["']/.test(source)&&
        !/piece\.class\s*!==\s*["']ground["']\s*\|\|/.test(source))ground=false
    if(/piece\.class\s*!==\s*["']naval["']/.test(source))naval=false
    return {ground,naval,air}
}

function esm_card_activation_capacity(card, role, useEventHq) {
    if (typeof pieces === "undefined" || typeof HQ_LIST === "undefined" ||
        !G || !Array.isArray(G.location) || typeof get_distance !== "function") return null
    const mine=esm_role_faction(role)
    let hqs=(useEventHq&&Array.isArray(card?.hq)&&card.hq.length?card.hq:HQ_LIST).filter(id=>{
        const h=pieces[id],loc=G.location[id]
        return h&&h.class==="hq"&&h.faction===mine&&Number.isFinite(loc)&&
            (typeof LAST_BOARD_HEX==="undefined"||loc<=LAST_BOARD_HEX)&&
            (!(G.oos&&set_has(G.oos,id))||card===cards[GENERAL_ADACHI])
    })
    if(!hqs.length)return 0
    const classes=useEventHq?esm_card_activation_classes(card):{ground:true,naval:true,air:true}
    const source=String(card?.before_unit_activation||"")
    // Operation Z 一类事件显式重建全图候选，不受普通 HQ 启动区预检约束。
    // Events like Operation Z explicitly rebuild the whole-map candidate set, not constrained by the normal HQ activation-zone pre-check.
    if(useEventHq&&/for_each_unit_on_map/.test(source))
        return pieces.filter((u,id)=>id>0&&u&&u.faction===mine&&u.class!=="hq"&&G.location[id]<=LAST_BOARD_HEX).length
    let best=0
    const exact=typeof mark_activation_zone==="function"&&typeof HEX_TEMP_FLAG3!=="undefined"&&Array.isArray(G.supply_cache)
    const savedCache=exact?G.supply_cache.slice():null
    const hadLSupply=typeof L!=="undefined"&&Object.prototype.hasOwnProperty.call(L,"supply")
    const savedLSupply=typeof L!=="undefined"?L.supply:undefined
    try{
        if(exact&&typeof check_supply==="function")check_supply()
        for(const hqId of hqs){
            const hq=pieces[hqId],range=Math.max(0,Number(hq.cr)||0),supply=Number(hq.supply)||0
            if(exact)mark_activation_zone(hqId)
            let count=0
            for(let id=1;id<pieces.length;id++){
                const u=pieces[id],loc=G.location[id]
                if(!u||u.faction!==mine||u.class==="hq"||!Number.isFinite(loc))continue
                if(classes[u.class]===false)continue
                if(typeof LAST_BOARD_HEX!=="undefined"&&loc>LAST_BOARD_HEX)continue
                if(supply&&Number(u.supply)&&!(Number(u.supply)&supply))continue
                if(G.oos&&set_has(G.oos,id)&&card!==cards[GENERAL_ADACHI])continue
                if(exact?!!(G.supply_cache[loc]&HEX_TEMP_FLAG3):get_distance(G.location[hqId],loc)<=range)count++
            }
            if(count>best)best=count
        }
    }finally{
        if(savedCache)G.supply_cache=savedCache
        if(typeof L!=="undefined"){
            if(hadLSupply)L.supply=savedLSupply
            else delete L.supply
        }
    }
    return best
}

// 第4/10页共用卡牌分类器。只读取己方手牌；allowed 是引擎对当前
// Shared card classifier for pages 4/10. Only reads the own hand; allowed is the usable-mode computed by the engine for the current
// 状态计算出的可用方式。牌面限定 HQ 也是“受限军事事件”，不能只检查
// state. A card with a printed HQ restriction is also a "restricted military event"; do not check only
// 回调字段，否则会把限定舰队/HQ 的牌误列进无限制军事事件池。
// the callback fields, otherwise fleet/HQ-restricted cards would be misclassified into the unrestricted military event pool.
function classifyCards(ownHand, role) {
    const mine = esm_role_faction(role)
    const ownRivalry = !!(G.inter_service && G.inter_service[mine])
    const foeRivalry = !!(G.inter_service && G.inter_service[1-mine])
    return (ownHand || []).map(id => {
        const card = cards[id] || {}
        let allowed=[]
        try { allowed=get_allowed_actions(id)||[] } catch(e) { allowed=[] }
        const military=card.type===MILITARY
        const restricted=military && (!!card.before_unit_activation || !!card.before_commit_offensive ||
            (Array.isArray(card.hq)&&card.hq.length>0))
        const eventActivationCapacity=military?esm_card_activation_capacity(card,role,true):null
        const opsActivationCapacity=esm_card_activation_capacity(card,role,false)
        // 开局占领战至少要求能启动两个单位；仅一单位的军事攻势既无法组成
        // Opening occupation requires being able to activate at least two units; a single-unit military offensive can neither form
        // 地面+护航，也无法落实格外航空/航母支援，留作 OC/FO 比空耗 EC 合理。
        // ground+escort nor deliver extra-hex air/carrier support, so keeping it as OC/FO is more sensible than wasting an EC.
        const openingMin=role==="Japan"&&Number(G.turn)===2?2:1
        const eventHasForce=eventActivationCapacity===null||eventActivationCapacity>=openingMin
        const opsHasForce=opsActivationCapacity===null||opsActivationCapacity>=openingMin
        const activationClasses=esm_card_activation_classes(card)
        const supportsGround=activationClasses.ground,supportsNaval=activationClasses.naval
        const southIds=[]
        if(typeof HQ_JP_SOUTH!=="undefined")southIds.push(HQ_JP_SOUTH)
        if(typeof HQ_SOUTH_SEAS!=="undefined")southIds.push(HQ_SOUTH_SEAS)
        const openingHqCompatible=!Array.isArray(card.hq)||!card.hq.length||card.hq.some(id=>southIds.includes(id))
        const openingOccupationCompatible=openingHqCompatible&&supportsGround&&supportsNaval
        const name=String(card.name||"")
        let eventRank=50
        if (card.wie) eventRank=1
        else if (/replacement|reinforcement/i.test(name)) eventRank=2
        else if (ownRivalry && card.isr_agreement) eventRank=3
        else if (!foeRivalry && card.isr_rivalry) eventRank=4
        else if (card.china) eventRank=5
        const reinforcementBonus=!!(card.reinforcements||card.replacements||/reinforcement|replacement/i.test(name))
        const otherBonus=!!(card.draw||card.logistic_alt||card.bonus)
        return {id,name,type:card.type,ops:Number(card.ops)||0,lv:Number(card.logistic)||0,
            military,restricted,unrestricted:military&&!restricted,allowed,
            eventPlayable:allowed.includes("event")&&eventHasForce,
            opsPlayable:allowed.includes("ops")&&opsHasForce,
            eventActivationCapacity,opsActivationCapacity,
            supportsGround,supportsNaval,openingOccupationCompatible,
            futurePlayable:G.turn!==12&&allowed.includes("future_offensive"),eventRank,
            reinforcementBonus,otherBonus}
    })
}

// ---- C: 事件战略顺序化 ------------------------------------------------------
// ---- C: event-strategy sequentialization -------------------------------------
// 把已钉早期事件清单(JP 8 行 / AL 6 行)逐行译成“手牌/引擎状态”条件, 按清单顺序取
// Translate the pinned early-event list (JP 8 rows / AL 6 rows) row-by-row into "hand/engine-state" conditions, taking
// 首个可执行行:
// the first playable row in list order:
//   • 结束己方ISR(JP 行2 / AL 行2 前半) — 己方 ISR 激活时, 取【己方阵营】ISR 和解牌
//   • end own ISR (JP row 2 / AL row 2 first half) — when own ISR is active, take the own-faction ISR reconciliation card
//     (isr_agreement; 引擎 default_event 按 card.faction 清除该方 ISR);
//     (isr_agreement; engine default_event clears that side's ISR by card.faction);
//   • 造成敌方ISR(JP 行3 / AL 行3)         — 敌方尚未 ISR 时, 取【己方阵营】ISR 竞争牌
//   • cause enemy ISR (JP row 3 / AL row 3) — when the enemy is not yet in ISR, take the own-faction ISR rivalry card
//     (isr_rivalry; 引擎 default_event 对 1-faction 施加竞争);
//     (isr_rivalry; engine default_event applies rivalry to 1-faction);
//   • 点名事件牌: 东京玫瑰 / 杜立特空袭 / 巴丹行军 / 天气牌(JP 行4,6 / AL 行4,5);
//   • named event cards: Tokyo Rose / Doolittle Raid / Bataan Death March / weather cards (JP rows 4,6 / AL rows 4,5);
//   • 其余行(欧战正负 / 补员牌 / 东条1OC / FOQ / 其他放牌): 引擎无可稳定判定的执行信号,
//   • other rows (Europe War +/- / reinforcement cards / Tojo 1OC / FOQ / other discards): the engine has no stably-decidable execution signal,
//     顺延该行 —— 通用选牌(esm_choose_card)即覆盖“其他放牌/补员”等兜底。
//     defer that row — generic card pick (esm_choose_card) covers the "other discard/reinforcement" fallback.
// 命中行的意图子集内选最小 OV(事件意图下保住大 OC 牌)。确定性: 只读引擎当前状态
// Pick the smallest OV within the hit row's intent subset (under event intent, preserve big OC cards). Deterministic: read-only over engine current state
// (G.inter_service) 与牌面 meta, 不触碰引擎 RNG。行级条件不满足则顺延, 故为真“顺序化”。
// (G.inter_service) and card meta, not touching engine RNG. If a row's condition is unmet, defer to the next, hence true "sequentialization".
// 全行不可行 -> null, 调方退化为现通用行为。
// If no row is feasible -> null, caller degrades to the existing generic behavior.
function esm_event_strategy_card_pick(strategy, hand) {
    if (!strategy || strategy.kind !== "EVENT" || strategy.name !== "事件战略") return null
    const list = (strategy.targets || []).map(t => String(t).replace(/^\d+\s*[.、)]?\s*/, "")).filter(Boolean)
    if (!list.length) return null
    const mine = esm_role_faction(strategy.role)
    const foe = 1 - mine
    const ownRiv = (G.inter_service && G.inter_service[mine]) === 1
    const foeRiv = (G.inter_service && G.inter_service[foe]) === 1
    const meta = c => cards[c] || {}
    const eventCapable = c => { try { return (get_allowed_actions(c) || []).includes("event") } catch (e) { return false } }
    const all = (hand || []).map(id=>({id,card:meta(id),allowed:(()=>{try{return get_allowed_actions(id)||[]}catch(e){return[]}})()}))
    const pool = all.filter(x=>x.allowed.includes("event")).map(x=>x.id)
    if (!all.length) return null
    const own = f => pool.filter(c => meta(c).faction === mine && f(meta(c)))
    const choose=(ids,intent,line,i)=>{
        if(!ids||!ids.length)return null
        const sorted=ids.slice().sort((a,b)=>(Number(meta(a).ops)||0)-(Number(meta(b).ops)||0)||a-b)
        return {action:"card",argument:sorted[0],intent,via:`${strategy.name}:清单#${i+1}「${line}」:${intent}`}
    }
    for (let i = 0; i < list.length; i++) {
        const line = list[i]
        let hit = null
        let intent="event"
        if (/欧战|欧洲战事|War in Europe/i.test(line)) {
            const ids=all.filter(x=>x.card.wie).map(x=>x.id)
            intent=Number(G.wie)>0?"event":"future_offensive"
            hit=ids.filter(id=>all.find(x=>x.id===id)?.allowed.includes(intent))
        } else if (/补员|增援|replacement|reinforcement/i.test(line)) {
            hit=pool.filter(c=>/replacement|reinforcement/i.test(String(meta(c).name||""))||meta(c).replacements||meta(c).reinforcements)
        } else if (/结束.*ISR|ISR.*(?:结束|清除|消除)/.test(line)) {
            if (ownRiv) hit = own(m => m.isr_agreement)            // 己方 ISR 激活时才值得打和解牌
            // worth playing the reconciliation card only when own ISR is active
            else { intent="future_offensive"; hit=all.filter(x=>x.card.faction===mine&&x.card.isr_agreement&&x.allowed.includes(intent)).map(x=>x.id) }
        } else if (/造成.*ISR|引发.*ISR/.test(line)) {
            if (!foeRiv) hit = own(m => m.isr_rivalry)             // 敌方已 ISR 则重复施加无效
            // if enemy already in ISR, applying it again has no effect
        } else if (/东京玫瑰|Tokyo Rose/i.test(line)) {
            hit = pool.filter(c => /tokyo rose/i.test(meta(c).name))
        } else if (/杜立特|Doolittle Raid/i.test(line)) {
            hit = pool.filter(c => /^doolittle raid$/i.test(meta(c).name))
        } else if (/巴丹|Bataan|Battan/i.test(line)) {
            hit = pool.filter(c => /battan death march|bataan death march/i.test(meta(c).name))
        } else if (/天气|weather/i.test(line)) {
            const wx=all.filter(x=>/^weather$/i.test(x.card.name||""))
            intent="future_offensive";hit=wx.filter(x=>x.allowed.includes(intent)).map(x=>x.id)
        } else if (/东条.*1OC/i.test(line)) {
            const tj=all.filter(x=>/tojo/i.test(x.card.name||"")); intent="ops"; hit=tj.filter(x=>x.allowed.includes(intent)).map(x=>x.id)
        } else if (/其他.*(?:未来攻势|FOQ)|其他放牌/i.test(line)) {
            intent="future_offensive";hit=all.filter(x=>x.allowed.includes(intent)).map(x=>x.id)
        } else {
            hit = null
        }
        if (!hit || !hit.length) continue
        const picked=choose(hit,intent,line,i)
        strategy.cardIntent=intent;strategy.selectedCard=picked.argument;strategy.cardTreeNode=strategy.role==="Japan"?"JP04-S-EVENT":"AP10-S-EVENT"
        return picked
    }
    return null
}

// 选行动窗("C{idx}: Select action."): 按已钉战略选 ops/event 等。
// Action-window selection ("C{idx}: Select action."): pick ops/event etc. per the pinned strategy.
function esm_china_ready(strategy) {
    if (strategy.role !== "Japan") return false
    const index = (strategy.goals || []).findIndex(g => g.meta && g.meta.followupActions)
    if (index < 0) return false
    return strategy.goals.slice(0,index+1).every(g => (g.hexes||[]).every(h => is_space_controlled(h,JP)))
}
function esm_semantic_card_pick(strategy, hand) {
    const classified = classifyCards(hand,strategy.role)
    if (esm_china_ready(strategy)) {
        const offensive = classified.filter(c => { try { return get_allowed_actions(c.id).includes("china_offensive") } catch(e) {return false} })
            .sort((a,b)=>a.ops-b.ops||a.id-b.id)[0]
        if (offensive) return esm_set_card_pick(strategy,offensive,"china_offensive","JP-CHINA-OFFENSIVE","中国投降：中国攻势")
        const event = classified.find(c=>c.eventPlayable && cards[c.id] && cards[c.id].china)
        if (event) return esm_set_card_pick(strategy,event,"event","JP-CHINA-EVENT","中国投降：中国事件")
    }
    if (strategy.role === "Japan" && strategy.ctx && strategy.ctx._allocationFrom && Number(G.wie)>0) {
        const europe = classified.find(c=>c.eventPlayable && cards[c.id] && cards[c.id].wie)
        if(europe) return esm_set_card_pick(strategy,europe,"event","JP01-RESOURCE-WIE","资源战略注[5]：欧战事件优先")
    }
    if (strategy.role === "Allies" && strategy.name === "建立ABDA") {
        const arcadia = classified.find(c=>c.eventPlayable && c.id===find_card(AP,4))
        if(arcadia) return esm_set_card_pick(strategy,arcadia,"event","AP07-ABDA","建立ABDA：阿卡迪亚会议")
    }
    if (ESM_REDEPLOY[strategy.name] || ["DEI防御","橙色计划","攻势进攻","推进B29"].includes(strategy.name)) {
        const oc = classified.filter(c=>c.opsPlayable).sort((a,b)=>b.ops-a.ops||a.id-b.id)[0]
        if(oc) return esm_set_card_pick(strategy,oc,"ops","AP-SEMANTIC-OC",strategy.name+"：执行指定调动/攻击")
    }
    return null
}
function esm_card_action_window_action(strategy, view, context) {
    const legal = Object.keys(view.actions || {}).filter(a => { const v = view.actions[a]; return Array.isArray(v) ? v.length > 0 : Boolean(v) })
    if (strategy.cardIntent && legal.includes(strategy.cardIntent)) {
        const intent = strategy.cardIntent
        strategy.cardIntent = null
        return { action: intent, argument: undefined, via: `${strategy.cardTreeNode || strategy.name}:${intent}` }
    }
    const wantEvent = strategy.kind === "EVENT"
    const wantOps = strategy.kind === "CONQUEST" || strategy.kind === "ABSTRACT"
        || strategy.kind === "GARRISON" || strategy.kind === "DEFEND"
    if (wantOps && legal.includes("ops")) return { action: "ops", argument: undefined, via: strategy.name + ":ops" }
    if (wantEvent && legal.includes("event")) return { action: "event", argument: undefined, via: strategy.name + ":event" }
    // 所选牌的受限事件/OC不可用时，按第4/10页的其余合法用途继续；
    // When the chosen card's restricted event/OC is unavailable, continue with the remaining legal uses from page 4/10;
    // 第12回合禁止设置未来攻势。
    // setting a future offensive is forbidden on turn 12.
    if (G.turn !== 12 && legal.includes("future_offensive")) return {action:"future_offensive",argument:undefined,via:strategy.name+":future-offensive"}
    for (const action of ["inter_service","china_offensive","jarhat","imphal","ledo","return_hq","displace_hq","discard"])
        if (legal.includes(action)) return {action,argument:undefined,via:strategy.name+":"+action}
    return null
}

// D4: 原子弹胜利 —— 手牌含"苏联入侵满洲"(AP#79)且可作事件时, 优先事件打出(触发 esm_atomic_met
// D4: atomic victory — when hand contains "Soviet Invasion of Manchuria" (AP#79) and it is playable as event, prefer playing it as event (triggering esm_atomic_met's
// 的苏联条件); 否则返回 null 让调用方走 OPS 攻势。
// Soviet condition); otherwise return null to let the caller take the OPS offensive.
function esm_atomic_event_pick(strategy, hand) {
    if (!strategy || strategy.kind !== "ABSTRACT" || strategy.name !== "原子弹胜利") return null
    if (typeof SOVIET_INVADE === "undefined" || !hand || hand.indexOf(SOVIET_INVADE) === -1) return null
    const allowed = (() => { try { return get_allowed_actions(SOVIET_INVADE) } catch (e) { return null } })()
    if (allowed && allowed.indexOf("event") !== -1) {
        return { action: "card", argument: SOVIET_INVADE, via: strategy.name + ":soviet" }
    }
    return null
}

// 对外 trace: 供 erasmus.js publicTrace 附加
// External trace: appended by erasmus.js publicTrace
function esm_trace_of(strategy, privateDetails) {
    if (!strategy) return null
    const goalKinds = (strategy.goals || []).map(g => g.kind)
    let diag = strategy.ctx && strategy.ctx._diag ? JSON.parse(JSON.stringify(strategy.ctx._diag)) : undefined
    if (diag && diag.atomic && !privateDetails) {
        delete diag.atomic.sovietInHand
        delete diag.atomic.sovietPlayable
        delete diag.atomic.sovietReady
        delete diag.atomic.met
    }
    return { axis: strategy.role + "/" + strategy.phase + "/" + strategy.name, kind: strategy.kind, phase: strategy.phase,
        strategy: strategy.name, chainHead: strategy.chain[0] !== undefined ? strategy.chain[0] : null,
        focus: eop_focus(strategy.role), chainLen: strategy.chain.length,
        priorityTargets: esm_strategy_targets(strategy),
        goals: goalKinds.length ? goalKinds : undefined,
        ...(strategy.powEmergency ? { powEmergency: strategy.powEmergency } : {}),
        ...(strategy.openingSurrenderPlan ? { openingSurrenderPlan: strategy.openingSurrenderPlan } : {}),
        ...(strategy.progressPlan ? { progressPlan: strategy.progressPlan } : {}),
        ...(strategy.victoryPreparation ? { victoryPreparation: strategy.victoryPreparation } : {}),
        ...(strategy.eventPhase ? { eventPhase: strategy.eventPhase } : {}),
        ...(diag ? { diag } : {}) }
}

// 调试日志: 把每张牌钉选时的 AI 阶段、所选战略与当前首位战略目标写入 RTT 日志
// Debug log: write the AI phase at the time each card is pinned, the chosen strategy, and the current top-priority strategy target into the RTT log
// (G.log), 便于人工在回放里直接看到 AI 处在哪个阶段、执行哪条战略、把哪些地点
// (G.log), so humans can directly see in replay which phase the AI is in, which strategy it is executing, and which locations
// 放在队首。纯展示, 不触碰引擎状态 / RNG。
// are at the head of the queue. Purely presentational, not touching engine state / RNG.
function esm_log_strategy(strategy) {
    try {
        if (typeof log !== "function" || !strategy) return
        const roleCn = strategy.role === "Japan" ? "日本" : "盟军"
        const phaseCn = strategy.phase === "early" ? "早期" : strategy.phase === "mid" ? "中期" : "晚期"
        const targets = esm_strategy_targets(strategy)
        const head = targets.slice(0, 5).map(t => {
            const nm = t.name ? t.name : `#${t.hex}`
            const ctl = t.controlledBy === "Japan" ? "日" : t.controlledBy === "Allies" ? "盟" : "?"
            const mark = t.achieved ? "✓" : "·"
            return `${t.priority}.${mark}${nm}(${t.hex}${ctl})`
        }).join(" ")
        log(`[ERASMUS] ${roleCn}·${phaseCn} 战略「${strategy.name}」 首位目标: ${head || "(无)"}`)
    } catch (e) { /* 日志失败不影响决策 */ }
    // Logging failure does not affect the decision.
}
