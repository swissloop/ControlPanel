/**
 * @file      app.js
 * @brief     Visualization of telemetry data for the Swissloop Pod
 *
 * @author    Philip Wiese, philip.wiese@swissloop.ch
 * 
 * @license
 * Copyright (C) 2022 Swissloop
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 */

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// attach debugger command line port
app.commandLine.appendSwitch('remote-debugging-port', '9222')
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

const { ipcMain } = require('electron');

require('@electron/remote/main').initialize()

const config = require('./config/config');

if (process.env.DEV === 'true') {
    console.log("Dev Mode")
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let podControlWindow, logViewerWindow, communicationWorker;

function createWindow() {
    // Prevent from
    app.commandLine.appendSwitch("disable-background-timer-throttling")
    // Prevents Chromium from lowering the priority of invisible pages' renderer processes.
    app.commandLine.appendSwitch("disable-renderer-backgrounding");

    // Create the browser window.
    communicationWorker = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        parent: podControlWindow,
        backgroundThrottling: false
    });

    podControlWindow = new BrowserWindow({
        width: 1440,
        height: 840,
        enableRemoteModule: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
            enableRemoteModule: true,
        },
        backgroundThrottling: false
    });


    require('@electron/remote/main').enable(podControlWindow.webContents)
    require('@electron/remote/main').enable(communicationWorker.webContents)

    podControlWindow.setIcon(path.join(__dirname, 'img', 'Icon.png'));

    if (process.env.DEV === 'true') {
        // podControlWindow.openDevTools();
        communicationWorker.openDevTools();
    }

    podControlWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'html/podControl.html'),
        protocol: 'file:',
        slashes: true,
    }));

    communicationWorker.loadURL(url.format({
        pathname: path.join(__dirname, 'html/comWorker.html'),
        protocol: 'file:',
        slashes: true
    }));

    podControlWindow.maximize();

    // Emitted when the window is closed.
    podControlWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        podControlWindow = null;
        communicationWorker = null;
        app.quit();
    });

    if (config.testing.enabled) console.log("[INFO] Testing enabled");

    ipcMain.on('startLogging', (_event, arg) => {
        sendWindowMessage(communicationWorker, 'startLogging', arg);
    });
    ipcMain.on('stopLogging', (_event, arg) => {
        sendWindowMessage(communicationWorker, 'stopLogging', arg);
    });
    ipcMain.on('sendCtrlFrame', (_event, arg) => {
        sendWindowMessage(communicationWorker, 'sendCtrlFrame', arg);
    });
    ipcMain.on('console_log', (_event, ...arg) => {
        // console.log(...arg);
        sendWindowMessage(podControlWindow, 'console_log', arg);
    });
    ipcMain.on('error', (_event, arg) => {
        sendWindowMessage(podControlWindow, 'error', arg);
    });
    ipcMain.on('connected', (_event, arg) => {
        sendWindowMessage(podControlWindow, 'connected', arg);
    });
    ipcMain.on('missingHeartbeat', (_event, arg) => {
        sendWindowMessage(podControlWindow, 'missingHeartbeat', arg);
    });
    ipcMain.on('heartbeat', (_event, arg) => {
        sendWindowMessage(podControlWindow, 'heartbeat', arg);
    });
    ipcMain.on('packet', (_event, arg) => {
        sendWindowMessage(podControlWindow, 'packet', arg);
    });
    ipcMain.on('telemetryFrame', (_event, arg) => {
        sendWindowMessage(podControlWindow, 'telemetryFrame', arg);
    });
    ipcMain.on('openLogViewer', (_event, _arg) => {
        if (logViewerWindow) {
            logViewerWindow.show();
        } else {
            createLogViewer();
        }
    });

    ipcMain.setMaxListeners(Infinity);
}

function createLogViewer() {
    logViewerWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        backgroundThrottling: true
    });

    require('@electron/remote/main').enable(logViewerWindow.webContents)


    logViewerWindow.setIcon(path.join(__dirname, 'img', 'Icon.png'));

    logViewerWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'html/logViewer.html'),
        protocol: 'file:',
        slashes: true,
    }));

    logViewerWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        logViewerWindow = null;
    });

    logViewerWindow.maximize();

    logViewerWindow.show();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        console.log("All Windows Closed")
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
});

function sendWindowMessage(targetWindow, message, payload) {
    if (typeof targetWindow === 'undefined') {
        console.log('Target window does not exist');
        return;
    }
    if (targetWindow === null) {
        console.log('Target window does not exist');
        return;
    }
    targetWindow.webContents.send(message, payload);
}
