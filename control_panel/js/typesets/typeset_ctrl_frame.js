/**
 * @file      typeset_ctrl_frame.js
 * @brief     jBinary control frame Typeset
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
 * @module TelemetryTypeset
 * @version 3.0.0
 * 
 */

const moment = require('moment');
const jBinary = require('jbinary');

const frame_ctrl_typeset =
{
  'jBinary.all': 'Data',
  'jBinary.littleEndian': true,
  DateTimeFatFS: jBinary.Type({
    read: function () {
      let rawValue = this.binary.read('uint32');
      let year  = ((rawValue >> 25) & 0x3F) + 1980;
      let month = ((rawValue >> 21) & 0x0F) - 1;
      let date  = ((rawValue >> 16) & 0x1F);
      let hour  = ((rawValue >> 11) & 0x1F);
      let min   = ((rawValue >> 5 ) & 0x3F);
      let sec   = ((rawValue >> 0 ) & 0x1F);
      return moment([year, month, date, hour, min, sec]);
    },
    write: function () {
      let rawValue = 0;
      let time= moment();
      rawValue = rawValue | (((time.year() - 1980)  & 0x3F) << 25);
      rawValue = rawValue | (((time.month() + 1)  & 0x0F) << 21);
      rawValue = rawValue | ((time.date()   & 0x1F) << 16);
      rawValue = rawValue | ((time.hour()   & 0x1F) << 11);
      rawValue = rawValue | ((time.minute() & 0x3F) << 5 );
      rawValue = rawValue | ((time.second() & 0x1F) << 0 );
      this.binary.write('uint32', rawValue);
    }
  }),
  Length: 83,
  Data: {
    config_runType: 'uint8',
    config_pwmMethod: 'uint8',
    config_bandwidthLow: 'float',
    config_bandwidthHigh: 'float',
    config_zeroCurrent: 'float',
    config_targetCurrent: 'float',
    config_maxVoltage: 'float',
    config_overCurrentLimit_lo: 'float',
    config_overCurrentLimit_hi: 'float',
    config_ADC_MaxOffset: 'float',
    config_ADC_MaxNoiseRange: 'float',
    config_runForward: 'uint8',
    config_setPosition: 'uint8',
    config_runLength: 'uint8',
    config_runDuration: 'float',
    config_trackLength: 'uint8',
    config_propTrackLength: 'uint8',
    config_Temp2startFan: 'float',
    config_maxMosfetTemp: 'float',
    config_brake_state: 'uint8',
    config_controlled_Braking_pressure: 'float',
    config_number_of_batteries: 'uint8', // 44
    config_rideLength: 'float',
    config_NumInvertersEnabled: 'uint8',
    reset_run: 'uint8',
    fat_time: 'DateTimeFatFS', // 13 + 4
    sd_card_flush: 'uint8',
    brake_engage: 'uint8',
    vcu_set_state: 'uint16',
    pod_reset_error: 'uint8',
    vcu_software_reset: 'uint8',
    bms_software_reset_left: 'uint8',
    bms_software_reset_right: 'uint8',
    bms_balancing: 'uint8',
    inverter_software_reset: 'uint8',
    inverter_adc_calibrate: 'uint8',
    inverter_do_foo: 'uint8',
  },
  Unit: {
    config_runType: 'enum',
    config_pwmMethod: 'enum',
    config_bandwidthLow: 'A',
    config_bandwidthHigh: 'A',
    config_zeroCurrent: 'A',
    config_targetCurrent: 'A',
    config_maxVoltage: 'V',
    config_overCurrentLimit_lo: 'A',
    config_overCurrentLimit_hi: 'A',
    config_ADC_MaxOffset: 'A',
    config_ADC_MaxNoiseRange: 'A',
    config_runForward: 'boolean',
    config_setPosition: 'number',
    config_runLength: 'm',
    config_runDuration: 'ms',
    config_trackLength: 'm',
    config_propTrackLength: 'number',
    config_Temp2startFan: 'C',
    config_maxMosfetTemp: 'C',
    config_brake_state: 'enum',
    config_controlled_Braking_pressure: 'bar',
    config_number_of_batteries: 'number',
    config_rideLength: 'm',
    config_NumInvertersEnabled: 'number',
    reset_run: 'boolean',
    fat_time: 'DateTimeFatFS',
    sd_card_flush: 'boolean',
    brake_engage: 'boolean',
    vcu_set_state: 'enum',
    pod_reset_error: 'boolean',
    vcu_software_reset: 'boolean',
    bms_software_reset_left: 'boolean',
    bms_software_reset_right: 'boolean',
    bms_balancing: 'boolean',
    inverter_software_reset: 'boolean',
    inverter_adc_calibrate: 'boolean',
    inverter_do_foo: 'boolean',
  }
};

module.exports = {
    "typeset": frame_ctrl_typeset
};
