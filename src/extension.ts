import * as vscode from 'vscode';
import { initializeLogPath, formatDateTime, appendToLogFile, openLogFile } from './utils';
import { onActiveEditorSwitch, setLastActiveFile } from './switchHandler';
import { onTextDocumentChange } from './editHandler';
import { onActiveFileRun } from './runHandler'; 

let logFilePath: string;

export function activate(context: vscode.ExtensionContext) {

    logFilePath = initializeLogPath();

    logSessionStart();

    const activeEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(onActiveEditorSwitch);
    const textDocumentChangeDisposable = vscode.workspace.onDidChangeTextDocument(onTextDocumentChange);
    const openLogFileDisposable = vscode.commands.registerCommand('session-logger.openLogFile', openLogFile);
    const runHandlerDisposable = onActiveFileRun(); 

    context.subscriptions.push(
        activeEditorChangeDisposable,
        textDocumentChangeDisposable,
        openLogFileDisposable,
        runHandlerDisposable
    );

    if (vscode.window.activeTextEditor) {
        setLastActiveFile(vscode.window.activeTextEditor.document.uri.fsPath);
    }
}

function logSessionStart() {
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    //const activeEditor = vscode.window.activeTextEditor;
    //const currentFile = activeEditor ? activeEditor.document.uri.fsPath : "No active file found";
    const sessionStartMessage = `Session started at:${dateTimeString}\n`;

    appendToLogFile(sessionStartMessage);
}

export function deactivate() {
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    const sessionEndMessage = `Session ended at:${dateTimeString}\n\n==================================================\n\n`;

    try {
        appendToLogFile(sessionEndMessage);
    } catch (error) {
        console.error('Error writing session end to log file:', error);
    }
}
