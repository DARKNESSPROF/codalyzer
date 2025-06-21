import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
 
let logFilePath: string;
let lastActiveFile: string | undefined;

export function activate(context: vscode.ExtensionContext) {
    // Initialize log file path
    const documentsPath = path.join(os.homedir(), 'Documents');
    logFilePath = path.join(documentsPath, 'Activity-Session-Log.txt');

    // Log session start
    logSessionStart();

    // Register event listeners
    const activeEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(onActiveEditorChange);
    const openLogFileDisposable = vscode.commands.registerCommand('session-logger.openLogFile', openLogFile);

    context.subscriptions.push(
        activeEditorChangeDisposable,
        openLogFileDisposable
    );

    // Initial check for active editor
    if (vscode.window.activeTextEditor) {
        lastActiveFile = vscode.window.activeTextEditor.document.uri.fsPath;
    }
}

function logSessionStart() {
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    
    const activeEditor = vscode.window.activeTextEditor;
    const currentFile = activeEditor ? activeEditor.document.uri.fsPath : "No active file found";
    
    const sessionStartMessage = `\nSession started at: ${dateTimeString}\n\n`;
    
    appendToLogFile(sessionStartMessage);
}

function onActiveEditorChange(editor: vscode.TextEditor | undefined) {
    if (!editor) { return; }

    const currentFile = editor.document.uri.fsPath;
    
    // Only log if the file has actually changed
    if (currentFile !== lastActiveFile) {
        lastActiveFile = currentFile;
        logFileActivity(currentFile);
    }
}

function logFileActivity(filePath: string) {
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    
    const message = `${os.userInfo().username} has switched the window into: ${filePath}, at this time: ${dateTimeString}\n`;
    
    appendToLogFile(message);
}

function formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function appendToLogFile(message: string) {
    try {
        // Ensure the documents directory exists
        const documentsDir = path.dirname(logFilePath);
        if (!fs.existsSync(documentsDir)) {
            fs.mkdirSync(documentsDir, { recursive: true });
        }

        // Append to log file
        fs.appendFileSync(logFilePath, message, 'utf8');
    } catch (error) {
        console.error('Error writing to log file:', error);
        vscode.window.showErrorMessage(`Failed to write to log file: ${error}`);
    }
}

function openLogFile() {
    try {
        if (fs.existsSync(logFilePath)) {
            vscode.workspace.openTextDocument(logFilePath).then(doc => {
                vscode.window.showTextDocument(doc);
            });
        } else {
            vscode.window.showInformationMessage('Log file does not exist yet. Start using VS Code to create it.');
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to open log file: ${error}`);
    }
}

export function deactivate() {
    // Log session end
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    const sessionEndMessage = `Session ended at: ${dateTimeString}\n\n`;
    
    try {
        fs.appendFileSync(logFilePath, sessionEndMessage, 'utf8');
    } catch (error) {
        console.error('Error writing session end to log file:', error);
    }


}