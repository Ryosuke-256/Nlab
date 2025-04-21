/**
 * package import
 */
import * as PIXI from 'pixi.js';
/** Setting */

/**
 * Setteing
 */
// slider valocity
const slider_vel = 0.25;
//round limit
const roundnum = 1;
//model startq
const modelstart = 1;
/** Setting */

/**
 * initializing
 * /
/**
//name input 
let experiment_name = prompt("名前を入力してください:");
console.log("入力された名前は: " + experiment_name)
let namenum = 0
for (let i=0;i<experiment_name.length; i++){
    namenum += experiment_name.charCodeAt(i);
}

let Material_num = prompt("何回目ですか？:")
while(Material_num < 1 || Material_num > 4){
    Material_num = prompt("1-4の範囲で入力してください")
}

console.log("name number : "+namenum);
let changenseedlist = [0,0,0,0,0,0]
for (let i = changenseedlist.length - 1 ; i >=0; i--){
    namenum = Math.floor(seededRandom(1,24*100,namenum))
    changenseedlist[i] = namenum
}

let materialname_list = ['cu0025','cu0129','pla0075','pla0225']
for (let i = materialname_list.length-1 ; i >=0; i--){
    let changenum = changenseedlist[i] % 4;
    console.log("/nchangenum : "+changenum)
    let tmpStorage = materialname_list[i]
    materialname_list[i] = materialname_list[changenum]
    materialname_list[changenum] = tmpStorage
}

console.log("chang list : " + changenseedlist)
console.log(materialname_list)

function createseededRandom(seed) { 
    return function() {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
    }
}
function seededRandom(min,max,seed){
    const randomFunc = createseededRandom(seed); 
    return Math.floor(randomFunc() * (max - min + 1)) + min;
}

console.log("今回のMaterialは：" + materialname_list[Material_num - 1])
*/

//imagefiles
const base_path = 'image\\';

/**
const hdr_name = [
    '19','39','78',
];
 */

const hdr_name = [
    '5','19','34','39','42','43','78','80','102','105',
    '125','152','164','183','198','201','202','203','209','222',
    '226','227','230','232','243','259','272','278','281','282'
];

/**
const hdr_name = [
    '19','39','78','80','102','125','152','203','226','227',
    '230','232','243','278','281'
]
*/

//models
const model_name = ['sphere','bunny','dragon','boardA','boardB','boardC'];

//materials
const material_name = ['cu0025','cu0129','pla0075','pla0225'];

//index
let index_HDR = 0;
let index_material = 0;
let index_model = 0;

//size
let sizes = {width: window.innerWidth,height: window.innerHeight};
//**initialization */

/**
 * Base
 */
const app = new PIXI.Application();
await app.init({ background: '#888888', resizeTo: window });
document.body.appendChild(app.canvas);


/** Base */

/**
 * Renderer
 */
app.ticker.add((time) => {
    //second
    const sec = performance.now()/1000;
});
/**renderer */

/**
 * ToneMap
 */

/** ToneMap */

/**
 * Loading
 */
let pngSprite = null;
// Image load
async function init_Image(idx_model,idx_material,idx_HDR){
    if(pngSprite != null){
        app.stage.removeChild(pngSprite);
    }
    let imageName = model_name[idx_model] + '_' + material_name[idx_material] + '_' + hdr_name[idx_HDR] + '.png';
    let loadingPath = base_path + material_name[idx_material] + '\\' + model_name[idx_model] + '\\';

    const pngTexture = await PIXI.Assets.load(loadingPath + imageName);
    pngSprite = new PIXI.Sprite(pngTexture);
    pngSprite.anchor.set(0.5);
    pngSprite.x = app.screen.width / 2;
    pngSprite.y = app.screen.height / 2;

    app.stage.addChild(pngSprite);
};
init_Image(index_model,index_material,index_HDR);


//change loaded
document.addEventListener("keydown",(e)=>{
    //hdr
    //press T
    if(e.keyCode == 84 && index_HDR > 0){
        index_HDR -=1;
        init_Image(index_model,index_material,index_HDR)
    }
    //press Y
    if(e.keyCode == 89 && index_HDR < hdr_name.length-1){
        index_HDR +=1;
        init_Image(index_model,index_material,index_HDR)
    }

    //materials
    //press E
    if(e.keyCode == 69 && index_material > 0){
        index_material -=1
        init_Image(index_model,index_material,index_HDR)
    }
    //press R
    if(e.keyCode == 82 && index_material < material_name.length-1){
        index_material += 1
        init_Image(index_model,index_material,index_HDR)
    }

    //models
    //press Q
    if(e.keyCode == 81 && index_model > 0){
        index_model -=1;
        init_Image(index_model,index_material,index_HDR)
    }
    //press w
    if(e.keyCode == 87 && index_model < model_name.length-1){
        index_model +=1;
        init_Image(index_model,index_material,index_HDR)
    }
})

// DataMaking
let stimulsData = [];
async function Data_make(){
    return new Promise((resolve)=>{
        for (let i = 0; i < hdr_url.length; i++){
            const hdr_name = hdr_url[i]
            let onedata = new OneData(i,hdr_name)
            stimulsData.push(onedata)
        }
        resolve()
    })
}
function OneData(id,shape,material,hdr){
    this.id = id;
    this.score = 0;
    this.trialTimes = 0;
    this.shape = shape;
    this.material = material;
    this.hdr = hdr;
}
/** Loading */

/**
 * Geometry
 */



/** Geometry*/

/**
 * additional
 */
document.addEventListener('pointerlockchange',()=>{
    if(document.pointerLockElement == document.body){
        console.log("pointer locked")
    } else {
        console.log("pointer unlocked")
    }
})
document.addEventListener('keydown',(e)=>{
    if (e.keyCode == 27){
        document.exitPointerLock()
    }
})

//resize
window.addEventListener('resize', onWindowResize)
/** additional */

/**
 * Write Out
 */
//csv出力
function exportToCsv(filename, rows) {
    //CSVの各行を処理する
    var processRow = function (row) {
        var finalVal = ''
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString()
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString()
            }
            var result = innerValue.replace(/"/g, '""')
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"'
            if (j > 0)
                finalVal += ','
            finalVal += result
        }
        return finalVal + '\n'
    };
    //CSVファイル全体を生成する
    var csvFile = ''
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i])
    }
    //CSVファイルをBlobにしてダウンロード
    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' })
    var link = document.createElement("a")
    if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        var url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}
/**Write Out */

/**
 * Function
 */
//widowresize
function onWindowResize(){
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
}
/**Function */


/**
 * Slider Panel
*/
const slider = new PIXI.Graphics()
    .rect(0,0, 300, 6)
    .fill({color : 0xff0000 , alpha : 0.5});
app.stage.addChild(slider);


function updateSlider(){
    handle.position.x = (sliderValue - 0.5) * slider.getWidth()
    //console.log(handle.position.x)
}
function updateValue(){
    sliderValue = handle.position.x / slider.getWidth() + 0.5
}
/**Slider Panel */



/**
 * trial
*/
//sleep
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms))
}

//main trial
async function OneSession(){
    for (let session = modelstart-1; session < model_name.length;session++){
        for (let round = 0;round < roundnum;round++){
            console.log("round" + round + "start")
            for (let trial = 0;trial < hdr_name.length;trial++){
                init_Image(index_model,index_material,trial)
                await OneTrial()
                await sleep(50)
            }
        }
    }
    //finalization
    console.log("Exp Finished")
}
async function OneTrial(){
    return new Promise((resolve)=>{
        document.addEventListener("mousedown",TrialFunction)
        function TrialFunction(e){
            if(e.button == 0){
                document.removeEventListener("mousedown",TrialFunction)
                resolve()
            }
        }
    })
}
OneSession();
/**
//sleep
function sleep(ms){
    return new Promise(resolve => setTimeout(resolve,ms))
}
//preload
async function Preload(){
    init_model(0)
    init_material(Material_num-1)
    for (let i = 0; i < hdr_files.length;i++){
        init_HDR(i)
        await sleep(60)
    }
    scene.remove(object_obj)
}

//test trial
var testcontinue = true
let mousex1 = 0
let mousex2 = 0
let testcount = 0
async function TestSession(){
    testcontinue = true
    testcount = 0
    while(testcontinue){ 
        if(testcount < hdr_files.length){
        }else{
        }
        await TestTrial()
        testcount += 1
    }
}
async function TestTrial(){
    return new Promise((resolve)=>{
        mousex1 = mouse_pl.x + (Math.random() - 0.5)*3
        trialloop()
        function TrialFunction(e){
            if(e.button == 0){
                updateValue()
                console.log(sliderValue)
                sliderValue = 0.5
                updateSlider()
                document.removeEventListener("mousedown",TrialFunction)
                resolve()
            }
            if(e.button == 2 && testcount >= hdr_files.length){
                testcontinue = false
                document.removeEventListener("mousedown",TrialFunction)
                resolve()
            }
        }
        document.addEventListener("mousedown",TrialFunction)
    })
}

//main trial
async function OneSession(){
    SliderPanel1()
    for (let session = modelstart-1; session < model_files.length;session++){
        let ReportTable= [
            hdr_images_path
        ]
        let resulttable
        for (let round = 0;round < roundnum;round++){
            console.log("round" + round + "start")
            resulttable = Array(roundnum).fill().map(() => Array(stimulsData.length).fill(0))
            stimulsData.sort(() => Math.random() - 0.5)
            for (let trial = 0;trial < stimulsData.length;trial++){
                init_HDR(stimulsData[trial].id)
                await OneTrial()
                stimulsData[trial].score = resultbar
                stimulsData[trial].totalscore = stimulsData[trial].totalscore + resultbar
                resulttable[round][stimulsData[trial].id] = resultbar
                await sleep(50)
            }
            stimulsData.sort((a, b) => a.id - b.id)
            let reporcontents = stimulsData.map(field => field.score)
            console.log(reporcontents)
            ReportTable.push(reporcontents)
        }
        let modelname = model_url[session].replace(/\.obj/g,"")
        let xlsxname = experiment_name + "_" + ThisMatName + "_" + modelname + ".csv"
        exportToCsv(xlsxname, ReportTable)
    }
    //finalization
    console.log("Exp Finished")
}
async function OneTrial(){
    return new Promise((resolve)=>{
        mousex1 = mouse_pl.x + (Math.random() - 0.5)*3
        trialloop()
        document.addEventListener("mousedown",TrialFunction)
        function TrialFunction(e){
            if(e.button == 0){
                updateValue()
                console.log(sliderValue)
                resultbar = sliderValue
                document.removeEventListener("mousedown",TrialFunction)
                resolve()
            }
        }
    })
}
function trialloop(){
    mousex2 = mouse_pl.x

    handle.position.x = ( mousex2 - mousex1 ) * slider_vel
    handle.position.x = Math.max(-slider.getWidth()/2,Math.min(slider.getWidth()/2,handle.position.x))

    renderer.xr.getSession().requestAnimationFrame(trialloop)
}

//Exp Flow
async function mainload(){
    LoadPanel()
    await Data_make()
    scene.remove(loadpanel)
    OneSession()
}
mainload()
/**trial */
