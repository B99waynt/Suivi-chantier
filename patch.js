// Patch des fonctions manquantes

// Fonction checkRetard
function checkRetard(task, spanEl) {
  // Fonction vide pour l'instant - à implémenter plus tard
  if (!spanEl) return;
  spanEl.textContent = '';
}

// Fonction renderLots pour afficher l'avancement par lot
function renderLots() {
  const g = document.getElementById('lotsGrid');
  if (!g) return;
  
  const lotMap = {};
  tasks.forEach(t => {
    if (!lotMap[t.lot]) {
      lotMap[t.lot] = {total: 0, termine: 0};
    }
    lotMap[t.lot].total++;
    if (t.statut === 'Terminée') lotMap[t.lot].termine++;
  });
  
  g.innerHTML = '';
  g.style.display = 'grid';
  g.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
  g.style.gap = '10px';
  
  Object.keys(lotMap).sort().forEach(lot => {
    const d = lotMap[lot];
    const pct = d.total > 0 ? Math.round((d.termine / d.total) * 100) : 0;
    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px';
    
    const title = document.createElement('div');
    title.style.cssText = 'font-size:0.85rem;font-weight:600;color:#4c1d95';
    title.textContent = lot;
    
    const bar = document.createElement('div');
    bar.style.cssText = 'width:100%;height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden';
    const fill = document.createElement('div');
    fill.style.cssText = `width:${pct}%;height:100%;background:#7c3aed;transition:width 0.3s`;
    bar.appendChild(fill);
    
    const meta = document.createElement('div');
    meta.style.cssText = 'font-size:0.75rem;color:#6b7280;display:flex;justify-content:space-between';
    meta.innerHTML = `<span>${d.termine} / ${d.total} tâches</span><span>${pct}%</span>`;
    
    card.appendChild(title);
    card.appendChild(bar);
    card.appendChild(meta);
    g.appendChild(card);
  });
}

// Export Excel
function exportExcel() {
  const wb = XLSX.utils.book_new();
  const data = tasks.map(t => ({
    Ref: t.ref,
    Lot: t.lot,
    Tâche: t.task,
    Intervenant: t.intervenant || '',
    Statut: t.statut,
    Priorité: t.priorite,
    Commentaire: t.commentaire || ''
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Tâches');
  XLSX.writeFile(wb, 'suivi_chantier_clery.xlsx');
}

// Surcharger le render original pour appeler renderLots
const originalRender = window.render;
if (originalRender) {
  window.render = function() {
    originalRender();
    renderLots();
  };
}

// Surcharger le loadDB pour appeler renderLots après chargement
const originalLoadDB = window.loadDB;
if (originalLoadDB) {
  window.loadDB = async function() {
    await originalLoadDB();
    renderLots();
  };
}

console.log('Patch chargé avec succès');
