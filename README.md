# SABERS-DFI — Site do Grupo de Astrofísica da UFS

Site oficial do grupo de pesquisa em Astrofísica do Departamento de Física (DFI) da Universidade Federal de Sergipe.

**URL de produção:** https://astrofisica-ufs.github.io

---

## Índice

- [Como rodar localmente](#como-rodar-localmente)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Guia por tipo de membro](#guia-por-tipo-de-membro)
  - [Atualizar meu perfil](#atualizar-meu-perfil)
  - [Adicionar uma publicação](#adicionar-uma-publicação)
  - [Escrever um post/notícia](#escrever-um-postnotícia)
- [Deploy automático](#deploy-automático)
- [Contato e suporte](#contato-e-suporte)

---

## Como rodar localmente

### Pré-requisitos
- [Hugo Extended](https://gohugo.io/installation/) v0.136.5+
- [Go](https://go.dev/dl/) v1.20+
- [Git](https://git-scm.com/)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/astrofisica-ufs/sabers-dfi-page.git
cd sabers-dfi-page

# 2. Instale as dependências do Hugo
hugo mod tidy

# 3. Inicie o servidor de desenvolvimento
hugo server

# 4. Abra no navegador
# http://localhost:1313
```

O servidor atualiza automaticamente quando você salva arquivos.

---

## Estrutura de arquivos

```
sabers-dfi-page/
├── config/_default/          # Configurações globais do site
│   ├── hugo.yaml             # Nome do site, URL, idioma
│   ├── params.yaml           # Aparência, SEO, funcionalidades
│   ├── menus.yaml            # Links da barra de navegação
│   └── languages.yaml        # Configuração de idiomas
│
├── content/                  # Todo o conteúdo do site
│   ├── _index.md             # Homepage (widgets e seções)
│   ├── authors/              # Perfis de membros
│   │   ├── admin/            # Perfil do Prof. Diogo Souto (PI)
│   │   ├── doutorando-placeholder/
│   │   ├── mestrando-placeholder/
│   │   └── ic-placeholder/
│   ├── publication/          # Publicações científicas
│   ├── project/              # Linhas de pesquisa
│   ├── post/                 # Blog e notícias
│   ├── opportunities/        # Vagas e oportunidades
│   ├── people/               # Página da equipe
│   ├── contact/              # Página de contato
│   └── tour/                 # Página de pesquisa
│
├── static/                   # Arquivos estáticos (imagens, PDFs)
│   └── uploads/              # Local para fotos e documentos
│
└── .github/workflows/        # Automação GitHub Actions
    └── hugo.yml              # Deploy automático para GitHub Pages
```

---

## Guia por tipo de membro

### Atualizar meu perfil

1. Navegue até `content/authors/SEU-NOME/`
2. Edite o arquivo `_index.md` — substitua os campos com seus dados reais
3. Adicione sua foto como `avatar.jpg` na mesma pasta (recomendado: 400×400px)

**Campos importantes:**
```yaml
title: Seu Nome Completo
role: Seu Cargo (ex: Estudante de Doutorado)
bio: Uma frase sobre sua pesquisa
interests:
  - Tema 1
  - Tema 2
user_groups:
  - Doutorandos  # ou: Mestrandos, Iniciação Científica, Alumni
social:
  - icon: orcid
    icon_pack: ai
    link: https://orcid.org/SEU-ORCID
```

---

### Adicionar uma publicação

#### Método 1: Manual (recomendado para controle total)

```bash
# Crie uma pasta para a publicação
mkdir content/publication/sobrenome-ano-palavra-chave

# Crie o arquivo index.md baseado no modelo
cp content/publication/souto2018-m-dwarfs/index.md \
   content/publication/sobrenome-ano-palavra-chave/index.md
```

Edite os campos:
```yaml
title: "Título completo do artigo"
authors:
  - admin          # slug do autor (pasta em content/authors/)
  - Coautor Nome   # ou nome literal para autores externos
date: "2024-01-15T00:00:00Z"
doi: "10.xxxx/xxxxx"
publication_types: ["article-journal"]
publication: "*Nome da Revista*, Volume, Página"
abstract: |
  Resumo do artigo...
tags:
  - Tag relevante
featured: false  # true = aparece em destaque na homepage
url_pdf: 'https://arxiv.org/pdf/XXXX.XXXXX'
```

#### Método 2: Importar via BibTeX

```bash
# Instale o conversor
pip install academic

# Importe um arquivo .bib
academic import --bibtex minhas-publicacoes.bib

# Ou importe diretamente do arXiv
academic import --arxiv 1803.05538
```

---

### Escrever um post/notícia

```bash
# Crie uma pasta para o post
mkdir content/post/meu-post-sobre-tema

# Crie o arquivo
cat > content/post/meu-post-sobre-tema/index.md << 'EOF'
---
title: "Título da Notícia"
subtitle: "Subtítulo opcional"
summary: "Resumo em 1-2 frases para a listagem."
date: "2024-06-01T00:00:00Z"
draft: false
featured: false
authors:
  - admin
tags:
  - Tag 1
  - Tag 2
---

Conteúdo do post em Markdown aqui...
EOF
```

---

## Deploy automático

O site é publicado automaticamente no GitHub Pages toda vez que um commit é enviado para a branch `main`.

**Fluxo:**
```
git add .
git commit -m "Adiciona publicação de 2024"
git push origin main
# → GitHub Actions reconstrói e publica o site em ~2 minutos
```

Para verificar o status do deploy: GitHub → Actions → "Deploy Hugo site to GitHub Pages"

---

## Contato e suporte

Dúvidas técnicas sobre o site: abra uma issue no GitHub ou contate o Prof. Diogo Souto.

Documentação completa do HugoBlox: https://docs.hugoblox.com
