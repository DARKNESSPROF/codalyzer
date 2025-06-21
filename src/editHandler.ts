import * as vscode from 'vscode';
import * as os from 'os';
import { formatDateTime, appendToLogFile } from './utils';

let lastEditLogTime: number = 0;

export function onTextDocumentChange(event: vscode.TextDocumentChangeEvent) {
    // Only track changes in the active editor and only if there are actual content changes
    if (vscode.window.activeTextEditor?.document === event.document && event.contentChanges.length > 0) {
        const currentFile = event.document.uri.fsPath;
        const now = Date.now();
        
        // Check if 10 seconds have passed since the last edit log
        if (now - lastEditLogTime >= 10000) {
            logEditActivity(currentFile);
            lastEditLogTime = now;
        }
    }
}

export function logEditActivity(filePath: string) {
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    
    const message = `${os.userInfo().username} has edited the file ${filePath}, at this time: ${dateTimeString}\n`;
    
    appendToLogFile(message);
}