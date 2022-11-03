/**
 * @file      mockserver.js
 * @brief     Mockserver to emulate telemetry data of the Swissloop Pod
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
 * @version 3.0.0
 *
 */

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// attach debugger command line port
app.commandLine.appendSwitch('remote-debugging-port', '9223')
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

if (process.env.DEV === 'true') {
    console.log("Dev Mode")
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname,'../', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
    // Prevent from
    app.commandLine.appendSwitch("disable-background-timer-throttling")
    // Prevents Chromium from lowering the priority of invisible pages' renderer processes.
    app.commandLine.appendSwitch("disable-renderer-backgrounding");

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 840,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        backgroundThrottling:false
    });

    // Dangerous but this app is only a prototype
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

    // mainWindow.openDevTools();

    mainWindow.maximize();
    mainWindow.setIcon(path.join(__dirname, '../control_panel', 'img', 'Icon.png'));

    // and load the mockserver.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mockserver.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
