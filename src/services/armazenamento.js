// Leitura e gravação no localStorage do navegador.
// O localStorage pode estar indisponível (aba anônima, cota cheia, site bloqueado),
// então nenhuma falha aqui pode quebrar o app: na pior hipótese, nada é salvo.

const PREFIXO = "questoes-rapidas:";

export function lerLocal(chave) {
  try {
    const texto = localStorage.getItem(PREFIXO + chave);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

export function gravarLocal(chave, valor) {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch (erro) {
    console.warn(`Não foi possível salvar "${chave}" no navegador:`, erro);
  }
}

export function removerLocal(chave) {
  try {
    localStorage.removeItem(PREFIXO + chave);
  } catch {
    // nada a fazer
  }
}
