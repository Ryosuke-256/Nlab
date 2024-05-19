import { readdirSync, statSync } from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

// 再帰的にディレクトリを読み込み、ファイルのパスを配列に格納する関数
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = readdirSync(dirPath);

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    console.log(arrayOfFiles)
    return arrayOfFiles;
}

// CSVファイルとして出力する関数
async function writeFilesToCsv(files) {
    const csvWriter = createObjectCsvWriter({
        path: 'output.csv',
        header: [
            { id: 'filePath', title: 'File Path' }
        ]
    });

    const records = files.map(filePath => ({ filePath }));

    try {
        await csvWriter.writeRecords(records);
        console.log('CSV file written successfully');
    } catch (error) {
        console.error('Error writing CSV file', error);
    }
}

// 指定したフォルダのパス
const folderPath = './image'; // 実際のフォルダパスに置き換え

// フォルダ内のすべてのファイルのパスを取得
const allFiles = getAllFiles(folderPath);

// CSVファイルとして出力
writeFilesToCsv(allFiles);
