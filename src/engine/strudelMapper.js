export const generateStrudelCode = (game, cityConfig) => {
  const board = game.board();
  const isCheck = game.inCheck();
  const pieces = board.flat().filter(p => p !== null);
  
  // Contagem de peças para densidade
  const pawns = pieces.filter(p => p.type === 'p');
  const knights = pieces.filter(p => p.type === 'n');
  const queen = pieces.find(p => p.type === 'q');

  // Lógica de Ritmo (Peões)
  const kickPattern = pawns.length > 8 ? "bd*4" : "bd [~ bd] bd ~";
  
  // Lógica de Bass (Cavalos)
  const bassNotes = knights.map(k => {
    const notes = ['c1', 'eb1', 'f1', 'g1', 'bb1'];
    return notes[k.square.charCodeAt(0) % 5];
  }).join(' ');

  return `
    stack(
      // RITMO (Peões)
      s("${kickPattern}").bank("${cityConfig.samples}").gain(0.8),
      s("hh*${isCheck ? 16 : 8}").gain(0.3)${isCheck ? '.distort(0.4)' : ''},
      
      // BASS (Cavalos)
      note("${bassNotes || 'c1'}").s("sawtooth")
        .lpf(sine.range(400, 1200).slow(4))
        .resonance(12).gain(0.5),
        
      // LEAD (Rainha)
      ${queen ? `note("c3(3,8)").s("fm").gain(0.4).rev()` : `s("")`}
    ).slow(${120 / cityConfig.bpm})
  `;
};