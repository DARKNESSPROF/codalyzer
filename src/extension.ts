import * as vscode from 'vscode';
import { initializeLogPath, formatDateTime, appendToLogFile, openLogFile } from './utils';
import { onActiveEditorSwitch, setLastActiveFile } from './switchHandler';
import { onTextDocumentChange } from './editHandler';

let logFilePath: string;

export function activate(context: vscode.ExtensionContext) {
    // Initialize log file path
    logFilePath = initializeLogPath();

    // Log session start
    logSessionStart();

    // Register event listeners
    const activeEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(onActiveEditorSwitch);
    const textDocumentChangeDisposable = vscode.workspace.onDidChangeTextDocument(onTextDocumentChange);
    const openLogFileDisposable = vscode.commands.registerCommand('session-logger.openLogFile', openLogFile);

    context.subscriptions.push(
        activeEditorChangeDisposable,
        textDocumentChangeDisposable,
        openLogFileDisposable
    );

    // Initial check for active editor
    if (vscode.window.activeTextEditor) {
        setLastActiveFile(vscode.window.activeTextEditor.document.uri.fsPath);
    }
}

function logSessionStart() {
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    
    const activeEditor = vscode.window.activeTextEditor;
    const currentFile = activeEditor ? activeEditor.document.uri.fsPath : "No active file found";
    
    const sessionStartMessage = `Session started at: ${dateTimeString}\n\n`;
    
    appendToLogFile(sessionStartMessage);
}

export function deactivate() {
    // Log session end
    const now = new Date();
    const dateTimeString = formatDateTime(now);
    const sessionEndMessage = `\nSession ended at: ${dateTimeString}\n\n==================================================\n\n`;
    
    try {
        appendToLogFile(sessionEndMessage);
    } catch (error) {
        console.error('Error writing session end to log file:', error);
    }
}
