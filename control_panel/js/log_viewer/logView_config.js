/**
 * @file      logView_config.js
 * @brief     Configuration file for log viewer
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

/**
 * @typedef {object} SeriesConfig
 * @property {"number" | "enum" | "boolean" } type Type of the series.
 * @property {"config" | "state" | "series" | "event" } category Category of the series.
 * @property {boolean} active If the series is loaded into the chart.
 * @property {string} color RGBA Color (e.g. #FF011702).
 */

/**
 * @type {SeriesConfig}
 */
const logView_config_controlPanel = {
    Sync: {
      SYNC:  {type: 'number', category: 'config', active: false, color: undefined}
    },
    State: {
      STATE: {type: 'enum', category: 'state', active: true, color: undefined},
      VCU_ERRORS: {type: 'enum', category: 'event', active: true, color: undefined},

    },
    Velocity: {
      CORRAIL_VELOCITY: {type: 'number', category: 'series', active: true, color: undefined},
    },
};

module.exports = {
  "config": logView_config_controlPanel
};
