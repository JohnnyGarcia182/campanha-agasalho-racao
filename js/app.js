// Armazenamento local (localStorage)
const DB = {
  ler(chave) { try { return JSON.parse(localStorage.getItem(chave)) || []; } catch (e) { return []; } },
  salvar(chave, v) { try { localStorage.setItem(chave, JSON.stringify(v)); } catch (e) { alert('Não foi possível salvar os dados neste navegador.'); } }
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtData = iso => iso ? iso.split('-').reverse().join('/') : '';
const pl = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
const fmtQtd = d => d.tipo === 'racao' ? d.qtd + ' kg' : pl(d.qtd, 'peça', 'peças');
const nomeTipo = t => t === 'racao' ? 'Ração' : 'Agasalho';
const $ = id => document.getElementById(id);
const pagina = document.body.dataset.page;

// Menu de navegação
const itens = [['index.html','Painel','home'],['registrar.html','Registrar doação','registrar'],['abrigos.html','Abrigos','abrigos'],['historico.html','Histórico','historico']];
$('topo').innerHTML = '<span class="marca">Campanha de Doação Agasalho e Ração - 2027</span><nav aria-label="Principal">' +
  itens.map(i => `<a href="${i[0]}"${i[2] === pagina ? ' aria-current="page"' : ''}>${i[1]}</a>`).join('') + '</nav>';

const tabela = (cab, linhas) => linhas.length
  ? '<table><thead><tr>' + cab.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>' + linhas.join('') + '</tbody></table>'
  : '<p class="vazio">Nada por aqui ainda.</p>';

// Abrigos antigos (sem tipo) são tratados como abrigos de animais
const tipoAbrigo = a => (a && a.tipo) || 'animais';
const nomeTipoAbrigo = a => tipoAbrigo(a) === 'pessoas' ? 'Pessoas carentes' : 'Animais';
const fmtRecebido = (a, doacoes) => {
  const mine = doacoes.filter(d => d.abrigo === a.id);
  const soma = t => mine.filter(d => d.tipo === t).reduce((s, d) => s + d.qtd, 0);
  return tipoAbrigo(a) === 'pessoas' ? pl(soma('agasalho'), 'peça', 'peças') : +soma('racao').toFixed(1) + ' kg';
};
const nomeAbrigo = id => (DB.ler('abrigos').find(a => a.id === id) || {}).nome || 'Sem destino definido';

function painel() {
  const doacoes = DB.ler('doacoes'), abrigos = DB.ler('abrigos');
  const soma = t => doacoes.filter(d => d.tipo === t).reduce((s, d) => s + d.qtd, 0);
  const doadores = new Set(doacoes.map(d => d.doador.trim().toLowerCase())).size;
  $('stats').innerHTML =
    `<div class="stat"><b>${soma('agasalho')}</b>${soma('agasalho') === 1 ? 'agasalho arrecadado' : 'agasalhos arrecadados'}</div>` +
    `<div class="stat racao"><b>${soma('racao').toFixed(1).replace('.0','')} kg</b>de ração arrecadada</div>` +
    `<div class="stat"><b>${doadores}</b>${doadores === 1 ? 'doador' : 'doadores'}</div>` +
    `<div class="stat"><b>${abrigos.length}</b>${abrigos.length === 1 ? 'ONG ou abrigo atendido' : 'ONGs e abrigos atendidos'}</div>`;
  const grupos = {};
  doacoes.forEach(d => { const n = nomeAbrigo(d.abrigo); grupos[n] = grupos[n] || {a:0,r:0,t:tipoAbrigo(abrigos.find(x => x.id === d.abrigo))}; d.tipo === 'racao' ? grupos[n].r += d.qtd : grupos[n].a += d.qtd; });
  const nomes = Object.keys(grupos), max = Math.max(1, ...nomes.map(n => grupos[n].a + grupos[n].r));
  const rot = g => g.t === 'pessoas' ? pl(g.a, 'peça', 'peças') : +g.r.toFixed(1) + ' kg';
  $('porAbrigo').innerHTML = nomes.length ? nomes.map(n =>
    `<div class="linha"><span>${esc(n)}</span><div class="trilho"><i style="width:${(grupos[n].a + grupos[n].r) / max * 100}%"></i></div><span>${rot(grupos[n])}</span></div>`).join('')
    : '<p class="vazio">Registre a primeira doação para ver a distribuição por ONG ou abrigo.</p>';
  const ult = doacoes.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);
  $('ultimas').innerHTML = tabela(['Data','Tipo','Quantidade','Doador'], ult.map(d =>
    `<tr><td>${fmtData(d.data)}</td><td>${nomeTipo(d.tipo)}</td><td>${fmtQtd(d)}</td><td>${esc(d.doador)}</td></tr>`));
}

function registrar() {
  $('data').valueAsDate = new Date();
  const ab = DB.ler('abrigos');
  // Mostra todas as ONGs/abrigos, com os do tipo sugerido (ração: animais; agasalho: pessoas) primeiro
  const opcoes = () => {
    const sug = $('tipo').value === 'racao' ? 'animais' : 'pessoas';
    const grupo = t => {
      const l = ab.filter(a => tipoAbrigo(a) === t);
      return l.length ? `<optgroup label="${t === 'animais' ? 'Animais' : 'Pessoas carentes'}">` + l.map(a => `<option value="${a.id}">${esc(a.nome)}</option>`).join('') + '</optgroup>' : '';
    };
    $('abrigo').innerHTML = '<option value="">Definir depois</option>' + grupo(sug) + grupo(sug === 'animais' ? 'pessoas' : 'animais');
  };
  opcoes();
  $('tipo').addEventListener('change', () => { $('unid').textContent = $('tipo').value === 'racao' ? '(kg)' : '(peças)'; opcoes(); });
  $('formDoacao').addEventListener('submit', e => {
    e.preventDefault();
    const qtd = parseFloat($('qtd').value);
    if (!(qtd > 0)) { $('msg').textContent = 'Informe uma quantidade maior que zero.'; return; }
    const lista = DB.ler('doacoes');
    lista.push({ id: Date.now().toString(), tipo: $('tipo').value, qtd, doador: $('doador').value.trim(), contato: $('contato').value.trim(), data: $('data').value, abrigo: $('abrigo').value, obs: $('obs').value.trim() });
    DB.salvar('doacoes', lista);
    e.target.reset(); $('data').valueAsDate = new Date(); $('unid').textContent = '(peças)'; opcoes();
    $('msg').textContent = 'Doação salva.';
  });
}

function historico() {
  const desenhar = () => {
    const f = $('filtro').value;
    const lista = DB.ler('doacoes').filter(d => !f || d.tipo === f).sort((a, b) => b.data.localeCompare(a.data));
    $('lista').innerHTML = tabela(['Data','Tipo','Quantidade','Doador','ONG ou abrigo','Observações',''], lista.map(d =>
      `<tr><td>${fmtData(d.data)}</td><td>${nomeTipo(d.tipo)}</td><td>${fmtQtd(d)}</td><td>${esc(d.doador)}</td><td>${esc(nomeAbrigo(d.abrigo))}</td><td>${esc(d.obs)}</td><td><button class="btn del" data-id="${d.id}">Excluir</button></td></tr>`));
  };
  $('filtro').addEventListener('change', desenhar);
  $('lista').addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (id && confirm('Excluir esta doação?')) { DB.salvar('doacoes', DB.ler('doacoes').filter(d => d.id !== id)); desenhar(); }
  });
  $('csv').addEventListener('click', () => {
    const linhas = [['Data','Tipo','Quantidade','Unidade','Doador','Contato','ONG ou abrigo','Observações']].concat(
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
    $('lista').innerHTML = tabela(['ONG ou abrigo','Tipo','Cidade','Contato','Recebido',''], DB.ler('abrigos').map(a =>
      `<tr><td>${esc(a.nome)}</td><td>${nomeTipoAbrigo(a)}</td><td>${esc(a.cidade)}</td><td>${esc(a.tel)}</td><td>${fmtRecebido(a, doacoes)}</td><td><button class="btn del" data-id="${a.id}">Excluir</button></td></tr>`));
  };
  $('formAbrigo').addEventListener('submit', e => {
    e.preventDefault();
    const l = DB.ler('abrigos');
    l.push({ id: Date.now().toString(), tipo: $('tipoAbrigo').value, nome: $('nome').value.trim(), cidade: $('cidade').value.trim(), tel: $('tel').value.trim() });
    DB.salvar('abrigos', l); e.target.reset(); desenhar();
  });
  $('lista').addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (id && confirm('Excluir esta ONG ou abrigo? As doações dela ficam sem destino.')) { DB.salvar('abrigos', DB.ler('abrigos').filter(a => a.id !== id)); desenhar(); }
  });
  desenhar();
}

({ home: painel, registrar, historico, abrigos }[pagina] || (() => {}))();
