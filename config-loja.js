(function (escopoGlobal) {
    "use strict";

    const config = Object.freeze({
        slug: "passo_firme",
        nome: "Passo Firme",
        razaoSocial: "Passo Firme Ltda",
        cnpj: "03.190.202/0001-31",
        email: "calcadospassofirme@hotmail.com",
        whatsapp: {
            exibicao: "(38) 99159-5150",
            internacional: "5538991595150"
        },
        logo: "WhatsApp Image 2026-08-07 at 08.26.08.jpeg",
        apiUrl: "https://roleta-api-passo-firme.onrender.com",
        roletaUrl: "https://tnlabs-dev.github.io/Passo_Firme/",
        instagram: "instagram.com/passo.firme_/",
        mensagemCompartilhamento: "Acabei de descobrir a Roleta de Prêmios da Passo Firme! ✨ Comprando acima de R$200 você garante um giro e pode ganhar desde cupons até R$500 em roupas. Dá uma olhada no Instagram e vem conferir: instagram.com/passo.firme_/ 💫👗",
        chavesSessao: {
            administracao: "passo_firme_admin_session",
            equipe: "passo_firme_senha_equipe"
        },
        voucherPrefix: "PFR",
        cores: {
            principal: "#0D2E46",
            principalEscura: "#05263E",
            destaque: "#B02C3A",
            destaqueForte: "#B02C3A",
            destaqueSuave: "#F7E6E8",
            fundo: "#F3F6F8",
            papel: "#FFFFFF",
            texto: "#263844",
            textoSuave: "#687985",
            borda: "#D8E1E6"
        }
    });

    escopoGlobal.LojaConfig = config;

    const documento = escopoGlobal.document;
    if (documento) {
        const raiz = documento.documentElement;
        const cores = config.cores;
        const variaveisCss = {
            "--cor-fundo": cores.fundo,
            "--cor-bordeaux": cores.principal,
            "--cor-azul-marinho": cores.principal,
            "--cor-rose-gold": cores.destaque,
            "--cor-vermelho": cores.destaque,
            "--cor-vermelho-claro": cores.destaqueSuave,
            "--cor-ouro": cores.destaqueForte,
            "--cor-borda": cores.borda,
            "--cor-texto": cores.texto,
            "--vinho": cores.principal,
            "--vinho-escuro": cores.principalEscura,
            "--rose": cores.destaque,
            "--rose-claro": cores.destaqueSuave,
            "--ouro": cores.destaqueForte,
            "--creme": cores.fundo,
            "--texto": cores.texto,
            "--muted": cores.textoSuave,
            "--borda": cores.borda,
            "--bordeaux": cores.principal,
            "--gold": cores.destaqueForte,
            "--ink": cores.texto,
            "--paper": cores.papel
        };
        Object.entries(variaveisCss).forEach(([nome, valor]) => {
            raiz.style.setProperty(nome, valor);
        });
        raiz.dataset.lojaConfig = config.slug;

        const aplicarIdentidade = () => {
            documento.querySelectorAll("[data-loja-nome]").forEach(elemento => {
                elemento.textContent = config.nome;
            });
            documento.querySelectorAll("[data-loja-razao-social]").forEach(elemento => {
                elemento.textContent = config.razaoSocial;
            });
            documento.querySelectorAll("[data-loja-cnpj]").forEach(elemento => {
                elemento.textContent = config.cnpj;
            });
            documento.querySelectorAll("[data-loja-email]").forEach(elemento => {
                elemento.textContent = config.email;
                if (elemento.tagName === "A") elemento.href = `mailto:${config.email}`;
            });
            documento.querySelectorAll("[data-loja-whatsapp]").forEach(elemento => {
                elemento.textContent = config.whatsapp.exibicao;
                if (elemento.tagName === "A") {
                    elemento.href = `https://wa.me/${config.whatsapp.internacional}`;
                }
            });
            documento.querySelectorAll("[data-loja-logo]").forEach(elemento => {
                elemento.src = config.logo;
                elemento.alt = `Logo ${config.nome}`;
            });
            documento.querySelectorAll("[data-loja-rodape-privacidade]").forEach(elemento => {
                elemento.textContent = `${config.razaoSocial} · CNPJ ${config.cnpj} · Aviso de Privacidade versão 1.0`;
            });
        };

        if (documento.readyState === "loading") {
            documento.addEventListener("DOMContentLoaded", aplicarIdentidade, { once: true });
        } else {
            aplicarIdentidade();
        }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = config;
    }
})(typeof window !== "undefined" ? window : globalThis);
