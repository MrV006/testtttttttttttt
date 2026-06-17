
var self = { postMessage: function(){}, onmessage: null };
// --- WORKER ENGINE CORE ---
var E=null;
var TT={};
var searchPly=0;
function getHash(b,mx,c2,eps){ // WK_HASH
  var s=mx?'w':'b';
  s+=c2.wk+''+c2.wq+''+c2.bk+''+c2.bq;
  s+=eps?(eps[0]+''+eps[1]):'-';
  for(var i=0;i<8;i++)for(var j=0;j<8;j++)s+=b[i][j]||'.';
  return s;
}
// WORKER_EV_MARKER
var PV={P:100,N:320,B:330,R:500,Q:950,K:20000};
var TBL={
P:[[0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],[5,5,10,27,27,10,5,5],[0,0,0,25,25,0,0,0],[5,-5,-10,0,0,-10,-5,5],[5,10,10,-25,-25,10,10,5],[0,0,0,0,0,0,0,0]],
N:[[-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],[-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],[-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],[-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50]],
B:[[-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,10,10,10,10,0,-10],[-10,5,5,10,10,5,5,-10],[-10,0,10,10,10,10,0,-10],[-10,10,10,10,10,10,10,-10],[-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20]],
R:[[0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0]],
Q:[[-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],[-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],[0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],[-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20]],
K:[[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],[-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],[20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20]],
KE:[[-50,-40,-30,-20,-20,-30,-40,-50],[-30,-20,-10,0,0,-10,-20,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,30,40,40,30,-10,-30],[-30,-10,20,30,30,20,-10,-30],[-30,-30,0,0,0,0,-30,-30],[-50,-30,-30,-30,-30,-30,-30,-50]]
};
function cln(b){return[b[0].slice(),b[1].slice(),b[2].slice(),b[3].slice(),b[4].slice(),b[5].slice(),b[6].slice(),b[7].slice()]}
function co(p){return p?(p===p.toUpperCase()?'w':'b'):E}
function ty(p){return p?p.toUpperCase():E}
function ib(r,c){return r>=0&&r<8&&c>=0&&c<8}
function appM(b,mv){var p=b[mv.fr][mv.fc];mv.pc=p;b[mv.tr][mv.tc]=p;b[mv.fr][mv.fc]=E;if(mv.cas){b[mv.cas.rtr][mv.cas.rtc]=b[mv.cas.rfr][mv.cas.rfc];b[mv.cas.rfr][mv.cas.rfc]=E}if(mv.epp)b[mv.epp[0]][mv.epp[1]]=E;if(mv.pp)b[mv.tr][mv.tc]=mv.pp}
function undMv(b,mv){if(mv.pp)b[mv.fr][mv.fc]=co(mv.pp)==='w'?'P':'p';else b[mv.fr][mv.fc]=b[mv.tr][mv.tc];b[mv.tr][mv.tc]=mv.cap&&!mv.epp?mv.cap:E;if(mv.cas){b[mv.cas.rfr][mv.cas.rfc]=b[mv.cas.rtr][mv.cas.rtc];b[mv.cas.rtr][mv.cas.rtc]=E}if(mv.epp)b[mv.epp[0]][mv.epp[1]]=mv.cap}
function uCRc(c2,mv){if(mv.fr===7&&mv.fc===4){c2.wk=0;c2.wq=0}if(mv.fr===0&&mv.fc===4){c2.bk=0;c2.bq=0}if(mv.fr===7&&mv.fc===0)c2.wq=0;if(mv.fr===7&&mv.fc===7)c2.wk=0;if(mv.fr===0&&mv.fc===0)c2.bq=0;if(mv.fr===0&&mv.fc===7)c2.bk=0;if(mv.tr===7&&mv.tc===0)c2.wq=0;if(mv.tr===7&&mv.tc===7)c2.wk=0;if(mv.tr===0&&mv.tc===0)c2.bq=0;if(mv.tr===0&&mv.tc===7)c2.bk=0}
function raw(b,r,c,col,eps){
var p=b[r][c];if(!p||co(p)!==col)return[];var t=ty(p),mvs=[];
function ad(tr,tc,ex){if(!ib(tr,tc))return;var o={fr:r,fc:c,tr:tr,tc:tc,cap:b[tr][tc]||E};if(ex)for(var k in ex)o[k]=ex[k];mvs.push(o)}
if(t==='P'){var d=col==='w'?-1:1,sr=col==='w'?6:1,pr=col==='w'?0:7;if(ib(r+d,c)&&!b[r+d][c]){if(r+d===pr)ad(r+d,c,{pro:true});else{ad(r+d,c);if(r===sr&&!b[r+d*2][c])ad(r+d*2,c,{epc:[r+d,c]})}}for(var dc=-1;dc<=1;dc+=2){var nr=r+d,nc=c+dc;if(!ib(nr,nc))continue;if(b[nr][nc]&&co(b[nr][nc])!==col){if(nr===pr)ad(nr,nc,{pro:true});else ad(nr,nc)}if(eps&&eps[0]===nr&&eps[1]===nc)ad(nr,nc,{epp:[r,nc],cap:b[r][nc]})}}
var SL={R:[[0,1],[0,-1],[1,0],[-1,0]],B:[[1,1],[1,-1],[-1,1],[-1,-1]],Q:[[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]};
if(SL[t]){var dirs=SL[t];for(var di=0;di<dirs.length;di++){var nr2=r+dirs[di][0],nc2=c+dirs[di][1];while(ib(nr2,nc2)){if(b[nr2][nc2]){if(co(b[nr2][nc2])!==col)ad(nr2,nc2);break}ad(nr2,nc2);nr2+=dirs[di][0];nc2+=dirs[di][1]}}}
if(t==='N'){var kd=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];for(var ki=0;ki<8;ki++){var nr3=r+kd[ki][0],nc3=c+kd[ki][1];if(ib(nr3,nc3)&&(!b[nr3][nc3]||co(b[nr3][nc3])!==col))ad(nr3,nc3)}}
if(t==='K'){var kk=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];for(var kj=0;kj<8;kj++){var nr4=r+kk[kj][0],nc4=c+kk[kj][1];if(ib(nr4,nc4)&&(!b[nr4][nc4]||co(b[nr4][nc4])!==col))ad(nr4,nc4)}}
return mvs}
function casM(b,col,c2){var mvs=[],rw=col==='w'?7:0,en=col==='w'?'b':'w',k=col==='w'?'K':'k',rk=col==='w'?'R':'r';if(b[rw][4]!==k||iCk(b,col))return mvs;if(c2[col==='w'?'wk':'bk']&&b[rw][7]===rk&&!b[rw][5]&&!b[rw][6]&&!sAt(b,rw,5,en)&&!sAt(b,rw,6,en))mvs.push({fr:rw,fc:4,tr:rw,tc:6,cap:E,cas:{rfr:rw,rfc:7,rtr:rw,rtc:5}});if(c2[col==='w'?'wq':'bq']&&b[rw][0]===rk&&!b[rw][1]&&!b[rw][2]&&!b[rw][3]&&!sAt(b,rw,3,en)&&!sAt(b,rw,2,en))mvs.push({fr:rw,fc:4,tr:rw,tc:2,cap:E,cas:{rfr:rw,rfc:0,rtr:rw,rtc:3}});return mvs}
function sAt(b,r,c,by){var pd=by==='w'?1:-1,i,nr,nc,p;for(var dc=-1;dc<=1;dc+=2){var pr2=r+pd,pc2=c+dc;if(ib(pr2,pc2)){p=b[pr2][pc2];if(p&&co(p)===by&&ty(p)==='P')return true}}var kd=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];for(i=0;i<8;i++){nr=r+kd[i][0];nc=c+kd[i][1];if(ib(nr,nc)){p=b[nr][nc];if(p&&co(p)===by&&ty(p)==='N')return true}}var kk=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];for(i=0;i<8;i++){nr=r+kk[i][0];nc=c+kk[i][1];if(ib(nr,nc)){p=b[nr][nc];if(p&&co(p)===by&&ty(p)==='K')return true}}var sl=[[0,1],[0,-1],[1,0],[-1,0]];for(i=0;i<4;i++){nr=r+sl[i][0];nc=c+sl[i][1];while(ib(nr,nc)){p=b[nr][nc];if(p){if(co(p)===by&&(ty(p)==='R'||ty(p)==='Q'))return true;break}nr+=sl[i][0];nc+=sl[i][1]}}var dg=[[1,1],[1,-1],[-1,1],[-1,-1]];for(i=0;i<4;i++){nr=r+dg[i][0];nc=c+dg[i][1];while(ib(nr,nc)){p=b[nr][nc];if(p){if(co(p)===by&&(ty(p)==='B'||ty(p)==='Q'))return true;break}nr+=dg[i][0];nc+=dg[i][1]}}return false}
function fK(b,col){var k=col==='w'?'K':'k';for(var i=0;i<8;i++)for(var j=0;j<8;j++)if(b[i][j]===k)return[i,j];return E}
function iCk(b,col){var kp=fK(b,col);return kp?sAt(b,kp[0],kp[1],col==='w'?'b':'w'):false}
function leg(b,r,c,col,c2,eps){var mvs=raw(b,r,c,col,eps);if(ty(b[r][c])==='K'){var cm=casM(b,col,c2);for(var i=0;i<cm.length;i++)mvs.push(cm[i])}var out=[];for(var j=0;j<mvs.length;j++){appM(b,mvs[j]);var ok=!iCk(b,col);undMv(b,mvs[j]);if(ok)out.push(mvs[j])}return out}
function aLeg(b,col,c2,eps){var a=[];for(var i=0;i<8;i++)for(var j=0;j<8;j++)if(b[i][j]&&co(b[i][j])===col){var m=leg(b,i,j,col,c2,eps);for(var k=0;k<m.length;k++)a.push(m[k])}return a}

function ev(b, c2){ // WK_EV_FUNC
  var s=0;
  var wB=0, bB=0, wN=0, bN=0, wR=0, bR=0, wQ=0, bQ=0;
  var wP=[0,0,0,0,0,0,0,0], bP=[0,0,0,0,0,0,0,0];
  var wK=[-1,-1], bK=[-1,-1];
  var wHasQueen=false, bHasQueen=false;
  var wHangingAttacked=0, bHangingAttacked=0;
  
  var phaseWeight = { 'N': 1, 'B': 1, 'R': 2, 'Q': 4 };
  var totalPhase = 0;
  
  var wQPos=[-1,-1], bQPos=[-1,-1];
  for (var i=0; i<8; i++){
    for (var j=0; j<8; j++){
      var p=b[i][j];
      if(!p) continue;
      var t2=ty(p), c=co(p);
      if(phaseWeight[t2] !== undefined){
        totalPhase += phaseWeight[t2];
      }
      if(t2==='P'){
        if(c==='w') wP[j]++; else bP[j]++;
      } else if(t2==='K'){
        if(c==='w') wK=[i,j]; else bK=[i,j];
      } else if(t2==='Q'){
        if(c==='w') wQPos=[i,j]; else bQPos=[i,j];
      }
    }
  }
  var phase = Math.min(24, totalPhase);
  
  if (phase > 15) {
    if (b[6][4] === 'Q' && b[7][5] === 'B') s -= 35;
    if (b[1][4] === 'q' && b[0][5] === 'b') s += 35;
  }

  for (var i=0; i<8; i++){
    for (var j=0; j<8; j++){
      var p=b[i][j];
      if(!p) continue;
      var t2=ty(p), c=co(p), v=PV[t2]||0;
      
      var ps = 0;
      if (t2 === 'K') {
        var mgK = TBL.K[i][j];
        var egK = TBL.KE[i][j];
        var tblK = c==='w' ? (mgK * phase + egK * (24 - phase)) / 24 : (TBL.K[7-i][j] * phase + TBL.KE[7-i][j] * (24 - phase)) / 24;
        ps = Math.round(tblK);
      } else {
        var tb=TBL[t2];
        ps = tb ? (c==='w' ? tb[i][j] : tb[7-i][j]) : 0;
      }
      
      s += (c==='w'?1:-1)*(v+ps);
 
      // Wing pawn push penalty in opening
      if (phase > 12 && t2 === 'P') {
        if (j === 0 || j === 7) {
          if (c === 'w') {
            var wKUncastled = (wK[0] === 7 && wK[1] === 4);
            if (i <= 4 && wKUncastled) {
              s -= 25;
            }
          } else {
            var bKUncastled = (bK[0] === 0 && bK[1] === 4);
            if (i >= 3 && bKUncastled) {
              s += 25;
            }
          }
        }
      }

      // Tactical vulnerability and blunder safety penalty
      if (t2 !== 'K') {
        var isDefended = sAt(b, i, j, c);
        var by = c === 'w' ? 'b' : 'w';
        var isAttacked = sAt(b, i, j, by);
        
        // Pinned piece evaluation
        var myKingPos = c === 'w' ? wK : bK;
        var myQueenPos = c === 'w' ? wQPos : bQPos;
        var isPinned = false;
        var pinLevel = 0; // 1 = Queen, 2 = King
        var origPiece = b[i][j];
        b[i][j] = E;
        
        // King pin check
        if (myKingPos[0] !== -1) {
          var kp = myKingPos;
          var sl_dirs = [[0,1],[0,-1],[1,0],[-1,0]];
          for (var k_dir=0; k_dir<4; k_dir++) {
            var nr = kp[0]+sl_dirs[k_dir][0], nc = kp[1]+sl_dirs[k_dir][1];
            while (ib(nr, nc)) {
              var oppP = b[nr][nc];
              if (oppP) {
                if (co(oppP) === by && (ty(oppP)==='R'||ty(oppP)==='Q')) {
                  isPinned = true;
                  pinLevel = 2;
                }
                break;
              }
              nr += sl_dirs[k_dir][0]; nc += sl_dirs[k_dir][1];
            }
            if (isPinned) break;
          }
          if (!isPinned) {
            var dg_dirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
            for (var k_dir=0; k_dir<4; k_dir++) {
              var nr = kp[0]+dg_dirs[k_dir][0], nc = kp[1]+dg_dirs[k_dir][1];
              while (ib(nr, nc)) {
                var oppP = b[nr][nc];
                if (oppP) {
                  if (co(oppP) === by && (ty(oppP)==='B'||ty(oppP)==='Q')) {
                    isPinned = true;
                    pinLevel = 2;
                  }
                  break;
                }
                nr += dg_dirs[k_dir][0]; nc += dg_dirs[k_dir][1];
              }
              if (isPinned) break;
            }
          }
        }
        
        // Queen pin check
        if (!isPinned && myQueenPos[0] !== -1) {
          var qp = myQueenPos;
          var sl_dirs = [[0,1],[0,-1],[1,0],[-1,0]];
          for (var k_dir=0; k_dir<4; k_dir++) {
            var nr = qp[0]+sl_dirs[k_dir][0], nc = qp[1]+sl_dirs[k_dir][1];
            while (ib(nr, nc)) {
              var oppP = b[nr][nc];
              if (oppP) {
                if (co(oppP) === by && (ty(oppP)==='R'||ty(oppP)==='Q')) {
                  isPinned = true;
                  pinLevel = 1;
                }
                break;
              }
              nr += sl_dirs[k_dir][0]; nc += sl_dirs[k_dir][1];
            }
            if (isPinned) break;
          }
          if (!isPinned) {
            var dg_dirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
            for (var k_dir=0; k_dir<4; k_dir++) {
              var nr = qp[0]+dg_dirs[k_dir][0], nc = qp[1]+dg_dirs[k_dir][1];
              while (ib(nr, nc)) {
                var oppP = b[nr][nc];
                if (oppP) {
                  if (co(oppP) === by && (ty(oppP)==='B'||ty(oppP)==='Q')) {
                    isPinned = true;
                    pinLevel = 1;
                  }
                  break;
                }
                nr += dg_dirs[k_dir][0]; nc += dg_dirs[k_dir][1];
              }
              if (isPinned) break;
            }
          }
        }
        b[i][j] = origPiece;
        
        if (isPinned) {
          var pinPen = (pinLevel === 2) ? 40 : 20;
          s += (c === 'w' ? -pinPen : pinPen);
          
          var hasPawnThreat = false;
          var pd = c === 'w' ? -1 : 1;
          for (var dc = -1; dc <= 1; dc += 2) {
            var pr = i + pd, pc = j + dc;
            if (pr >= 0 && pr < 8 && pc >= 0 && pc < 8) {
              var oppP = b[pr][pc];
              if (oppP && co(oppP) === by && ty(oppP) === 'P') {
                hasPawnThreat = true;
              }
            }
          }
          if (isAttacked || hasPawnThreat) {
            s += (c === 'w' ? -130 : 130);
          }
        }

        if (isAttacked) {
          if (!isDefended) {
            var blunderPenalty = 50;
            if (t2 === 'N' || t2 === 'B') blunderPenalty = 180;
            else if (t2 === 'R') blunderPenalty = 300;
            else if (t2 === 'Q') blunderPenalty = 600;
            s += (c === 'w' ? -blunderPenalty : blunderPenalty);
            if (c === 'w') wHangingAttacked++; else bHangingAttacked++;
          } else {
            var attackedByPawn = false;
            var pd = c === 'w' ? -1 : 1;
            for (var dc = -1; dc <= 1; dc += 2) {
              var pr = i + pd, pc = j + dc;
              if (pr >= 0 && pr < 8 && pc >= 0 && pc < 8) {
                var oppP = b[pr][pc];
                if (oppP && co(oppP) === by && ty(oppP) === 'P') {
                  attackedByPawn = true;
                }
              }
            }
            if (attackedByPawn && t2 !== 'P') {
              s += (c === 'w' ? -150 : 150);
            } else {
              var leastAttacker = getLeastValuableAttacker(b, i, j, by);
              if (leastAttacker && leastAttacker.val < v) {
                s += (c === 'w' ? -100 : 100);
              }
            }
          }
        } else if (!isDefended && t2 !== 'P') {
          s += (c === 'w' ? -15 : 15);
        }
      }
      
      if(t2==='B'){
        if(c==='w') wB++; else bB++;
      } else if(t2==='N'){
        if(c==='w') wN++; else bN++;
      } else if(t2==='R'){
        if(c==='w') {
          wR++;
          if (wP[j] === 0) { s += bP[j] === 0 ? 25 : 12; }
          if (i === 1 || i === 0) { s += 20; }
        } else {
          bR++;
          if (bP[j] === 0) { s -= wP[j] === 0 ? 25 : 12; }
          if (i === 6 || i === 7) { s -= 20; }
        }
      } else if(t2==='P'){
        // Handled in preamble
      } else if(t2==='K'){
        // Handled in preamble
      } else if(t2==='Q'){
        if(c==='w') { wQ++; wHasQueen=true; } else { bQ++; bHasQueen=true; }
        // Defensive Queen Behind Pawns in Opening
        var hasShield = false;
        if (c === 'w') {
          if (i >= 6) {
            for (var colOffset = -1; colOffset <= 1; colOffset++) {
              var targetCol = j + colOffset;
              if (targetCol >= 0 && targetCol < 8) {
                for (var rIdx = 4; rIdx <= 6; rIdx++) {
                  if (b[rIdx][targetCol] && co(b[rIdx][targetCol]) === 'w' && ty(b[rIdx][targetCol]) === 'P') {
                    hasShield = true;
                    break;
                  }
                }
              }
              if (hasShield) break;
            }
            if (hasShield) {
              s += Math.round(35 * (phase / 24));
            }
          } else {
            s -= Math.round(30 * (phase / 24));
          }
        } else {
          if (i <= 1) {
            for (var colOffset = -1; colOffset <= 1; colOffset++) {
              var targetCol = j + colOffset;
              if (targetCol >= 0 && targetCol < 8) {
                for (var rIdx = 1; rIdx <= 3; rIdx++) {
                  if (b[rIdx][targetCol] && co(b[rIdx][targetCol]) === 'b' && ty(b[rIdx][targetCol]) === 'P') {
                    hasShield = true;
                    break;
                  }
                }
              }
              if (hasShield) break;
            }
            if (hasShield) {
              s -= Math.round(35 * (phase / 24));
            }
          } else {
            s += Math.round(30 * (phase / 24));
          }
        }
      }
    }
  }
  
  if(wB>=2) s+=30;
  if(bB>=2) s-=30;
 
  // Major-Minor Imbalance Guard (Queen vs Rook + Minor Piece)
  if (wQ > 0 && bQ === 0) {
    if (bR > 0 && (bN + bB) > 0) {
      s += 180;
    }
  }
  if (bQ > 0 && wQ === 0) {
    if (wR > 0 && (wN + wB) > 0) {
      s -= 180;
    }
  }
 
  // Multi-target attack penalty on hanging pieces
  if (wHangingAttacked >= 2) {
    s -= 150;
  }
  if (bHangingAttacked >= 2) {
    s += 150;
  }
  
  for (var f=0; f<8; f++){
    if(wP[f]>1) s-=(wP[f]-1)*15;
    if(bP[f]>1) s+=(bP[f]-1)*15;
    var wL=f>0?wP[f-1]:0, wR=f<7?wP[f+1]:0;
    if(wP[f]>0&&wL===0&&wR===0) s-=20;
    var bL=f>0?bP[f-1]:0, bR=f<7?bP[f+1]:0;
    if(bP[f]>0&&bL===0&&bR===0) s+=20;
  }
  
  for (var i=0; i<8; i++){
    for (var j=0; j<8; j++){
      var p=b[i][j];
      if(!p) continue;
      var t2=ty(p), c=co(p);
      if(t2==='P'){
        var ip=true;
        if(c==='w'){
          for(var nf=Math.max(0,j-1); nf<=Math.min(7,j+1); nf++){
            for(var nr=0; nr<i; nr++) {
              if(b[nr][nf]==='p'){ ip=false; break; }
            }
            if(!ip) break;
          }
          if(ip) {
            var dist = i;
            var ppb = 0;
            if (dist === 1) ppb = 240;
            else if (dist === 2) ppb = 130;
            else if (dist === 3) ppb = 65;
            else if (dist === 4) ppb = 35;
            else if (dist === 5) ppb = 15;
            else if (dist === 6) ppb = 5;
            s += ppb;
          }
        } else {
          for(var nf=Math.max(0,j-1); nf<=Math.min(7,j+1); nf++){
            for(var nr=i+1; nr<8; nr++) {
              if(b[nr][nf]==='P'){ ip=false; break; }
            }
            if(!ip) break;
          }
          if(ip) {
            var dist = 7 - i;
            var ppb = 0;
            if (dist === 1) ppb = 240;
            else if (dist === 2) ppb = 130;
            else if (dist === 3) ppb = 65;
            else if (dist === 4) ppb = 35;
            else if (dist === 5) ppb = 15;
            else if (dist === 6) ppb = 5;
            s -= ppb;
          }
        }
      }
    }
  }
  
  var wShieldPenalty = 0;
  var bShieldPenalty = 0;
  if(wK[0]!==-1){
    var kc=wK[1];
    for(var f=Math.max(0,kc-1); f<=Math.min(7,kc+1); f++) {
      var foundPawn = false;
      var pawnRow = -1;
      for (var r = 7; r >= 0; r--) {
        if (b[r][f] === 'P') {
          foundPawn = true;
          pawnRow = r;
          break;
        }
      }
      var weight = (f === kc) ? 1.2 : 0.85;
      var base = 0;
      if (!foundPawn) {
        base = bHasQueen ? 150 : 45;
      } else {
        if (pawnRow === 5) {
          base = bHasQueen ? 45 : 20;
        } else if (pawnRow === 4) {
          base = bHasQueen ? 95 : 45;
        } else if (pawnRow < 4) {
          base = bHasQueen ? 160 : 65;
        }
      }
      wShieldPenalty += base * weight;
    }
    for(var i=0; i<8; i++){
      if(b[i][kc] === 'r' || b[i][kc] === 'q'){
        wShieldPenalty += bHasQueen ? 35 : 15;
      }
    }
  }
  if(bK[0]!==-1){
    var kc=bK[1];
    for(var f=Math.max(0,kc-1); f<=Math.min(7,kc+1); f++) {
      var foundPawn = false;
      var pawnRow = -1;
      for (var r = 0; r < 8; r++) {
        if (b[r][f] === 'p') {
          foundPawn = true;
          pawnRow = r;
          break;
        }
      }
      var weight = (f === kc) ? 1.2 : 0.85;
      var base = 0;
      if (!foundPawn) {
        base = wHasQueen ? 150 : 45;
      } else {
        if (pawnRow === 2) {
          base = wHasQueen ? 45 : 20;
        } else if (pawnRow === 3) {
          base = wHasQueen ? 95 : 45;
        } else if (pawnRow > 3) {
          base = wHasQueen ? 160 : 65;
        }
      }
      bShieldPenalty += base * weight;
    }
    for(var i=0; i<8; i++){
      if(b[i][kc] === 'R' || b[i][kc] === 'Q'){
        bShieldPenalty += wHasQueen ? 35 : 15;
      }
    }
  }
  s -= Math.round((wShieldPenalty * phase) / 24);
  s += Math.round((bShieldPenalty * phase) / 24);
 
  // King's open files penalty (120 centipawns if castled and file with opponent rook/queen is open/half-open)
  var wOpenKingFilePenalty = 0;
  if (wK[0] !== -1) {
    var wCastledTemp = (wK[0] === 7 && (wK[1] === 6 || wK[1] === 2)) || (phase > 8);
    if (wCastledTemp) {
      var kc = wK[1];
      for (var f = Math.max(0, kc - 1); f <= Math.min(7, kc + 1); f++) {
        var hasFriendlyPawn = false;
        for (var r = 0; r < 8; r++) {
          if (b[r][f] === 'P') { hasFriendlyPawn = true; break; }
        }
        if (!hasFriendlyPawn) {
          var oppOnFile = false;
          for (var r2 = 0; r2 < 8; r2++) {
            if (b[r2][f] === 'r' || b[r2][f] === 'q') {
              oppOnFile = true;
              break;
            }
          }
          if (oppOnFile) {
            wOpenKingFilePenalty += 120;
          }
        }
      }
    }
  }
  var bOpenKingFilePenalty = 0;
  if (bK[0] !== -1) {
    var bCastledTemp = (bK[0] === 0 && (bK[1] === 6 || bK[1] === 2)) || (phase > 8);
    if (bCastledTemp) {
      var kc = bK[1];
      for (var f = Math.max(0, kc - 1); f <= Math.min(7, kc + 1); f++) {
        var hasFriendlyPawn = false;
        for (var r = 0; r < 8; r++) {
          if (b[r][f] === 'p') { hasFriendlyPawn = true; break; }
        }
        if (!hasFriendlyPawn) {
          var oppOnFile = false;
          for (var r2 = 0; r2 < 8; r2++) {
            if (b[r2][f] === 'R' || b[r2][f] === 'Q') {
              oppOnFile = true;
              break;
            }
          }
          if (oppOnFile) {
            bOpenKingFilePenalty += 120;
          }
        }
      }
    }
  }
  s -= Math.round((wOpenKingFilePenalty * phase) / 24);
  s += Math.round((bOpenKingFilePenalty * phase) / 24);
 
  // Wedge Pawn Penalty (250 centipawns if opponent pawn is within Chebyshev distance <= 2 to castled king)
  var wWedgePenalty = 0;
  if (wK[0] !== -1) {
    var wCastledTemp = (wK[0] === 7 && (wK[1] === 6 || wK[1] === 2));
    if (wCastledTemp) {
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
          if (b[r][c] === 'p') {
            var rowDiff = Math.abs(r - wK[0]);
            var colDiff = Math.abs(c - wK[1]);
            if (rowDiff <= 2 && colDiff <= 2) {
              wWedgePenalty += 250;
            }
          }
        }
      }
    }
  }
  var bWedgePenalty = 0;
  if (bK[0] !== -1) {
    var bCastledTemp = (bK[0] === 0 && (bK[1] === 6 || bK[1] === 2));
    if (bCastledTemp) {
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 8; c++) {
          if (b[r][c] === 'P') {
            var rowDiff = Math.abs(r - bK[0]);
            var colDiff = Math.abs(c - bK[1]);
            if (rowDiff <= 2 && colDiff <= 2) {
              bWedgePenalty += 250;
            }
          }
        }
      }
    }
  }
  s -= wWedgePenalty;
  s += bWedgePenalty;
  
  if (c2) {
    var wCastled = (wK[0] === 7 && (wK[1] === 6 || wK[1] === 2));
    if (!wCastled) {
      if (!c2.wk && !c2.wq) {
        s -= 65;
      } else {
        if (!c2.wk) s -= 20;
        if (!c2.wq) s -= 20;
      }
    }
    var bCastled = (bK[0] === 0 && (bK[1] === 6 || bK[1] === 2));
    if (!bCastled) {
      if (!c2.bk && !c2.bq) {
        s += 65;
      } else {
        if (!c2.bk) s += 20;
        if (!c2.bq) s += 20;
      }
    }
  }
  
  // Minor piece vs Pawns trade adjustment
  var wMinors = wB + wN;
  var bMinors = bB + bN;
  var wPawnCount = 0, bPawnCount = 0;
  for (var f = 0; f < 8; f++) {
    wPawnCount += wP[f];
    bPawnCount += bP[f];
  }
  if (phase > 8) {
    if (wMinors < bMinors && wPawnCount > bPawnCount) {
      s -= 110;
    }
    if (bMinors < wMinors && bPawnCount > wPawnCount) {
      s += 110;
    }
  }
  
  return s;
}
var killerMoves = {};
var historyTable = new Int32Array(4096);

function getLeastValuableAttacker(b, tr, tc, col) {
  var pd = col === 'w' ? 1 : -1;
  var bestAtt = null;
  var minVal = 999999;
  
  function updateBest(r, c, p) {
    var val = PV[ty(p)] || 0;
    if (val < minVal) {
      minVal = val;
      bestAtt = {r: r, c: c, val: val, p: p};
    }
  }

  // Pawns
  for (var dc = -1; dc <= 1; dc += 2) {
    var pr = tr + pd, pc = tc + dc;
    if (pr >= 0 && pr < 8 && pc >= 0 && pc < 8) {
      var p = b[pr][pc];
      if (p && co(p) === col && ty(p) === 'P') {
        updateBest(pr, pc, p);
      }
    }
  }
  if (bestAtt) return bestAtt;

  // Knights
  var kd = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  for (var i = 0; i < 8; i++) {
    var nr = tr + kd[i][0], nc = tc + kd[i][1];
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      var p = b[nr][nc];
      if (p && co(p) === col && ty(p) === 'N') {
        updateBest(nr, nc, p);
      }
    }
  }

  // Bishops / Queens
  var dg = [[1,1],[1,-1],[-1,1],[-1,-1]];
  for (var i = 0; i < 4; i++) {
    var nr = tr + dg[i][0], nc = tc + dg[i][1];
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      var p = b[nr][nc];
      if (p) {
        if (co(p) === col && (ty(p) === 'B' || ty(p) === 'Q')) {
          updateBest(nr, nc, p);
        }
        break;
      }
      nr += dg[i][0];
      nc += dg[i][1];
    }
  }

  // Rooks / Queens
  var sl = [[0,1],[0,-1],[1,0],[-1,0]];
  for (var i = 0; i < 4; i++) {
    var nr = tr + sl[i][0], nc = tc + sl[i][1];
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      var p = b[nr][nc];
      if (p) {
        if (co(p) === col && (ty(p) === 'R' || ty(p) === 'Q')) {
          updateBest(nr, nc, p);
        }
        break;
      }
      nr += sl[i][0];
      nc += sl[i][1];
    }
  }

  // Kings
  var kk = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  for (var i = 0; i < 8; i++) {
    var nr = tr + kk[i][0], nc = tc + kk[i][1];
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      var p = b[nr][nc];
      if (p && co(p) === col && ty(p) === 'K') {
        updateBest(nr, nc, p);
      }
    }
  }

  return bestAtt;
}

function see(b, mv) {
  var tr = mv.tr, tc = mv.tc;
  var victim = b[tr][tc];
  if (!victim) {
    if (mv.epp) {
      victim = co(b[mv.fr][mv.fc]) === 'w' ? 'p' : 'P';
    } else {
      return 0;
    }
  }
  var victimVal = PV[ty(victim)] || 0;
  var attacker = b[mv.fr][mv.fc];
  if (!attacker) return 0;
  var attackerVal = PV[ty(attacker)] || 0;

  var gain = [];
  gain[0] = victimVal + (mv.pp ? (PV[ty(mv.pp)] - 100) : 0);

  var simB = cln(b);
  simB[tr][tc] = attacker;
  simB[mv.fr][mv.fc] = E;

  var activeCol = co(attacker) === 'w' ? 'b' : 'w';
  var depth = 1;
  var currentVictimVal = mv.pp ? (PV[ty(mv.pp)] || 900) : attackerVal;

  while (depth < 32) {
    var bestAttacker = getLeastValuableAttacker(simB, tr, tc, activeCol);
    if (!bestAttacker) break;

    var attPiece = simB[bestAttacker.r][bestAttacker.c];
    var attVal = PV[ty(attPiece)] || 0;

    gain[depth] = currentVictimVal;
    currentVictimVal = attVal;

    simB[tr][tc] = attPiece;
    simB[bestAttacker.r][bestAttacker.c] = E;

    activeCol = activeCol === 'w' ? 'b' : 'w';
    depth++;
  }

  var i = depth - 1;
  while (i > 1) {
    gain[i - 1] = Math.max(0, gain[i - 1] - gain[i]);
    i--;
  }
  if (i > 0) {
    gain[0] = gain[0] - gain[1];
  }
  return gain[0];
}

function ord(b,mvs,d){
  for (var i = 0; i < mvs.length; i++) {
    var m = mvs[i];
    if (m.cap) {
      m.seeVal = see(b, m);
    }
  }
  mvs.sort(function(a,z){
    var sa=0,sz=0;
    if(a.cap) {
      var seeVal = a.seeVal !== undefined ? a.seeVal : 0;
      if (seeVal >= 0) {
        sa += 200000 + seeVal;
      } else {
        sa += 10000 + seeVal;
      }
    } else {
      var fromA = a.fr * 8 + a.fc, toA = a.tr * 8 + a.tc;
      sa += historyTable[fromA * 64 + toA] || 0;
      if (d && killerMoves[d]) {
        if (killerMoves[d][0] && killerMoves[d][0].fr===a.fr && killerMoves[d][0].fc===a.fc && killerMoves[d][0].tr===a.tr && killerMoves[d][0].tc===a.tc) sa += 50000;
        else if (killerMoves[d][1] && killerMoves[d][1].fr===a.fr && killerMoves[d][1].fc===a.fc && killerMoves[d][1].tr===a.tr && killerMoves[d][1].tc===a.tc) sa += 40000;
      }
    }
    if(z.cap) {
      var seeVal = z.seeVal !== undefined ? z.seeVal : 0;
      if (seeVal >= 0) {
        sz += 200000 + seeVal;
      } else {
        sz += 10000 + seeVal;
      }
    } else {
      var fromZ = z.fr * 8 + z.fc, toZ = z.tr * 8 + z.tc;
      sz += historyTable[fromZ * 64 + toZ] || 0;
      if (d && killerMoves[d]) {
        if (killerMoves[d][0] && killerMoves[d][0].fr===z.fr && killerMoves[d][0].fc===z.fc && killerMoves[d][0].tr===z.tr && killerMoves[d][0].tc===z.tc) sz += 50000;
        else if (killerMoves[d][1] && killerMoves[d][1].fr===z.fr && killerMoves[d][1].fc===z.fc && killerMoves[d][1].tr===z.tr && killerMoves[d][1].tc===z.tc) sz += 40000;
      }
    }
    if(a.pro||a.pp) sa += 9000;
    if(z.pro||z.pp) sz += 9000;
    if(a.cas) sa += 500;
    if(z.cas) sz += 500;
    return sz-sa;
  });
}
function qsh(b,al,bt,mx,c2,qdepth,checksCount){
qdepth = qdepth || 0;
var col=mx?'w':'b';
var inCheck=iCk(b,col);
checksCount = checksCount || (inCheck ? 1 : 0);
if(inCheck){
if(qdepth > 10) return ev(b,c2);
var nextChecks = checksCount + 1;
var mvs=aLeg(b,col,{wk:0,wq:0,bk:0,bq:0},E);
if(!mvs.length)return mx?-99000:99000;
if(mx){
ord(b,mvs);
for(var i=0;i<mvs.length;i++){
appM(b,mvs[i]);var s=qsh(b,al,bt,false,c2,qdepth+1,nextChecks);undMv(b,mvs[i]);
if(s>=bt)return bt;
if(s>al)al=s;
}
return al;
}else{
ord(b,mvs);
for(var i=0;i<mvs.length;i++){
appM(b,mvs[i]);var s=qsh(b,al,bt,true,c2,qdepth+1,nextChecks);undMv(b,mvs[i]);
if(s<=al)return al;
if(s<bt)bt=s;
}
return bt;
}
}
var val=ev(b,c2);
if(mx){
if(val>=bt)return val;
if(val>al)al=val;
var mvs=aLeg(b,'w',{wk:0,wq:0,bk:0,bq:0},E).filter(function(m){
if(m.cap)return true;
if(qdepth < 3 && checksCount > 0){
appM(b,m);var gc=iCk(b,'b');undMv(b,m);
return gc;
}
return false;
});
ord(b,mvs);
for(var i=0;i<mvs.length;i++){
appM(b,mvs[i]);var s=qsh(b,al,bt,false,c2,qdepth+1,checksCount);undMv(b,mvs[i]);
if(s>=bt)return bt;
if(s>al)al=s;
}
return al;
}else{
if(val<=al)return val;
if(val<bt)bt=val;
var mvs=aLeg(b,'b',{wk:0,wq:0,bk:0,bq:0},E).filter(function(m){
if(m.cap)return true;
if(qdepth < 3 && checksCount > 0){
appM(b,m);var gc=iCk(b,'w');undMv(b,m);
return gc;
}
return false;
});
ord(b,mvs);
for(var i=0;i<mvs.length;i++){
appM(b,mvs[i]);var s=qsh(b,al,bt,true,c2,qdepth+1,checksCount);undMv(b,mvs[i]);
if(s<=al)return al;
if(s<bt)bt=s;
}
return bt;
}
}
var globalStartTime = 0;
var globalTimeLimit = 0;
var globalAborted = false;
var nodeCount = 0;
var gameHashes = [];
var searchPath = [];

function hasMat(b,col){var tCol=col==='w';for(var r=0;r<8;r++)for(var c=0;c<8;c++){var p=b[r][c];if(p&&ty(p)!=='K'&&ty(p)!=='P'&&((p===p.toUpperCase())===tCol))return true}return false}

function mmx(b,d,al,bt,mx,c2,eps,nmpOk){
  var h = getHash(b,mx,c2,eps);
  var isRep = false;
  if(searchPath.indexOf(h) !== -1){
    isRep = true;
  } else {
    for(var idx = 0; idx < gameHashes.length - 1; idx++){
      if(gameHashes[idx] === h){
        isRep = true;
        break;
      }
    }
  }
  if(isRep){
    return {s: 0};
  }
  searchPath.push(h);
  searchPly++;
  var res = mmxCore(b,d,al,bt,mx,c2,eps,nmpOk);
  searchPly--;
  searchPath.pop();
  return res;
}

function mmxCore(b,d,al,bt,mx,c2,eps,nmpOk){
  var origAlpha = al;
  var origBeta = bt;
  nodeCount++;
  if(nodeCount % 1024 === 0) {
    if(Date.now() - globalStartTime >= globalTimeLimit) {
      globalAborted = true;
    }
  }
  if(globalAborted) return {s: 0};

  var h=getHash(b,mx,c2,eps);
  var entry=TT[h];
  if(entry&&entry.depth>=d){
    if(entry.flag===0)return entry.val;
    if(entry.flag===1&&entry.val.s<=al)return entry.val;
    if(entry.flag===2&&entry.val.s>=bt)return entry.val;
  }
  if(d<=0)return{s:qsh(b,al,bt,mx,c2)};
  var col=mx?'w':'b',inCheck=iCk(b,col),mvs=aLeg(b,col,c2,eps);
  if(!mvs.length){if(inCheck)return{s:mx?-100000+searchPly:100000-searchPly};return{s:0}}
  if(inCheck && d < 8) d++;
  for(var i=0;i<mvs.length;i++){if(mvs[i].pro)mvs[i]={fr:mvs[i].fr,fc:mvs[i].fc,tr:mvs[i].tr,tc:mvs[i].tc,cap:mvs[i].cap,pro:false,pp:col==='w'?'Q':'q',cas:mvs[i].cas,epc:mvs[i].epc,epp:mvs[i].epp}}
  ord(b,mvs,d);
  if(TT[h]&&TT[h].move){
    var hm=TT[h].move;
    for(var i=0;i<mvs.length;i++){
      if(mvs[i].fr===hm.fr&&mvs[i].fc===hm.fc&&mvs[i].tr===hm.tr&&mvs[i].tc===hm.tc){
        var tm=mvs[0];mvs[0]=mvs[i];mvs[i]=tm;
        break;
      }
    }
  } else if(d>=4){
    var iidRes=mmx(b,d-2,al,bt,mx,c2,eps,false);
    if(iidRes&&iidRes.move){
      var hm=iidRes.move;
      for(var i=0;i<mvs.length;i++){
        if(mvs[i].fr===hm.fr&&mvs[i].fc===hm.fc&&mvs[i].tr===hm.tr&&mvs[i].tc===hm.tc){
          var tm=mvs[0];mvs[0]=mvs[i];mvs[i]=tm;
          break;
        }
      }
    }
  }
  var best=mvs[0],sc={wk:c2.wk,wq:c2.wq,bk:c2.bk,bq:c2.bq};
  if(mx){
    if(d>=3 && nmpOk!==false && !iCk(b,'w') && hasMat(b,'w')){
      var nullS=mmx(b,d-3,bt-1,bt,false,c2,E,false);
      if(nullS.s>=bt)return {s:bt};
    }
    var mE=-1e9;
    for(i=0;i<mvs.length;i++){
      appM(b,mvs[i]);
      var nc={wk:sc.wk,wq:sc.wq,bk:sc.bk,bq:sc.bq};
      uCRc(nc,mvs[i]);
      var r;
      if(i===0){
        r=mmx(b,d-1,al,bt,false,nc,mvs[i].epc||E);
      }else{
        if(d>=3 && i>=3 && !mvs[i].cap && !iCk(b,'w') && !iCk(b,'b')){
          r=mmx(b,d-2,al,al+1,false,nc,mvs[i].epc||E);
          if(r.s>al){
            r=mmx(b,d-1,al,al+1,false,nc,mvs[i].epc||E);
          }
        }else{
          r=mmx(b,d-1,al,al+1,false,nc,mvs[i].epc||E);
        }
        if(r.s>al && r.s<bt){
          r=mmx(b,d-1,al,bt,false,nc,mvs[i].epc||E);
        }
      }
      undMv(b,mvs[i]);
      if(globalAborted) break;
      if(r.s>mE){mE=r.s;best=mvs[i]}
      al=Math.max(al,r.s);
      if(bt<=al){
        if(!mvs[i].cap){
          if(!killerMoves[d]) killerMoves[d]=[];
          var exists=false;
          for(var k=0;k<killerMoves[d].length;k++){
            var km=killerMoves[d][k];
            if(km.fr===mvs[i].fr && km.fc===mvs[i].fc && km.tr===mvs[i].tr && km.tc===mvs[i].tc){exists=true;break;}
          }
          if(!exists){
            killerMoves[d].unshift(mvs[i]);
            if(killerMoves[d].length>2)killerMoves[d].pop();
          }
          var fromSq=mvs[i].fr*8+mvs[i].fc;
          var toSq=mvs[i].tr*8+mvs[i].tc;
          historyTable[fromSq*64+toSq]+=d*d;
        }
        break;
      }
    }
    var res={s:mE,move:best};
    if(!globalAborted) {
      var flag = 0;
      if (res.s <= origAlpha) flag = 1;
      else if (res.s >= origBeta) flag = 2;
      TT[h]={depth:d,val:res,move:best,flag:flag};
    }
    return res;
  }else{
    if(d>=3 && nmpOk!==false && !iCk(b,'b') && hasMat(b,'b')){
      var nullS2=mmx(b,d-3,al,al+1,true,c2,E,false);
      if(nullS2.s<=al)return {s:al};
    }
    var mE2=1e9;
    for(i=0;i<mvs.length;i++){
      appM(b,mvs[i]);
      var nc2={wk:sc.wk,wq:sc.wq,bk:sc.bk,bq:sc.bq};
      uCRc(nc2,mvs[i]);
      var r2;
      if(i===0){
        r2=mmx(b,d-1,al,bt,true,nc2,mvs[i].epc||E);
      }else{
        if(d>=3 && i>=3 && !mvs[i].cap && !iCk(b,'b') && !iCk(b,'w')){
          r2=mmx(b,d-2,bt-1,bt,true,nc2,mvs[i].epc||E);
          if(r2.s<bt){
            r2=mmx(b,d-1,bt-1,bt,true,nc2,mvs[i].epc||E);
          }
        }else{
          r2=mmx(b,d-1,bt-1,bt,true,nc2,mvs[i].epc||E);
        }
        if(r2.s<bt && r2.s>al){
          r2=mmx(b,d-1,al,bt,true,nc2,mvs[i].epc||E);
        }
      }
      undMv(b,mvs[i]);
      if(globalAborted) break;
      if(r2.s<mE2){mE2=r2.s;best=mvs[i]}
      bt=Math.min(bt,r2.s);
      if(bt<=al){
        if(!mvs[i].cap){
          if(!killerMoves[d]) killerMoves[d]=[];
          var exists=false;
          for(var k=0;k<killerMoves[d].length;k++){
            var km=killerMoves[d][k];
            if(km.fr===mvs[i].fr && km.fc===mvs[i].fc && km.tr===mvs[i].tr && km.tc===mvs[i].tc){exists=true;break;}
          }
          if(!exists){
            killerMoves[d].unshift(mvs[i]);
            if(killerMoves[d].length>2)killerMoves[d].pop();
          }
          var fromSq=mvs[i].fr*8+mvs[i].fc;
          var toSq=mvs[i].tr*8+mvs[i].tc;
          historyTable[fromSq*64+toSq]+=d*d;
        }
        break;
      }
    }
    var res2={s:mE2,move:best};
    if(!globalAborted) {
      var flag = 0;
      if (res2.s <= origAlpha) flag = 1;
      else if (res2.s >= origBeta) flag = 2;
      TT[h]={depth:d,val:res2,move:best,flag:flag};
    }
    return res2;
  }
}

self.onmessage=function(e){
  var d=e.data;
  if(d.type==='minimax'){
    TT={};
    killerMoves={};
    searchPly=0;
    for(var i=0;i<4096;i++)historyTable[i]=0;
    globalStartTime = Date.now();
    globalTimeLimit = d.timeLimit || 2500;
    globalAborted = false;
    nodeCount = 0;
    gameHashes = d.gameHashes || [];
    searchPath = [];
    
    var maxDepth = d.d;
    var bestResult = null;
    
    for(var currentDepth = 1; currentDepth <= maxDepth; currentDepth++){
      var res;
      var delta = 35; // Fine centipawn margin for narrowing first-step search
      
      if (currentDepth >= 3 && bestResult !== null && Math.abs(bestResult.s) < 15000) {
        var alphaBound = bestResult.s - delta;
        var betaBound = bestResult.s + delta;
        
        res = mmx(d.bd, currentDepth, alphaBound, betaBound, d.mx, d.c2, d.eps);
        
        if (!globalAborted && res.s <= alphaBound) {
          // Failed low: search with expanded bounds
          res = mmx(d.bd, currentDepth, d.al, betaBound, d.mx, d.c2, d.eps);
        } else if (!globalAborted && res.s >= betaBound) {
          // Failed high: search with expanded bounds
          res = mmx(d.bd, currentDepth, alphaBound, d.bt, d.mx, d.c2, d.eps);
        }
      } else {
        res = mmx(d.bd, currentDepth, d.al, d.bt, d.mx, d.c2, d.eps);
      }
      
      if(globalAborted){
        break;
      }
      bestResult = res;
      
      var elapsed = Date.now() - globalStartTime;
      var threshold = globalTimeLimit * (maxDepth >= 8 ? 0.45 : 0.40);
      if(elapsed > threshold){
        break;
      }
    }
    
    if(!bestResult){
      globalAborted = false;
      bestResult = mmx(d.bd, 1, d.al, d.bt, d.mx, d.c2, d.eps);
    }
    
    self.postMessage({type:'result',id:d.id,res:bestResult});
  }
};


// ---- Perft driver (uses the engine's own aLeg/appM/undMv/uCRc) ----
function fenToBoard(fen){
  var parts = fen.trim().split(/\s+/);
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
console.log(allOk ? '\nALL PERFT OK' : '\nPERFT FAILURES DETECTED');
process.exit(allOk ? 0 : 1);
