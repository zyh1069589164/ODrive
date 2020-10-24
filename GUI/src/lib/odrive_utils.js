import store from "../store.js";
import * as socketio from "../comms/socketio.js";

// helper functions and utilities for getting ODrive values

// given a path like "odrive0.axis0.config.blah", return the value
export function getParam(path) {
    let keys = path.split('.');
    if (store.state.ODrivesConnected[keys[0]]) {
        let odriveObj = store.state.odrives;
        for (const key of keys) {
            odriveObj = odriveObj[key];
        }
        return odriveObj;
    }
    else {
        console.log("getParam for " + path + " is for disconnected ODrive");
        return undefined;
    }
}

// wrapper for val field
export function getVal(path) {
    return getParam(path + ".val");
}

// wrapper for readonly field
export function getReadonly(path) {
    return getParam(path + '.readonly');
}

export function fetchParam(path) {
    if (store.state.serverConnected){
        socketio.sendEvent({
            type: "getProperty",
            data: {path: path},
        });
    }
}

export function parseMath(inString) {
    // given an input string that is valid arithmetic, use eval() to evaluate it
    let allowedChars = "0123456789eE/*-+.()";
    let send = true;
    for (const c of inString) {
        if (!allowedChars.includes(c)) {
            send = false;
        }
    }
    if (send) {
        return eval(inString);
    }
    else {
        return false;
    }
}

export function putVal(path, value) {
    console.log("path: " + path + ", val: " + value + ", type: " + typeof value);
    if (store.state.ODrivesConnected[path.split('.')[0]]) {
        socketio.sendEvent({
            type: "setProperty",
            data: {path: path, val: value, type: typeof value}
        });
    }
    else {
        console.log("requesting " + path + " from disconnected odrive")
    }
}

// path is path to function, args is list of parameters
export function callFcn(path, args = []) {
    console.log("calling function: " + path);
    socketio.sendEvent({
        type: "callFunction",
        data: {path: path, args: args}
    });
}

export function odriveMinorVersion(odrive) {
    // given an odrive object, return the minor version
    return odrive.fw_version_minor.val;
}

export function getUnit(odrive, path) {
    let unit = undefined;
    for ( const key of Object.keys(odriveUnits[odriveMinorVersion(odrive)]) ) {
        if (path.includes(key)) {
          unit = odriveUnits[odriveMinorVersion(odrive)][key];
        }
    }
    return unit;
}

// standins for wizard and gui unit displays
// TODO - convert between odrive api units and user-defined units like degrees and rpm
export let odriveUnits = {
    "4": {
        "config.brake_resistance": "Ohms",
        "controller.pos_setpoint": "counts",
        "controller.vel_setpoint": "counts/s",
        "controller.current_setpoint": "Amps",
        "controller.config.vel_limit": "counts/s",
        "controller.config.vel_ramp_rate": "counts/s^2",
        "encoder.pos_estimate": "counts",
        "encoder.vel_estimate": "counts/s",
        "trap_traj.config.vel_limit": "counts/s",
        "trap_traj.config.accel_limit": "counts/s^2",
        "trap_traj.config.decel_limit": "counts/s^2",
        "motor.config.phase_resistance": "Ohms",
        "motor.config.phase_inductance": "Henries",
        "motor.config.current_lim": "Amps",
        "vbus_voltage": "Volts",
    },
    "5": {
        "config.brake_resistance": "Ohms",
        "controller.input_pos": "turns",
        "controller.input_vel": "turns/s",
        "controller.torque_setpoint": "Amps",
        "controller.input_torque": "N/m",
        "controller.config.vel_limit": "turns/s",
        "controller.config.vel_ramp_rate": "turns/s^2",
        "encoder.pos_estimate": "turns",
        "encoder.vel_estimate": "turns/s",
        "trap_traj.config.vel_limit": "turns/s",
        "trap_traj.config.accel_limit": "turns/s^2",
        "trap_traj.config.decel_limit": "turns/s^2",
        "motor.config.phase_resistance": "Ohms",
        "motor.config.phase_inductance": "Henries",
        "motor.config.current_lim": "Amps",
        "motor.config.torque_lim": "N/m",
        "vbus_voltage": "Volts",
    }
}