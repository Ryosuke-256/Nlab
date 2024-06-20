function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const numParticipants = 60;
const numRounds = 7;
const scores = new Array(numParticipants).fill(0);
const participants = [...Array(numParticipants)].map((_,i)=> i+1)
//const participants = Array.from({ length: numParticipants }, (_, i) => i + 1); 

for (let round = 1; round <= numRounds; round++) {
    console.log(`Round ${round}`);
    
    // 勝ち点順に参加者をソート
    const sortedIndices = [...participants].sort((a, b) => scores[b - 1] - scores[a - 1]);
    console.log(sortedIndices);

    // 対戦ペアの生成
    const pairings = [];
    for (let i = 0; i < sortedIndices.length; i += 2) {
        if (i + 1 < sortedIndices.length) {
            pairings.push([sortedIndices[i], sortedIndices[i + 1]]);
        }
    }

    // 各対戦ペアでの対戦と結果処理
    for (const pair of pairings) {
        const winnerIndex = getRandomInt(2);
        const winner = pair[winnerIndex];
        const loser = pair[1 - winnerIndex];
        
        // 勝者に勝ち点を加算
        scores[winner - 1] += 1;
        
        // 結果の表示
        console.log(`Match: ${pair[0]} vs ${pair[1]} - Winner: ${winner}`);
    }

    // 現在のスコアを表示
    console.log('Current Scores:');
    console.log(scores);
}

// 最終順位の表示
const finalStandings = participants.slice().sort((a, b) => scores[b - 1] - scores[a - 1]);
const finalScores = finalStandings.map(p => scores[p - 1]);

console.log('Final Standings:');
finalStandings.forEach((participant, index) => {
    console.log(`Rank ${index + 1}: Participant ${participant} - Score: ${finalScores[index]}`);
});
