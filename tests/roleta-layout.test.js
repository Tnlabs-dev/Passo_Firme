const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const {
    calcularDimensoesRoleta
} = require(path.join(__dirname, "..", "roleta-layout.js"));

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
    const aguardar = funcao.indexOf("await CappriRoletaLayout.aguardarLayout()");
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

test("mostra o mesmo link da cliente no QR e no campo copiável", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "caixa.html"), "utf8");
    const inicio = html.indexOf("function exibirConvite(token, campanha)");
    const fim = html.indexOf("async function copiarLinkCliente()", inicio);
    const funcao = html.slice(inicio, fim);

    assert.match(html, /id="link-cliente"[^>]*readonly/);
    assert.match(html, /id="botao-copiar-link"/);
    assert.match(funcao, /linkClienteAtual = `\$\{URL_ROLETA\}\?token=\$\{encodeURIComponent\(token\)\}`/);
    assert.match(funcao, /getElementById\("link-cliente"\)\.value = linkClienteAtual/);
    assert.match(funcao, /QRCode\.toCanvas\(canvas, linkClienteAtual/);
});

test("usa caixa.html como único gerador de convites do painel", () => {
    const html = fs.readFileSync(path.join(__dirname, "..", "admin.html"), "utf8");
    const atalhos = [...html.matchAll(/<a class="btn btn-primary" href="caixa\.html">＋ Gerar convite<\/a>/g)];

    assert.equal(atalhos.length, 2, "visão geral e convites devem abrir o mesmo gerador");
    assert.doesNotMatch(html, /function generateInvite\s*\(/);
    assert.doesNotMatch(html, /api\("\/admin\/convites", \{ method: "POST" \}\)/);
    assert.doesNotMatch(html, /Convite gerado/);
});

test("mantém válida a sintaxe dos scripts da funcionária e da administração", () => {
    for (const arquivo of ["caixa.html", "admin.html"]) {
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
