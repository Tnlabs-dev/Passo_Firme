(function (escopoGlobal) {
    "use strict";

    function calcularDimensoesRoleta(
        larguraDisponivel,
        densidadeDePixels = 1,
        larguraMaxima = 320,
        espessuraAnel = 12
    ) {
        const largura = Number(larguraDisponivel);
        const espessura = Number(espessuraAnel);

        if (!Number.isFinite(largura) || largura <= espessura * 2) {
            throw new Error("Não foi possível calcular o tamanho da roleta. Tente novamente.");
        }

        const diametroAnel = Math.min(Number(larguraMaxima), largura);
        const diametroRoleta = diametroAnel - (espessura * 2);
        const densidadeInformada = Number(densidadeDePixels);
        const densidade = Number.isFinite(densidadeInformada)
            ? Math.min(3, Math.max(1, densidadeInformada))
            : 1;
        const resolucao = Math.round(diametroRoleta * densidade);

        if (!Number.isFinite(resolucao) || resolucao <= 0) {
            throw new Error("Não foi possível calcular o tamanho da roleta. Tente novamente.");
        }

        return {
            diametroAnel,
            diametroRoleta,
            resolucao,
            escala: resolucao / 350,
            outerRadius: resolucao / 2
        };
    }

    function aguardarLayout() {
        return new Promise((resolve) => {
            if (typeof escopoGlobal.requestAnimationFrame !== "function") {
                resolve();
                return;
            }

            escopoGlobal.requestAnimationFrame(() => {
                escopoGlobal.requestAnimationFrame(resolve);
            });
        });
    }

    const api = { calcularDimensoesRoleta, aguardarLayout };
    escopoGlobal.CappriRoletaLayout = api;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
