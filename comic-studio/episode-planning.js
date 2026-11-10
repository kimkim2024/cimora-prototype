window.EpisodePlanning = (() => {
  const cp = (x) => JSON.parse(JSON.stringify(x)),
    id = () => crypto.randomUUID(),
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
      );
  const fields = [
    ["name", "姓名"],
    ["role", "人物定位"],
    ["identity", "身份"],
    ["relation", "人物关系"],
    ["age", "年龄"],
    ["gender", "性别"],
    ["background", "背景经历"],
    ["personality", "性格"],
    ["personalityTags", "性格特点"],
    ["state", "当前处境"],
  ];
  const outline = (x) =>
    x.events || x.summary || x.text || x.beat || x.content || "";
  const sourceKey = (p) =>
    p.source?.type === "script-asset-snapshot"
      ? JSON.stringify([
          p.source.assetId,
          p.source.projectId,
          p.source.savedAt,
          p.source.episodeIds,
        ])
      : "inspiration";
  function ensure(p) {
    const key = sourceKey(p);
    if (p.storyPlan?.sourceKey === key) return p.storyPlan;
    if (p.storyPlan) {
      p.storyPlanHistory ??= [];
      p.storyPlanHistory.push(cp(p.storyPlan));
    }
    const src = p.source?.type === "script-asset-snapshot" ? p.source : null,
      known = p.planning?.adopted?.episodes || p.confirmedEpisodes || [],
      characters =
        src?.characters ||
        p.planning?.adopted?.characters ||
        p.confirmedCharacters ||
        [];
    return (p.storyPlan = {
      version: 1,
      sourceKey: key,
      confirmed: !!src || known.length > 0,
      meta: {
        title: p.title,
        audience: src?.settings?.audience || p.planning?.meta?.audience || "",
        genre: src?.settings?.genre || p.planning?.meta?.genre || "",
        style: p.style === "待选择画风" ? "" : p.style,
        world: src?.settings?.world || p.planning?.meta?.world || "",
      },
      synopsis: p.planning?.synopsis || "",
      seed: p.planning?.seed || p.original || "",
      characters: cp(characters).map((c) => ({
        ...c,
        id: c.id || id(),
        assetId: c.assetId || c.id || "",
        name: c.name || "",
      })),
      episodes: (src?.outline || known).map((x) => ({
        id: x.id || x.episodeId || id(),
        title: x.title || "",
        text: outline(x),
        characterIds: cp(x.characterIds || []),
      })),
      range: "full",
      messages: [],
      history: [],
    });
  }
  function episodes(p) {
    const q = p.storyPlan;
    return q?.confirmed && q.episodes.length
      ? q.episodes.map((x) => ({ ...x, episodePlan: true }))
      : null;
  }
  function factText(c) {
    return fields
      .filter(
        ([key]) =>
          key !== "name" &&
          c?.[key] &&
          (!Array.isArray(c[key]) || c[key].length),
      )
      .map(
        ([key, label]) =>
          label + "：" + (Array.isArray(c[key]) ? c[key].join("、") : c[key]),
      )
      .join("；");
  }
  function facts(p, a) {
    if (p.storyPlan?.confirmed)
      return (
        p.storyPlan.characters.find(
          (c) => c.assetId === a.id || c.id === a.characterId || c.id === a.id,
        ) || null
      );
    return a.storyProfile || null;
  }
  function confirmPlan(p, draft) {
    if (!draft.episodes.length) throw Error("请先准备至少一集已确认集纲。");
    if (draft.episodes.some((e) => !e.title.trim()))
      throw Error("请填写分集标题。");
    if (!p.source && draft.episodes.length > 8)
      throw Error("灵感创作限8集短篇；更长内容请先在故事创作规划。");
    if (draft.characters.some((c) => !c.name.trim()))
      throw Error("请填写角色姓名。");
    if (
      new Set(draft.characters.map((c) => c.id)).size !==
        draft.characters.length ||
      new Set(draft.episodes.map((e) => e.id)).size !== draft.episodes.length
    )
      throw Error("角色或分集ID重复，未保存。");
    const old = ensure(p),
      history = cp(old.history || []);
    history.push({
      at: new Date().toISOString(),
      characters: cp(old.characters),
      episodes: cp(old.episodes),
      meta: cp(old.meta),
      synopsis: old.synopsis,
    });
    const q = cp(draft);
    q.history = history;
    q.confirmed = true;
    if (
      p.assets.length +
        q.characters.filter(
          (c) =>
            !p.assets.some(
              (a) =>
                a.id === c.assetId || a.id === c.id || a.characterId === c.id,
            ),
        ).length >
      40
    )
      throw Error("角色资产超过本机40项限制，请缩小范围。");
    for (const c of q.characters) {
      let a = p.assets.find(
        (a) => a.id === c.assetId || a.id === c.id || a.characterId === c.id,
      );
      if (!a) {
        a = {
          id: c.assetId || c.id,
          kind: "角色",
          name: c.name,
          stable: "",
          reference: "",
        };
        p.assets.push(a);
      }
      c.assetId = a.id;
      const previous =
        a.storyProfile || p.source?.characters?.find((x) => x.id === c.id);
      const before = (previous?.name || "") + "|" + factText(previous);
      a.characterId = c.id;
      a.storyProfile = cp(c);
      a.name = c.name;
      if (a.adoptedVisualId && before !== c.name + "|" + factText(c))
        a.storyFactsChanged = true;
    }
    p.storyPlan = q;
    p.title = q.meta.title || p.title;
    if (q.meta.style) p.style = q.meta.style;
    if (!p.scenes.length && !Object.keys(p.edit).length) p.format = "pages";
    p.story =
      q.synopsis ||
      q.episodes
        .map((e) => e.text)
        .filter(Boolean)
        .join("\n\n");
    const ids = new Set(q.episodes.map((e) => e.id));
    if (!ids.has(p.activeEpisodeId)) p.activeEpisodeId = q.episodes[0].id;
    for (const e of q.episodes) {
      const d = p.bodyPagination?.episodes?.[e.id];
      if (d && old.episodes.find((x) => x.id === e.id)?.text !== e.text) {
        d.outlineNeedsReview = true;
        d.notice =
          "本集集纲已修改；正文、分页与已采用图片保留，请核对后决定是否重新生成。";
      }
    }
    return q;
  }
  function organize(p, conversation, range) {
    const q = ensure(p), draft = cp(q);
    if (!p.source && !conversation.seed.trim()) throw Error("请先描述短篇灵感。");
    if (!p.source && /长篇|多卷|[百千]集/.test(conversation.seed)) throw Error("请先到故事创作规划长篇，再选短篇改编范围。");
    draft.seed = conversation.seed;
    for (const key of ["title", "audience", "genre", "style", "world"])
      if (conversation.meta[key]) draft.meta[key] = conversation.meta[key];
    if (p.source && range) {
      draft.range = range;
      const old = new Map(q.episodes.map(e => [e.id,e]));
      draft.episodes = p.source.outline.filter(e => range === "full" || e.id === range).map(e => old.get(e.id) || {id:e.id,title:e.title,text:outline(e),characterIds:cp(e.characterIds || [])});
    }
    if (!draft.episodes.length && !p.source) draft.episodes = [{id:id(),title:"短篇第一集",text:conversation.seed,characterIds:[]}];
    if (!draft.synopsis && !p.source) draft.synopsis = conversation.seed;
    p.__epDraft = draft;
    return draft;
  }
  function view(p) {
    const q = ensure(p),
      draft = p.__epDraft || q,
      editing = !!p.__epDraft,
      src = p.source?.type === "script-asset-snapshot",
      renderCharacter = (c, i) =>
        `<article class="ep-character" data-ep-character="${E(c.id)}"><h4>${E(c.name || "待填写角色")}</h4>${
          editing
            ? fields
                .filter(([k]) => k !== "personalityTags")
                .map(
                  ([key, label]) =>
                    `<label>${label}<${["background", "relation", "personality"].includes(key) ? 'textarea rows="2"' : "input"} data-ep-character-field="${i}:${key}" ${["background", "relation", "personality"].includes(key) ? "" : `value="${E(c[key] || "")}"`}>${["background", "relation", "personality"].includes(key) ? E(c[key] || "") : ""}${["background", "relation", "personality"].includes(key) ? "</textarea>" : ""}</label>`,
                )
                .join("")
            : `<p>${E(factText(c) || "尚无已确认的人物事实")}</p>`
        }</article>`;
    return `<div class="cs-plan-grid"><section class="cs-plan-conversation"><h2>内容策划</h2><p class="hint">默认分格页漫；画风由你设置。未接文本模型，不自动扩写。</p>${src ? `<p>引用故事《${E(p.source.title)}》的独立快照，漫画编辑不回写原故事。</p>` : '<label>短篇灵感<textarea id="epSeed" rows="5" placeholder="描述短篇创意；分集和角色可在右侧确认">' + E(q.seed) + '</textarea></label><button id="epOrganize">整理短篇策划草稿</button><p class="hint">仅将现有创意保留为一集待确认概要，不分析生成新情节。多集请在右侧明确填写。</p>'}${editing ? '<p class="ep-alert">右侧正在编辑，完成确认后才传递到下一步。取消不会修改原稿。</p>' : '<button id="epEdit">编辑策划</button>'}<p>角色事实 → 视觉资产<br>分集集纲 → 本集正文 → 正文分页 → 整页作品</p><p class="hint">集纲改动保留已有正文、分页和图片；人物事实变更保留已确认视觉版本并提示核对。</p></section><section class="cs-plan-reading"><div class="sectionHead"><h2>漫画策划</h2>${editing ? '<div><button id="epConfirm" class="primary">完成并确认</button><button id="epCancel">取消</button></div>' : '<button id="epEdit">编辑策划</button>'}</div><dl class="cs-plan-facts"><div><dt>篇幅</dt><dd>当前规划 ${draft.episodes.length} 集${q.confirmed && !editing ? " · 已确认" : " · 待确认"}</dd></div></dl>${
      editing
        ? `<div class="cs-plan-meta">${[
            ["title", "作品名"],
            ["audience", "目标读者"],
            ["genre", "故事题材"],
            ["style", "画风"],
            ["world", "背景 / 世界观"],
          ]
            .map(
              ([key, label]) =>
                `<label>${label}<input data-ep-meta="${key}" value="${E(draft.meta[key])}"></label>`,
            )
            .join("")}</div>`
        : `<dl class="cs-plan-facts">${[
            ["title", "作品名"],
            ["audience", "目标读者"],
            ["genre", "故事题材"],
            ["style", "画风"],
            ["world", "背景 / 世界观"],
          ]
            .map(
              ([key, label]) =>
                `<div><dt>${label}</dt><dd>${E(draft.meta[key] || "待确认")}</dd></div>`,
            )
            .join("")}</dl>`
    }<section id="epCharacters"><h3>角色描述</h3>${draft.characters.map(renderCharacter).join("") || '<p class="empty">尚无已确认的角色事实，请补充姓名与人物背景；不会从画格或图片猜测。</p>'}${editing ? '<button id="epAddCharacter">＋ 添加角色事实</button>' : ""}</section><article><h3>整体故事简介</h3>${editing ? `<textarea id="epSynopsis" rows="4">${E(draft.synopsis)}</textarea>` : `<p>${E(draft.synopsis || "尚无整体故事简介")}</p>`}</article><section id="epEpisodes"><h3>分集集纲</h3>${editing && src ? `<label>改编范围<select id="epRange"><option value="full">全部来源集</option>${(p.source.outline || []).map((e) => `<option value="${E(e.id)}" ${draft.range === e.id ? "selected" : ""}>${E(e.title)}</option>`).join("")}</select></label>` : ""}${draft.episodes.map((e, i) => `<article class="cs-plan-unit" data-ep-episode="${E(e.id)}"><h4>第${i + 1}集 · ${E(e.title || "待填写标题")}</h4>${editing ? `<label>分集标题<input data-ep-title="${i}" value="${E(e.title)}"></label><label>本集概述<textarea rows="4" data-ep-outline="${i}">${E(e.text)}</textarea></label>` : `<p>${E(e.text || "来源缺少本集集纲，请补充；不会以正文或旧页纲代替。")}</p>`}</article>`).join("") || '<p class="empty">暂无已确认分集。旧页纲、旧页面与图片继续保留，不会自动改名为集纲。</p>'}${editing && !src ? '<button id="epAddEpisode">＋ 添加短篇分集</button>' : ""}</section></section></div>`;
  }
  function wire(p, host, save, render) {
    const $ = (s) => host.querySelector("#" + s),
      q = ensure(p),
      draft = p.__epDraft;
    const show = (t) => {
      const el = $("stageMessage");
      if (el) el.textContent = t;
    };
    const action = (fn) => {
      try {
        fn();
        render();
      } catch (error) {
        show(error.message);
      }
    };
    if ($("epSeed"))
      $("epSeed").oninput = (ev) => {
        q.seed = ev.target.value;
        save();
      };
    if ($("epEdit"))
      $("epEdit").onclick = () =>
        action(() => {
          p.__epDraft = cp(q);
        });
    if ($("epOrganize"))
      $("epOrganize").onclick = () =>
        action(() => {
          if (!q.seed.trim()) throw Error("请先描述短篇灵感。");
          if (/长篇|多卷|[百千]集/.test(q.seed))
            throw Error("请先到故事创作规划长篇，再选短篇改编范围。");
          p.__epDraft = cp(q);
          if (!p.__epDraft.episodes.length)
            p.__epDraft.episodes = [
              { id: id(), title: "短篇第一集", text: q.seed, characterIds: [] },
            ];
          if (!p.__epDraft.synopsis) p.__epDraft.synopsis = q.seed;
        });
    if (!draft) return;
    $("epCancel").onclick = () => {
      delete p.__epDraft;
      render();
    };
    $("epConfirm").onclick = () =>
      action(() => {
        const backup = cp(p);
        try {
          confirmPlan(p, draft);
          delete p.__epDraft;
          if (save() === false) throw Error("保存失败，策划未确认。");
          render();
          show("策划已确认；角色事实与分集已同步，已有正文、分页和图片保留。");
        } catch (err) {
          for (const k of Object.keys(p)) delete p[k];
          Object.assign(p, backup);
          throw err;
        }
      });
    host
      .querySelectorAll("[data-ep-meta]")
      .forEach(
        (el) => (el.oninput = () => (draft.meta[el.dataset.epMeta] = el.value)),
      );
    host.querySelectorAll("[data-ep-character-field]").forEach(
      (el) =>
        (el.oninput = () => {
          const [i, key] = el.dataset.epCharacterField.split(":");
          draft.characters[+i][key] = el.value;
        }),
    );
    host
      .querySelectorAll("[data-ep-title]")
      .forEach(
        (el) =>
          (el.oninput = () =>
            (draft.episodes[+el.dataset.epTitle].title = el.value)),
      );
    host
      .querySelectorAll("[data-ep-outline]")
      .forEach(
        (el) =>
          (el.oninput = () =>
            (draft.episodes[+el.dataset.epOutline].text = el.value)),
      );
    $("epSynopsis").oninput = (ev) => (draft.synopsis = ev.target.value);
    if ($("epAddCharacter"))
      $("epAddCharacter").onclick = () =>
        action(() => {
          draft.characters.push({
            id: id(),
            assetId: "",
            name: "",
            role: "",
            relation: "",
            age: "",
            gender: "",
            background: "",
          });
        });
    if ($("epAddEpisode"))
      $("epAddEpisode").onclick = () =>
        action(() => {
          if (draft.episodes.length >= 8) throw Error("灵感创作限8集短篇。");
          draft.episodes.push({
            id: id(),
            title: "第" + (draft.episodes.length + 1) + "集",
            text: "",
            characterIds: [],
          });
        });
    if ($("epRange"))
      $("epRange").onchange = (ev) =>
        action(() => {
          const range = ev.target.value;
          draft.range = range;
          const old = new Map(draft.episodes.map((e) => [e.id, e]));
          draft.episodes = (p.source.outline || [])
            .filter((e) => range === "full" || e.id === range)
            .map(
              (e) =>
                old.get(e.id) || {
                  id: e.id,
                  title: e.title,
                  text: outline(e),
                  characterIds: cp(e.characterIds || []),
                },
            );
        });
  }
  return { ensure, episodes, factText, facts, confirmPlan, organize, view, wire };
})();
