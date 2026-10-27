# My Music My Life ♡

Biblioteca musical demonstrativa feita com **HTML, CSS e JavaScript puro**. Não usa Node.js, npm, React, Vite, TypeScript nem ferramentas de compilação.

## Como abrir

1. Extraia a pasta `my-music-my-life`.
2. Abra a pasta no VS Code (opcional).
3. Dê dois cliques em `index.html` para abrir no navegador.
4. O modo demonstração inicia sem cadastro e sem configuração do Supabase: crie uma conta fictícia na tela de cadastro. Os dados de demonstração ficam no `localStorage` deste navegador.

Não é necessária nenhuma extensão do VS Code. Live Server é opcional.

## Funcionalidades incluídas

- Interface responsiva rosa, páginas de início, busca, biblioteca, favoritos, playlists, artistas, álbuns, perfil e configurações.
- Cadastro/login local demonstrativo (não é autenticação segura de produção).
- Favoritos, playlists e preferências persistidos no navegador.
- Busca dinâmica.
- Player de áudio HTML5 com play/pause, anterior/próxima, progresso, volume, aleatório e repetição.
- Catálogo demonstrativo de 8 faixas.
- Criação e exclusão de playlists; adicionar e remover músicas.
- Esquema SQL de referência com RLS para Supabase.

## Sobre o áudio

As faixas de demonstração apontam para URLs de exemplo do SoundHelix. Elas exigem conexão com a internet e podem não estar disponíveis em todos os ambientes. Substitua os campos `audio` em `js/music.js` por URLs de arquivos de áudio que você tenha autorização para utilizar. Se o navegador bloquear a reprodução, clique novamente no botão de play e confira sua conexão.

## Importante sobre o modo de demonstração

A autenticação local existe apenas para experimentar a interface. Ela guarda dados no navegador e **não deve ser usada para contas reais**, pois não oferece a segurança de um servidor de autenticação. Não use uma senha importante. Para autenticação real e dados sincronizados entre dispositivos, configure Supabase.

## Configurar Supabase (opcional)

1. Crie um projeto em [supabase.com](https://supabase.com/).
2. No painel do projeto, abra o SQL Editor e execute o conteúdo de `schema.sql`.
3. Em `js/supabase.js`, preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY` com a URL e a chave pública (publishable/anon) do projeto.
4. Configure as opções de confirmação de e-mail e URLs de redirecionamento no Supabase conforme seu uso.

**Não** coloque a `service_role` key no frontend.

### Limitação importante da versão atual

A conexão Supabase habilita login/cadastro, mas a interface atual ainda guarda playlists, favoritos, histórico e preferências em `localStorage`; não sincroniza esses dados com as tabelas do Supabase. O arquivo `schema.sql` é a base para uma integração futura e não significa que todas as tabelas já estejam ligadas à interface. O cadastro no Supabase pode exigir confirmação por e-mail, conforme a configuração do projeto.

## Arquivos

- `index.html`: estrutura da aplicação.
- `css/style.css`: estilo responsivo.
- `js/supabase.js`: configuração opcional de Supabase.
- `js/music.js`: catálogo demonstrativo e renderização de faixas.
- `js/player.js`: player de áudio.
- `js/playlists.js`: playlists demonstrativas persistidas no navegador.
- `js/auth.js`: autenticação de demonstração e integração básica de login Supabase.
- `js/app.js`: páginas, navegação e estado local.
- `schema.sql`: tabelas e políticas RLS sugeridas.

## Publicar

É possível publicar os arquivos estáticos no GitHub Pages, Netlify ou Vercel sem Node.js. Para autenticação Supabase, cadastre também o domínio publicado nas configurações de URL do Supabase.

## Nota de teste

O projeto foi gerado como arquivos estáticos e não depende de compilação. O ambiente de criação não valida automaticamente a disponibilidade das URLs de áudio nem executa o projeto em todos os navegadores; teste no seu navegador e substitua URLs de áudio se necessário.
