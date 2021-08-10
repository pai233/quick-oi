//引入模块
const vscode = require('vscode');
const axios = require('axios').default;
const katex = require("@luogu-dev/markdown-it-katex");
const MarkdownIt = require('markdown-it');
const Cookies = require('tough-cookie');
const CookieSupport = require("axios-cookiejar-support").default;
const fs = require('fs-extra');
const sillyDateTime = require('silly-datetime')
const QUICK_OI_HOME = (process.env.HOME || process.env.USERPROFILE)+'/.quick_oi';
var jar=new Cookies.CookieJar()
var bar=vscode.window.createStatusBarItem()
bar.tooltip="Quick OI StatusBar"
bar.text="我的Quick OI状态"
bar.show()
/**
 * @param {string} hostURL
 */
function SetAPI_Request(hostURL){//API设置函数
	const Request=axios.create({
		baseURL: hostURL,
		withCredentials: true,
		jar: jar
	})
	return CookieSupport(Request);
}
//Markdown设置
const Markdown=MarkdownIt();
Markdown.use(katex);
//定义API
const LG_API=SetAPI_Request('https://www.luogu.com.cn');
const VIJOS_API=SetAPI_Request('https://vijos.org');
//设置
var defaultSettings={};
function readDefaultSettings() {
	defaultSettings=JSON.parse(fs.readFileSync(__dirname+'/config.json',{
		encoding: "UTF-8"
	}).toString());
	console.log(defaultSettings);
}
readDefaultSettings();
//通用函数
/**
 * @param {any} Array
 */
function ArrayLength(Array) {
	var length=0;
	// eslint-disable-next-line no-unused-vars
	for(var _i in Array){
		length++;
	}
	console.log(length);
	return length;
}
/**
 * @param {string} str
 */
 function DeleteHtmlCode(str,is_title=false) {
	console.log("delete")
	if(!is_title){
		var code=str.substring(1,str.length-2);
		code=code.replace(/<h2>/g,"<h3>");
		code=code.replace(/<\/h2>/g,"</h3>");
		code=code.split('</div>')[0];
		console.log(code);
	}
	else var code=str.split('>')[1].split('<')[0];
	//console.log(code);
	return code;
}
//Vijos专用函数
/**
 * @param {any[]} DataArray
 * @param {string} PID
 */
function Split_Data(DataArray,PID) {
	var Data_Split=[];
	Data_Split.push(PID);
	Data_Split.push(DeleteHtmlCode(DataArray[1],true));//题目标题切割
	for(var i=7;;i++){
		if(DataArray[i].match('section__title')=='section__title')break;
		if(i % 2!=0)Data_Split.push(DeleteHtmlCode(DataArray[i]));
		else Data_Split.push(DeleteHtmlCode(DataArray[i].substring(2,DataArray[i].length-1)));
		console.log(Data_Split[Data_Split.length])
	}
	// Data_Split.push(DeleteHtmlCode(DataArray[8]));//背景
	// Data_Split.push(DeleteHtmlCode(DataArray[10]));//描述
	// Data_Split.push(DeleteHtmlCode(DataArray[12]));//格式
	// Data_Split.push(DeleteHtmlCode(DataArray[14]));//样例1
	// Data_Split.push(DeleteHtmlCode(DataArray[16]));//限制
	// Data_Split.push(DeleteHtmlCode(DataArray[18]));//提示
	console.log(Data_Split);
	return Data_Split;
}
/**
 * @param {any[]} DataArray
 */
function VJ_BuildProblemPages(DataArray){
	console.log(DataArray.length);
	var Body=``;
	for(var i=2;i<DataArray.length;i+=2){
		Body+=`
			<h2>${DataArray[i]}</h2>
			${DataArray[i+1]}
		`
	}
	var nowTime=sillyDateTime.format(new Date(),'YYYY-MM-DD HH:mm');
	var HTML=`
	<! DOCTYPE html>
		<head>
			<meta charset="UTF-8">
			<title>${DataArray[0]+'：'+DataArray[1]}</title>
			<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css" integrity="sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq" crossorigin="anonymous">
  			<script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.js" integrity="sha384-y23I5Q6l+B6vatafAwxRu/0oK/79VlbSz7Q9aiSZUvyWYIYsd+qj+o24G5ZU2zJz" crossorigin="anonymous"></script>
			<script defer src="https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/contrib/auto-render.min.js" integrity="sha384-kWPLUVMOks5AQFrykwIup5lo0m3iMkkHrD0uJ4H5cjeGihAutqP0yW0J6dpFiVkI" crossorigin="anonymous" onload="renderMathInElement(document.body);"></script>
		</head>
		<body>
			<h1>${DataArray[0]+'：'+DataArray[1]}</h1>
			<hr>
			${Body}		
			<br>
			<br>
			<b style="text-align: center;">题目来源于Vijos。</b>
			<br>
			<br>
			<b style="text-align: center;">当前文档获取于${nowTime}。<br>Generated By Quick OI.</b>
		</body>
	</html>
	`
	return HTML;
}
//洛谷专用函数
/**
 * @param {any[][]} Samples_Array
 */
function LG_SamplesGenerator(Samples_Array) {
	var length=ArrayLength(Samples_Array);
	if(length==0)return '无';
	var Samples_Code=``;
	for(var i=0;i<length;i++){
		var input='```\n'+String(Samples_Array[i][0])+'\n```';
		var output='```\n'+String(Samples_Array[i][1])+'\n```';
		console.log(input,output,Markdown.render(input),Markdown.render(output));
		input=Markdown.render(input);
		output=Markdown.render(output);
		Samples_Code+=`
			<h3>Sample #${i+1}</h3>
				<b>Input:</b>
				${input}
				<b>Output:</b>
				${output}
		`

	}
	return Samples_Code;
}
/**
 * @param {{ memory: any[]; time: any[]; }} LimitsJson
 */
function LG_LimitsGenerator(LimitsJson) {
	//console.log(LimitsJson);
	var length=ArrayLength(LimitsJson.memory);
	var limits=``;
	for(var i=0;i<length;i++){
		limits+=`
		<tr>
			<td>#${i+1}</td>
			<td>${String(LimitsJson.memory[i])+'KB'}</td>
			<td>${String(LimitsJson.time[i])+'ms'}</td>
		</tr>	
		`
	}
	var code=`
		<table>
			<tr>
				<th>Samples</th>
				<th>Memory</th>
				<th>Time</th>
			</tr>
			${limits}
		</table>
	`
	console.log(code);
	return code;
}
/**
 * @param {string} [api]
 */
async function getToken(api) {
	let token=await LG_API.get(api).then(html=>{
		var Token_REG=new RegExp(/<meta name="csrf-token" content="(.*)">/);
		var execData=Token_REG.exec(html.data)
		return execData ? execData[1].trim():null
	})
	return token;
}
/**
 * @param {{ dispose(): any; }[]} subscriptions
 */
async function showCaptcha(subscriptions) {
	let getCaptcha= async function () {
		let base64=await LG_API.get('api/verify/captcha',{
			responseType: 'arraybuffer',
			params: {
				'_t': new Date().getTime()
			}
		})
		return "data:image/png;base64,"+base64.data.toString("base64");
	}
	let base64=await getCaptcha();
	let panel=vscode.window.createWebviewPanel('洛谷验证码','洛谷验证码',vscode.ViewColumn.Two,{
		enableScripts: true,
		retainContextWhenHidden: true
	});
	panel.webview.html=`
	<!doctype html>
	<html>
		<head>
			<meta charset="utf-8">
			<title>Captcha</title>
			<script>
				const vscode=acquireVsCodeApi()
				function getCaptcha(){//向主进程请求验证码
					vscode.postMessage({
						code: 114514
					})
				}
				window.addEventListener('message',event=>{
					if(event.data.code===114514){//接收验证码
						var DOM=document.getElementById("captcha");
						DOM.src=event.data.base64;
					}
				})
			</script>	
		<head>
		<body>
			<div align="center">
				<img src="https://cdn.luogu.com.cn/fe/logo.png" height="81" width="160" />
			</div>
			<div align="center">
				<h2><font color=#6495ED>在洛谷，享受 Coding 的欢乐！</font></h2>
			</div>
			<div align="center">
				<img id="captcha" src="${base64}">
			</div>
			<div align="center">
				<a herf="javascript:void(0)" onclick="getCaptcha()">点击这里刷新验证码</a><br><b>Powered By Quick OI.</b>
			</div>
		</body>
	</html>
	`
	panel.webview.onDidReceiveMessage(async message=>{
		/**
		 * @param {any} message
		 */
		switch (message.code){
			case 114514://刷新验证码
				let image=await getCaptcha();
				panel.webview.postMessage({
					code: 114514,
					base64: image
				})
			}		
	},undefined,subscriptions)
	let captcha=await vscode.window.showInputBox({
		placeHolder: '请输入验证码',
		ignoreFocusOut: true
	})
	return captcha
}
/**
 * @param {import("axios").AxiosResponse<any>} ProblemJson
 */
function LG_BuildProblemPages(ProblemJson) {
	var nowTime=sillyDateTime.format(new Date(),'YYYY-MM-DD HH:mm');
	var HTML=`
	<!DOCTYPE html>
		<head>
			<meta charset="UTF-8">
			<title>${'洛谷'+ProblemJson.data.currentData.problem.pid+'：'+ProblemJson.data.currentData.problem.title}</title>
			<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.12.0/build/styles/default.min.css">
			<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0/katex.min.css">
		</head>
		<body>
			<h1>${ProblemJson.data.currentData.problem.pid+'：'+ProblemJson.data.currentData.problem.title}</h1>
			<hr>
			<h2>题目背景</h2>
			${Markdown.render(ProblemJson.data.currentData.problem.background==""?'没有背景':ProblemJson.data.currentData.problem.background)}
			<h2>题目描述</h2>
			${Markdown.render(ProblemJson.data.currentData.problem.description==""?'没有题目描述':ProblemJson.data.currentData.problem.description)}
			<h2>输入格式</h2>
			${Markdown.render(ProblemJson.data.currentData.problem.inputFormat==""?'没有输入格式':ProblemJson.data.currentData.problem.inputFormat)}
			<h2>输出格式</h2>
			${Markdown.render(ProblemJson.data.currentData.problem.outputFormat==""?'没有输出格式':ProblemJson.data.currentData.problem.outputFormat)}
			<h2>题目样例</h2>
			${LG_SamplesGenerator(ProblemJson.data.currentData.problem.samples)}
			<h2>提示</h2>
			${Markdown.render(ProblemJson.data.currentData.problem.hint==""?'没有提示':ProblemJson.data.currentData.problem.hint)}
			<br>
			<br>
			<b>题目难度：${defaultSettings.luoguConfig.difficulty[ProblemJson.data.currentData.problem.difficulty]}</b>
			<br>
			<b>总提交：${ProblemJson.data.currentData.problem.totalSubmit}</b>
			<br>
			<b>总通过：${ProblemJson.data.currentData.problem.totalAccepted}</b>
			<br>
			<b>数据限制：</b>
			<br>
			${LG_LimitsGenerator(ProblemJson.data.currentData.problem.limits)}
			<br>
			<br>
			<b style="text-align: center;">题目来源于洛谷，出题者${ProblemJson.data.currentData.problem.provider.name}</b>
			<br><br><br>
			<b style="text-align: center;">当前文档获取于${nowTime}。<br>Generated By Quick OI.</b>
		</body>
	</html>
	`
	console.log(ProblemJson.data.currentData.problem.background)
	//console.log(HTML)
	return HTML;
}
//更新后的文件检测
function checkUpdated() {
	//检查版本
	var old_ver=fs.readFileSync(QUICK_OI_HOME+'/version',{
		encoding: 'utf-8'
	}).toString();
	console.log(old_ver);
	if(old_ver<defaultSettings.version){
		//重设内置模板组文件夹路径
		var oldTemplatesSettings=JSON.parse(fs.readFileSync(QUICK_OI_HOME+'/template_settings.json',{
			encoding: 'utf-8'
		}).toString())
		oldTemplatesSettings.userSettings[0].dir=__dirname.replace(/\\/g,'/')+'/Templates';
		fs.writeFile(QUICK_OI_HOME+'/template_settings.json',JSON.stringify(oldTemplatesSettings),function(err) {
			if(err){
				vscode.window.showErrorMessage('更新模板配置失败！')
				return;
			}
			vscode.window.showInformationMessage('模板设置已更新！')
		})
		fs.writeFile(QUICK_OI_HOME+'/version',defaultSettings.version,{
			encoding: 'utf-8'
		},function (err) {
			if(err){
				console.log(err);
				vscode.window.showErrorMessage('Quick OI:Files Error')
			}
		});
		if(!fs.existsSync(QUICK_OI_HOME+'/cache'))fs.mkdir(QUICK_OI_HOME+'/cache',err=>{
			if(err)vscode.window.showErrorMessage('Quick OI: mkdir Error');
		})
		LoadDoc('Quick OI Changelog',__dirname+'/CHANGELOG.md')
	}
}
//本地Markdown文档渲染
/**
 * @param {string} title
 * @param {fs.PathLike} filename
 */
function LoadDoc(title,filename) {
	const panel=vscode.window.createWebviewPanel(title,title,vscode.ViewColumn.Two,{
		enableScripts: true,
		retainContextWhenHidden: true
	 });

	const html=`
	<!DOCTYPE html>
		<head>
			<meta charset='UTF-8'>
			<title>Quick OI Guide</title>
			<style type="text/css">
				table.imagetable {
					font-family: verdana,arial,sans-serif;
					font-size:11px;
					color:#333333;
					border-width: 1px;
					border-color: #999999;
					border-collapse: collapse;
				}
				table.imagetable th {
					background:#b5cfd2 url('cell-blue.jpg');
					border-width: 1px;
					padding: 8px;
					border-style: solid;
					border-color: #999999;
				}
				table.imagetable td {
					background:#dcddc0 url('cell-grey.jpg');
					border-width: 1px;
					padding: 8px;
					border-style: solid;
					border-color: #999999;
				}
			</style>
		</head>
		<body>
	 		${Markdown.render(fs.readFileSync(filename).toString())}
		</body>	 
	`;
	console.log(html)
	panel.webview.html=html;
}
//首次安装
function firstRun() {
	var check_err=function (/** @type {null} */ err) {
		if(err!=null){
			vscode.window.showErrorMessage('初始化失败，可能有部分功能不可用！');
			return;
		}
	}
	fs.mkdir(QUICK_OI_HOME,(err)=>{
		check_err();
		console.log(QUICK_OI_HOME,err);
	});
	fs.mkdir(QUICK_OI_HOME+'/cache',(err)=>{
		check_err();
		console.log(QUICK_OI_HOME,err);
	});
	fs.writeFile(QUICK_OI_HOME+'/template_settings.json',`{
		"userSettings": [
			{
				"name": "系统模板组",
				"dir": "${__dirname.replace(/\\/g,'/')+'/Templates'}"
			}
		]
	}`,{
		encoding: 'utf-8'
	},function (err) {
		check_err();
		console.log(err);
	});
	console.log(defaultSettings.version)
	fs.writeFile(QUICK_OI_HOME+'/version',defaultSettings.version,{
		encoding: 'utf-8'
	},function (err) {
		check_err();
		console.log(err);
	});
	LoadDoc('Quick OI使用向导',__dirname+'/doc/guide.md');
}
//检测函数
function init() {
	if(!fs.existsSync(QUICK_OI_HOME))firstRun();
	else checkUpdated();
}
//文件遍历
/**
 * @param {fs.PathLike} dir
 * @param {(error: any, filename: any[], filepath: any[]) => void} [callback]
 */
async function filesTraversal(dir,callback) {
	var filesPath=[];
	var filesName=[];
	fs.readdir(dir,function (/** @type {any} */ err, /** @type {any[]} */ files) {
		if (err)
			callback(err,null,null)
		else {
			let counter=0;
			files.forEach(function (file_name) {
				fs.stat(dir + "/" + file_name, async function (error, status) {
					counter++
					if (error)
						return;
					if (status.isFile()) {
						filesPath.unshift(dir + "/" + file_name);
						filesName.unshift(file_name);
						console.log(filesPath, filesName);
					}
					console.log("counter:",counter,"ArrayLength:",ArrayLength(files))
					if(counter===ArrayLength(files)){
						console.log("callback")
						callback(null,filesName,filesPath)
					}
				});
			});
		}
	})
	
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Quick OI Active.');
	let disposable = vscode.commands.registerCommand('quick-oi.luogu.problem', async function () {
		var LG_PID=await vscode.window.showInputBox({
			placeHolder: '请输入题号',
			ignoreFocusOut: true
		});
		try{
			var ProblemJson=await LG_API.get('/problem/'+LG_PID+'?_contentOnly');
			console.log(ProblemJson,ProblemJson.data.currentData.problem.pid);
			const panel=vscode.window.createWebviewPanel(ProblemJson.data.currentData.problem.pid+'：'+ProblemJson.data.currentData.problem.title,
														 ProblemJson.data.currentData.problem.pid+'：'+ProblemJson.data.currentData.problem.title,
														 vscode.ViewColumn.Two,{
															enableScripts: true,
															retainContextWhenHidden: true
														 });
			console.log(panel);
			var html=LG_BuildProblemPages(ProblemJson);
			panel.webview.html=html;
			vscode.window.showInformationMessage('题目获取完毕！');
			fs.writeFileSync(QUICK_OI_HOME+'/cache/Luogu-'+LG_PID,html,{
				encoding: 'utf-8'
			})
		}catch(err){
			console.log('err!')
			//TODO：读取本地缓存
			fs.readFile(QUICK_OI_HOME+'/cache/Luogu-'+LG_PID,(err,cache)=>{
				console.log(err,cache)
				if(err){
					vscode.window.showErrorMessage('获取题目失败，请检查网络连接或题号！');
					return;
				}
				const panel=vscode.window.createWebviewPanel('Quick OI 题目缓存',
														'Quick OI 题目缓存',
														vscode.ViewColumn.Two,{
															enableScripts: true,
															retainContextWhenHidden: true
														});
				console.log(panel)
				panel.webview.html=cache.toString();
				vscode.window.showInformationMessage('题目在线获取失败，已为您读取缓存！');
			})
		}
	});
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('quick-oi.vijos.problem',async function () {
		try{
			var VJ_PID=await vscode.window.showInputBox({
				placeHolder: '请输入题号',
				ignoreFocusOut: true
			});
			var ProblemHTML=(await VIJOS_API.get('/p/' + VJ_PID)).data;
			// console.log(ProblemHTML);
			// console.log(ProblemHTML.split('h1'))
			// console.log(((ProblemHTML.split('h1')[1]).split('>')))
			// console.log(((ProblemHTML.split('h1')[1]).split('>')[1]).split('<'))
			console.log("Split")
			var Data=Split_Data(ProblemHTML.split('h1'),VJ_PID);
			console.log("split done")
			var HTML_Show=VJ_BuildProblemPages(Data);
			// var VJ_ProblemTitle=((ProblemHTML.split('h1')[1]).split('>')[1]).split('<')[0];
			// console.log(VJ_ProblemTitle);
			const panel=vscode.window.createWebviewPanel(VJ_PID+'：'+Data[1],
														 VJ_PID+'：'+Data[1],
														 vscode.ViewColumn.Two,{
															enableScripts: true,
															retainContextWhenHidden: true
														 });
			panel.webview.html=HTML_Show;
			fs.writeFileSync(QUICK_OI_HOME+'/cache/Vijos-'+VJ_PID,HTML_Show,{
				encoding: 'utf-8'
			})
			vscode.window.showInformationMessage('题目获取完毕！');
		}catch(err){
			fs.readFile(QUICK_OI_HOME+'/cache/Vijos-'+VJ_PID,(err,cache)=>{
				console.log(err,cache)
				if(err){
					vscode.window.showErrorMessage('获取题目失败，请检查网络连接或题号！');
					return;
				}
				const panel=vscode.window.createWebviewPanel('Quick OI 题目缓存',
														'Quick OI 题目缓存',
														vscode.ViewColumn.Two,{
															enableScripts: true,
															retainContextWhenHidden: true
														});
				console.log(panel)
				panel.webview.html=cache.toString();
				vscode.window.showInformationMessage('题目在线获取失败，已为您读取缓存！');
			})
		}
	})
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('quick-oi.template.import',async function () {
		try{
			console.log("Import")
			var Settings=JSON.parse((fs.readFileSync(QUICK_OI_HOME+'/template_settings.json').toString()));
			console.log(Settings)
			var TemplateGroup=[];
			for(var i=0;i<ArrayLength(Settings.userSettings);i++){
				TemplateGroup.push(Settings.userSettings[i].name);
			}
			console.log(TemplateGroup);
			var templateDirName=await vscode.window.showQuickPick(TemplateGroup,{
				canPickMany: false,
				ignoreFocusOut: true,
				placeHolder: "请选择模板组"
			}).then((choice)=>{
				for(var i=0;i<ArrayLength(TemplateGroup);i++){
					if(TemplateGroup[i]==choice){
						return Settings.userSettings[i].dir;
					}
				}
				return undefined;
			});
			if(templateDirName==undefined)return;
			filesTraversal(templateDirName,async function(err,file_name,path) {
				console.log(err,file_name,path)
				if(err){
					vscode.window.showErrorMessage('Something was happened...');
					console.log("Error: filesTraversal")
					return;
				}
				var templatePath=await vscode.window.showQuickPick(file_name,{
					canPickMany: false,
					ignoreFocusOut: true,
					placeHolder: "请选择模板"
				}).then((choice)=>{
					for(var i=0;i<file_name.length;i++){
						if(file_name[i]==choice){
							return path[i];
						}
					}
					return undefined;
				});
				console.log(templatePath)
				if(templatePath==undefined){
					return;
				}
				try{
					vscode.window.activeTextEditor.edit(editBuilder => {
						const end=new vscode.Position(vscode.window.activeTextEditor.document.lineCount+1,0);
						editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end),fs.readFileSync(templatePath).toString());
					});
				}catch(err){
					vscode.window.showErrorMessage("你没有编辑文档哦~")
				}
			});
		}catch(err){
			vscode.window.showErrorMessage('Something was happened...');
			console.log(err)
		}
	});
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('quick-oi.template.settings',async function () {
		//vscode.window.showInformationMessage('正在重修中……')
		vscode.workspace.openTextDocument(QUICK_OI_HOME+'/template_settings.json').then(doc=>{
			vscode.window.showTextDocument(doc);
		});
		LoadDoc('Quick OI模板设置向导',__dirname+'/doc/template_guide.md')
		// Child_Process.exec('start '+__dirname+'/Templates');
	})
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('quick-oi.data.clear',async function () {
		vscode.window.showWarningMessage("你确定要清除用户数据吗？数据将会永久删除！","我确定！","算了吧！").then(value=>{
			if(value==="我确定！"){
				fs.removeSync(QUICK_OI_HOME);
				vscode.window.showInformationMessage('已为您清除用户文件，请重新加载VS Code。');
			}
		})
	})
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('quick-oi.luogu.login',async function () {
		let username=await vscode.window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: '请输入您的洛谷账号/手机号/邮箱'
		})
		if(!username)return;
		let password=await vscode.window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: '请输入您的密码',
			password: true
		})
		if(!username)return;
		let captcha=await showCaptcha(context.subscriptions)		
		let loginStatus=await LG_API.post('/api/auth/userPassLogin',{username,password,captcha},{
			headers: {
				'X-CSRF-TOKEN': await getToken('/auth/login'),
				'Referer': 'https://www.luogu.com.cn/auth/login',
				'Sec-Fetch-Dest': 'empty',
				'Sec-Fetch-Mode': 'cors',
				'Sec-Fetch-Site': 'same-origin',
				'Origin': 'https://www.luogu.com.cn/',
				'X-Requested-With': 'XMLHttpRequest'
			},
		}).catch(err=>{
			if(err.response){
				vscode.window.showErrorMessage(err.response.errorMessage);
				return err;
			}
		})
		console.log(loginStatus)
		vscode.window.showInformationMessage("登陆成功！洛谷用户名为："+loginStatus.data.username)
	})
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('quick-oi.luogu.logout',async function () {
		jar.getCookies("https://www.luogu.com.cn/",async (err,cookie)=>{
			if(err){
				vscode.window.showErrorMessage('Get Cookies err')
				return;
			}
			var uid=cookie.find(_uid=>_uid.key==='_uid').value
			if(uid==="0"){
				vscode.window.showErrorMessage("你没有登录过啊QvQ")
				return;
			}
			let logoutStatus=await LG_API.post("/api/auth/logout",null,{
				headers: {
					'X-CSRF-Token': await getToken('/'),
					'Referer': 'https://www.luogu.com.cn/',
					'Sec-Fetch-Dest': 'empty',
					'Sec-Fetch-Mode': 'cors',
					'Sec-Fetch-Site': 'same-origin',
					'Origin': 'https://www.luogu.com.cn/',
					'X-Requested-With': 'XMLHttpRequest'
				}
			})
			if(logoutStatus.data._empty)vscode.window.showInformationMessage("已为你退出洛谷账号！");
		})
	})
	context.subscriptions.push(disposable);
	disposable = vscode.commands.registerCommand('quick-oi.luogu.fate',async function () {
		let fateStatus=await LG_API.post('/index/ajax_punch',null,{
			headers: {
				'X-CSRF-Token': await getToken('/'),
				'Referer': "https://www.luogu.com.cn/"
			}
		})
		console.log(fateStatus)
		if(fateStatus.data.code!=200){
			vscode.window.showInformationMessage(fateStatus.data.message||fateStatus.data.data)
		}
		else{
			vscode.window.showInformationMessage("打卡成功！")
		}
	})
	context.subscriptions.push(disposable);
	init()
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
	
}