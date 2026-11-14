// Armazenamento local (localStorage)
const DB = {
  ler(chave) { try { return JSON.parse(localStorage.getItem(chave)) || []; } catch (e) { return []; } },
  salvar(chave, v) { try { localStorage.setItem(chave, JSON.stringify(v)); } catch (e) { alert('Não foi possível salvar os dados neste navegador.'); } }
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtData = iso => iso ? iso.split('-').reverse().join('/') : '';
const fmtQtd = d => d.tipo === 'racao' ? d.qtd + ' kg' : d.qtd + ' peças';
const nomeTipo = t => t === 'racao' ? 'Ração' : 'Agasalho';
const $ = id => document.getElementById(id);
const pagina = document.body.dataset.page;

// Menu de navegação
const itens = [['index.html','Painel','home'],['registrar.html','Registrar doação','registrar'],['historico.html','Histórico','historico'],['abrigos.html','Abrigos','abrigos']];
$('topo').innerHTML = '<span class="marca">Campanha Agasalho e Ração</span><nav aria-label="Principal">' +
  itens.map(i => `<a href="${i[0]}"${i[2] === pagina ? ' aria-current="page"' : ''}>${i[1]}</a>`).join('') + '</nav>';

const tabela = (cab, linhas) => linhas.length
  ? '<table><thead><tr>' + cab.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>' + linhas.join('') + '</tbody></table>'
  : '<p class="vazio">Nada por aqui ainda.</p>';

const nomeAbrigo = id => (DB.ler('abrigos').find(a => a.id === id) || {}).nome || 'Sem destino definido';

function painel() {
  const doacoes = DB.ler('doacoes'), abrigos = DB.ler('abrigos');
  const soma = t => doacoes.filter(d => d.tipo === t).reduce((s, d) => s + d.qtd, 0);
  const doadores = new Set(doacoes.map(d => d.doador.trim().toLowerCase())).size;
  $('stats').innerHTML =
    `<div class="stat"><b>${soma('agasalho')}</b>agasalhos arrecadados</div>` +
    `<div class="stat racao"><b>${soma('racao').toFixed(1).replace('.0','')} kg</b>de ração arrecadada</div>` +
    `<div class="stat"><b>${doadores}</b>doadores</div>` +
    `<div class="stat"><b>${abrigos.length}</b>abrigos atendidos</div>`;
  const grupos = {};
  doacoes.forEach(d => { const n = nomeAbrigo(d.abrigo); grupos[n] = grupos[n] || {a:0,r:0}; d.tipo === 'racao' ? grupos[n].r += d.qtd : grupos[n].a += d.qtd; });
  const nomes = Object.keys(grupos), max = Math.max(1, ...nomes.map(n => grupos[n].a + grupos[n].r));
  $('porAbrigo').innerHTML = nomes.length ? nomes.map(n =>
    `<div class="linha"><span>${esc(n)}</span><div class="trilho"><i style="width:${(grupos[n].a + grupos[n].r) / max * 100}%"></i></div><span>${grupos[n].a} peças · ${+grupos[n].r.toFixed(1)} kg</span></div>`).join('')
    : '<p class="vazio">Registre a primeira doação para ver a distribuição por abrigo.</p>';
  const ult = doacoes.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
  $('ultimas').innerHTML = tabela(['Data','Tipo','Quantidade','Doador'], ult.map(d =>
    `<tr><td>${fmtData(d.data)}</td><td>${nomeTipo(d.tipo)}</td><td>${fmtQtd(d)}</td><td>${esc(d.doador)}</td></tr>`));
}

function registrar() {
  $('data').valueAsDate = new Date();
  const ab = DB.ler('abrigos');
  $('abrigo').innerHTML = '<option value="">Definir depois</option>' + ab.map(a => `<option value="${a.id}">${esc(a.nome)}</option>`).join('');
  $('tipo').addEventListener('change', () => $('unid').textContent = $('tipo').value === 'racao' ? '(kg)' : '(peças)');
  $('formDoacao').addEventListener('submit', e => {
    e.preventDefault();
    const qtd = parseFloat($('qtd').value);
    if (!(qtd > 0)) { $('msg').textContent = 'Informe uma quantidade maior que zero.'; return; }
    const lista = DB.ler('doacoes');
    lista.push({ id: Date.now().toString(), tipo: $('tipo').value, qtd, doador: $('doador').value.trim(), contato: $('contato').value.trim(), data: $('data').value, abrigo: $('abrigo').value, obs: $('obs').value.trim() });
    DB.salvar('doacoes', lista);
    e.target.reset(); $('data').valueAsDate = new Date(); $('unid').textContent = '(peças)';
    $('msg').textContent = 'Doação salva.';
  });
}

function historico() {
  const desenhar = () => {
    const f = $('filtro').value;
    const lista = DB.ler('doacoes').filter(d => !f || d.tipo === f).sort((a, b) => b.data.localeCompare(a.data));
    $('lista').innerHTML = tabela(['Data','Tipo','Quantidade','Doador','Abrigo','Observações',''], lista.map(d =>
      `<tr><td>${fmtData(d.data)}</td><td>${nomeTipo(d.tipo)}</td><td>${fmtQtd(d)}</td><td>${esc(d.doador)}</td><td>${esc(nomeAbrigo(d.abrigo))}</td><td>${esc(d.obs)}</td><td><button class="btn del" data-id="${d.id}">Excluir</button></td></tr>`));
  };
  $('filtro').addEventListener('change', desenhar);
  $('lista').addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (id && confirm('Excluir esta doação?')) { DB.salvar('doacoes', DB.ler('doacoes').filter(d => d.id !== id)); desenhar(); }
  });
  $('csv').addEventListener('click', () => {
    const linhas = [['Data','Tipo','Quantidade','Unidade','Doador','Contato','Abrigo','Observações']].concat(
      DB.ler('doacoes').map(d => [fmtData(d.data), nomeTipo(d.tipo), d.qtd, d.tipo === 'racao' ? 'kg' : 'peças', d.doador, d.contato, nomeAbrigo(d.abrigo), d.obs]));
    const csv = linhas.map(l => l.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'doacoes.csv'; a.click();
  });
  desenhar();
}

function abrigos() {
  const desenhar = () => {
    const doacoes = DB.ler('doacoes');
    $('lista').innerHTML = tabela(['Abrigo','Cidade','Contato','Recebido',''], DB.ler('abrigos').map(a => {
      const mine = doacoes.filter(d => d.abrigo === a.id);
      const pecas = mine.filter(d => d.tipo === 'agasalho').reduce((s, d) => s + d.qtd, 0);
      const kg = mine.filter(d => d.tipo === 'racao').reduce((s, d) => s + d.qtd, 0);
      return `<tr><td>${esc(a.nome)}</td><td>${esc(a.cidade)}</td><td>${esc(a.tel)}</td><td>${pecas} peças · ${+kg.toFixed(1)} kg</td><td><button class="btn del" data-id="${a.id}">Excluir</button></td></tr>`;
    }));
  };
  $('formAbrigo').addEventListener('submit', e => {
    e.preventDefault();
    const l = DB.ler('abrigos');
    l.push({ id: Date.now().toString(), nome: $('nome').value.trim(), cidade: $('cidade').value.trim(), tel: $('tel').value.trim() });
    DB.salvar('abrigos', l); e.target.reset(); desenhar();
  });
  $('lista').addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (id && confirm('Excluir este abrigo? As doações dele ficam sem destino.')) { DB.salvar('abrigos', DB.ler('abrigos').filter(a => a.id !== id)); desenhar(); }
  });
  desenhar();
}

({ home: painel, registrar, historico, abrigos }[pagina] || (() => {}))();
