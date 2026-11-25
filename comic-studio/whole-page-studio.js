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
  const PS=window.ComicPageScript;
  const mergedContent = content => content?.pageScript?PS.print(content.pageScript):window.StoryNarrative.merge(content?.text,content?.pageDirection?.dialogue);
  const pages = (p, e) => p.bodyPagination?.episodes?.[e]?.pages || [];
  function data(p) {
    return (p.wholePageStudio ??= { version: 1, works: {}, selected: {} });
  }
  function snapshot(p, e, pg) {
    const explicitRatio=data(p).confirmedOutputRatio||data(p).works[pg.id]?.outputRatio;
    const includeRatio=explicitRatio&&(explicitRatio!=='9:16'||adopted(data(p).works[pg.id])?.sourceSnapshot?.outputRatio);
    return cp({
      episodeId: e,
      pageId: pg.id,
      text: pg.text,
      ...(includeRatio?{outputRatio:explicitRatio}:{}),
      ...(pg.pageScript?{pageScript:cp(pg.pageScript)}:{}),
      ...(pg.direction ? {pageDirection:cp(pg.direction)} : {}),
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
  function uploadSnapshot(p,e,pg) {
    const copy=cp(pg);
    if(p.storyDraftId||copy.pageScript)PS.adopt(copy,p.assets);
    return snapshot(p,e,copy);
  }
  function adoptUpload(p,e,pg,image,snap) {
    // Only commit the displayed draft after the uploaded candidate is adopted.
    if(!pg.pageScript&&snap.pageScript&&signature(uploadSnapshot(p,e,pg))===signature(snap))PS.adopt(pg,p.assets);
    const target=work(p,pg.id),v={id:uid(),image,sourceSnapshot:cp(snap),signature:signature(snap),createdAt:new Date().toISOString(),origin:'Uploaded image'};
    target.versions.push(v);target.adoptedId=v.id;return v;
  }
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
  function outputRatio(p,pg){return data(p).confirmedOutputRatio||data(p).works[pg?.id]?.outputRatio||'9:16';}
  function confirmOutputRatio(p,value){
    if(!['9:16','16:9'].includes(value))throw Error('Choose an aspect ratio in Page Layout first.');
    data(p).confirmedOutputRatio=value;
  }
  function setOutputRatio(p,pg,value){
    if(!pg||!['9:16','16:9'].includes(value))throw Error('Choose a 9:16 or 16:9 aspect ratio.');
    const w=work(p,pg.id);
    if(value==='9:16'&&!adopted(w)?.sourceSnapshot?.outputRatio)delete w.outputRatio;else w.outputRatio=value;
  }
  const previewImageSizes = new Map();
  function previewLayout(p,pg,version,dimensions=previewImageSizes.get(version?.image)) {
    const width=Number(dimensions?.width),height=Number(dimensions?.height);
    const selectedRatio=version?(version.sourceSnapshot?.outputRatio||'9:16'):outputRatio(p,pg);
    const ratio=Number.isFinite(width)&&Number.isFinite(height)&&width>0&&height>0
      ?width/height:selectedRatio==='16:9'?16/9:9/16;
    return {ratio,shape:ratio<.85?'portrait':ratio>1.2?'landscape':'square'};
  }
  function status(p, e, pg) {
    const v = adopted(data(p).works[pg.id]);
    return !v
      ? "Not generated"
      : v.signature === signature(snapshot(p, e, pg))
        ? "Generated"
        : "Content updated";
  }
  function request(p, e, pg, kind, prompt) {
    if(kind==='generate'&&(p.storyDraftId||pg.pageScript)){PS.validate(PS.read(pg));PS.adopt(pg,p.assets);}
    const w = work(p, pg.id),
      snap = snapshot(p, e, pg),
      sig = signature(snap),
      current = adopted(w);
    if (["edit", "arrangement"].includes(kind) && !prompt.trim())
      throw Error("Describe how to revise this page.");
    if (
      w.requests.some(
        (r) =>
          r.state === "Demo request recorded" &&
          r.kind === kind &&
          r.signature === sig &&
          r.prompt === prompt &&
          r.currentVersionId === (current?.id || ""),
      )
    )
      throw Error("This request was already recorded.");
    const r = {
      id: uid(),
      projectId: p.id,
      episodeId: e,
      pageId: pg.id,
      kind,
      prompt,
      sourceSnapshot: snap,
      narrativeContent: mergedContent(snap),
      outputRatio: outputRatio(p,pg),
      signature: sig,
      currentVersionId: current?.id || "",
      currentImage: current?.image || null,
      state: "Demo request recorded",
      createdAt: new Date().toISOString(),
    };
    w.requests.push(r);
    return r;
  }
  // Keep a pending request attached to its original page across navigation.
  function agentContext(p, M) {
    const d = data(p), es = M.episodes(p);
    const currentEpisode = es.find(e => e.id === p.activeEpisodeId) || es[0];
    const currentPages = pages(p, currentEpisode.id);
    const currentPage = currentPages.find(pg => pg.id === d.selected[currentEpisode.id]) || currentPages[0];
    const previous = d.agentTarget;
    const previousPage = previous && pages(p, previous.episodeId).find(pg => pg.id === previous.pageId);
    const pending = previousPage && work(p, previous.pageId).draft.trim();
    if (!pending) d.agentTarget = currentPage ? {episodeId:currentEpisode.id,pageId:currentPage.id} : null;
    const target = d.agentTarget;
    if (!target) return null;
    const episode = es.find(e => e.id === target.episodeId);
    const page = pages(p, target.episodeId).find(pg => pg.id === target.pageId);
    if (!episode || !page) return null;
    return {episode, page, work:work(p,page.id), index:pages(p,episode.id).indexOf(page),
      chapter:es.indexOf(episode), different:episode.id!==currentEpisode.id || page.id!==currentPage?.id};
  }
  function openAgent(p, M) {
    agentContext(p,M);
    data(p).sidebar = 'agent';
  }
  function comparison(p, eid, page, mode = 'basis') {
    const latest = snapshot(p,eid,page), version = adopted(work(p,page.id));
    const basis = version?.sourceSnapshot || null;
    return {latest,basis,version,missingBasis:!!version&&!basis,
      changed:!!version && (basis ? signature(basis)!==signature(latest) : version.signature!==signature(latest)),
      content:mode==='latest'||!version?latest:basis,
      mode:!version?'latest':mode};
  }
  function beginEdit(p,eid,page) {
    if(!pages(p,eid).some(x=>x.id===page.id))throw Error('This page no longer exists. Select another.');
    data(p).editReturn={episodeId:eid,pageId:page.id,signature:signature(snapshot(p,eid,page))};
    data(p).selected[eid]=page.id;
    p.activeEpisodeId=eid;p.bodyPagination.episodes[eid].selected=page.id;p.stage=2;
  }
  function editState(p) {
    const target=data(p).editReturn;
    if(!target)return null;
    const page=pages(p,target.episodeId).find(x=>x.id===target.pageId);
    return {target,page,changed:!!page&&signature(snapshot(p,target.episodeId,page))!==target.signature};
  }
  function returnPreview(p,regenerate=false) {
    const state=editState(p);
    if(!state?.page)throw Error('This page was replanned. Select a page from the list.');
    const {target,page}=state;
    if(regenerate){
      if(page.pageScript)PS.validate(PS.read(page));else if(!mergedContent({text:page.text,pageDirection:page.direction}).trim())throw Error('Add content to this page before generating an image.');
      if(!state.changed)throw Error('The layout is unchanged. You can return to the preview.');
      request(p,target.episodeId,page,'generate','Regenerate this page from the latest layout and keep the current image until a replacement is selected.');
    }
    p.activeEpisodeId=target.episodeId;data(p).selected[target.episodeId]=page.id;
    data(p).sourceMode='basis';p.stage=3;delete data(p).editReturn;
  }
  function sourceView(p,eid,page) {
    if(!page)return '';
    const d=data(p),c=comparison(p,eid,page,d.sourceMode||'basis'),content=c.content;
    const script=content?.pageScript||(c.mode==='latest'?PS.read(page):null);
    return `<aside class="wp-source" id="wpSource" aria-label="Page content comparison"><header><h3>Page content</h3></header>
      ${c.version?`<div class="wp-source-modes" role="group" aria-label="Content version"><button data-wp-source-mode="basis" aria-pressed="${c.mode==='basis'}">Image source</button><button data-wp-source-mode="latest" aria-pressed="${c.mode==='latest'}">Latest layout</button></div>`:''}
      <div class="wp-source-scroll"><p class="wp-source-note">${c.mode==='basis'?'Content used for the current image':!page.pageScript?'Page draft · saves when edited or generated':'Current saved page script'}${c.changed?' · Layout updated':''}</p>
      ${content?`<div class="wp-source-copy">${script?PS.view(script,esc,{compact:true}):`<section aria-label="Page story content"><p>${esc(mergedContent(content)||'No content yet')}</p></section><details><summary>Earlier layout</summary><p>${esc(content.pageDirection?.visual||'Not filled in')}</p>${content.pageDirection?.ending?`<h4>Page transition</h4><p>${esc(content.pageDirection.ending)}</p>`:''}</details>`}</div>`:'<p class="wp-source-note">No source was saved for this image. Switch to the latest layout to view the current content.</p>'}
      </div><footer class="wp-panel-footer"><button id="wpSourceEdit">Edit page layout</button></footer></aside>`;
  }
  function changeRows(before,after) {
    const scripted=before.pageScript||after.pageScript;
    const fields=[['Page content',mergedContent],['Main plot',s=>scripted?undefined:s.pageDirection?.title],['Artwork layout',s=>scripted?undefined:s.pageDirection?.visual],['Page transition',s=>scripted?undefined:s.pageDirection?.ending],['Characters and assets',s=>JSON.stringify(s.assets||[])],['Reference image',s=>s.reference?'Reference set':'No reference'],['Art style',s=>s.style],['Format',s=>s.format],['Aspect ratio',s=>s.outputRatio||'9:16'],['Reading direction',s=>s.direction],['Pacing',s=>s.rhythm]];
    return fields.map(([label,get])=>({label,before:String(get(before)||''),after:String(get(after)||'')})).filter(x=>x.before!==x.after);
  }
  function sharedView(p, M, e, list, pg, w, v, archived) {
    const d=data(p), es=M.episodes(p), index=list.indexOf(pg), ctx=agentContext(p,M);
    const agent=d.sidebar==='agent', hasImage=ctx && adopted(ctx.work), ratio=outputRatio(p,pg), ratioChanged=!!v&&ratio!==(v.sourceSnapshot?.outputRatio||'9:16'), preview=previewLayout(p,pg,v);
    const label=ctx?`Chapter ${ctx.chapter+1} · Page ${ctx.index+1}`: 'No page selected';
    const cmp=pg?comparison(p,e.id,pg):null;
    const recorded=pg&&w.requests.some(r=>r.kind==='generate'&&r.signature===signature(cmp.latest)&&r.currentVersionId===(v?.id||''));
    const examples=hasImage?['Adjust composition','Revise dialogue','Refine character acting']:['Adjust artwork layout','Revise dialogue','Increase suspense at the page break'];
    return `<div class="as-plan-context-actions wp-stage-actions" role="group" aria-label="Comic generation actions"><button id="wpBatch" ${list.some(x=>!adopted(d.works[x.id]))?'':'disabled'}>Generate missing pages</button><button id="wpReadAll" ${list.length?'':'disabled'}>Read chapter</button><button id="wpZIP" ${list.length?'':'disabled'}>Export chapter ZIP</button></div><div class="wp-layout wp-unified wp-with-source wp-responsive" data-preview-shape="${preview.shape}" style="--wp-preview-ratio:${preview.ratio}"><header class="wp-production-heading"><div class="wp-tools"><strong>${esc(e.title)}${pg?` · Page ${index+1}`:''}</strong>
      <div class="wp-current-actions"><span class="wp-ratio-confirmed" aria-label="Confirmed aspect ratio">Aspect ratio · ${ratio} ${ratio==='16:9'?'Landscape':'Portrait'}</span>${v?'<button id="wpRead" title="Open a larger image to inspect artwork and lettering">View full size</button>':''}<button id="wpPNG" ${v?'':'disabled'}>Export page PNG</button><button data-wp-generate class="primary" ${!pg||recorded?'disabled':''}>${recorded?'Request recorded':v?'Regenerate page':'Generate page'}</button></div></div>
      ${cmp?.changed?`<div class="wp-change-banner"><div><strong>${ratioChanged?'Aspect ratio changed':'Page layout updated'}</strong><span>${ratioChanged?'The new aspect ratio takes effect when this page is regenerated.':'The current image uses the earlier layout.'}</span></div><button id="wpChanges">View changes</button></div>`:''}
      ${recorded?'<p class="wp-request-status" role="status">Generation request recorded. The current image remains in use.</p>':''}
</header><section class="wp-center" aria-label="Comic image preview"><header class="wp-panel-heading"><h3>Image preview</h3><span>${v?'Original aspect ratio':ratio+' · '+(ratio==='16:9'?'Landscape':'Portrait')}</span></header>
      <div class="wp-art" id="wpArt" ${v?'role="region" aria-label="Full comic image"':''}>${v?`<img src="${esc(v.image)}" alt="Selected artwork for Page ${index+1}">`:
      `<div class="wp-page-frame" style="--wp-ratio:${ratio==='16:9'?16/9:9/16}" aria-label="${ratio} comic aspect ratio"><div class="wp-empty"><h3>${pg?'Turn this page into a comic':'No layout for this chapter yet'}</h3><p>${pg?'Review this page’s script and assets before generating artwork.':'Lay out this chapter before generating artwork.'}</p>${pg?'':'<button id="wpEmptyArrange">Go to Page Layout</button>'}</div></div>`}</div>
      <footer class="wp-panel-footer wp-preview-footer"><p id="wpMessage" role="status"></p><p class="wp-preview-note">${v?'Use AI Writing Assistant to request changes. Preview any candidate before applying it.':'Demo · Generation requests are recorded locally.'}</p><details class="wp-more"><summary>Page candidates and version history</summary><div>${pg?`<label class="wp-upload">Upload page candidate<input id="wpUpload" type="file" accept="image/png,image/jpeg,image/webp"></label><details><summary>Compare versions · ${w.versions.length}</summary>${w.versions.map((x,i)=>`<button data-wp-version="${esc(x.id)}">Version ${i+1}${x.id===w.adoptedId?' · In use':' · Preview'}</button>`).join('')||'<p>No image versions yet</p>'}</details>`:''}${archived.length?`<details><summary>Earlier page versions · ${archived.length}</summary>${archived.map(x=>`<button data-wp-archive="${esc(x.pageId)}">Earlier page ${esc(x.pageId.slice(-8))}</button>`).join('')}</details>`:''}</div></details></footer></section>${sourceView(p,e.id,pg)}
      <aside class="wp-right wp-unified-sidebar" aria-label="Pages and AI Writing Assistant"><header class="wp-side-heading"><h3>${agent?'AI Writing Assistant':'Chapters and pages'}</h3>${agent?'<button id="wpAgentClose" aria-label="Close AI Writing Assistant and return to chapters and pages">Back to pages</button>':''}</header>
      <div id="wpPagesPanel" role="region" aria-label="Chapters and pages" ${agent?'hidden':''}>
      <label class="wp-section-label" for="wpEpisode">Current chapter</label><select id="wpEpisode" aria-label="Current chapter">${es.map(x=>`<option value="${esc(x.id)}" ${x.id===e.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select>
      <div class="wp-list">${list.map((x,i)=>`<button data-wp-page="${esc(x.id)}" aria-pressed="${x.id===pg?.id}"><b>Page ${i+1}</b><small>${status(p,e.id,x)}</small></button>`).join('')||'<p>No layout for this chapter yet</p>'}</div>
      </div>
      <div id="wpAgentPanel" role="region" aria-label="AI Writing Assistant" ${agent?'':'hidden'}>
      <div class="wp-agent-target"><span>${hasImage?'Revision target':'Layout target'}</span><strong>${esc(label)}</strong><small>${esc(ctx?.episode.title||'')}</small></div>
      ${ctx?.different?'<div class="wp-bound-note">Your unsent draft is still attached to the previous page.<button id="wpReturnTarget">Return to page</button></div>':''}
      <div class="wp-agent-thread" aria-label="Page assistant history"><div class="wp-agent-welcome"><strong>${hasImage?'What would you like to change on this page?':'Plan the artwork for this page'}</strong><p>${hasImage?'Describe the changes to the artwork, characters, or dialogue. The current image remains in use until a candidate is selected.':'Discuss composition, dialogue, or character acting, or edit the page layout directly.'}</p>${!hasImage&&ctx?'<button id="wpAgentArrange">Edit this page’s layout</button>':''}</div>${(ctx?.work.requests||[]).map(r=>`<article class="wp-agent-message"><span>${esc(label)}</span><p>${esc(r.prompt)}</p><div>AI Writing Assistant · ${r.kind==='arrangement'?'Layout request recorded. The current layout remains in place.':'Request recorded. The current artwork remains in place.'}</div></article>`).join('')}</div>
      ${ctx?`<div class="wp-agent-examples">${examples.map(x=>`<button data-wp-example="${esc(x)}">${x}</button>`).join('')}</div><div class="wp-agent-compose"><label class="wp-section-label" for="wpAgentPrompt">${hasImage?'What would you like to revise?':'How would you adjust the layout?'}</label><textarea id="wpAgentPrompt" rows="4" placeholder="For example: ${hasImage?'Make the expressions more restrained while keeping the composition':'Let the character pause before their final line'}">${esc(ctx.work.draft)}</textarea><div><span>⌘ / Ctrl + Enter</span><button id="wpAgentSend" class="primary" ${ctx.work.draft.trim()?'':'disabled'}>Send</button></div></div>`:'<p>Lay out this chapter before discussing individual pages with the assistant.</p>'}<small class="wp-agent-footnote">Preview changes before adopting them. Requests are recorded locally.</small></div><footer class="wp-continue-footer"><button class="as-btn primary" data-action="comic-continue" aria-describedby="wp-continue-note">Continue story <span aria-hidden="true">→</span></button><p id="wp-continue-note">Carry the story and comic references into a new video project.</p></footer></aside></div>`;
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
    if (p.storyDraftId) return sharedView(p,M,e,list,pg,w,v,archived);
    return `<div class="wp-heading"><h2>Generate & edit full pages</h2></div><div class="wp-layout"><aside class="wp-left">${
      pg
        ? `<small>${esc(e.title)} / Page ${index + 1}</small><h3>Revise page</h3><textarea id="wpPrompt" rows="5" placeholder="Describe how to revise this page">${esc(w.draft)}</textarea><button id="wpEdit" class="primary">Submit page revision</button><button data-wp-generate>Regenerate page</button><label class="wp-upload">Replace page image<input id="wpUpload" type="file" accept="image/png,image/jpeg,image/webp"></label><p class="hint">Generation and revision requests are recorded locally. Preview uploads before selecting one.</p><details><summary>Versions · ${w.versions.length}</summary>${w.versions.map((v, i) => `<button data-wp-version="${esc(v.id)}">Version ${i + 1}${v.id === w.adoptedId ? " · In use" : " · Preview"}</button>`).join("")}</details><details><summary>Page requests · ${w.requests.length}</summary>${w.requests
            .slice()
            .reverse()
            .map(
              (r) =>
                `<p>${esc(r.kind === "edit" ? r.prompt : "Generate page")}<small>${esc(r.state)}</small></p>`,
            )
            .join(
              "",
            )}</details><details><summary>Page generation source</summary><p>${esc(pg.text)}</p><small>${(pg.refs || []).length} asset versions · ${pg.reference ? "Reference image set" : "No reference"}</small></details>`
        : "<h3>Prepare page layouts</h3><p>Add chapter text and arrange pages in Page Layout first.</p>"
    }<button id="wpBack">Back to Page Layout</button>${archived.length ? `<details><summary>Earlier pagination · ${archived.length} pages</summary>${archived.map((w) => `<button data-wp-archive="${esc(w.pageId)}">Earlier page ${esc(w.pageId.slice(-8))} · ${w.versions.length} versions</button>`).join("")}</details>` : ""}</aside><section class="wp-center"><div class="wp-tools"><strong>Full artwork</strong><button id="wpFit">Fit to page</button><button id="wpRead" ${v ? "" : "disabled"}>Enlarge</button></div><div class="wp-art" id="wpArt">${v ? `<img src="${esc(v.image)}" alt="Selected artwork for Page ${index + 1}">` : `<div class="wp-empty"><h3>${pg ? "Page has no generated image" : "This episode has no pages yet"}</h3><p>${pg ? "Upload a full-page candidate to preview and use it." : "Return to Page Layout to continue."}</p></div>`}</div>${pg && status(p, e.id, pg) === "Content updated" ? '<p class="wp-updated">Content updated · The current image stays in use until you regenerate it.</p>' : ""}<p id="wpMessage" role="status"></p></section><aside class="wp-right"><h3>${p.storyDraftId?'Chapters and pages':'Episodes and pages'}</h3><select id="wpEpisode" aria-label="${p.storyDraftId?'Current chapter':'Current episode'}">${es.map((x) => `<option value="${esc(x.id)}" ${e.id === x.id ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select><div class="wp-list">${list.map((x, i) => `<button data-wp-page="${esc(x.id)}" aria-pressed="${pg?.id === x.id}"><b>Page ${i + 1}</b><small>${status(p, e.id, x)}</small></button>`).join("") || "<p>No pages yet</p>"}</div><button data-wp-generate ${pg ? "" : "disabled"}>${v ? "Regenerate page" : "Generate page"}</button><button id="wpBatch" ${list.some((x) => !adopted(d.works[x.id])) ? "" : "disabled"}>Generate missing pages</button><button id="wpReadAll" ${list.length ? "" : "disabled"}>${p.storyDraftId?'Read chapter':'Read episode'}</button><details><summary>Export artwork</summary><button id="wpPNG" ${v ? "" : "disabled"}>Export page PNG</button><button id="wpZIP" ${list.length ? "" : "disabled"}>${p.storyDraftId?'Export chapter ZIP':'Export episode ZIP'}</button><small>Select artwork for all pages before exporting an episode.</small></details></aside></div>`;
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
          throw Error("Could not save the change. Check local storage and try again.");
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
      el.innerHTML = `<header><strong>${esc(title)}</strong><button data-close>Close</button></header><div class="wp-dialog-body"></div>`;
      el.querySelector("[data-close]").onclick = () => el.close();
      el.onclose = () => el.remove();
      host.append(el);
      el.showModal();
      return el;
    };
    const preview = (targetId, image, snap, versionId = null) => {
      const target = work(p, targetId),
        current = adopted(target),
        el = dialog("Compare full-page candidates"),
        body = el.querySelector(".wp-dialog-body");
      body.innerHTML = `<div class="wp-compare"><figure><figcaption>Current image · original kept</figcaption>${current ? `<img src="${esc(current.image)}" alt="Current full-page image">` : "<p>No image in use</p>"}</figure><figure><figcaption>Candidate preview</figcaption><img src="${esc(image)}" alt="Full-page candidate"></figure></div><button id="wpAdopt">${versionId ? "Use this version" : "Use page candidate"}</button><button id="wpCancel">Cancel</button>`;
      body.querySelector("#wpCancel").onclick = () => el.close();
      body.querySelector("#wpAdopt").onclick = () => {
        if (!pages(p, eid).some((x) => x.id === targetId)) {
          message("The page layout changed. The candidate was not saved.");
          el.close();
          return;
        }
        el.close();
        mutate(() => {
          const target = work(p, targetId);
          if (versionId) target.adoptedId = versionId;
          else {
            adoptUpload(p,eid,pages(p,eid).find(x=>x.id===targetId),image,snap);
          }
        }, "Page version selected. Earlier versions were kept.");
      };
    };
    if($("wpBack")) $("wpBack").onclick = () => {
      if (pg && p.storyDraftId) beginEdit(p,eid,pg);
      else p.stage = 2;
      save();
      render();
    };
    if (p.storyDraftId) {
      const layout=host.querySelector('.wp-responsive'),image=$('wpArt')?.querySelector('img');
      if(layout){
        let observer,lastWidth=0,lastHeight=0;
        const fitPreview=()=>{
          if(!layout.isConnected){observer?.disconnect();return;}
          const panel=layout.querySelector('.wp-center'),footer=panel.querySelector('.wp-preview-footer');
          const available=window.innerHeight-Math.max(0,panel.getBoundingClientRect().top)-footer.getBoundingClientRect().height-102;
          layout.style.setProperty('--wp-preview-height',Math.max(220,Math.min(680,available))+'px');
          lastWidth=layout.clientWidth;lastHeight=window.innerHeight;
        };
        const updatePreview=()=>{
          if(!layout.isConnected||!image?.naturalWidth||!image.naturalHeight)return;
          const version=adopted(w),dimensions={width:image.naturalWidth,height:image.naturalHeight};
          previewImageSizes.set(version.image,dimensions);
          const geometry=previewLayout(p,pg,version,dimensions);
          layout.dataset.previewShape=geometry.shape;
          layout.style.setProperty('--wp-preview-ratio',geometry.ratio);
          fitPreview();
        };
        if(image){image.addEventListener('load',updatePreview,{once:true});if(image.complete)updatePreview();}
        fitPreview();
        observer=new ResizeObserver(()=>{if(!layout.isConnected)observer.disconnect();else if(lastWidth!==layout.clientWidth||lastHeight!==window.innerHeight)fitPreview();});
        observer.observe(layout);observer.observe(document.documentElement);
      }
      const ctx=agentContext(p,M);
      const changePanel=(panel)=>mutate(()=>{if(panel==='agent')openAgent(p,M);else d.sidebar='pages';});
      if($('wpAgentClose'))$('wpAgentClose').onclick=()=>{changePanel('pages');document.querySelector('[data-action="planning-guide-toggle"]')?.focus({preventScroll:true});};
      const arrange=(context)=>{
        const ep=context?.episode.id||eid, page=context?.page||pg;
        if(page)beginEdit(p,ep,page);
        else {p.activeEpisodeId=ep;p.stage=2;}
        if(save()===false){p.stage=3;message('Could not save. Try again.');return;}render();
      };
      if($('wpEmptyArrange'))$('wpEmptyArrange').onclick=()=>arrange();
      if($('wpSourceEdit'))$('wpSourceEdit').onclick=()=>arrange();
      host.querySelectorAll('[data-wp-source-mode]').forEach(b=>b.onclick=()=>mutate(()=>{d.sourceMode=b.dataset.wpSourceMode;}));
      if($('wpChanges'))$('wpChanges').onclick=()=>{
        const c=comparison(p,eid,pg),el=dialog('Page comparison · image source and latest layout'),body=el.querySelector('.wp-dialog-body');
        const rows=c.basis?changeRows(c.basis,c.latest):[];
        body.innerHTML=c.basis?`<div class="wp-change-rows">${rows.map(r=>`<section><h3>${esc(r.label)}</h3><div><article><strong>Image source</strong><p>${esc(r.before||'Not set')}</p></article><article><strong>Latest layout</strong><p>${esc(r.after||'Not set')}</p></article></div></section>`).join('')||'<p>Review the latest layout for changes to references or project settings.</p>'}</div>`:'<p>No source was saved for this image. The current image remains in use.</p>';
      };

      if($('wpAgentArrange'))$('wpAgentArrange').onclick=()=>arrange(ctx);
      if($('wpReturnTarget'))$('wpReturnTarget').onclick=()=>mutate(()=>{p.activeEpisodeId=ctx.episode.id;d.selected[ctx.episode.id]=ctx.page.id;});
      const input=$('wpAgentPrompt');
      const updateDraft=(text)=>{
        const before=ctx.work.draft;ctx.work.draft=text;
        if(save()===false){ctx.work.draft=before;message('Your input was not saved. Try again.');return;}
        $('wpAgentSend').disabled=!text.trim();
      };
      if(input){
        input.oninput=()=>updateDraft(input.value);
        input.onkeydown=(event)=>{if((event.metaKey||event.ctrlKey)&&event.key==='Enter'){event.preventDefault();$('wpAgentSend').click();}};
        host.querySelectorAll('[data-wp-example]').forEach(b=>b.onclick=()=>{
          input.value=(input.value.trim()?input.value.trim()+'\n':'')+'Please '+b.dataset.wpExample+'：';updateDraft(input.value);input.focus();
        });
        $('wpAgentSend').onclick=()=>{
          const prompt=input.value.trim();if(!prompt)return;
          mutate(()=>{
            if(!pages(p,ctx.episode.id).some(x=>x.id===ctx.page.id))throw Error('The target page changed. Select it again.');
            request(p,ctx.episode.id,ctx.page,adopted(ctx.work)?'edit':'arrangement',prompt);
            ctx.work.draft='';
            p.activeEpisodeId=ctx.episode.id;d.selected[ctx.episode.id]=ctx.page.id;
          },'Page request recorded. The original remains in use.');
        };
      }
      helpers.onAgentPanelChange?.(d.sidebar==='agent');
    }
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
          message("Changes could not be saved. Check local storage.");
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
            "Generate this page while preserving the content, art style, characters, and constraints.",
          ),
        "Page generation request recorded.",
      );
    };
    host
      .querySelectorAll("[data-wp-generate]")
      .forEach((b) => (b.onclick = generate));
    if ($("wpEdit"))
      $("wpEdit").onclick = () =>
        mutate(
          () => request(p, eid, pg, "edit", w.draft),
          "Page revision request recorded.",
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
              "Generate this page while preserving the content, art style, characters, and constraints.",
            );
          }
        },
        `Recorded requests for ${list.filter((x) => !adopted(d.works[x.id])).length} missing pages. Duplicate requests were skipped.`,
      );
    };
    if ($("wpUpload"))
      $("wpUpload").onchange = async (ev) => {
        if (busy) return;
        const pageId = pg.id,
          snap = uploadSnapshot(p, eid, pg),
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
            message("The page changed. Return to the original page and upload again.");
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
            el = dialog("Earlier pagination · read only"),
            body = el.querySelector(".wp-dialog-body");
          for (const v of old.versions) {
            const im = document.createElement("img");
            im.src = v.image;
            im.alt = "Saved earlier page versions";
            body.append(im);
          }
          if (!old.versions.length)
            body.textContent = "This earlier page has requests but no image.";
        }),
    );
    const read = (all) => {
      const el = dialog(all ? (p.storyDraftId ? "Read chapter" : "Read episode") : "View full size"),
        body = el.querySelector(".wp-dialog-body");
      for (const [i, page] of (all ? list : [pg]).entries()) {
        const a = adopted(d.works[page.id]),
          h = document.createElement("h3");
        h.textContent = "Page " + (all ? i + 1 : list.indexOf(page) + 1);
        body.append(h);
        if (a) {
          const im = document.createElement("img");
          im.src = a.image;
          im.alt = h.textContent;
          body.append(im);
        } else {
          const msg = document.createElement("p");
          msg.textContent = "This page has no image to export.";
          body.append(msg);
        }
      }
    };
    if ($("wpRead")) $("wpRead").onclick = () => read(false);
    $("wpReadAll").onclick = () => read(true);
    if ($("wpFit")) $("wpFit").onclick = () => {
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
        c.toBlob((b) => (b ? ok(b) : no(Error("PNGImage encoding failed"))), "image/png"),
      );
    };
    const exportImages = async (all) => {
      if (busy) return;
      busy = true;
      const targets = all ? list : [pg],
        versions = targets.map((x) => adopted(d.works[x.id]));
      try {
        if (window.ExportCenter) { await ExportCenter.comic(cp(p), [eid], all ? undefined : pg.id); message("Exported and saved in Export & Delivery."); return; }
        if (versions.some((x) => !x))
          throw Error("Select images for all pages before exporting.");
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
        a.download = "comic-" + (all ? "整集.zip" : files[0].name);
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        message("Exported the selected full-page images.");
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
    agentContext,
    openAgent,
    comparison,
    changeRows,
    beginEdit,
    editState,
    returnPreview,
    pages,
    data,
    snapshot,
    uploadSnapshot,
    adoptUpload,
    signature,
    status,
    request,
    work,
    adopted,
    outputRatio,
    setOutputRatio,
    confirmOutputRatio,
    previewLayout,
  };
})();
