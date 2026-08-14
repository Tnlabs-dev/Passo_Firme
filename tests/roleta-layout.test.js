const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
    calcularDimensoesRoleta
} = require(path.join(__dirname, "..", "roleta-layout.js"));
const lojaConfig = require(path.join(__dirname, "..", "config-loja.js"));

test("calcula uma roleta de desktop com raio positivo", () => {
    const dimensoes = calcularDimensoesRoleta(320, 1);

    assert.equal(dimensoes.diametroAnel, 320);
    assert.equal(dimensoes.diametroRoleta, 296);
    assert.equal(dimensoes.resolucao, 296);
    assert.equal(dimensoes.outerRadius, 148);
});

test("adapta a roleta a uma tela estreita e de alta densidade", () => {
    const dimensoes = calcularDimensoesRoleta(240, 2);

    assert.equal(dimensoes.diametroAnel, 240);
    assert.equal(dimensoes.diametroRoleta, 216);
    assert.equal(dimensoes.resolucao, 432);
    assert.equal(dimensoes.outerRadius, 216);
});

test("impede que uma largura oculta gere o antigo raio negativo", () => {
    assert.throws(() => calcularDimensoesRoleta(0, 1), /calcular o tamanho/);
    assert.throws(() => calcularDimensoesRoleta(24, 1), /calcular o tamanho/);
    assert.throws(() => calcularDimensoesRoleta(Number.NaN, 1), /calcular o tamanho/);
});

test("limita a densidade de pixels a valores seguros", () => {
    assert.equal(calcularDimensoesRoleta(320, 0).resolucao, 296);
    assert.equal(calcularDimensoesRoleta(320, 10).resolucao, 888);
    assert.equal(calcularDimensoesRoleta(320, "inválido").resolucao, 296);
});

test("exibe o contêiner antes de medir e montar a roleta", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
    const inicio = html.indexOf("async function avancarParaWhatsapp()");
    const fim = html.indexOf("async function carregarPremios()", inicio);
    const funcao = html.slice(inicio, fim);

    const exibir = funcao.indexOf('document.getElementById("roleta-container").style.display = "block"');
    const aguardar = funcao.indexOf("await RoletaLayout.aguardarLayout()");
    const montar = funcao.indexOf("montarRoleta(premios)");

    assert.ok(exibir >= 0, "o contêiner precisa ser exibido");
    assert.ok(aguardar > exibir, "o layout precisa ser aguardado depois da exibição");
    assert.ok(montar > aguardar, "a roleta precisa ser montada depois do layout");
});

test("libera a confirmação de compartilhamento também no computador", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
    const inicio = html.indexOf("function compartilharWpp()");
    const fim = html.indexOf("function registrarCompartilhamentoValido()", inicio);
    const funcao = html.slice(inicio, fim);

    assert.match(html, /id="botao-confirmar-compartilhamento"/);
    assert.match(funcao, /window\.open\(linkWeb/);
    assert.match(funcao, /botaoConfirmar\.hidden = false/);
    assert.doesNotMatch(funcao, /visibilitychange/);
});

test("mantém válida a sintaxe do JavaScript embutido na página", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
    const scriptsSemSrc = [
        ...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)
    ];

    assert.ok(scriptsSemSrc.length > 0, "a página precisa conter o script principal");
    for (const script of scriptsSemSrc) {
        assert.doesNotThrow(() => new Function(script[1]));
    }
});

test("a tela da equipe gera e exibe somente o código temporário", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "caixa.html"), "utf8");
    const inicio = html.indexOf("function exibirCodigo(codigo, campanha, expiraEm, validadeMinutos)");
    const fim = html.indexOf("async function copiarCodigo()", inicio);
    const funcao = html.slice(inicio, fim);

    assert.match(html, /id="codigo-texto"/);
    assert.match(html, /dados\.codigo \|\| dados\.token/);
    assert.match(funcao, /codigoAtual\.length === 6/);
    assert.match(funcao, /Válido por \$\{validadeMinutos \|\| 30\} minutos/);
    assert.doesNotMatch(html, /\?token=/);
    assert.doesNotMatch(html, /QRCode\.toCanvas/);
});

test("o QR permanente aponta para a página da loja e pode ser impresso", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "qrcode.html"), "utf8");

    assert.match(html, /QRCode\.toCanvas\(document\.getElementById\("qr-code"\), LojaConfig\.roletaUrl/);
    assert.match(html, /código temporário de 6 números/i);
    assert.match(html, /window\.print\(\)/);
    assert.doesNotMatch(html, /\?token=/);
});

test("a cliente informa seis números e usa a verificação de código", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

    assert.match(html, /id="token"[^>]*inputmode="numeric"[^>]*maxlength="6"/);
    assert.match(html, /pattern="\[0-9\]\{6\}"/);
    assert.match(html, /\? "verificar-codigo" : "verificar-token"/);
    assert.match(html, /replace\(\/\\D\/g, ""\)\.slice\(0, 6\)/);
});

test("usa caixa.html como único gerador de convites do painel", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "admin.html"), "utf8");
    const atalhos = [...html.matchAll(/<a class="btn btn-primary" href="caixa\.html">＋ Gerar código<\/a>/g)];
    const atalhosQr = [...html.matchAll(/href="qrcode\.html"/g)];

    assert.equal(atalhos.length, 2, "visão geral e convites devem abrir o mesmo gerador");
    assert.equal(atalhosQr.length, 2, "visão geral e códigos devem abrir o mesmo QR permanente");
    assert.doesNotMatch(html, /function generateInvite\s*\(/);
    assert.doesNotMatch(html, /api\("\/admin\/convites", \{ method: "POST" \}\)/);
    assert.doesNotMatch(html, /Convite gerado/);
});

test("mantém válida a sintaxe dos scripts da funcionária, do QR e da administração", () => {
    for (const arquivo of ["caixa.html", "qrcode.html", "admin.html"]) {
        const html = fs.readFileSync(path.join(__dirname, "..", arquivo), "utf8");
        const scriptsSemSrc = [
            ...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)
        ];

        assert.ok(scriptsSemSrc.length > 0, `${arquivo} precisa conter JavaScript embutido`);
        for (const script of scriptsSemSrc) {
            assert.doesNotThrow(() => new Function(script[1]), `${arquivo} precisa ter JavaScript válido`);
        }
    }
});

test("administração distingue códigos expirados e copia só os seis números", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "admin.html"), "utf8");

    assert.match(html, /<option value="expired">Expirados<\/option>/);
    assert.match(html, /invite\.codigo \|\| invite\.token/);
    assert.match(html, /expirado: \["Expirado", "badge-gray"\]/);
    assert.match(html, />Copiar código<\/button>/);
    assert.match(html, /copyText\(copyInvite\.dataset\.copyInvite\)/);
    assert.doesNotMatch(html, /ROLETA_URL\}\?token=/);
});

test("separa ciência de privacidade da autorização opcional de aniversário", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

    assert.match(html, /id="ciencia-privacidade"/);
    assert.match(html, /id="data-nascimento"[^>]*autocomplete="bday"/);
    assert.match(html, /id="consentimento-aniversario"/);
    assert.match(html, /href="privacidade\.html"/);
    assert.match(html, /ciencia_privacidade:/);
    assert.match(html, /data_nascimento:/);
    assert.match(html, /consentimento_aniversario:/);
    assert.doesNotMatch(html, /id="consentimento"/);
});

test("publica aviso de privacidade com identificação e canal da empresa", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "privacidade.html"), "utf8");

    assert.match(html, /Passo Firme Ltda/);
    assert.match(html, /03\.190\.202\/0001-31/);
    assert.match(html, /calcadospassofirme@hotmail\.com/);
    assert.match(html, /5538991595150/);
    assert.match(html, /Versão 1\.0/);
    assert.match(html, /18 anos ou mais/);
    assert.match(html, /revogar/i);
});

test("administração mostra aniversários e permite revogar a autorização", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "admin.html"), "utf8");

    assert.match(html, /<th>Aniversário<\/th>/);
    assert.match(html, /p\.data_nascimento/);
    assert.match(html, /data-revoke-birthday/);
    assert.match(html, /revogar-aniversario/);
    assert.match(html, /politica_privacidade_versao/);
});

test("usa a identidade visual e as chaves de sessão exclusivas da Passo Firme", () => {
    const arquivos = ["index.html", "caixa.html", "qrcode.html", "admin.html", "privacidade.html", "config-loja.js"];
    const conteudo = arquivos
        .map(arquivo => fs.readFileSync(path.join(__dirname, "..", arquivo), "utf8"))
        .join("\n");

    assert.match(conteudo, /#0d2e46/i);
    assert.match(conteudo, /#b02c3a/i);
    assert.match(conteudo, /passo_firme_admin_session/);
    assert.match(conteudo, /passo_firme_senha_equipe/);
    assert.doesNotMatch(conteudo, /cappri/i);
});

test("centraliza os dados operacionais da Passo Firme", () => {
    const arquivos = ["index.html", "caixa.html", "qrcode.html", "admin.html", "privacidade.html"];
    const conteudo = arquivos
        .map(arquivo => fs.readFileSync(path.join(__dirname, "..", arquivo), "utf8"))
        .join("\n");

    assert.equal(lojaConfig.nome, "Passo Firme");
    assert.equal(lojaConfig.apiUrl, "https://roleta-api-passo-firme.onrender.com");
    assert.equal(lojaConfig.voucherPrefix, "PFR");
    assert.equal(lojaConfig.chavesSessao.administracao, "passo_firme_admin_session");
    assert.match(conteudo, /config-loja\.js/);
    assert.match(conteudo, /LojaConfig\.apiUrl/);
    assert.match(conteudo, /LojaConfig\.chavesSessao/);
});
