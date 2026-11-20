# Campanha de Doação Agasalho e Ração - 2027

Aplicação web para organizar uma campanha de doação de agasalhos (pessoas carentes e em situação de rua) e de ração (abrigos de animais).
Projeto Integrado – Desenvolvimento para Web – UNIFEOB (4º trimestre 2026).

## Funcionalidades
- RF01 Cadastrar e excluir ONGs e abrigos de destino
- RF02 Registrar doações (tipo, quantidade, doador, data, destino e observações)
- RF03 Exibir painel com totais arrecadados, doadores e distribuição por ONG ou abrigo
- RF04 Consultar histórico de doações e filtrar por tipo
- RF05 Excluir doação
- RF06 Exportar histórico em planilha (CSV)
- RF07 Validar formulários
- RNF01 Funciona sem instalação (dados salvos no navegador) | RNF02 Interface simples e responsiva

## Como rodar
Abra o arquivo index.html no navegador. Para usar um servidor local:
```bash
python -m http.server 8000
```
Depois acesse http://localhost:8000 (Ctrl+C para encerrar).

Observação: os dados ficam salvos no próprio navegador; trocar de computador ou limpar os dados do navegador apaga as informações.

## Estrutura
`index.html` painel · `registrar.html` nova doação · `historico.html` lista, filtro e CSV · `abrigos.html` cadastro de ONGs e abrigos · `css/style.css` visual · `js/app.js` funcionamento e armazenamento
