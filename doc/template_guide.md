# Quick OI 模板使用向导

![icon_title.png](https://i.loli.net/2021/05/20/zvtV8uTnDLamcWr.png)

欢迎使用Quick OI的模板功能！我们的模板使用`JSON`文件进行配置，在左侧的文件中，你会看到类似以下的内容：
```json
{
	"userSettings": [
		{
			"name": "系统模板组",
			"dir": "c:/Users/Administrator/.vscode/extensions/pai233.quick-oi-1.0.1058/Templates"
		}
	]
}
```

接下来您将会了解如何添加自己的设置。首先看向`userSettings`，这是一个数组，您需要像以下方式添加一个项目：
```json
{
	"userSettings": [
		{
			"name": "系统模板组",
			"dir": "c:/Users/Administrator/.vscode/extensions/pai233.quick-oi-1.0.1058/Templates"
		},{
			//Type Something...
		},{
			//Type Something...
		}
		// And More...
	]
}
```

这时我们再看向每项内的`name`，这个是您的模板组的名字，而`dir`则指向您存放模板文件的位置。我们建议您将模板文件放置在一个单独的目录下，因为我们的程序会自动遍历您目录下的**文件**（这意味着子目录不被支持）。

**Tips:如果您是Windows用户，目录路径中的斜杠请使用`/`或者`\\`，直接使用`\`会出现奇妙的转义问题qwq**

For an example:
```json
{
	"userSettings": [
		{
			"name": "系统模板组",
			"dir": "c:/Users/Administrator/.vscode/extensions/pai233.quick-oi-1.0.1058/Templates"
		},{
			"name" :"DP",
			"dir": "D:/template/dp"
		},{
			"name" :"Math",
			"dir": "D:/template/math"
		}
	]
}
```

未来我们会支持更方便的添加方式，敬请期待呀qaq