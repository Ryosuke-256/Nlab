const fs = require('fs');
const path = require('path');

// フォルダのパス
const folderPath = 'path_to_your_folder';

// フォルダ内のファイルのパスを格納する配列
let filePaths = [];

// フォルダ内のファイルを読み込む関数
function readFilesInFolder(folderPath) {
    // フォルダ内のファイルを取得
    const files = fs.readdirSync(folderPath);

    // 各ファイルについて処理
    files.forEach(file => {
        // ファイルのパスを取得
        const filePath = path.join(folderPath, file);

        // ファイルかどうかをチェック
        const isFile = fs.statSync(filePath).isFile();

        // ファイルであれば配列に追加
        if (isFile) {
            filePaths.push(filePath);
        }
        // フォルダであれば再帰的に処理
        else {
            readFilesInFolder(filePath);
        }
    });
}

// フォルダ内のファイルのパスを取得
readFilesInFolder(folderPath);

// ファイルのパスを出力
console.log(filePaths);
