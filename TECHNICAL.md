
# Technical Documentation

## Folder Structure
The main application is separated into config, CSS (Cascading Style Sheets), images, JavaScript, json objects, and riot-tags files. 
```bash
.
├── control_panel           # Main Application
│   ├── config              # - Configuration files 
│   ├── css                 # - CSS for the layout, colors, and fonts
│   ├── html                # - HTML for the content and structure
│   ├── img                 # - Various images including pod visualization 
│   ├── js                  # - JavaScript Code
│   ├── json                # - Definitions such as states and errors
│   ├── mp3                 # - Sound files
│   ├── riot-tags           # - Riot tags for custom widgets
│   └── app.js              # - Main application entry script
├── mock_server             # Mock server emulating the pod 
│   ├── config              # - Configuration files 
│   ├── css                 # - CSS for the layout, colors, and fonts
│   ├── js                  # - JavaScript Code
│   ├── json                # - Definitions such as default values 
│   ├── mockserver.html     # - Mockserver HTML file
│   └── mockserver.js       # - Mockserver entry point
├── package.json            #
├── README.md
├── TECHNICAL.md
└── ...
```

**Before changing anything in the code make sure to update update `control_panel/config/mappings.js`!**  
The mappings are separated into enumerations and errors. An enumerations takes only one values and describes states of FSMs as well as status signals or configuration modes. On the other side, errors are bitmask and can thus take on multiple values by combining the values with an bitwise AND operator.

## Main Application
To parse and generate the binary data the [jBinary](https://github.com/jDataView/jBinary) library from jDataView was used. It allows the definition of so-called typesets, which describe the structure of the binary data and allow easy conversion and data handling. 
The typeset of the telemetry frame is automatically generated from the `network_telemetry_frame.h` file header of the Vehicle Control Software with the `generator.js` script.  However, the typeset of the control frame is hardcoded as it is easy to adopt. 

The `com.js` and `parser.js` modules receive and generate data and parse this data from a binary stream to a jBinary object and vice-versa. After receiving a complete frame, the `parser.js` module emits a telemetryFrame, which then gets processed and updated by the GUI modules. The `utils.js` contains utility functions as creating testing data.

**The application is separated into a main, renderer & communication process ([Electron Process Model](https://www.electronjs.org/docs/latest/tutorial/process-model)).** 
The renderer process is responsible for the visible window while the communication process is hidden and is responsible for receiving, parsing, and sending data to the VCU (Vehicle Control Unit). The code of the renderer process is located in the `control_panel/pod_gui` folder, while the code of the communication process in the `control_panel/communication` folder. The GUI is separated into several smaller submodules which are imported in the `control_panel/js/pod_gui/renderer.js` module.

## Mock-Up Server
The mock server can be started by running
```bash
npm run mock
```
The mock server as well as a control and telemetry frame for development purposes are located inside the `mock_server` folder. The folder structure is organized the same way as the main application. There is also a config folder where you can specify the log level, IP ports & addresses, and the frequency of the heartbeat. The css, js and json folders are self-explanatory.