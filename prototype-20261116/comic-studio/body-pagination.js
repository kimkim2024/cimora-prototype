/* 第三步正文分页。只保存独立草稿，不改上游源或第四步图文。 */
window.BodyPagination = (() => {
  const assetBase = typeof document !== 'undefined' && document.currentScript ? new URL('.', document.currentScript.src).href : null;
  const assetURL = src => src ? new URL(src, assetBase || location.href).href : '';
  const copy = (x) => JSON.parse(JSON.stringify(x)),
    E = (x) =>
      String(x ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      ),
    id = () =>
      "bp-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 7);
  function outline(p, e) {
    const confirmed = p.storyPlan?.confirmed && p.storyPlan.episodes?.find(x => x.id === e.id);
    if (confirmed) return confirmed.text || "该集暂无集纲快照。";
    const o = p.source?.outline?.find((x) => x.id === e.id);
    return (
      o?.events ||
      o?.summary ||
      o?.text ||
      o?.beat ||
      o?.content ||
      (sourceKind(p) === "inspiration" ? e.text : "") ||
      "该集暂无集纲快照。"
    );
  }
  function sourceKind(p) {
    if (p.source?.type === "script-asset-snapshot") return "story";
    if (!p.source) return "inspiration";
    return "unknown";
  }
  function body(p, e) {
    const script = p.source?.scripts?.[e.id];
    if (sourceKind(p) === "story") {
      if (typeof script?.fullText === "string")
        return {
          text: script.fullText,
          origin: "故事资产正文快照",
          sourceId: e.id,
        };
      if (script?.scenes?.length)
        return {
          text: script.scenes
            .map((s) =>
              [s.action, s.dialogue, s.mind].filter(Boolean).join("\n"),
            )
            .join("\n\n"),
          origin: "故事资产结构化正文快照",
          sourceId: e.id,
        };
      return { text: "", origin: "缺少该集正文快照", sourceId: e.id };
    }
    if (sourceKind(p) === "inspiration")
      return { text: "", origin: "独立灵感 · 尚未准备正文", sourceId: e.id };
    return { text: "", origin: "无法识别的正文来源", sourceId: e.id };
  }
  function state(p, e) {
    p.bodyPagination ??= { episodes: {} };
    return (p.bodyPagination.episodes[e.id] ??= {
      ...body(p, e),
      pages: [],
      archives: [],
      selected: "",
      bodyHistory: [],
    });
  }
  function splitExact(text, n) {
    if (!text) return [];
    n = Math.min(Math.max(1, Math.floor(n)), 30, text.length);
    const cuts = [0];
    for (let i = 1; i < n; i++) {
      let target = Math.floor((text.length * i) / n),
        cut = text.indexOf("\n", target);
      if (cut < 0 || cut >= Math.floor((text.length * (i + 1)) / n))
        cut = target;
      if (cut <= cuts.at(-1)) cut = cuts.at(-1) + 1;
      cuts.push(cut);
    }
    cuts.push(text.length);
    return cuts
      .slice(0, -1)
      .map((start, i) => ({
        start,
        end: cuts[i + 1],
        text: text.slice(start, cuts[i + 1]),
      }));
  }
  function associate(p, text) {
    return p.assets
      .filter((a) => a.adoptedVisualId && a.name && text.includes(a.name))
      .map((a) => ({
        assetId: a.id,
        versionId: a.adoptedVisualId,
        via: "name-rule",
      }));
  }
  function assetStatus(a, r) {
    return !r.versionId ? '尚无采用图' : r.versionId === a.adoptedVisualId ? '已采用参考' : '保留旧版参考';
  }
  function assetGroups(p, pg) {
    return ['人物', '场景', '道具'].map(kind => {
      const assets = p.assets.filter(a => (a.kind === '角色' ? '人物' : a.kind) === kind);
      const refs = (pg.refs || []).filter(r => assets.some(a => a.id === r.assetId));
      return `<div class="bp-asset-group"><h4>${kind === '人物' ? '出镜角色' : kind === '场景' ? '本页场景' : '本页道具'}<small>${refs.length} 项</small></h4><div class="bp-linked-assets">${refs.map(r => {
        const a = assets.find(a => a.id === r.assetId);
        const v = a.visualVersions?.find(v => v.id === r.versionId);
        const src = assetURL(v?.images?.main);
        return `<button type="button" data-bp-detail="${E(a.id)}" aria-label="查看${E(a.name)}的资产资料">${src ? `<img src="${E(src)}" alt="${E(a.name)}">` : '<span class="bp-asset-missing">待准备</span>'}<span><b>${E(a.name)}</b><small>${E(assetStatus(a, r))}</small></span></button>`;
      }).join('') || '<p class="hint">尚未关联</p>'}</div><details data-bp-kind="${kind}"><summary>调整关联资产</summary><div class="bp-asset-picker">${assets.map(a => `<label><input type="checkbox" data-bp-asset="${E(a.id)}" ${refs.some(r => r.assetId === a.id) ? 'checked' : ''}>${E(a.name)}</label>`).join('') || `<p class="hint">暂无${kind}，可返回视觉资产准备。</p>`}</div></details></div>`;
    }).join('');
  }
  function view(p, M) {
    const es = M.episodes(p),
      e = es.find((e) => e.id === p.activeEpisodeId) || es[0];
    p.activeEpisodeId = e.id;
    const d = state(p, e);
    return `<div class="bp-title"><h2>正文与分页</h2><small>正文 → 整页内容 · 本步不做视觉分镜</small></div><p class="bp-impact">分页保存后可进入第四步创作整页作品。</p><div class="bp-columns"><section class="bp-pages"><h3>分页内容 <small>${d.pages.length}页</small></h3>${
      d.text.trim()
        ? `<div class="bp-controls"><button id="bpSplit" class="primary">自动分页</button></div><p class="hint">按完整正文顺序分段，保留全部字符；规则演示，非AI识别。</p>${
            d.pages
              .map(
                (pg, i) =>
                  `<article class="bp-card ${pg.id === d.selected ? "selected" : ""}"><button data-bp-page="${pg.id}"><strong>第${i + 1}页${pg.edited ? " · 已手改" : ""}</strong><span>${E(pg.text.slice(0, 75))}…</span></button>${
                    pg.id === d.selected
                      ? `<label>本页完整内容<textarea id="bpPageText" rows="9">${E(pg.text)}</textarea></label><small>来源：${E(d.origin)} · 字符 ${pg.mapping.start}—${pg.mapping.end}${pg.edited ? " · 手改后与源段不完全一致" : ""}</small><div class="bp-assets">${assetGroups(p, pg)}</div><div class="bp-ref"><label>本页创作参考<input id="bpReference" type="file" accept="image/png,image/jpeg,image/webp"></label><small>仅参考附件，不识别布局，不等同第二步采用资产。</small>${pg.reference ? `<img src="${pg.reference.image}" alt="本页创作参考"><span>${E(pg.reference.name)}</span><button id="bpRemoveReference">移除参考</button>` : ""}</div>`
                      : ""
                  }</article>`,
              )
              .join("") ||
            '<p class="bp-empty">正文已准备好，点击自动分页建立整页草稿。</p>'
          }`
        : '<p class="bp-empty">正文准备后即可自动分页；灵感创作请先生成正文。</p>'
    }<details><summary>保留的分页旧稿 · ${d.archives.length}</summary>${d.archives.map((a, i) => `<button data-bp-restore="${i}">恢复第${i + 1}次旧稿（${a.pages.length}页）</button>`).join("")}</details><p id="bpStatus" role="status">${E(d.notice || "正文与页内容编辑自动保存，未改上游故事。")}</p></section><section class="bp-body"><div class="bp-section-head"><h3>本集正文</h3><div>${sourceKind(p) === "inspiration" ? `<button id="bpGenerate" class="primary">${d.text ? "重新生成正文" : "生成正文"}</button>` : ""}<button id="bpEdit">编辑正文</button></div></div><p class="hint">${E(sourceKind(p) === "story" ? (d.text ? "已从故事《" + (p.source.title || "未命名故事") + "》带入" + e.title + "正文" : "该集缺少故事正文，请补充来源正文") : (d.text ? "本集正文草稿已准备 · 演示未接模型扩写" : "根据右侧本集集纲，生成漫画改编所需的正文"))}${d.edited ? " · 本地修改版" : ""}</p>${d.text ? `<div id="bpReading" class="bp-reading">${E(d.text)}</div><textarea id="bpBodyText" rows="20" hidden>${E(d.text)}</textarea>` : `<p class="bp-empty">${sourceKind(p) !== "inspiration" ? "该集缺少正文快照。请补充本集正文；不会用集纲或画格说明冒充原文。" : "先准备本集短篇正文，再进行分页。当前未接模型。"}</p><details><summary>手动补充正文</summary><textarea id="bpBodyText" rows="12" placeholder="手动补充本集正文"></textarea></details>${sourceKind(p) === "inspiration" ? '<small>生成交互为演示：从当前集纲建立正文草稿，尚未接入模型扩写。</small>' : ""}`}</section><aside class="bp-episodes"><h3>集选择</h3><div class="bp-episode-buttons">${es.map((x, i) => `<button data-bp-episode="${E(x.id)}" aria-pressed="${x.id === e.id}"><b>${i + 1}</b><span>${E(x.title)}</span></button>`).join("")}</div><h3>当前集集纲</h3><p class="bp-outline">${E(outline(p, e))}</p><small>当前集切换同步正文和分页；本地编辑不回写故事源。</small></aside></div>`;
  }
  function wire(p, M, host, save, render) {
    const $ = (id) => host.querySelector("#" + id),
      e = M.episodes(p).find((e) => e.id === p.activeEpisodeId),
      d = state(p, e),
      pg = () => d.pages.find((pg) => pg.id === d.selected),
      run = (fn) => {
        try {
          fn();
          save();
          render();
        } catch (err) {
          $("bpStatus").textContent = err.message;
        }
      };
    host.querySelectorAll("[data-bp-episode]").forEach(
      (b) =>
        (b.onclick = () =>
          run(() => {
            p.activeEpisodeId = b.dataset.bpEpisode;
            const i = p.scenes.findIndex(
              (s) => s.episodeId === p.activeEpisodeId,
            );
            if (i >= 0) p.scene = i;
          })),
    );
    host
      .querySelectorAll("[data-bp-page]")
      .forEach(
        (b) => (b.onclick = () => run(() => (d.selected = b.dataset.bpPage))),
      );
    if ($("bpSplit"))
      $("bpSplit").onclick = () =>
        run(() => {
          if (
            d.pages.length &&
            !confirm("重新分页会归档当前页内容、手改和参考，旧图文保持。继续？")
          )
            return;
          if (d.pages.length)
            d.archives.push({
              at: new Date().toISOString(),
              pages: copy(d.pages),
              body: d.text,
            });
          d.budget = Math.min(30, Math.max(1, Math.ceil(d.text.length / 450)));
          d.pages = splitExact(d.text, d.budget).map((part) => ({
            id: id(),
            text: part.text,
            mapping: {
              sourceEpisodeId: e.id,
              start: part.start,
              end: part.end,
              sourceText: part.text,
            },
            refs: associate(p, part.text),
          }));
          d.selected = d.pages[0]?.id || "";
          d.paginatedBody = d.text;
          d.notice = "分页草稿已保存，正文字符完整保留；第四步按本次分页显示整页作品。";
        });
    if ($("bpBodyText"))
      $("bpBodyText").oninput = (ev) => {
        if (!d.edited) d.bodyHistory.push({ text: d.text, origin: d.origin });
        d.text = ev.target.value;
        d.edited = true;
        d.notice = d.pages.length
          ? "正文已修改，分页保留原稿；请明确重新分页。"
          : "正文已自动保存，可以分页。";
        save();
        $("bpStatus").textContent = d.notice;
      };
    if ($("bpEdit"))
      $("bpEdit").onclick = () => {
        if (!$("bpReading")) {
          $("bpBodyText").focus();
          return;
        }
        const editing = $("bpBodyText").hidden;
        $("bpBodyText").hidden = !editing;
        $("bpReading").hidden = editing;
        $("bpReading").textContent = d.text;
        $("bpEdit").textContent = editing ? "返回阅读" : "轻量编辑";
      };
    if ($("bpGenerate")) $("bpGenerate").onclick = () => run(() => {
      const plan = outline(p,e).trim();
      if (!plan || plan === "该集暂无集纲快照。") throw Error("请先准备本集集纲。");
      if (d.text && !confirm("保留当前正文到历史，再重新生成？已有分页不覆盖。")) return;
      if(d.text) d.bodyHistory.push({text:d.text,origin:d.origin,pages:copy(d.pages)});
      d.generatedOutline=plan;d.outlineNeedsReview=false;d.text=plan; d.origin="灵感创意 · 集纲转正文草稿演示（未接模型，尚未扩写）"; d.edited=false;
      d.notice="已按本集集纲建立草稿，未调用AI扩写；可编辑后自动分页。原分页保留。";
    });
    if ($("bpPageText"))
      $("bpPageText").oninput = (ev) => {
        pg().text = ev.target.value;
        pg().edited = true;
        save();
        $("bpStatus").textContent =
          "本页内容自动保存；源段映射保留，已采用整页图片保留，第四步将提示内容已更新。";
      };
    host.querySelectorAll("[data-bp-asset]").forEach(
      (el) =>
        (el.onchange = () => {
          const page = pg();
          page.refs ??= [];
          if (el.checked && !page.refs.some(r => r.assetId === el.dataset.bpAsset)) {
            const asset = p.assets.find(a => a.id === el.dataset.bpAsset);
            page.refs.push({ assetId: asset.id, versionId: asset.adoptedVisualId || null, via: 'manual' });
          } else if (!el.checked) page.refs = page.refs.filter(r => r.assetId !== el.dataset.bpAsset);
          const openKinds = [...host.querySelectorAll('[data-bp-kind][open]')].map(node => node.dataset.bpKind);
          const scroll = { x: window.scrollX, y: window.scrollY, pages: host.querySelector('.bp-pages')?.scrollTop || 0 };
          save();
          render();
          host.querySelectorAll('[data-bp-kind]').forEach(node => node.open = openKinds.includes(node.dataset.bpKind));
          if (host.querySelector('.bp-pages')) host.querySelector('.bp-pages').scrollTop = scroll.pages;
          window.scrollTo(scroll.x, scroll.y);
          [...host.querySelectorAll('[data-bp-asset]')].find(node => node.dataset.bpAsset === el.dataset.bpAsset)?.focus({ preventScroll: true });
        }),
    );
    host.querySelectorAll("[data-bp-detail]").forEach(
      (b) =>
        (b.onclick = () => {
          const a = p.assets.find(a => a.id === b.dataset.bpDetail);
          const r = pg().refs.find(r => r.assetId === a?.id);
          if (!a || !r) return;
          const v = a.visualVersions?.find(v => v.id === r.versionId);
          CreationWorkbench.openAssetCard({ host, name: a.name, kind: a.kind === '角色' ? '人物' : a.kind,
            status: assetStatus(a, r), image: assetURL(v?.images?.main), assetId: a.id, versionId: r.versionId,
            fields: [['故事事实', typeof EpisodePlanning !== 'undefined' ? EpisodePlanning.factText(EpisodePlanning.facts(p, a)) : CreationWorkbench.assetFacts(a)], ['稳定资料', a.stable], ['外貌 / 视觉描述', a.visualAppearance], ['服装', a.visualClothing], ['重要配饰', a.visualAccessories], ['关联版本说明', v?.description]] });
        }),
    );
    if ($("bpReference"))
      $("bpReference").onchange = async () => {
        try {
          const f = $("bpReference").files[0];
          if (!f) return;
          if (
            !/^image\/(png|jpeg|webp)$/.test(f.type) ||
            f.size > 5 * 1024 * 1024
          )
            throw Error("请选择5MB以内图片");
          const target = pg(),
            im = new Image(),
            url = URL.createObjectURL(f);
          try {
            im.src = url;
            await im.decode();
            const c = document.createElement("canvas"),
              scale = Math.min(1, 600 / im.width, 800 / im.height);
            c.width = Math.round(im.width * scale);
            c.height = Math.round(im.height * scale);
            c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
            target.reference = {
              name: f.name,
              image: c.toDataURL("image/jpeg", 0.7),
            };
            save();
            render();
          } finally {
            URL.revokeObjectURL(url);
          }
        } catch (err) {
          $("bpStatus").textContent = err.message;
        }
      };
    if ($("bpRemoveReference"))
      $("bpRemoveReference").onclick = () => run(() => delete pg().reference);
    host.querySelectorAll("[data-bp-restore]").forEach(
      (b) =>
        (b.onclick = () =>
          run(() => {
            const old = copy(d.archives[+b.dataset.bpRestore].pages);
            d.archives.push({
              at: new Date().toISOString(),
              pages: copy(d.pages),
              body: d.text,
            });
            d.pages = old;
            d.selected = old[0]?.id || "";
          })),
    );
  }
  return { view, wire, splitExact, associate, body, state, outline };
})();
