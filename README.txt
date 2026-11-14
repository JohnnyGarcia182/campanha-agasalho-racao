CAMPANHA AGASALHO E RAÇÃO
Projeto Integrado UNIFEOB - Análise e Desenvolvimento de Sistemas (4º trimestre de 2026)

SOBRE O PROJETO
Fiz este site para ajudar a organizar uma campanha de doação de agasalhos
para pessoas carentes e em situação de rua e de ração para abrigos de animais.
Com ele dá para registrar cada doação e ver de forma fácil quanto já foi
arrecadado e para onde cada coisa foi.

ONDE ACESSAR
Site no ar: https://johnnygarcia182.github.io/campanha-agasalho-racao/
Código-fonte: https://github.com/JohnnyGarcia182/campanha-agasalho-racao

COMO USAR
Não precisa instalar nada. Basta abrir o site pelo link acima ou baixar este
repositório e abrir o arquivo index.html no navegador.

1. Em "Abrigos", cadastre os locais que vão receber as doações.
2. Em "Registrar doação", anote cada doação recebida: tipo, quantidade,
   doador, data e destino.
3. No "Painel", veja os totais arrecadados e quanto foi para cada abrigo.
4. No "Histórico", consulte todas as doações, filtre por tipo e, se quiser,
   baixe a lista em uma planilha (arquivo CSV).

Importante: os dados ficam salvos no próprio navegador de quem usa o site.
Se você trocar de computador ou limpar os dados do navegador, as informações
não vão junto.

RODANDO EM UM SERVIDOR LOCAL (opcional)
Caso queira rodar através do python, abra o terminal dentro da pasta do projeto
e digite:
   python -m http.server 8000
Depois é só abrir http://localhost:8000 no navegador.
Para desligar o servidor, aperte Ctrl+C no terminal.

COMO OS ARQUIVOS ESTÃO ORGANIZADOS
PI Doação/
├── index.html       Painel com os totais da campanha
├── registrar.html   Formulário para registrar uma nova doação
├── historico.html   Lista de doações, com filtro e exportação
├── abrigos.html     Cadastro dos abrigos
├── css/style.css    Visual do site (se adapta ao celular)
├── js/app.js        Funcionamento do site e armazenamento dos dados
└── README.txt       Este arquivo
