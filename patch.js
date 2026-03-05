// Patch des fonctions manquantes

// Fonction checkRetard
function checkRetard(task, spanEl) {
  if (!spanEl) return;
  if (!task.date_fin) { spanEl.textContent = ''; spanEl.className = ''; return; }
  const today = new Date().toISOString().split('T')[0];
  if (task.statut !== 'Terminée' && task.date_fin < today) {
    spanEl.className = 'badge-retard';
    spanEl.textContent = '⚠ Retard';
  } else {
    spanEl.textContent = '';
    spanEl.className = '';
  }
}

// Fonction renderLots pour afficher l'avancement par lot
function renderLots() {
  const g = document.getElementById('lotsGrid');
  if (!g) return;

  const lotMap = {};
  tasks.forEach(t => {
    if (!lotMap[t.lot]) lotMap[t.lot] = { total: 0, termine: 0, encours: 0 };
    lotMap[t.lot].total++;
    if (t.statut === 'Terminée') lotMap[t.lot].termine++;
    if (t.statut === 'En cours') lotMap[t.lot].encours++;
  });

  g.innerHTML = '';

  Object.keys(lotMap).sort().forEach(lot => {
    const d = lotMap[lot];
    const pct = d.total > 0 ? Math.round((d.termine / d.total) * 100) : 0;

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:8px;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:.85rem;font-weight:700;color:#4c1d95;';
    title.textContent = lot;

    const bar = document.createElement('div');
    bar.style.cssText = 'width:100%;height:8px;background:#e5e7eb;border-radius:999px;overflow:hidden;';
    const fill = document.createElement('div');
    fill.style.cssText = `width:${pct}%;height:100%;background:#7c3aed;transition:width 0.4s;`;
    bar.appendChild(fill);

    const meta = document.createElement('div');
    meta.style.cssText = 'font-size:.75rem;color:#6b7280;display:flex;justify-content:space-between;';
    meta.innerHTML = `<span>${d.termine} / ${d.total} terminées</span><span style="font-weight:700;color:#7c3aed">${pct}%</span>`;

    card.appendChild(title);
    card.appendChild(bar);
    card.appendChild(meta);

    if (d.encours > 0) {
      const ecBadge = document.createElement('span');
      ecBadge.style.cssText = 'font-size:.7rem;background:#ffedd5;color:#c2410c;border-radius:999px;padding:2px 8px;font-weight:600;align-self:flex-start;';
      ecBadge.textContent = `${d.encours} en cours`;
      card.appendChild(ecBadge);
    }

    g.appendChild(card);
  });
}

// Export Excel (inclut les dates)
function exportExcel() {
  const wb = XLSX.utils.book_new();
  const data = tasks.map(t => ({
    Ref: t.ref,
    Lot: t.lot,
    'Tâche': t.task,
    Intervenant: t.intervenant || '',
    Statut: t.statut,
    Priorité: t.priorite,
    'Début prévu': t.date_debut || '',
    'Fin prévue': t.date_fin || '',
    Commentaire: t.commentaire || ''
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Tâches');
  XLSX.writeFile(wb, 'suivi_chantier_clery.xlsx');
}

// Surcharger render pour appeler renderLots
const _origRender = window.render;
if (_origRender) {
  window.render = function() {
    _origRender();
    renderLots();
  };
}

// Surcharger loadDB pour appeler renderLots après chargement
const _origLoadDB = window.loadDB;
if (_origLoadDB) {
  window.loadDB = async function() {
    await _origLoadDB();
    renderLots();
  };
}

console.log('Patch chargé ✓');
