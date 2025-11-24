# 📘 Guia de Uso — Reconstrução e Comparação de Modelos 3DGS

Este documento descreve as boas práticas de captura, requisitos do navegador e recomendações essenciais para comparar modelos usando o pipeline baseado em 3D Gaussian Splatting.

# 🚀 Visão Geral

Este projeto permite:

Visualizar modelos 3DGS diretamente no navegador.

Carregar outro modelo (mesh, PLY, nuvem de pontos) e compará-lo com o 3DGS.

Avaliar qualidade da captura, reconstrução e alinhamento.

A comparação utiliza um cálculo de distâncias ponto-a-ponto entre os modelos para identificar discrepâncias, falhas e qualidade geométrica.

# 📸 Boas Práticas de Captura de Imagem

A qualidade da reconstrução depende diretamente da qualidade da captura. Para obter modelos consistentes e comparações úteis, siga estas diretrizes:

✔️ 1. Movimentação suave e contínua

Evite movimentos bruscos.

Caminhe ao redor da cena com velocidade uniforme.

Rotacione a câmera de forma gradual.

✔️ 2. Overlap entre 60–80%

Cada foto deve compartilhar bastante informação com a anterior.

Pense em uma sequência contínua, não em fotos isoladas.

✔️ 3. Distância consistente até os objetos

Evite se aproximar e afastar demais sem necessidade.

Objetos pequenos: 0,5 m a 1,5 m.

Ambientes maiores: 2 m a 4 m.

✔️ 4. Variação de ângulos

Circule totalmente o objeto ou ambiente.

Capture diferentes alturas (para cima e para baixo).

Preste atenção em cantos, bordas, e áreas de difícil acesso.

✔️ 5. Iluminação adequada

Prefira luz difusa e evite reflexos.

Não use flash direto.

Ambientes homogêneos de luz ajudam o COLMAP e o 3DGS a encontrar mais correspondências.

✔️ 6. Captura por vídeo (opcional)

Se usar vídeo e extrair frames:

Grave em 4K se possível.

Estabilização ativa ajuda bastante.

Evite motion blur (ex.: filmar em ambientes muito escuros).

# 🌐 Requisitos do Navegador

Para renderizar Gaussian Splats com boa performance:

✔️ Aceleração de hardware deve estar ativada

Sem isso, o WebGL não lida com o volume de splats e o FPS cai drasticamente.

✔️ Uso no Electron

O Electron já ativa aceleração gráfica por padrão, então nada precisa ser configurado.

- Caso utilizar a aplicação pelo navegador, verifique:

Chrome / Edge / Brave / Opera
Configurações → Sistema → “Usar aceleração de hardware quando disponível”.

Obs.: o uso da aplicação por navegador não é recomendado.

# 🆚 Comparação entre modelos — Recomendações essenciais

Durante a análise, o sistema precisa definir qual modelo será a referência e qual será o alvo para cálculo das distâncias.

✔️ Use o modelo 3DGS como modelo de referência (source)

Esta é a forma recomendada de operar, pois:

- O 3DGS geralmente é mais rico em detalhes.

- É mais pesado e complexo, logo é mais eficiente utilizá-lo como referência em vez de “modelo a ser comparado”.

- O tempo de análise aumenta bastante quando o 3DGS é usado como target.

✔️ O 3DGS pode ser usado como modelo alvo

Isso é permitido pelo sistema, mas não recomendado, porque:

- O tempo de cálculo aumenta de forma significativa.

- Em modelos grandes, pode se tornar inviável.

Recomendação final:

| Modelo                           | Papel Ideal                     |
|----------------------------------|---------------------------------|
| **3DGS**                         | Referência (**source**)         |
| **Outro modelo** (mesh/PLY/nuvem)| Target (modelo a ser comparado) |

# 🧭 Pipeline Geral de Uso

1. Capture imagens seguindo as boas práticas acima.

2. Gere o modelo adicional (mesh/PLY) usando COLMAP ou outro pipeline.

3. Gere o modelo 3DGS.

4. Abra ambos os modelos no sistema.

5. Configure a comparação usando 3DGS como referência.

6. Analise o mapa de distâncias, discrepâncias e qualidade.