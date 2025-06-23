import * as vscode from 'vscode';
import { formatDateTime, appendToLogFile } from './utils';

let lastEditLogTime: number = 0;

export function onTextDocumentChange(event: vscode.TextDocumentChangeEvent) {

    if (vscode.window.activeTextEditor?.document === event.document && event.contentChanges.length > 0) {
        const currentFile = event.document.uri.fsPath;
        const now = Date.now();
        
        if (now - lastEditLogTime >= 10000) {
            logEditActivity(currentFile);
            lastEditLogTime = now;
        }
    }
}

export function logEditActivity(filePath: string) {
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    
    const message = `Edit:${filePath}, Time: ${dateTimeString}\n`;
    
    appendToLogFile(message);
}