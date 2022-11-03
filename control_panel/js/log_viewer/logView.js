/**
 * @file      logView.js
 * @brief     Viewer for control panel log files
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
 * @module LogView:ProtocolTable
 * @version 3.0.0
 *
 */

const $ = require('jquery');

// To create csv data and pipe into file streams
const fs = require('fs');
const csv = require('@fast-csv/parse');
const DataFrame = require('dataframe-js').DataFrame;

const config = require('../../config/config');

const {
    lightningChart,
    SolidFill,
    SolidLine,
    emptyLine,
    DataPatterns,
    Themes,
    emptyFill,
    UIOrigins,
    UIDirections,
    ColorPalettes,
    AxisTickStrategies,
    AutoCursorModes
} = require('@arction/lcjs')

const lc = lightningChart();

// Library to work with date objects
const moment = require('moment');

const control_panel_log_config = require('./logView_config.js').config

const mappings = require('../../config/mappings.js');

const loadingOverlay       = $('#loading_overlay');
const groupControlPanel    = $('#groupControlPanel');
const groupVCU             = $('#groupVCU');
const groupInverter        = $('#groupInverter');

class LogView{
    /**
     * @typedef {object} LogViewConfig
     * @property {String} id Div container to insert chart.
     */

    /**
     * Constructor
     * @param {EventEmitter} eventEmitter App-wide command emitter.
     * @param {LogViewConfig} config Configuration for log view.
     */
    constructor(eventEmitter, config) {
        this.eventEmitter = eventEmitter;
        this.config = config;

        /**
         * @typedef {"controlpanel" | "vcu" | "inverter" } LogTypes
         */


        /** @typedef {object} LogViewSeries
         *  @property {"config" | "state" | "series" | "event" } category Category of the series.
         *  @property {lcjs/LineSeries|lcjs/RectangleSeries} handle LCJS Handle.
         *  @property {String} label Label to show in legend.
         *  @property {String} color Color of the graph.
         */

        /**
         *
         * @type {{vcu: Object.<LogViewSeries>, inverter: Object.<LogViewSeries>, controlpanel: Object.<LogViewSeries>, dataset: DataFrame}}
         */
        this.series = {
            vcu: {},
            controlpanel: {},
            inverter: {},
            dataset: {}
        }

        this.rectanglesSeries = [];

        // Add event listeners
        window.addEventListener("load", () => {
            this._generate_chart();
            this._add_event_listeners();
        });
    }

    /**
     * Setup listener.
     * @private
     */
    _add_event_listeners() {
        return 0;
    }

    /**
     * Setup dashboard.
     * @private
     */
    _generate_chart() {

        this.log_db = lc.Dashboard({
            numberOfRows: 3,
            numberOfColumns: 1,
            container: 'logViewChart_1',
            theme: Themes.light,
        })

        this.chartValues = this.log_db.createChartXY({
            columnIndex: 0,
            rowIndex: 0,
            columnSpan: 1,
            rowSpan: 1
        })
            .setTitle('')
            .setTitleMarginBottom(0)
            .setTitleMarginTop(0)
            .setAutoCursor(cursor => {
                cursor.disposeTickMarkerY()
                cursor.setGridStrokeYStyle(emptyLine)
            })
            .setPadding({top: -20, bottom: -5, left: config.logviewer["padding-left"], right: 20})

        this.chartEvents = this.log_db.createChartXY({
            columnIndex: 0,
            rowIndex: 1,
            columnSpan: 1,
            rowSpan: 1
        })
            .setTitle('')
            .setTitleMarginBottom(0)
            .setTitleMarginTop(0)
            .setAutoCursorMode(AutoCursorModes.onHover)
            .setAutoCursor(cursor => cursor
                .setResultTableAutoTextStyle(false)
                .disposePointMarker()
                .disposeTickMarkerX()
                .disposeTickMarkerY()
                .setGridStrokeXStyle(emptyLine)
                .setGridStrokeYStyle(emptyLine)
                .setResultTable((table) => {
                    table
                        .setOrigin(UIOrigins.Center)
                })
            )
            .setPadding({top: -20, bottom: -5, left: 0, right: 20})


        this.zoomBandChart = this.log_db.createZoomBandChart( {
            columnIndex: 0,
            rowIndex: 2,
            columnSpan: 1,
            rowSpan: 1,
            axis: this.chartValues.getDefaultAxisX()
        } )
            .setTitle('')
            .setTitleMarginBottom(0)
            .setTitleMarginTop(0)
            .setPadding({top: -20, bottom: -5, left: 42+config.logviewer["padding-left"], right: 20})

        // Manually attach to event chart
        this.zoomBandChart.band.onValueChange( (handler, start, end) => {
            this.chartEvents.getDefaultAxisX().setInterval(start, end, false, true)
        })

        this.chartValues.getDefaultAxisX().setAnimationScroll( undefined )
        this.chartValues.getDefaultAxisX().setAnimationZoom( undefined )
        this.chartValues.getDefaultAxisY().setAnimationScroll( undefined )
        this.chartValues.getDefaultAxisY().setAnimationZoom( undefined )
        this.chartEvents.getDefaultAxisX().setAnimationScroll( undefined )
        this.chartEvents.getDefaultAxisX().setAnimationZoom( undefined )
        this.chartEvents.getDefaultAxisY().setAnimationScroll( undefined )
        this.chartEvents.getDefaultAxisY().setAnimationZoom( undefined )
        this.zoomBandChart.getDefaultAxisX().setAnimationScroll( undefined )
        this.zoomBandChart.getDefaultAxisX().setAnimationZoom( undefined )
        this.zoomBandChart.getDefaultAxisY().setAnimationScroll( undefined )
        this.zoomBandChart.getDefaultAxisY().setAnimationZoom( undefined )

        this.zoomBandChart.getDefaultAxisX().setTitle('seconds')
        this.chartValues.getDefaultAxisX().setChartInteractionZoomByDrag(true)
        this.chartValues.getDefaultAxisY().setChartInteractionZoomByDrag(true)
        this.chartValues.getDefaultAxisX().setChartInteractionPanByDrag(true)
        this.chartValues.getDefaultAxisY().setChartInteractionPanByDrag(true)

        this.chartEvents.getDefaultAxisY().setChartInteractionZoomByDrag(false)
        this.chartEvents.getDefaultAxisY().setChartInteractionPanByDrag(false)
        this.chartEvents.getDefaultAxisY().setChartInteractionZoomByWheel(false)
        this.chartEvents.getDefaultAxisY().setAxisInteractionZoomByWheeling(false)
        this.chartEvents.getDefaultAxisY().setAxisInteractionZoomByDragging(false)
        this.chartEvents.getDefaultAxisY().setAxisInteractionPanByDragging(false)

        this.chartEvents.getDefaultAxisX().setChartInteractionZoomByDrag(false)
        this.chartEvents.getDefaultAxisX().setChartInteractionPanByDrag(false)
        this.chartEvents.getDefaultAxisX().setChartInteractionZoomByWheel(false)
        this.chartEvents.getDefaultAxisX().setAxisInteractionZoomByWheeling(false)
        this.chartEvents.getDefaultAxisX().setAxisInteractionZoomByDragging(false)
        this.chartEvents.getDefaultAxisX().setAxisInteractionPanByDragging(false)

        console.log(this.chartEvents.getDefaultAxisY().setTickStrategy())
        this.chartEvents.getDefaultAxisY()
            .setTickStrategy(AxisTickStrategies.Empty)

        this.log_db.setRowHeight(0, 5)
        this.log_db.setRowHeight(1, 3)
        this.log_db.setRowHeight(2, 2)

    }
    /**
     * @typedef {"controlpanel" | "vcu" | "inverter" } LogTypes
     */

    /**
     * Open a log file and display data.
     * @param htmlLegend {HTMLElement} Where to insert the legend.
     * @param type {LogTypes} The type of the log file.
     * @param filename {String} The path to the log file.
     * @param callback {function} Callback function.
     * @private
     */
    _openLog(htmlLegend, type, filename, callback) {
        return;
    }

    /**
     * Generate legend with checkboxes to disable series
     *
     * @param html_element {HTMLElement} Collapsable div where to insert legend
     * @param series {Object.<LogViewSeries>}
     * @private
     */
    _generate_legend(html_element, series) {
        html_element.empty();

        let html_group = $("<div>").addClass("card card-body");
        let categories = [];

        for (let index in series) {
            if (index === 'dataset') continue
            if (!series.hasOwnProperty(index)) continue;
            let id = series[index].label;
            const category = id.split(".")[0];

            series[index].handle.dispose();

            const label = id.substring(id.indexOf(".")+1)
            id = id.replace(".","-");

            if (!categories.includes(category)) {
                categories.push(category);
                if (html_group.children().length > 0) {
                    html_element.append(html_group)
                }
                html_group = $("<div>").addClass("card card-body");
            }

            let html_series = `<div class="form-check" style="color: ${series[index].color}"><input class="form-check-input" type="checkbox" value="" id="${id.replace(".","-")}">
                               <label class="form-check-label" for="${id.replace(".","-")}">${label}</label></div>`;
            html_group.append(html_series)
        }
        html_element.append(html_group)

        // Add event handlers
        for (let index in series) {
            if (index === 'dataset') continue
            if (!series.hasOwnProperty(index)) continue;
            const id = series[index].label.replace(".", "-");
            $(`#${id.replace(".","-")}`).change( (element) => {
                if ($(`#${id.replace(".","-")}`).is(':checked')) {
                    series[index].handle.restore()
                } else {
                    series[index].handle.dispose()
                }
            })
        }
    }

    /**
     * @param axis FitAxis
     */
    fitAxis(axis) {
        if (axis.x) this.chartValues.getDefaultAxisX().fit()
        if (axis.y) {
            this.chartValues.getDefaultAxisY().fit()
            this.chartEvents.getDefaultAxisY().fit()
        }
    }

    /**
     * Open and display a control panel log
     * @param filename {String} The path to the log file.
     */
    openLog_ControlPanel(filename) {
        // Overlay
        if (loadingOverlay.css('display') === 'none') loadingOverlay.show();
        // Clear rectangles
        this.rectanglesSeries = [];

        // Open file a stream
        const stream = fs.createReadStream(filename)

        // If there are existing data, hide it
        for (let item in this.series.controlpanel) {
            if (this.series.controlpanel.hasOwnProperty(item) && this.series.controlpanel[item].handle) this.series.controlpanel[item].handle.dispose()
        }

        // Indicator to determine first row
        let first = true;
        // Timestamp used as origin
        let time_origin = 0;
        // Used to determine unchanged values and replace them with NaN
        let lastRow = [];

        // Store the current label position for event chart
        let eventY = 0;

        csv.parseStream(stream, {delimiter: ';', headers: true, objectMode:true})
            .on('headers', header => {
                this.series.controlpanel.dataset = new DataFrame([], ['Timestamp']);
                for (let item in header) {
                    if (!header.hasOwnProperty(item)) continue;
                    if (header[item] === 'Timestamp') continue;
                    let path = header[item].split('.');

                    // If not configured, hide series
                    if (control_panel_log_config[path[0]] === undefined || control_panel_log_config[path[0]][path[1]] === undefined) {
                        console.warn("[LogView]", header[item], " not properly not configured!")
                        continue;
                    }

                    // If not active skip
                    if (control_panel_log_config[path[0]][path[1]].active === false) continue;

                    // Use custom name if configured
                    let label = header[item];
                    if (control_panel_log_config[path[0]][path[1]].name) {
                        let temp = Array.from(path);
                        temp[1] = control_panel_log_config[path[0]][path[1]].name;
                        label = temp.join('.');
                    }

                    // Select colors from palette
                    const lcColor = ColorPalettes.flatUI(header.length)(item)
                    const toHex = (value) => {
                        return Math.floor(value).toString(16);
                    }
                    const color = `#${toHex(lcColor.getR())}${toHex(lcColor.getG())}${toHex(lcColor.getB())}`

                    // Set category and LightningChartJS handle
                    let handle = undefined;
                    let category = ""

                    switch (control_panel_log_config[path[0]][path[1]].category) {
                        case "config":
                            category = "config"
                            break;
                        case "state":
                            category = "state"
                            handle = this.chartEvents.addRectangleSeries()
                                .setName(header[item])
                                // Show state on hover
                                .setCursorResultTableFormatter((builder, series, figure) => {
                                    const rect = this.rectanglesSeries.find((bar) => bar.rect === figure);
                                    const mapping = mappings.select_enum(mappings.enum_list, rect.label)
                                    const desc = mappings.select_flag(mapping, rect.data)
                                    return builder
                                        .addRow( "" +desc)
                                })
                            this.chartEvents.getDefaultAxisY().addCustomTick()
                                    .setValue(eventY + 0.4)
                                    .setGridStrokeLength(0)
                                    .setTextFormatter(_ => label.substring(label.indexOf(".")+1))
                                    .setMarker(marker => marker
                                        .setPadding(0)
                                        .setDirection(UIDirections.Left)
                                        .setBackground(background => background
                                            .setFillStyle(emptyFill)
                                            .setStrokeStyle(emptyLine)
                                        )
                                    )
                            eventY += 1;
                            break;
                        case "series":
                            category = "series"
                            handle = this.chartValues.addLineSeries({dataPattern: DataPatterns.horizontalProgressive})
                                .setName(header[item])
                                .setStrokeStyle(new SolidLine({
                                    thickness: 2,
                                    fillStyle: new SolidFill({ color: lcColor})
                                }));
                            break;
                        case "event":
                            category = "event"
                            handle = this.chartValues.addPointLineSeries({dataPattern: DataPatterns.horizontalProgressive})
                                .setName(header[item])
                                .setStrokeStyle((strokeStyle) => strokeStyle.setFillStyle(emptyFill))
                                .setPointFillStyle(new SolidFill({color: lcColor}))
                                .setPointSize(50)
                            break;
                        default:
                            continue;
                    }

                    if (handle === undefined) continue;

                    // Add column to dataset
                    this.series.controlpanel.dataset = this.series.controlpanel.dataset.withColumn(header[item]);

                    this.series.controlpanel[header[item]] = {
                        category: category,
                        label: label,
                        color: color,
                        handle: handle
                    }
                }
            })
            .on('error', error => console.error(error))
            .on('data', row => {
                if (first) {
                    time_origin = moment(row.Timestamp).valueOf();
                    first = false;
                }

                // Row with reduced values
                let tempRowReduced = [(moment(row.Timestamp).valueOf()-time_origin)/1000];
                // Row with all values
                let tempRowValues = [(moment(row.Timestamp).valueOf()-time_origin)/1000];
                let index = 1;
                for (let item in row) {
                    if (!row.hasOwnProperty(item)) continue;

                    if (item === 'Timestamp') continue;
                    if (!this.series.controlpanel[item]) continue;

                    let path = item.split('.');
                    let value = parseInt(row[item]);
                    // if (value > 36863) value -= 2 ** 16;

                    value /= parseInt(mappings.typeset_telemetry_frame.Factor[path[0]][path[1]]);

                    if (control_panel_log_config[path[0]][path[1]].factor) {
                        value *= control_panel_log_config[path[0]][path[1]].factor
                    }

                    // Remember original values
                    tempRowValues.push(value);

                    if (this.series.controlpanel[item].category !== 'series' || config.logviewer.reduce_series) {
                        if (value === lastRow[index]) value = NaN;
                    }

                    tempRowReduced.push(value)
                    index += 1;
                }
                // Add row to dataset
                this.series.controlpanel.dataset = this.series.controlpanel.dataset.push(tempRowReduced);
                // Remember original values
                lastRow = Array.from(tempRowValues);
            })
            .on('end', rowCount => {
                this.series.controlpanel.dataset = this.series.controlpanel.dataset.push(lastRow);
                eventY = 0;
                // Process and reduce data
                for (let item in this.series.controlpanel) {
                    if (item === 'dataset') continue;
                    if (! this.series.controlpanel.hasOwnProperty(item)) continue;

                    // Remove all missing values from previous step
                    let reduced = this.series.controlpanel.dataset.dropMissingValues([item]);

                    switch (this.series.controlpanel[item].category) {
                        case "config":
                            break;
                        case "state":
                            let data = reduced.toArray(item);
                            let time = reduced.toArray('Timestamp')

                            for (let i = 0; i < data.length-1; i++ ) {
                                if (data[i] !== 0) {
                                    const rectDimensions = {
                                        x: time[i],
                                        y: eventY,
                                        width: time[i+1] - time[i],
                                        height: 0.8
                                    }
                                    const lcColor = ColorPalettes.flatUI(Math.max(config.logviewer.max_states))(data[i])
                                    let rect = this.series.controlpanel[item].handle.add(rectDimensions)
                                        .setFillStyle(new SolidFill({ color: lcColor}))
                                    this.rectanglesSeries.push({
                                        rect: rect,
                                        data: data[i],
                                        label: item,
                                    })

                                }
                            }
                            eventY +=1;
                            break;
                        case "series":
                            this.series.controlpanel[item].handle.addArraysXY(reduced.toArray('Timestamp'),  reduced.toArray(item));
                            break;
                        case "event":
                            this.series.controlpanel[item].handle.addArraysXY(reduced.toArray('Timestamp'),  reduced.toArray(item));
                            break
                    }
                }

                // Generate custom labels
                this._generate_legend(groupControlPanel, this.series.controlpanel);

                // Show all data
                this.chartValues.getDefaultAxisX().fit()
                this.chartValues.getDefaultAxisY().fit()

                // Show legend
                groupControlPanel.collapse("show");
                groupVCU.collapse("hide");
                groupInverter.collapse("hide");

                if (loadingOverlay.css('display') !== 'none') loadingOverlay.hide();
            });
    }

    /**
     * Open and display a VCU log.
     * @param filename {String} The path to the log file.
     */
    openLog_VCU(filename) {
        // Overlay
        if (loadingOverlay.css('display') === 'none') loadingOverlay.show();
        // Clear rectangles
        this.rectanglesSeries = [];

        // Open file a stream
        const stream = fs.createReadStream(filename)

        // If there are existing data, hide it
        for (let item in this.series.vcu) {
            if (this.series.vcu.hasOwnProperty(item) && this.series.vcu[item].handle) this.series.vcu[item].handle.dispose()
        }

        // Indicator to determine first row
        let first = true;
        // Timestamp used as origin
        let time_origin = 0;

        csv.parseStream(stream, {delimiter: ';', headers: true, objectMode:true})
            .on('error', error => console.error(error))
            .on('data', row => {
                if (first) {
                    time_origin = row.timestamp;
                    first = false;
                }

            })
            .on('end', rowCount => {
                // Generate custom labels
                this._generate_legend(groupVCU, this.series.vcu);

                // Show all data
                this.chartValues.getDefaultAxisX().fit()
                this.chartValues.getDefaultAxisY().fit()

                // Show legend
                groupControlPanel.collapse("hide");
                groupVCU.collapse("show");
                groupInverter.collapse("hide");

                if (loadingOverlay.css('display') !== 'none') loadingOverlay.hide();
            });
    }

    /**
     * Open and display a inverter log,
     * @param filename {String} The path to the log file.
     */
    openLog_Inverter(filename) {

    }
}

function init(eventEmitter, config) {
    return new LogView(eventEmitter, config);
}

module.exports = init;