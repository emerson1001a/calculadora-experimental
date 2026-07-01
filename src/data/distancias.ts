type Rota = readonly [string, string, number];

const rotas: Rota[] = [
  // São Paulo
  ['São Paulo', 'Rio de Janeiro', 430],
  ['São Paulo', 'Belo Horizonte', 586],
  ['São Paulo', 'Curitiba', 408],
  ['São Paulo', 'Porto Alegre', 1107],
  ['São Paulo', 'Florianópolis', 704],
  ['São Paulo', 'Brasília', 1015],
  ['São Paulo', 'Goiânia', 907],
  ['São Paulo', 'Salvador', 1960],
  ['São Paulo', 'Campo Grande', 1001],
  ['São Paulo', 'Cuiabá', 1618],
  ['São Paulo', 'Vitória', 918],
  ['São Paulo', 'Campinas', 100],
  ['São Paulo', 'Santos', 72],
  ['São Paulo', 'Ribeirão Preto', 314],
  ['São Paulo', 'São José dos Campos', 96],
  ['São Paulo', 'Sorocaba', 97],
  ['São Paulo', 'Bauru', 320],
  ['São Paulo', 'Marília', 438],
  ['São Paulo', 'Presidente Prudente', 558],
  ['São Paulo', 'São José do Rio Preto', 447],
  ['São Paulo', 'Araçatuba', 519],
  ['São Paulo', 'Araraquara', 271],
  ['São Paulo', 'Londrina', 458],
  ['São Paulo', 'Maringá', 543],
  ['São Paulo', 'Cascavel', 668],
  ['São Paulo', 'Foz do Iguaçu', 788],
  ['São Paulo', 'Ponta Grossa', 538],
  ['São Paulo', 'Joinville', 537],
  ['São Paulo', 'Blumenau', 622],
  ['São Paulo', 'Caxias do Sul', 932],
  ['São Paulo', 'Uberlândia', 579],
  ['São Paulo', 'Uberaba', 480],
  ['São Paulo', 'Juiz de Fora', 497],
  ['São Paulo', 'Anápolis', 940],
  ['São Paulo', 'Dourados', 1173],
  ['São Paulo', 'Três Lagoas', 780],
  ['São Paulo', 'Montes Claros', 1051],
  ['São Paulo', 'Rondonópolis', 1619],
  ['São Paulo', 'Chapecó', 856],
  ['São Paulo', 'Passo Fundo', 1027],
  ['São Paulo', 'Recife', 2662],
  ['São Paulo', 'Fortaleza', 3120],
  ['São Paulo', 'Natal', 2828],
  ['São Paulo', 'Belém', 2599],
  ['São Paulo', 'Manaus', 3859],
  ['São Paulo', 'Maceió', 2470],
  ['São Paulo', 'Palmas', 2152],
  ['São Paulo', 'São Luís', 3020],
  ['São Paulo', 'Teresina', 2780],
  ['São Paulo', 'Sinop', 2075],
  ['São Paulo', 'João Pessoa', 2948],
  ['São Paulo', 'Porto Velho', 3241],
  ['São Paulo', 'Aracaju', 2222],
  ['São Paulo', 'Governador Valadares', 791],

  // Rio de Janeiro
  ['Rio de Janeiro', 'Belo Horizonte', 434],
  ['Rio de Janeiro', 'Vitória', 524],
  ['Rio de Janeiro', 'Juiz de Fora', 182],
  ['Rio de Janeiro', 'São José dos Campos', 163],
  ['Rio de Janeiro', 'Curitiba', 847],
  ['Rio de Janeiro', 'Florianópolis', 1143],
  ['Rio de Janeiro', 'Porto Alegre', 1540],
  ['Rio de Janeiro', 'Salvador', 1651],
  ['Rio de Janeiro', 'Brasília', 1148],
  ['Rio de Janeiro', 'Goiânia', 1220],
  ['Rio de Janeiro', 'Campo Grande', 1431],
  ['Rio de Janeiro', 'Recife', 2324],
  ['Rio de Janeiro', 'Fortaleza', 2782],
  ['Rio de Janeiro', 'Montes Claros', 904],
  ['Rio de Janeiro', 'Campinas', 497],
  ['Rio de Janeiro', 'Ribeirão Preto', 740],
  ['Rio de Janeiro', 'Uberlândia', 897],
  ['Rio de Janeiro', 'Santos', 431],
  ['Rio de Janeiro', 'Governador Valadares', 691],
  ['Rio de Janeiro', 'Natal', 2588],
  ['Rio de Janeiro', 'Maceió', 2146],
  ['Rio de Janeiro', 'Palmas', 2286],

  // Belo Horizonte
  ['Belo Horizonte', 'Brasília', 741],
  ['Belo Horizonte', 'Goiânia', 741],
  ['Belo Horizonte', 'Salvador', 1373],
  ['Belo Horizonte', 'Uberlândia', 449],
  ['Belo Horizonte', 'Uberaba', 490],
  ['Belo Horizonte', 'Montes Claros', 424],
  ['Belo Horizonte', 'Juiz de Fora', 284],
  ['Belo Horizonte', 'Governador Valadares', 325],
  ['Belo Horizonte', 'Vitória', 524],
  ['Belo Horizonte', 'Curitiba', 1001],
  ['Belo Horizonte', 'Porto Alegre', 1735],
  ['Belo Horizonte', 'Recife', 2272],
  ['Belo Horizonte', 'Fortaleza', 2668],
  ['Belo Horizonte', 'Teresina', 2213],
  ['Belo Horizonte', 'São Luís', 2436],
  ['Belo Horizonte', 'Palmas', 1668],
  ['Belo Horizonte', 'Ribeirão Preto', 639],
  ['Belo Horizonte', 'Campinas', 668],
  ['Belo Horizonte', 'Anápolis', 695],
  ['Belo Horizonte', 'Maceió', 1905],
  ['Belo Horizonte', 'Florianópolis', 1275],
  ['Belo Horizonte', 'Campo Grande', 1443],
  ['Belo Horizonte', 'Aracaju', 1252],

  // Curitiba
  ['Curitiba', 'Porto Alegre', 718],
  ['Curitiba', 'Florianópolis', 298],
  ['Curitiba', 'Campo Grande', 876],
  ['Curitiba', 'Foz do Iguaçu', 637],
  ['Curitiba', 'Cascavel', 476],
  ['Curitiba', 'Maringá', 417],
  ['Curitiba', 'Londrina', 374],
  ['Curitiba', 'Ponta Grossa', 128],
  ['Curitiba', 'Joinville', 138],
  ['Curitiba', 'Blumenau', 196],
  ['Curitiba', 'Chapecó', 485],
  ['Curitiba', 'Caxias do Sul', 608],
  ['Curitiba', 'Passo Fundo', 699],
  ['Curitiba', 'Brasília', 1419],
  ['Curitiba', 'Goiânia', 1312],
  ['Curitiba', 'Dourados', 1053],
  ['Curitiba', 'Três Lagoas', 1073],

  // Porto Alegre
  ['Porto Alegre', 'Florianópolis', 476],
  ['Porto Alegre', 'Caxias do Sul', 127],
  ['Porto Alegre', 'Passo Fundo', 296],
  ['Porto Alegre', 'Foz do Iguaçu', 870],
  ['Porto Alegre', 'Chapecó', 590],
  ['Porto Alegre', 'Brasília', 2083],
  ['Porto Alegre', 'Goiânia', 1976],
  ['Porto Alegre', 'Campo Grande', 1598],
  ['Porto Alegre', 'Dourados', 1400],
  ['Porto Alegre', 'Cascavel', 699],
  ['Porto Alegre', 'Maringá', 780],
  ['Porto Alegre', 'Londrina', 835],

  // Florianópolis
  ['Florianópolis', 'Joinville', 185],
  ['Florianópolis', 'Blumenau', 142],
  ['Florianópolis', 'Chapecó', 472],
  ['Florianópolis', 'Caxias do Sul', 394],
  ['Florianópolis', 'Passo Fundo', 490],
  ['Florianópolis', 'Campo Grande', 1170],

  // Brasília
  ['Brasília', 'Goiânia', 209],
  ['Brasília', 'Anápolis', 134],
  ['Brasília', 'Uberlândia', 599],
  ['Brasília', 'Campo Grande', 1136],
  ['Brasília', 'Cuiabá', 1133],
  ['Brasília', 'Rondonópolis', 1239],
  ['Brasília', 'Palmas', 972],
  ['Brasília', 'Belém', 2090],
  ['Brasília', 'Salvador', 1435],
  ['Brasília', 'Fortaleza', 2334],
  ['Brasília', 'Recife', 2034],
  ['Brasília', 'São Luís', 2191],
  ['Brasília', 'Teresina', 1999],
  ['Brasília', 'Montes Claros', 700],
  ['Brasília', 'Sinop', 1476],
  ['Brasília', 'Londrina', 958],
  ['Brasília', 'Natal', 2248],
  ['Brasília', 'Maceió', 1874],
  ['Brasília', 'João Pessoa', 2112],
  ['Brasília', 'Porto Velho', 2875],
  ['Brasília', 'Aracaju', 1633],
  ['Brasília', 'Uberaba', 739],

  // Goiânia
  ['Goiânia', 'Anápolis', 55],
  ['Goiânia', 'Uberlândia', 426],
  ['Goiânia', 'Campo Grande', 851],
  ['Goiânia', 'Cuiabá', 928],
  ['Goiânia', 'Rondonópolis', 1029],
  ['Goiânia', 'Salvador', 1638],
  ['Goiânia', 'Palmas', 880],
  ['Goiânia', 'Sinop', 1268],
  ['Goiânia', 'Dourados', 1050],
  ['Goiânia', 'Teresina', 1945],
  ['Goiânia', 'Belém', 1907],
  ['Goiânia', 'Fortaleza', 2430],
  ['Goiânia', 'Montes Claros', 659],
  ['Goiânia', 'Três Lagoas', 906],
  ['Goiânia', 'Uberaba', 390],
  ['Goiânia', 'São Luís', 2148],

  // Campo Grande
  ['Campo Grande', 'Cuiabá', 694],
  ['Campo Grande', 'Dourados', 225],
  ['Campo Grande', 'Três Lagoas', 321],
  ['Campo Grande', 'Rondonópolis', 480],
  ['Campo Grande', 'Foz do Iguaçu', 780],
  ['Campo Grande', 'Londrina', 679],
  ['Campo Grande', 'Maringá', 695],
  ['Campo Grande', 'Cascavel', 780],
  ['Campo Grande', 'Sinop', 1386],
  ['Campo Grande', 'Porto Velho', 2190],

  // Cuiabá
  ['Cuiabá', 'Rondonópolis', 218],
  ['Cuiabá', 'Sinop', 503],
  ['Cuiabá', 'Porto Velho', 1464],
  ['Cuiabá', 'Belém', 2516],

  // Belém
  ['Belém', 'Manaus', 2550],
  ['Belém', 'Palmas', 1293],
  ['Belém', 'São Luís', 797],
  ['Belém', 'Fortaleza', 1765],
  ['Belém', 'Teresina', 1098],

  // Salvador
  ['Salvador', 'Recife', 839],
  ['Salvador', 'Maceió', 576],
  ['Salvador', 'Natal', 1175],
  ['Salvador', 'Fortaleza', 1304],
  ['Salvador', 'Vitória', 1237],
  ['Salvador', 'Governador Valadares', 1041],
  ['Salvador', 'Montes Claros', 981],
  ['Salvador', 'Teresina', 1715],
  ['Salvador', 'São Luís', 1993],
  ['Salvador', 'Aracaju', 356],
  ['Salvador', 'João Pessoa', 1278],

  // Recife
  ['Recife', 'Natal', 303],
  ['Recife', 'João Pessoa', 122],
  ['Recife', 'Maceió', 288],
  ['Recife', 'Fortaleza', 800],
  ['Recife', 'Teresina', 1268],
  ['Recife', 'São Luís', 1781],
  ['Recife', 'Aracaju', 546],

  // Fortaleza
  ['Fortaleza', 'Natal', 537],
  ['Fortaleza', 'Teresina', 630],
  ['Fortaleza', 'São Luís', 1071],
  ['Fortaleza', 'João Pessoa', 697],
  ['Fortaleza', 'Maceió', 1004],

  // São Luís
  ['São Luís', 'Teresina', 446],
  ['São Luís', 'Palmas', 1200],
  ['São Luís', 'Natal', 1485],

  // Teresina
  ['Teresina', 'Natal', 952],
  ['Teresina', 'João Pessoa', 795],
  ['Teresina', 'Palmas', 1148],

  // Vitória
  ['Vitória', 'Governador Valadares', 383],
  ['Vitória', 'Juiz de Fora', 630],
  ['Vitória', 'Aracaju', 924],

  // Palmas
  ['Palmas', 'Manaus', 2620],
  ['Palmas', 'Sinop', 1338],
  ['Palmas', 'Cuiabá', 1761],

  // Manaus
  ['Manaus', 'Porto Velho', 897],

  // João Pessoa
  ['João Pessoa', 'Natal', 185],
  ['João Pessoa', 'Maceió', 284],

  // Maceió
  ['Maceió', 'Aracaju', 291],

  // Interior SP: Campinas
  ['Campinas', 'Ribeirão Preto', 237],
  ['Campinas', 'Santos', 186],
  ['Campinas', 'São José dos Campos', 176],
  ['Campinas', 'Sorocaba', 100],
  ['Campinas', 'Bauru', 243],
  ['Campinas', 'Araraquara', 168],
  ['Campinas', 'Uberlândia', 473],
  ['Campinas', 'Uberaba', 406],
  ['Campinas', 'Londrina', 485],
  ['Campinas', 'Maringá', 570],

  // Interior SP: Santos
  ['Santos', 'São José dos Campos', 163],
  ['Santos', 'Curitiba', 415],
  ['Santos', 'Bauru', 385],

  // Interior SP: Ribeirão Preto
  ['Ribeirão Preto', 'Araraquara', 76],
  ['Ribeirão Preto', 'Uberlândia', 240],
  ['Ribeirão Preto', 'Uberaba', 257],
  ['Ribeirão Preto', 'Bauru', 234],
  ['Ribeirão Preto', 'Marília', 260],
  ['Ribeirão Preto', 'São José do Rio Preto', 192],
  ['Ribeirão Preto', 'Goiânia', 748],

  // Interior SP: São José dos Campos
  ['São José dos Campos', 'Sorocaba', 176],

  // Interior SP: Bauru
  ['Bauru', 'Marília', 113],
  ['Bauru', 'Presidente Prudente', 255],
  ['Bauru', 'Araçatuba', 175],
  ['Bauru', 'Araraquara', 138],
  ['Bauru', 'São José do Rio Preto', 234],
  ['Bauru', 'Londrina', 388],
  ['Bauru', 'Campo Grande', 651],
  ['Bauru', 'Três Lagoas', 382],

  // Interior SP: Marília
  ['Marília', 'Presidente Prudente', 166],
  ['Marília', 'Araçatuba', 235],
  ['Marília', 'São José do Rio Preto', 260],
  ['Marília', 'Campo Grande', 614],

  // Interior SP: Presidente Prudente
  ['Presidente Prudente', 'Araçatuba', 258],
  ['Presidente Prudente', 'Campo Grande', 530],
  ['Presidente Prudente', 'Cascavel', 397],
  ['Presidente Prudente', 'São José do Rio Preto', 285],
  ['Presidente Prudente', 'Londrina', 336],
  ['Presidente Prudente', 'Dourados', 629],

  // Interior SP: São José do Rio Preto
  ['São José do Rio Preto', 'Araçatuba', 128],
  ['São José do Rio Preto', 'Uberlândia', 369],
  ['São José do Rio Preto', 'Goiânia', 630],
  ['São José do Rio Preto', 'Campo Grande', 680],
  ['São José do Rio Preto', 'Três Lagoas', 463],

  // Interior SP: Araçatuba
  ['Araçatuba', 'Campo Grande', 492],
  ['Araçatuba', 'Três Lagoas', 322],
  ['Araçatuba', 'Dourados', 696],

  // Interior MG
  ['Uberlândia', 'Uberaba', 105],
  ['Uberlândia', 'Anápolis', 481],
  ['Uberlândia', 'Montes Claros', 573],
  ['Uberlândia', 'Campo Grande', 1169],
  ['Uberlândia', 'Três Lagoas', 718],
  ['Uberlândia', 'Ribeirão Preto', 240],

  ['Uberaba', 'Anápolis', 585],
  ['Uberaba', 'Goiânia', 390],

  ['Montes Claros', 'Governador Valadares', 338],
  ['Montes Claros', 'Vitória', 862],
  ['Montes Claros', 'Teresina', 1569],

  ['Juiz de Fora', 'Vitória', 630],

  ['Governador Valadares', 'Vitória', 383],

  // Interior PR
  ['Londrina', 'Maringá', 107],
  ['Londrina', 'Cascavel', 291],
  ['Londrina', 'Foz do Iguaçu', 400],
  ['Londrina', 'Ponta Grossa', 260],
  ['Londrina', 'Dourados', 456],

  ['Maringá', 'Cascavel', 246],
  ['Maringá', 'Foz do Iguaçu', 352],
  ['Maringá', 'Ponta Grossa', 313],
  ['Maringá', 'Dourados', 480],

  ['Cascavel', 'Foz do Iguaçu', 148],
  ['Cascavel', 'Ponta Grossa', 416],
  ['Cascavel', 'Chapecó', 295],
  ['Cascavel', 'Dourados', 571],

  ['Foz do Iguaçu', 'Porto Alegre', 870],
  ['Foz do Iguaçu', 'Florianópolis', 648],
  ['Foz do Iguaçu', 'Chapecó', 340],
  ['Foz do Iguaçu', 'Dourados', 450],

  ['Ponta Grossa', 'Joinville', 266],
  ['Ponta Grossa', 'Blumenau', 262],

  // Interior SC
  ['Joinville', 'Blumenau', 79],
  ['Joinville', 'Chapecó', 452],

  ['Blumenau', 'Chapecó', 380],

  ['Chapecó', 'Passo Fundo', 250],
  ['Chapecó', 'Caxias do Sul', 380],

  // Interior RS
  ['Caxias do Sul', 'Passo Fundo', 173],

  // Interior GO
  ['Anápolis', 'Palmas', 983],

  // Interior MT
  ['Rondonópolis', 'Sinop', 497],
  ['Rondonópolis', 'Porto Velho', 1310],

  ['Sinop', 'Belém', 2085],
  ['Sinop', 'Porto Velho', 1116],

  // Interior MS
  ['Dourados', 'Três Lagoas', 545],
];

export const distancias: Record<string, Record<string, number>> = {};

for (const [a, b, d] of rotas) {
  if (!distancias[a]) distancias[a] = {};
  if (!distancias[b]) distancias[b] = {};
  distancias[a][b] = d;
  distancias[b][a] = d;
}

export const cidades = Object.keys(distancias).sort();
