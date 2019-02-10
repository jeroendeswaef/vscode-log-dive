// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const AWS = require("aws-sdk");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const config = vscode.workspace.getConfiguration();
	const awsRegion = config.get("logdive.awsRegion");

	const outputChannel = vscode.window.createOutputChannel("Log dive");

	AWS.config.apiVersions = {
		cloudwatchlogs: "2014-03-28"
		// other service API versions
	};
	AWS.config.update({ region: awsRegion });

	var cloudwatchlogs = new AWS.CloudWatchLogs();

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(
		"extension.logDive",
		function() {
			outputChannel.clear();
			var params = {
				logGroupName: config.get('logdive.logGroupName'),
				startTime: new Date(config.get('logdive.startTime')).getTime(),
				endTime: new Date(config.get('logdive.endTime')).getTime(),
				filterPattern: config.get('logdive.filterPattern'),
				limit: 10
			};
			cloudwatchlogs.filterLogEvents(params, function(err, data) {
				console.log(data);
				if (err) console.error(err, err.stack);
				// an error occurred
				else {
					data.events.forEach(event => {
						const parsedMessage = JSON.parse(event.message);
						outputChannel.appendLine(parsedMessage.msg);
					});
				}
			});
			outputChannel.show();
		}
	);

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
};
