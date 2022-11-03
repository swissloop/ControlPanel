/**
 * @file      typeset_telemetry_frame.js
 * @brief     jBinary telemetry frame Typeset
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

const frame_telemetry_typeset = 
{
  'jBinary.all': 'Data',
  'jBinary.littleEndian': true,
  Length: 632,
  SyncWord: 'FECA',
  Data: {
    Sync: { SYNC: 'uint16' },
    State: {
      STATE: 'uint8',
      VCU_EMERGENCY_REASON: 'uint32',
      VCU_ERRORS: 'uint32',
      RUN_TIMER: 'uint32',
      LOG_FILE_NUM: 'uint16',
      LOG_DISCARDED_DATA: 'uint8'
    },
    Brake: {
      BRAKE_ENGAGE: 'uint8',
      BRAKE_STATE: 'uint8',
      BRAKE_VALVEEMERGENCYBRAKE: 'uint8',
      BRAKE_VALVEENGAGEBRAKE: 'uint8',
      BRAKE_CONTROLLEDBRAKINGPRESSURE: 'float32',
      BRAKE_PRESSUREREGULATORIN: 'float32',
      BRAKE_SENSORLEFTENGAGED: 'uint8',
      BRAKE_SENSORRIGHTENGAGED: 'uint8',
      BRAKE_BRAKEDISTANCE: 'uint16',
      BRAKE_BRAKEENGAGETIMELEFT: 'uint16',
      BRAKE_BRAKEENGAGETIMERIGHT: 'uint16',
      BRAKE_TANK: 'uint32',
      BRAKE_LEFT_ACTION: 'uint16',
      BRAKE_LEFT_RELEASE: 'uint16',
      BRAKE_RIGHT_ACTION: 'uint16',
      BRAKE_RIGHT_RELEASE: 'uint16'
    },
    Velocity: {
      CORRAIL_VELOCITY: 'int32',
      CORRAIL_DISTANCE: 'uint32',
      CORRAIL_MAX_VELOCITY: 'uint32',
      CORRAIL_OFFSET_AFTER_RESET: 'uint32',
      GAM900_ACCELERATION_X: 'int32',
      GAM900_ACCELERATION_Y: 'int32',
      COMBINED_VELOCITY: 'int16'
    },
    OM20: {
      OM20_FRONT_FINDOWN: 'uint16',
      OM20_FRONT_FINLEFT: 'uint32',
      OM20_FRONT_FINRIGHT: 'uint32',
      OM20_FRONT_CHASSISLEFT: 'uint16',
      OM20_FRONT_CHASSISRIGHT: 'uint16',
      OM20_BACK_FINDOWN: 'uint16',
      OM20_BACK_FINLEFT: 'uint32',
      OM20_BACK_FINRIGHT: 'uint32',
      OM20_BACK_CHASSISLEFT: 'uint16',
      OM20_BACK_CHASSISRIGHT: 'uint16'
    },
    Motor_Temperatures: {
      TEMP_PT100_2: [ 'array', 'uint8', 7 ],
      TEMP_PTC_1: [ 'array', 'uint8', 8 ],
      TEMP_PT100_MAX: 'uint8',
      TEMP_PTC_MAX: 'uint8'
    },
    LV_Batteries: {
      LV_BAT1_CURRENT: 'float32',
      LV_BAT1_VOLTAGE: 'float32',
      LV_BAT1_POWER: 'float32',
      LV_BAT2_CURRENT: 'float32',
      LV_BAT2_VOLTAGE: 'float32',
      LV_BAT2_POWER: 'float32'
    },
    HV_Batteries: {
      HV_ISOLATION: 'uint8',
      HV_DO_PRECHARGE: 'uint8',
      HV_PRECHARGE_DONE: 'uint8',
      NUMBER_OF_BATTERIES: 'uint8'
    },
    HV_Left: {
      HV_L_READY: 'uint8',
      HV_L_ERROR: 'uint32',
      HV_L_STATE: 'uint8',
      HV_L_BALANCING: 'uint8',
      HV_L_VOLTAGE: 'uint16',
      HV_L_CURRENT: 'int16',
      HV_L_MIN_CELL_VOLTAGE: 'float32',
      HV_L_MAX_CELL_VOLTAGE: 'float32',
      HV_L_MAX_CELL_TEMP: 'float32',
      HV_L_VOLTAGES: [ 'array', 'uint8', 96 ],
      HV_L_TEMPERATURES: [ 'array', 'uint8', 48 ]
    },
    HV_Right: {
      HV_R_READY: 'uint8',
      HV_R_ERROR: 'uint32',
      HV_R_STATE: 'uint8',
      HV_R_BALANCING: 'uint8',
      HV_R_VOLTAGE: 'uint16',
      HV_R_CURRENT: 'int16',
      HV_R_MIN_CELL_VOLTAGE: 'float32',
      HV_R_MAX_CELL_VOLTAGE: 'float32',
      HV_R_MAX_CELL_TEMP: 'float32',
      HV_R_VOLTAGES: [ 'array', 'uint8', 96 ],
      HV_R_TEMPERATURES: [ 'array', 'uint8', 48 ]
    },
    FPGA: {
      FPGA_CURRENT_ADC_VALUES: [ 'array', 'uint16', 8 ],
      FPGA_CURRENT_STATUS: [ 'array', 'uint8', 8 ],
      FPGA_POSITION: 'uint8',
      FPGA_PHASE: 'uint8',
      FPGA_SUBPHASE: 'uint8',
      FPGA_FULL_POSITION: 'uint16',
      FPGA_IREF: 'uint8',
      FPGA_PULLUP_CURRENT: 'uint8',
      FPGA_ZERO_CURRENT: 'uint8'
    },
    Inverter: {
      READY: 'uint8',
      SHUTDOWNDONE: 'uint8',
      ICUFPGAREADY: 'uint8',
      ICUFPGASTATE: 'uint8',
      ICUFPGASTATUS: 'uint32',
      ICUFPGAREADYBITS: 'uint16',
      ICUMCUSTATE: 'uint8',
      ICUMCUSTATUS: 'uint32',
      GD_STATUS: 'uint32',
      MAX_CURRENT: 'uint8',
      BOARD_VOLTAGES: [ 'array', 'float32', 4 ],
      TEMPERATURE_MOSFETS: [ 'array', 'uint8', 12 ],
      MAX_TEMP: 'uint8',
      REAL_POWER: 'int16',
      REACTIVE_POWER: 'int16'
    },
    Configuration: {
      CONFIG_RUNTYPE: 'uint8',
      CONFIG_PWMMETHOD: 'uint8',
      CONFIG_BANDWIDTHLOW: 'float32',
      CONFIG_BANDWIDTHHIGH: 'float32',
      CONFIG_MAXVOLTAGE: 'float32',
      CONFIG_TARGETCURRENT: 'float32',
      CONFIG_ZEROCURRENT: 'float32',
      CONFIG_OVERCURRENTLIMIT_LO: 'float32',
      CONFIG_OVERCURRENTLIMIT_HI: 'float32',
      CONFIG_ADC_MAXOFFSET: 'float32',
      CONFIG_ADC_MAXNOISERANGE: 'float32',
      CONFIG_RUNFORWARD: 'uint8',
      CONFIG_RUNDURATION: 'float32',
      CONFIG_TRACKLENGTH: 'uint8',
      CONFIG_SETPOSITION: 'uint8',
      CONFIG_RUNLENGTH: 'uint8',
      CONFIG_PROPTRACKLENGTH: 'uint8',
      CONFIG_TEMP2STARTFAN: 'float32',
      CONFIG_MAXMOSFETTEMP: 'float32',
      CONFIG_RIDELENGTH: 'float32',
      CONFIG_NUMINVERTERSENABLED: 'uint8'
    },
    END: { TELEMETRY_FRAME_END: 'uint32' }
  },
  Unit: {
    Sync: { SYNC: '0xCAFE' },
    State: {
      STATE: 'enum',
      VCU_EMERGENCY_REASON: 'enum',
      VCU_ERRORS: 'enum',
      RUN_TIMER: 'ms',
      LOG_FILE_NUM: 'number',
      LOG_DISCARDED_DATA: 'boolean'
    },
    Brake: {
      BRAKE_ENGAGE: 'boolean',
      BRAKE_STATE: 'enum',
      BRAKE_VALVEEMERGENCYBRAKE: 'boolean',
      BRAKE_VALVEENGAGEBRAKE: 'boolean',
      BRAKE_CONTROLLEDBRAKINGPRESSURE: 'bar',
      BRAKE_PRESSUREREGULATORIN: 'bar',
      BRAKE_SENSORLEFTENGAGED: 'boolean',
      BRAKE_SENSORRIGHTENGAGED: 'boolean',
      BRAKE_BRAKEDISTANCE: 'm',
      BRAKE_BRAKEENGAGETIMELEFT: 'ms',
      BRAKE_BRAKEENGAGETIMERIGHT: 'ms',
      BRAKE_TANK: 'bar',
      BRAKE_LEFT_ACTION: 'bar',
      BRAKE_LEFT_RELEASE: 'bar',
      BRAKE_RIGHT_ACTION: 'bar',
      BRAKE_RIGHT_RELEASE: 'bar'
    },
    Velocity: {
      CORRAIL_VELOCITY: 'm/s',
      CORRAIL_DISTANCE: 'm',
      CORRAIL_MAX_VELOCITY: 'm/s',
      CORRAIL_OFFSET_AFTER_RESET: 'm',
      GAM900_ACCELERATION_X: 'm/ss',
      GAM900_ACCELERATION_Y: 'm/ss',
      COMBINED_VELOCITY: 'm/s'
    },
    OM20: {
      OM20_FRONT_FINDOWN: 'mm',
      OM20_FRONT_FINLEFT: 'um',
      OM20_FRONT_FINRIGHT: 'um',
      OM20_FRONT_CHASSISLEFT: 'mm',
      OM20_FRONT_CHASSISRIGHT: 'mm',
      OM20_BACK_FINDOWN: 'mm',
      OM20_BACK_FINLEFT: 'um',
      OM20_BACK_FINRIGHT: 'um',
      OM20_BACK_CHASSISLEFT: 'mm',
      OM20_BACK_CHASSISRIGHT: 'mm'
    },
    Motor_Temperatures: {
      TEMP_PT100_2: '°C',
      TEMP_PTC_1: 'kOhm',
      TEMP_PT100_MAX: '°C',
      TEMP_PTC_MAX: 'kOhm'
    },
    LV_Batteries: {
      LV_BAT1_CURRENT: 'A',
      LV_BAT1_VOLTAGE: 'V',
      LV_BAT1_POWER: 'W',
      LV_BAT2_CURRENT: 'A',
      LV_BAT2_VOLTAGE: 'V',
      LV_BAT2_POWER: 'W'
    },
    HV_Batteries: {
      HV_ISOLATION: 'boolean',
      HV_DO_PRECHARGE: 'boolean',
      HV_PRECHARGE_DONE: 'boolean',
      NUMBER_OF_BATTERIES: 'number'
    },
    HV_Left: {
      HV_L_READY: 'boolean',
      HV_L_ERROR: 'enum',
      HV_L_STATE: 'enum',
      HV_L_BALANCING: 'boolean',
      HV_L_VOLTAGE: 'V',
      HV_L_CURRENT: 'A',
      HV_L_MIN_CELL_VOLTAGE: 'V',
      HV_L_MAX_CELL_VOLTAGE: 'V',
      HV_L_MAX_CELL_TEMP: '°C',
      HV_L_VOLTAGES: 'V',
      HV_L_TEMPERATURES: '°C'
    },
    HV_Right: {
      HV_R_READY: 'boolean',
      HV_R_ERROR: 'enum',
      HV_R_STATE: 'enum',
      HV_R_BALANCING: 'boolean',
      HV_R_VOLTAGE: 'V',
      HV_R_CURRENT: 'A',
      HV_R_MIN_CELL_VOLTAGE: 'V',
      HV_R_MAX_CELL_VOLTAGE: 'V',
      HV_R_MAX_CELL_TEMP: '°C',
      HV_R_VOLTAGES: 'V',
      HV_R_TEMPERATURES: '°C'
    },
    FPGA: {
      FPGA_CURRENT_ADC_VALUES: 'number',
      FPGA_CURRENT_STATUS: 'enum',
      FPGA_POSITION: 'number',
      FPGA_PHASE: 'number',
      FPGA_SUBPHASE: 'number',
      FPGA_FULL_POSITION: 'number',
      FPGA_IREF: 'enum',
      FPGA_PULLUP_CURRENT: 'enum',
      FPGA_ZERO_CURRENT: 'enum'
    },
    Inverter: {
      READY: 'enum',
      SHUTDOWNDONE: 'enum',
      ICUFPGAREADY: 'enum',
      ICUFPGASTATE: 'enum',
      ICUFPGASTATUS: 'enum',
      ICUFPGAREADYBITS: 'enum',
      ICUMCUSTATE: 'enum',
      ICUMCUSTATUS: 'enum',
      GD_STATUS: 'enum',
      MAX_CURRENT: 'V',
      BOARD_VOLTAGES: 'V',
      TEMPERATURE_MOSFETS: '°C',
      MAX_TEMP: '°C',
      REAL_POWER: 'W',
      REACTIVE_POWER: 'kvar'
    },
    Configuration: {
      CONFIG_RUNTYPE: 'enum',
      CONFIG_PWMMETHOD: 'enum',
      CONFIG_BANDWIDTHLOW: 'A',
      CONFIG_BANDWIDTHHIGH: 'A',
      CONFIG_MAXVOLTAGE: 'V',
      CONFIG_TARGETCURRENT: 'A',
      CONFIG_ZEROCURRENT: 'A',
      CONFIG_OVERCURRENTLIMIT_LO: 'A',
      CONFIG_OVERCURRENTLIMIT_HI: 'A',
      CONFIG_ADC_MAXOFFSET: 'A',
      CONFIG_ADC_MAXNOISERANGE: 'A',
      CONFIG_RUNFORWARD: 'boolean',
      CONFIG_RUNDURATION: 's',
      CONFIG_TRACKLENGTH: 'm',
      CONFIG_SETPOSITION: 'number',
      CONFIG_RUNLENGTH: 'number',
      CONFIG_PROPTRACKLENGTH: 'number',
      CONFIG_TEMP2STARTFAN: 'number',
      CONFIG_MAXMOSFETTEMP: 'number',
      CONFIG_RIDELENGTH: 'm',
      CONFIG_NUMINVERTERSENABLED: 'number'
    },
    END: { TELEMETRY_FRAME_END: '0xDECAFBAD' }
  },
  Factor: {
    Sync: { SYNC: 1 },
    State: {
      STATE: 1,
      VCU_EMERGENCY_REASON: 1,
      VCU_ERRORS: 1,
      RUN_TIMER: 1,
      LOG_FILE_NUM: 1,
      LOG_DISCARDED_DATA: 1
    },
    Brake: {
      BRAKE_ENGAGE: 1,
      BRAKE_STATE: 1,
      BRAKE_VALVEEMERGENCYBRAKE: 1,
      BRAKE_VALVEENGAGEBRAKE: 1,
      BRAKE_CONTROLLEDBRAKINGPRESSURE: 1,
      BRAKE_PRESSUREREGULATORIN: 1,
      BRAKE_SENSORLEFTENGAGED: 1,
      BRAKE_SENSORRIGHTENGAGED: 1,
      BRAKE_BRAKEDISTANCE: 1000,
      BRAKE_BRAKEENGAGETIMELEFT: 1,
      BRAKE_BRAKEENGAGETIMERIGHT: 1,
      BRAKE_TANK: 1000,
      BRAKE_LEFT_ACTION: 1000,
      BRAKE_LEFT_RELEASE: 1000,
      BRAKE_RIGHT_ACTION: 1000,
      BRAKE_RIGHT_RELEASE: 1000
    },
    Velocity: {
      CORRAIL_VELOCITY: 1000,
      CORRAIL_DISTANCE: 1000,
      CORRAIL_MAX_VELOCITY: 1000,
      CORRAIL_OFFSET_AFTER_RESET: 1000,
      GAM900_ACCELERATION_X: 1000,
      GAM900_ACCELERATION_Y: 1000,
      COMBINED_VELOCITY: 1000
    },
    OM20: {
      OM20_FRONT_FINDOWN: 100,
      OM20_FRONT_FINLEFT: 10,
      OM20_FRONT_FINRIGHT: 10,
      OM20_FRONT_CHASSISLEFT: 100,
      OM20_FRONT_CHASSISRIGHT: 100,
      OM20_BACK_FINDOWN: 100,
      OM20_BACK_FINLEFT: 10,
      OM20_BACK_FINRIGHT: 10,
      OM20_BACK_CHASSISLEFT: 100,
      OM20_BACK_CHASSISRIGHT: 100
    },
    Motor_Temperatures: {
      TEMP_PT100_2: 1,
      TEMP_PTC_1: 125,
      TEMP_PT100_MAX: 1,
      TEMP_PTC_MAX: 125
    },
    LV_Batteries: {
      LV_BAT1_CURRENT: 1,
      LV_BAT1_VOLTAGE: 1,
      LV_BAT1_POWER: 1,
      LV_BAT2_CURRENT: 1,
      LV_BAT2_VOLTAGE: 1,
      LV_BAT2_POWER: 1
    },
    HV_Batteries: {
      HV_ISOLATION: 1,
      HV_DO_PRECHARGE: 1,
      HV_PRECHARGE_DONE: 1,
      NUMBER_OF_BATTERIES: 1
    },
    HV_Left: {
      HV_L_READY: 1,
      HV_L_ERROR: 1,
      HV_L_STATE: 1,
      HV_L_BALANCING: 1,
      HV_L_VOLTAGE: 50,
      HV_L_CURRENT: 50,
      HV_L_MIN_CELL_VOLTAGE: 1,
      HV_L_MAX_CELL_VOLTAGE: 1,
      HV_L_MAX_CELL_TEMP: 1,
      HV_L_VOLTAGES: 50,
      HV_L_TEMPERATURES: 2
    },
    HV_Right: {
      HV_R_READY: 1,
      HV_R_ERROR: 1,
      HV_R_STATE: 1,
      HV_R_BALANCING: 1,
      HV_R_VOLTAGE: 50,
      HV_R_CURRENT: 50,
      HV_R_MIN_CELL_VOLTAGE: 1,
      HV_R_MAX_CELL_VOLTAGE: 1,
      HV_R_MAX_CELL_TEMP: 1,
      HV_R_VOLTAGES: 50,
      HV_R_TEMPERATURES: 2
    },
    FPGA: {
      FPGA_CURRENT_ADC_VALUES: 1,
      FPGA_CURRENT_STATUS: 1,
      FPGA_POSITION: 1,
      FPGA_PHASE: 1,
      FPGA_SUBPHASE: 1,
      FPGA_FULL_POSITION: 1,
      FPGA_IREF: 1,
      FPGA_PULLUP_CURRENT: 1,
      FPGA_ZERO_CURRENT: 1
    },
    Inverter: {
      READY: 1,
      SHUTDOWNDONE: 1,
      ICUFPGAREADY: 1,
      ICUFPGASTATE: 1,
      ICUFPGASTATUS: 1,
      ICUFPGAREADYBITS: 1,
      ICUMCUSTATE: 1,
      ICUMCUSTATUS: 1,
      GD_STATUS: 1,
      MAX_CURRENT: 1,
      BOARD_VOLTAGES: 1,
      TEMPERATURE_MOSFETS: 2,
      MAX_TEMP: 2,
      REAL_POWER: 1,
      REACTIVE_POWER: 1000
    },
    Configuration: {
      CONFIG_RUNTYPE: 1,
      CONFIG_PWMMETHOD: 1,
      CONFIG_BANDWIDTHLOW: 1,
      CONFIG_BANDWIDTHHIGH: 1,
      CONFIG_MAXVOLTAGE: 1,
      CONFIG_TARGETCURRENT: 1,
      CONFIG_ZEROCURRENT: 1,
      CONFIG_OVERCURRENTLIMIT_LO: 1,
      CONFIG_OVERCURRENTLIMIT_HI: 1,
      CONFIG_ADC_MAXOFFSET: 1,
      CONFIG_ADC_MAXNOISERANGE: 1,
      CONFIG_RUNFORWARD: 1,
      CONFIG_RUNDURATION: 1,
      CONFIG_TRACKLENGTH: 1,
      CONFIG_SETPOSITION: 1,
      CONFIG_RUNLENGTH: 1,
      CONFIG_PROPTRACKLENGTH: 1,
      CONFIG_TEMP2STARTFAN: 1,
      CONFIG_MAXMOSFETTEMP: 1,
      CONFIG_RIDELENGTH: 1,
      CONFIG_NUMINVERTERSENABLED: 1
    },
    END: { TELEMETRY_FRAME_END: 1 }
  }
};
module.exports = {
    "typeset": frame_telemetry_typeset
};
        