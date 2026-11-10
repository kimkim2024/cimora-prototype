/* 整页作品以第三步分页ID绑定，旧 scenes/edit 永不迁写。 */
window.WholePageStudio = (() => {
  const cp = (x) => JSON.parse(JSON.stringify(x)),
    esc = (x) =>
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
    uid = () => crypto.randomUUID();
  const pages = (p, e) => p.bodyPagination?.episodes?.[e]?.pages || [];
  function data(p) {
    return (p.wholePageStudio ??= { version: 1, works: {}, selected: {} });
  }
  function snapshot(p, e, pg) {
    return cp({
      episodeId: e,
      pageId: pg.id,
      text: pg.text,
      reference: pg.reference || null,
      assets: (pg.refs || []).map((r) => {
        const a = p.assets.find((x) => x.id === r.assetId),
          v = a?.visualVersions?.find((x) => x.id === r.versionId);
        return {
          ...r,
          description: a
            ? {
                name: a.name,
              storyFacts: p.storyPlan?.characters?.find(c=>c.assetId===a.id||c.id===a.id)||a.storyProfile||null,
                stable: a.stable,
                appearance: a.visualAppearance,
                clothing: a.visualClothing,
              }
            : null,
          images: v?.images || null,
        };
      }),
      style: p.style,
      format: p.format,
      direction: p.direction,
      rhythm: p.rhythm,
      source: p.source
        ? {
            type: p.source.type,
            assetId: p.source.assetId,
            sourceRevision: p.source.sourceRevision,
          }
        : null,
    });
  }
  const signature = (s) => JSON.stringify(s);
  function work(p, id) {
    return (data(p).works[id] ??= {
      pageId: id,
      versions: [],
      requests: [],
      adoptedId: "",
      draft: "",
    });
  }
  const adopted = (w) => w?.versions.find((v) => v.id === w.adoptedId);
  function status(p, e, pg) {
    const v = adopted(data(p).works[pg.id]);
    return !v
      ? "待生成"
      : v.signature === signature(snapshot(p, e, pg))
        ? "已生成"
        : "内容已更新";
  }
  function request(p, e, pg, kind, prompt) {
    const w = work(p, pg.id),
      snap = snapshot(p, e, pg),
      sig = signature(snap),
      current = adopted(w);
    if (kind === "edit" && !prompt.trim())
      throw Error("请描述希望怎样修改本页。");
    if (
      w.requests.some(
        (r) =>
          r.state === "演示请求已记录" &&
          r.kind === kind &&
          r.signature === sig &&
          r.prompt === prompt &&
          r.currentVersionId === (current?.id || ""),
      )
    )
      throw Error("相同请求已记录；未接模型，请勿重复提交。");
    const r = {
      id: uid(),
      projectId: p.id,
      episodeId: e,
      pageId: pg.id,
      kind,
      prompt,
      sourceSnapshot: snap,
      signature: sig,
      currentVersionId: current?.id || "",
      currentImage: current?.image || null,
      state: "演示请求已记录",
      createdAt: new Date().toISOString(),
    };
    w.requests.push(r);
    return r;
  }
  function view(p, M) {
    const d = data(p),
      es = M.episodes(p),
      e = es.find((x) => x.id === p.activeEpisodeId) || es[0];
    p.activeEpisodeId = e.id;
    const list = pages(p, e.id),
      pg = list.find((x) => x.id === d.selected[e.id]) || list[0];
    if (pg) d.selected[e.id] = pg.id;
    const w = pg ? work(p, pg.id) : null,
      v = adopted(w),
      index = list.indexOf(pg),
      activeIds = new Set(
        Object.values(p.bodyPagination?.episodes || {}).flatMap((x) =>
          x.pages.map((pg) => pg.id),
        ),
      ),
      archived = Object.values(d.works).filter((w) => !activeIds.has(w.pageId));
    return `<div class="wp-heading"><h2>整页生成与编辑</h2></div><div class="wp-layout"><aside class="wp-left">${
      pg
        ? `<small>${esc(e.title)} / 第${index + 1}页</small><h3>本页修改</h3><textarea id="wpPrompt" rows="5" placeholder="描述希望怎样修改本页">${esc(w.draft)}</textarea><button id="wpEdit" class="primary">提交本页修改</button><button data-wp-generate>重新生成本页</button><label class="wp-upload">替换整页图片<input id="wpUpload" type="file" accept="image/png,image/jpeg,image/webp"></label><p class="hint">生成与修改仅记录请求，未接模型。上传先预览，采用后保存。</p><details><summary>版本 · ${w.versions.length}</summary>${w.versions.map((v, i) => `<button data-wp-version="${esc(v.id)}">第${i + 1}版${v.id === w.adoptedId ? " · 已采用" : " · 预览"}</button>`).join("")}</details><details><summary>本页请求 · ${w.requests.length}</summary>${w.requests
            .slice()
            .reverse()
            .map(
              (r) =>
                `<p>${esc(r.kind === "edit" ? r.prompt : "生成本页")}<small>${esc(r.state)}</small></p>`,
            )
            .join(
              "",
            )}</details><details><summary>本页生成依据</summary><p>${esc(pg.text)}</p><small>${(pg.refs || []).length}项资产版本 · ${pg.reference ? "有参考图" : "无参考图"}</small></details>`
        : "<h3>先准备分页</h3><p>请先在第三步为当前集准备正文并自动分页。</p>"
    }<button id="wpBack">返回第三步</button>${archived.length ? `<details><summary>重分页前作品 · ${archived.length}页</summary>${archived.map((w) => `<button data-wp-archive="${esc(w.pageId)}">旧页 ${esc(w.pageId.slice(-8))} · ${w.versions.length}版</button>`).join("")}</details>` : ""}</aside><section class="wp-center"><div class="wp-tools"><strong>完整作品</strong><button id="wpFit">适应页面</button><button id="wpRead" ${v ? "" : "disabled"}>放大阅读</button></div><div class="wp-art" id="wpArt">${v ? `<img src="${esc(v.image)}" alt="第${index + 1}页已采用整页作品">` : `<div class="wp-empty"><h3>${pg ? "本页尚未生成" : "当前集尚无分页"}</h3><p>${pg ? "生成请求不会伪造图片；可上传整页候选预览后采用。" : "返回第三步准备分页后继续。"}</p></div>`}</div>${pg && status(p, e.id, pg) === "内容已更新" ? '<p class="wp-updated">内容已更新 · 当前图片保留，重新生成由你决定。</p>' : ""}<p id="wpMessage" role="status"></p></section><aside class="wp-right"><h3>集与页</h3><select id="wpEpisode" aria-label="当前集">${es.map((x) => `<option value="${esc(x.id)}" ${e.id === x.id ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select><div class="wp-list">${list.map((x, i) => `<button data-wp-page="${esc(x.id)}" aria-pressed="${pg?.id === x.id}"><b>第${i + 1}页</b><small>${status(p, e.id, x)}</small></button>`).join("") || "<p>尚无分页</p>"}</div><button data-wp-generate ${pg ? "" : "disabled"}>${v ? "重新生成本页" : "生成本页"}</button><button id="wpBatch" ${list.some((x) => !adopted(d.works[x.id])) ? "" : "disabled"}>批量生成缺图页</button><button id="wpReadAll" ${list.length ? "" : "disabled"}>通读本集</button><details><summary>导出作品</summary><button id="wpPNG" ${v ? "" : "disabled"}>导出本页 PNG</button><button id="wpZIP" ${list.length ? "" : "disabled"}>导出整集 ZIP</button><small>只导出已采用图片；缺图时不输出整集成品。</small></details></aside></div>`;
  }
  function wire(p, M, host, save, render, helpers) {
    const $ = (id) => host.querySelector("#" + id),
      d = data(p),
      eid = p.activeEpisodeId,
      list = pages(p, eid),
      pg = list.find((x) => x.id === d.selected[eid]),
      w = pg ? work(p, pg.id) : null;
    let busy = false;
    const message = (t) => {
      if ($("wpMessage")) $("wpMessage").textContent = t;
    };
    const mutate = (fn, notice = "") => {
      const before = cp(data(p)),
        previousEpisode = p.activeEpisodeId;
      try {
        fn();
        if (save() === false)
          throw Error("保存失败，操作已回滚；请检查本机存储空间。");
        render();
        message(notice);
      } catch (error) {
        p.wholePageStudio = before;
        p.activeEpisodeId = previousEpisode;
        render();
        message(error.message);
      }
    };
    const dialog = (title) => {
      const el = document.createElement("dialog");
      el.className = "wp-dialog";
      el.innerHTML = `<header><strong>${esc(title)}</strong><button data-close>关闭</button></header><div class="wp-dialog-body"></div>`;
      el.querySelector("[data-close]").onclick = () => el.close();
      el.onclose = () => el.remove();
      host.append(el);
      el.showModal();
      return el;
    };
    const preview = (targetId, image, snap, versionId = null) => {
      const target = work(p, targetId),
        current = adopted(target),
        el = dialog("整页候选比较 · 尚未采用"),
        body = el.querySelector(".wp-dialog-body");
      body.innerHTML = `<div class="wp-compare"><figure><figcaption>当前采用 · 保留原稿</figcaption>${current ? `<img src="${esc(current.image)}" alt="当前整页">` : "<p>尚无采用图片</p>"}</figure><figure><figcaption>候选预览</figcaption><img src="${esc(image)}" alt="整页候选"></figure></div><button id="wpAdopt">${versionId ? "切换采用此版本" : "采用整页候选"}</button><button id="wpCancel">取消，不保存</button>`;
      body.querySelector("#wpCancel").onclick = () => el.close();
      body.querySelector("#wpAdopt").onclick = () => {
        if (!pages(p, eid).some((x) => x.id === targetId)) {
          message("来源页已重分页，候选未写入。");
          el.close();
          return;
        }
        el.close();
        mutate(() => {
          const target = work(p, targetId);
          if (versionId) target.adoptedId = versionId;
          else {
            const v = {
              id: uid(),
              image,
              sourceSnapshot: snap,
              signature: signature(snap),
              createdAt: new Date().toISOString(),
              origin: "用户上传",
            };
            target.versions.push(v);
            target.adoptedId = v.id;
          }
        }, "已采用整页版本；旧版保留。");
      };
    };
    $("wpBack").onclick = () => {
      p.stage = 2;
      save();
      render();
    };
    $("wpEpisode").onchange = (ev) =>
      mutate(() => (p.activeEpisodeId = ev.target.value));
    host
      .querySelectorAll("[data-wp-page]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            mutate(() => (d.selected[eid] = b.dataset.wpPage))),
      );
    if ($("wpPrompt"))
      $("wpPrompt").oninput = (ev) => {
        const previous = w.draft;
        w.draft = ev.target.value;
        if (save() === false) {
          w.draft = previous;
          message("修改尚未保存，请检查存储。");
        }
      };
    const generate = () => {
      if (!pg) return;
      mutate(
        () =>
          request(
            p,
            eid,
            pg,
            "generate",
            "生成本页；保留内容、画风、人物与约束。",
          ),
        "已记录本页生成请求；未接模型，图片未变化。",
      );
    };
    host
      .querySelectorAll("[data-wp-generate]")
      .forEach((b) => (b.onclick = generate));
    if ($("wpEdit"))
      $("wpEdit").onclick = () =>
        mutate(
          () => request(p, eid, pg, "edit", w.draft),
          "已记录整页修改请求；图片未变化。",
        );
    $("wpBatch").onclick = () => {
      mutate(
        () => {
          for (const page of list) {
            if (adopted(d.works[page.id])) continue;
            const x = work(p, page.id),
              sig = signature(snapshot(p, eid, page));
            if (
              x.requests.some(
                (r) => r.kind === "generate" && r.signature === sig,
              )
            )
              continue;
            request(
              p,
              eid,
              page,
              "generate",
              "生成本页；保留内容、画风、人物与约束。",
            );
          }
        },
        `已记录${list.filter((x) => !adopted(d.works[x.id])).length}页缺图范围；重复请求跳过，未接模型。`,
      );
    };
    if ($("wpUpload"))
      $("wpUpload").onchange = async (ev) => {
        if (busy) return;
        const pageId = pg.id,
          snap = snapshot(p, eid, pg),
          file = ev.target.files[0];
        if (!file) return;
        busy = true;
        ev.target.disabled = true;
        try {
          const image = await helpers.readImage(file),
            im = new Image();
          im.src = image;
          await im.decode();
          if (
            !host.isConnected || helpers.isCurrent?.() === false || p.stage !== 3 ||
            p.activeEpisodeId !== eid ||
            data(p).selected[eid] !== pageId
          ) {
            message("已切换页面，上传预览已取消；请回原页重新选择。");
            return;
          }
          preview(pageId, image, snap);
        } catch (error) {
          message(error.message);
        } finally {
          busy = false;
          ev.target.disabled = false;
          ev.target.value = "";
        }
      };
    host.querySelectorAll("[data-wp-version]").forEach(
      (b) =>
        (b.onclick = () => {
          const v = w.versions.find((x) => x.id === b.dataset.wpVersion);
          preview(pg.id, v.image, v.sourceSnapshot, v.id);
        }),
    );
    host.querySelectorAll("[data-wp-archive]").forEach(
      (b) =>
        (b.onclick = () => {
          const old = d.works[b.dataset.wpArchive],
            el = dialog("重分页前作品 · 只读"),
            body = el.querySelector(".wp-dialog-body");
          for (const v of old.versions) {
            const im = document.createElement("img");
            im.src = v.image;
            im.alt = "旧页保留版本";
            body.append(im);
          }
          if (!old.versions.length)
            body.textContent = "该旧页只有请求记录，暂无图片。";
        }),
    );
    const read = (all) => {
      const el = dialog(all ? "本集通读" : "整页放大阅读"),
        body = el.querySelector(".wp-dialog-body");
      for (const [i, page] of (all ? list : [pg]).entries()) {
        const a = adopted(d.works[page.id]),
          h = document.createElement("h3");
        h.textContent = "第" + (all ? i + 1 : list.indexOf(page) + 1) + "页";
        body.append(h);
        if (a) {
          const im = document.createElement("img");
          im.src = a.image;
          im.alt = h.textContent;
          body.append(im);
        } else {
          const msg = document.createElement("p");
          msg.textContent = "尚未生成，不作为成品导出。";
          body.append(msg);
        }
      }
    };
    $("wpRead").onclick = () => read(false);
    $("wpReadAll").onclick = () => read(true);
    $("wpFit").onclick = () => {
      $("wpArt").scrollTop = 0;
      $("wpArt").classList.remove("wp-zoom");
    };
    const png = async (image) => {
      const im = new Image();
      im.src = image;
      await im.decode();
      const c = document.createElement("canvas");
      c.width = im.naturalWidth;
      c.height = im.naturalHeight;
      c.getContext("2d").drawImage(im, 0, 0);
      return await new Promise((ok, no) =>
        c.toBlob((b) => (b ? ok(b) : no(Error("PNG编码失败"))), "image/png"),
      );
    };
    const exportImages = async (all) => {
      if (busy) return;
      busy = true;
      const targets = all ? list : [pg],
        versions = targets.map((x) => adopted(d.works[x.id]));
      try {
        if (versions.some((x) => !x))
          throw Error("当前范围有未生成页，请先采用全部整页图片；未导出成品。");
        const files = [];
        for (let i = 0; i < versions.length; i++)
          files.push({
            name:
              String(all ? i + 1 : list.indexOf(pg) + 1).padStart(2, "0") +
              ".png",
            blob: await png(versions[i].image),
          });
        const blob = all ? await helpers.zip(files) : files[0].blob,
          a = document.createElement("a"),
          url = URL.createObjectURL(blob);
        a.href = url;
        a.download = "漫画-" + (all ? "整集.zip" : files[0].name);
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        message("已导出真实采用的整页图片。");
      } catch (error) {
        message(error.message);
      } finally {
        busy = false;
      }
    };
    $("wpPNG").onclick = () => exportImages(false);
    $("wpZIP").onclick = () => exportImages(true);
  }
  return {
    view,
    wire,
    pages,
    data,
    snapshot,
    signature,
    status,
    request,
    work,
    adopted,
  };
})();
