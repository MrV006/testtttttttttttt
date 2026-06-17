// Perft harness: extracts the live WORKER_CODE engine from index.html and
// verifies move generation against known reference node counts.
// Temporary test artifact — safe to delete.
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract the WORKER_CODE template literal contents.
const startMarker = 'var WORKER_CODE=`';
const si = html.indexOf(startMarker);
if (si === -1) { console.error('WORKER_CODE start not found'); process.exit(2); }
const contentStart = si + startMarker.length;
const ei = html.indexOf('`;', contentStart);
if (ei === -1) { console.error('WORKER_CODE end not found'); process.exit(2); }
let workerCode = html.slice(contentStart, ei);

// The worker code references `self` only for the onmessage handler. Stub it.
const driver = `
var self = { postMessage: function(){}, onmessage: null };
${workerCode}

// ---- Perft driver (uses the engine's own aLeg/appM/undMv/uCRc) ----
function fenToBoard(fen){
  var parts = fen.trim().split(/\\s+/);
  var rows = parts[0].split('/');
  var b = [];
  for (var i=0;i<8;i++){
    var row = [];
    var fr = rows[i];
    for (var k=0;k<fr.length;k++){
      var ch = fr[k];
      if (ch >= '1' && ch <= '8'){
        var n = parseInt(ch,10);
        for (var z=0;z<n;z++) row.push(null);
      } else {
        row.push(ch);
      }
    }
    b.push(row);
  }
  var side = parts[1] === 'w' ? 'w' : 'b';
  var cr = parts[2] || '-';
  var c2 = { wk: cr.indexOf('K')!==-1?1:0, wq: cr.indexOf('Q')!==-1?1:0, bk: cr.indexOf('k')!==-1?1:0, bq: cr.indexOf('q')!==-1?1:0 };
  var ep = null;
  if (parts[3] && parts[3] !== '-'){
    var f = parts[3].charCodeAt(0) - 97;
    var r = 8 - parseInt(parts[3][1],10);
    ep = [r, f];
  }
  return { b: b, side: side, c2: c2, ep: ep };
}

function expand(moves, col){
  var out = [];
  for (var i=0;i<moves.length;i++){
    var m = moves[i];
    if (m.pro){
      var types = col==='w'?['Q','R','B','N']:['q','r','b','n'];
      for (var t=0;t<4;t++){
        out.push({fr:m.fr,fc:m.fc,tr:m.tr,tc:m.tc,cap:m.cap,cas:m.cas,epc:m.epc,epp:m.epp,pp:types[t]});
      }
    } else out.push(m);
  }
  return out;
}

function perft(b, col, c2, ep, depth){
  var moves = expand(aLeg(b, col, c2, ep), col);
  if (depth === 1) return moves.length;
  var nodes = 0;
  for (var i=0;i<moves.length;i++){
    var m = moves[i];
    appM(b, m);
    var nc = { wk:c2.wk, wq:c2.wq, bk:c2.bk, bq:c2.bq };
    uCRc(nc, m);
    var nep = m.epc || null;
    nodes += perft(b, col==='w'?'b':'w', nc, nep, depth-1);
    undMv(b, m);
  }
  return nodes;
}

var positions = [
  { name: 'startpos', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    expect: [20, 400, 8902, 197281] },
  { name: 'kiwipete', fen: 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',
    expect: [48, 2039, 97862] },
  { name: 'pos3-eppin', fen: '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',
    expect: [14, 191, 2812, 43238] },
  { name: 'pos4', fen: 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',
    expect: [6, 264, 9467] },
  { name: 'pos5', fen: 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',
    expect: [44, 1486, 62379] },
];

var allOk = true;
for (var pi=0; pi<positions.length; pi++){
  var P = positions[pi];
  var st = fenToBoard(P.fen);
  var line = P.name.padEnd(12) + ': ';
  for (var d=0; d<P.expect.length; d++){
    var got = perft(cln(st.b), st.side, st.c2, st.ep, d+1);
    var exp = P.expect[d];
    var ok = got === exp;
    if (!ok) allOk = false;
    line += 'd'+(d+1)+'='+got+(ok?'(OK)':'(EXP '+exp+'!!)')+' ';
  }
  console.log(line);
}
console.log(allOk ? '\\nALL PERFT OK' : '\\nPERFT FAILURES DETECTED');
process.exit(allOk ? 0 : 1);
`;

const tmp = path.join(__dirname, '_perft_run.tmp.js');
fs.writeFileSync(tmp, driver, 'utf8');
try {
  require(tmp);
} finally {
  // leave the tmp for inspection on crash; remove on clean exit handled by caller
}
