// keyboard style from https://codepen.io/irajsuhail/pen/mYMZVm
// led matrix style from https://codepen.io/djan/pen/gOWdqo




const REG_MAX_LENGTH = 256;
const TIMEOUT_UPDATE_INTERVAL = 500; // Interval update in milliseconds
const MAX_TIMEOUT_COUNTER = 100; // Timer in seconds for connection timeout.
const AGCSS_SERVICE_UUID = '6e400001-c352-11e5-953d-0002a5d5c51b';
const AGCSS_WRITE_CHAR_UUID = '6e400002-c352-11e5-953d-0002a5d5c51b';
const AGCSS_NOTIFY_CHAR_UUID = '6e400003-c352-11e5-953d-0002a5d5c51b';
const AGCSS_DESCRIPTOR_UUID = '00002902-0000-1000-8000-00805f9b34fb';
let _writeCharacteristic = null;
let _writeDescriptor = null;

let button = document.getElementById('find-bluetooth-button');
button.addEventListener('click', handleBluetoothFind);

let buttonDisconnect = document.getElementById('disconnect-bluetooth-button');
buttonDisconnect.addEventListener('click', handleBluetoothDisconnect);


// Get a reference to the SVG element
const svgElevator = document.getElementById('svg_elevator');
var svgDoc = null;





// const mycheckbox = document.getElementById('settings_visibility');
// mycheckbox.addEventListener('change', settings_visibility_change);


var bluetoothDevice; // Careful, is to handle disconnection from a button. newly created and not necesarely to work.

let registration_number = new Uint8Array(REG_MAX_LENGTH);


var time_timeout = 0;
var timer_timeout = 0;
//timeout_start();
// Interval in seconds.
function timeout_start() {
	timeout_refill();
	var timer_timeout = setInterval(timeout_handler, TIMEOUT_UPDATE_INTERVAL);
	document.getElementById("myBar").hidden = false;
}

function timeout_handler(event) {
	//console.log(timer_timeout);
	time_timeout--;
	document.getElementById("myBar").style.width = ((time_timeout * TIMEOUT_UPDATE_INTERVAL) / (MAX_TIMEOUT_COUNTER * 1000)) * 100 + "%";
	if (time_timeout <= 0) {
		clearInterval(timer_timeout);
	}
}

function timeout_refill() {
	time_timeout = MAX_TIMEOUT_COUNTER * 1000 / TIMEOUT_UPDATE_INTERVAL;
	document.getElementById("myBar").style.width = 100 + "%";
}

function timeout_clear() {
	time_timeout = 0;
	clearTimeout(timer_timeout);
	document.getElementById("myBar").style.width = ((time_timeout * TIMEOUT_UPDATE_INTERVAL) / (MAX_TIMEOUT_COUNTER * 1000)) * 100 + "%";
	document.getElementById("myBar").hidden = true;
}

// main.js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/js/sw.js').then((registration) => {
        console.log('Service Worker registered:', registration);
    }).catch((error) => {
        console.error('Service Worker registration failed:', error);
    });
}


//BlockTypes
const eBlocktypes = {
	MACHINE_ID             :   1,
	ID_NOT_SAME_MACHINE    :   2,
	ID                     :   3,
	ID_SUB_UNIT_RECEIVER   :   4,
	ID_BEGINNING_OF_BRANCH :   5,
	ID_COMMUNICATION_UNIT  :   6,
	ID_EXTRA               :  16,
	ID_TAG                 :  17,
	HARDWARE               :  31,
	SYSTEM_INFO            :  32,
	BOOT_INFO              :  33,
	APPLICATION_INFO       :  34,
	SYSTEM_PARAMETERS      :  35,
	BOOT_PARAMETERS        :  36,
	APP_PARAMS             :  37,
	SYSTEM_ALARM           :  38,
	BOOT_ALARM             :  39,
	APPLICATION_ALARM      :  40,
	DATE_TIME              :  41,
	NAME                   :  42,
	MENU                   :  43,
	ACCESS                 :  44,
	SCHEDULE               :  45,
	OPERATION_DATA         :  46,
	OLD_APPLICATION_ALARM  :  47,
	TEXT_BLOCK             :  48,
	IO                     :  49,
	SENSOR_DATA            :  50,
	TIMER                  :  51,
	JSON                   :  52,
	COMMUNICATION          :  53,
	CAN                    :  54,
	SDO                    :  55,
	SDO_TABLE              :  56,
	STATE_MACHINES         :  57,
	MODBUS                 :  58,
	LIBRARY                :  59,
	MOMENTARY_DATA         :  60,
	ACCUMULATED_DATA       :  61,
	TIME_SAMPLED_DATA      :  62,
	EVENT_SAMPLED_DATA     :  63,
	GLOBAL_STATE_MACHINES  :  64,
	VENDOR                 : 128,
	USER                   : 129,
	COMPANY                : 130,
	MACHINE                : 131,
	MACHINE_TYPE           : 132,
	UNIT_SW                : 133,
	SERVICE_NOTES          : 134,
	DOCUMENT               : 135,
	REGISTRATION           : 224,
	READING                : 225,
	PROGRAMMING            : 226,
	VIRTUAL_PANEL          : 227,
	SYSTEM                 : 228,
	TRACE_LOG              : 229,
	ERROR                  : 254,
	ROUTE_PACKAGE          : 255
}


function getEnumNameByValue(enumObj, value) {
	return Object.keys(enumObj).find((key) => enumObj[key] === value);
}

function colorBrighten(color, factor) {
	// Convert color from hexadecimal to RGB
	var red = parseInt(color.substring(1, 3), 16);
	var green = parseInt(color.substring(3, 5), 16);
	var blue = parseInt(color.substring(5, 7), 16);

	// Convert RGB to HSL
	var r = red / 255;
	var g = green / 255;
	var b = blue / 255;

	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h /= 6;
	}

	// Increase lightness (L) by the given factor
	l *= factor;
	l = Math.min(Math.max(l, 0), 1); // Clamp value to the valid range (0-1)

	// Convert HSL to RGB
	if (s === 0) {
		red = green = blue = l; // achromatic
	} else {
		var hue2rgb = function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;

		red = hue2rgb(p, q, h + 1 / 3);
		green = hue2rgb(p, q, h);
		blue = hue2rgb(p, q, h - 1 / 3);
	}

	// Convert back to hexadecimal
	red = Math.round(red * 255);
	green = Math.round(green * 255);
	blue = Math.round(blue * 255);
	var updatedColor = '#' + ((1 << 24) | (red << 16) | (green << 8) | blue).toString(16).slice(1);

	return updatedColor;
}

class BlockHeader {
	constructor(blockType, blockFormat, blockLength) {
		this.type = blockType;
		this.format = blockFormat;
		this.length = blockLength;
	}
}



const eDisplay_dir = {
	NONE: 0,
	DOWN: 1,
	UP: 2
};

const eDisplay_pic = {
	ZERO: 0,
	NEG1: 129,
	NEG2: 130,
	NEG3: 131,
	NEG4: 132,
	NEG5: 133,
	NEG6: 134,
	NEG7: 135,
	NEG8: 136,
	NEG9: 137,
	NEG10: 138,
	B: 139,
	E: 140,
	G: 141,
	P: 142,
	T: 143,
	F0: 144,
	F1: 145,
	F2: 146,
	F3: 147,
	F4: 148,
	F5: 149,
	F6: 150,
	F7: 151,
	F8: 152,
	F9: 153,
	DOOR_OPEN: 154,
	CD: 155,
	PD: 156,
	X: 157,
	HW: 158,
	FA: 159,
	GONG: 160,
	DOWN: 161,
	UP: 162,
	UPDOWN: 163,
	LINE: 164,
	BLANK: 165,
}


//globalStateMachine2


const eG_State_64_2 = {
    NO_STATE: 0,
    INIT: 1,
    IDLE: 2,
    SET_PICTURE: 3,
    SET_PICTURE_END: 4,
    CHANGE_BANK: 5,
    CHANGE_BANK_END: 6
};

const eG_CurrentBank_64_2 = {
    BANK_1TO32: 0,
    BANK_33TO64: 1,
    BANK_65TO96: 2,
    BANK_97TO128: 3
};

const eG_Direction_64_2 = {
    NONE: 0,
    DOWN: 1,
    UP: 2
};


class Control_64_2 {
    constructor() {
        this.direction = eG_Direction_64_2.NONE;
        this.picture = eDisplay_pic.BLANK;
    }
}

class Display_64_2 {
    constructor() {
        this.state = eG_State_64_2.NO_STATE;
        this.currentBank = eG_CurrentBank_64_2.BANK_1TO32;
        this.currentPicture = 0;
        this.displaycode = 0;
        this.control = new Control_64_2();
    }
}

class IO_64_2 {
    constructor() {
        this.keyboardIn = 0;
        this.keyboardOut = 0;
        this.display1Out = 0;
        this.display2Out = 0;
    }
}

class G_GlobalStateMachines2 {
    constructor(blockHeader, display1, display2, iO) {
        this.blockHeader = blockHeader;
        this.display = [display1, display2];
        this.iO = iO;
    }
}

//Access7
class Type_44_7 {
    constructor() {
		this.material = 0;
		this.type2 = 0;
		this.emergency = 0;
		this.down = 0;
		this.up = 0;
		this.destination = 0;
    }
}

class Status_44_7 {
    constructor() {
		this.f3 = 0;
		this.baseRxChk = 0;
		this.emergencyButton = 0;
		this.calibrating = 0;
		this.parked = 0;
		this.inspection = 0;
		this.fire = 0;
		this.alarm = 0;
		this.obstruction = 0;
		this.cageOnly = 0;
		this.outOfOrder = 0;
		this.overload = 0;
		this.fulload = 0;
		this.upDirection = 0;
		this.unlockedDoors = 0;
		this.closedDoors = 0;
		this.moving = 0;
		this.busy = 0;
    }
}

class Current_44_7 {
    constructor() {
        this.landing = 0;
        this.type = new Type_44_7();
        this.displayCurrent = 0;
        this.displayTarget = 0;
        this.status = new Status_44_7();
    }
}

class Target_44_7 {
    constructor() {
        this.landing = 0;
        this.type = new Type_44_7();
    }
}

class LandingData_44_7 {
    constructor() {
        this.noLandings = 0;
        this.landing = 0;
        this.display = 0; 
        this.landingBoxConfig = 0; 
    }
}

class Access7 {
    constructor() {
        this.blockHeader = new BlockHeader();
        this.current = new Current_44_7();
        this.target = new Target_44_7();
        this.landingData = new LandingData_44_7();
    }
}


//Momentary7

class Flags_60_7 {
	constructor() {
		this.spare3 = 0;
		this.spare2 = 0;
		this.spare = 0;
		this.emgInBase = 0;
		this.cageOnly = 0;
		this.overload = 0;
		this.fullLoad = 0;
		this.gas = 0;
		this.flood = 0;
		this.highWind = 0;
		this.blockedLift = 0;
		this.moving = 0;
		this.doorOpen = 0;
		this.calibrationMode = 0;
		this.programmingMode = 0;
		this.inspectionMode = 0;

	}
}

class Alarm_60_7 {
	constructor() {
		this.spare3 = 0;
		this.spare2 = 0;
		this.spare = 0;
		this.encoderError = 0;
		this.temperatureFault = 0;
		this.calibrationFault = 0;
		this.configError = 0;
		this.ctrlCircuit = 0;
		this.speedFault = 0;
		this.lockFault = 0;
		this.eNLockError = 0;
		this.doorError = 0;
		this.motorError = 0;
		this.safetyCircuit = 0;
		this.adaptiveError = 0;
	}
}

class Status_60_7 {
	constructor() {
		this.timeSinceStart = 0;
		this.distanceTraveled = 0;
		this.position = 0;
		this.currentSpeed = 0;
		this.targetSpeed = 0;
		this.voltageDC = 0;
		this.battery = 0;
		this.batteryChargingVoltage = 0;
		this.internalTemperature = 0;
		this.loadcell1 = 0;
		this.loadcell2 = 0;
		this.flags = new Flags_60_7();
		this.alarm = new Alarm_60_7();
	}
}

const eType_60_7 = {
	e60_7_TYPE_NONE: 0,
	e60_7_TYPE_DESTINATION: 1,
	e60_7_TYPE_UP: 2,
	e60_7_TYPE_DOWN: 3,
	e60_7_TYPE_UPDOWN: 4,
	e60_7_TYPE_EMERGENCY: 5,
	e60_7_TYPE_TYPE2: 6,
	e60_7_TYPE_MATERIAL: 7
};


class Trip_60_7 {
	constructor() {
		this.type = eType_60_7.e60_7_TYPE_NONE;
		this.targetLanding = 0;
		this.currentLanding = 0;
		this.pastLanding = 0;
	}
}


// MomentaryData7 enums
const eEventType_60_7 = {
	e60_7_EVENTTYPE_HEARTBEAT: 0,
	e60_7_EVENTTYPE_JOB: 1,
	e60_7_EVENTTYPE_POWERUP: 2,
	e60_7_EVENTTYPE_POWERDOWN: 3,
	e60_7_EVENTTYPE_ALARM: 4,
	e60_7_EVENTTYPE_BLOCKED: 5
};

class MomentaryData7 {
	constructor(blockType, blockFormat, blockLength) {
		this.blockHeader = new BlockHeader(blockType, blockFormat, blockLength);
		this.eventType = eEventType_60_7.e60_7_EVENTTYPE_HEARTBEAT;
		this.trip = new Trip_60_7();
		this.status = new Status_60_7();
	}
}


//Access1
class Flags_44_1 {
	constructor() {
		this.spare2 = 0;
		this.spare = 0;
		this.clearError = 0;
		this.emgStopBase = 0;
		this.cageOnly = 0;
		this.clearLandingCalls = 0;
		this.cageRxChk = 0;
	}

	pack() {
		let packedValue = 0;
		packedValue |= (this.spare2 & 0xFF) << 0;
		packedValue |= (this.spare & 0x7) << 8;
		packedValue |= (this.clearError & 0x1) << 11;
		packedValue |= (this.emgStopBase & 0x1) << 12;
		packedValue |= (this.cageOnly & 0x1) << 13;
		packedValue |= (this.clearLandingCalls & 0x1) << 14;
		packedValue |= (this.cageRxChk & 0x1) << 15;
		return packedValue;
	}
}

const eCallType_44_1 = {
	e44_1_CALLTYPE_NONE: 0,
	e44_1_CALLTYPE_DESTINATION: 1,
	e44_1_CALLTYPE_UP: 2,
	e44_1_CALLTYPE_DOWN: 3,
	e44_1_CALLTYPE_UPDOWN: 4,
	e44_1_CALLTYPE_EMERGENCY: 5,
	e44_1_CALLTYPE_TYPE2: 6,
	e44_1_CALLTYPE_MATERIAL: 7,
};


class Access1 {
	constructor() {
		this.blockHeader = new BlockHeader();
		this.callType = eCallType_44_1.e44_1_CALLTYPE_NONE;
		this.landing = 0;
		this.flags = new Flags_44_1();
		this.landingBitMaskUp = 0n;
		this.landingBitMaskDown = 0n;
		this.checksum = 0n;
	}
}

// Enum for eG_Type_229_2
const eG_Type_229_2 = {
	NONE: 0,
	VERSION: 1,
	INFO: 2,
	WARNING: 3,
	ALARM: 4,
	ERROR: 5,
	SYS_INFO: 6,
	SYS_WARNING: 7,
	SYS_ALARM: 8,
	SYS_ERROR: 9,
	DEV_INFO: 10,
	DEV_WARNING: 11,
	DEV_ALARM: 12,
	DEV_ERROR: 13
};

// Enum for eG_Grade_229_2
const eG_Grade_229_2 = {
	NONE: 0,
	LOW: 32,
	MEDIUM: 64,
	HIGH: 92
};

// Enum for eG_Variable_229_2
const eG_Variable_229_2 = {
	OK: 0,
	ERROR: 1,
	READ_ERROR: 2,
	WRITE_ERROR: 3,
	ID_ERROR: 4,
	READ_OK: 5,
	WRITE_OK: 6,
	ID_OK: 7,
	NULLPOINTER: 8
};

class G_TraceLog2 {
	constructor(blockHeader, type, grade, row, variable, message) {
		this.blockHeader = new BlockHeader(eBlocktypes.TRACELOG, 2, 208);
		this.type = type;
		this.grade = grade;
		this.row = row;
		this.variable = variable;
		this.message = message;
	}
}

class INPUT_DIGITAL_IN_44_99 {
	constructor() {
		this.sysChk              = 0;
		this.btnPROG             = 0;
		this.btnSNL              = 0;
		this.btnDOWN             = 0;
		this.btnUP               = 0;
		this.inspDown            = 0;
		this.inpsUp              = 0;
		this.retardDown          = 0;
		this.retardUp            = 0;
		this.fullLoad            = 0;
		this.overload            = 0;
		this.inspection          = 0;
		this.controlOfContactors = 0;
		this.doorsLocked         = 0;
		this.doorsClosed         = 0;
		this.safetyCircuit       = 0;
	}

	pack() {
		let packedValue = 0;
		packedValue |= (this.sysChk             & 0x1) <<  0;
		packedValue |= (this.btnPROG             & 0x1) <<  1;
		packedValue |= (this.btnSNL              & 0x1) <<  2;
		packedValue |= (this.btnDOWN             & 0x1) <<  3;
		packedValue |= (this.btnUP               & 0x1) <<  4;
		packedValue |= (this.inspDown            & 0x1) <<  5;
		packedValue |= (this.inpsUp              & 0x1) <<  6;
		packedValue |= (this.retardDown          & 0x1) <<  7;
		packedValue |= (this.retardUp            & 0x1) <<  8;
		packedValue |= (this.fullLoad            & 0x1) <<  9;
		packedValue |= (this.overload            & 0x1) << 10;
		packedValue |= (this.inspection          & 0x1) << 11;
		packedValue |= (this.controlOfContactors & 0x1) << 12;
		packedValue |= (this.doorsLocked         & 0x1) << 13;
		packedValue |= (this.doorsClosed         & 0x1) << 14;
		packedValue |= (this.safetyCircuit       & 0x1) << 15;
		return packedValue;
	}
}


class OUTPUT_DIGITAL_IN_44_99 {
	constructor() {
		this.sysChk     = 0;
		this.v8         = 0;
		this.v4         = 0;
		this.v2         = 0;
		this.v1         = 0;
		this.g8         = 0;
		this.g4         = 0;
		this.g2         = 0;
		this.g1         = 0;
		this.speed2     = 0;
		this.speed1     = 0;
		this.sNLOrALARM = 0;
		this.dOWN       = 0;
		this.uP         = 0;
		this.door2      = 0;
		this.door1      = 0;
	}

}

class OUTPUT_44_99 {
	constructor() {
		this.encoder = 0;
		this.digital = new OUTPUT_DIGITAL_IN_44_99();
	}

}


class Access99{
	constructor() {
		this.blockHeader = new BlockHeader(eBlocktypes.ACCESS, 99, 6);
		this.input = new INPUT_DIGITAL_IN_44_99();
		this.output = new OUTPUT_44_99();
	}
}

class INPUT_IO_49_5 {
	constructor() {
		this.o_3_b7 = 0; this.o_3_b6 = 0; this.o_3_b5 = 0; this.o_3_b4 = 0;
		this.o_3_b3 = 0; this.o_3_b2 = 0; this.o_3_b1 = 0; this.o_3_b0 = 0;
		this.i_3_b7 = 0; this.i_3_b6 = 0; this.i_3_b5 = 0; this.i_3_b4 = 0;
		this.i_3_b3 = 0; this.i_3_b2 = 0; this.i_3_b1 = 0; this.i_3_b0 = 0;
		this.o_RL5_C = 0; this.o_RL6_C = 0; this.o_OUT1 = 0; this.o_OUT2 = 0;
		this.o_OUT3 = 0; this.o_OUT4 = 0; this.o_2_b1 = 0; this.o_2_b0 = 0;
		this.i_2_b7 = 0; this.i_2_b6 = 0; this.i_2_b5 = 0; this.i_2_b4 = 0;
		this.i_2_b3 = 0; this.i_2_b2 = 0; this.i_2_b1 = 0; this.i_2_b0 = 0;
		this.o_1_b7 = 0; this.o_1_b6 = 0; this.o_1_b5 = 0; this.o_1_b4 = 0;
		this.o_1_b3 = 0; this.o_1_b2 = 0; this.o_1_b1 = 0; this.o_1_b0 = 0;
		this.i_SAFETY_IN8 = 0; this.i_SAFETY_IN9 = 0; this.i_SAFETY_IN10 = 0; this.i_SAFETY_IN11 = 0;
		this.i_SAFETY_PDS = 0; this.i_DOORCLOSED = 0; this.i_SAFETY_OK = 0; this.i_K3_FB = 0;
		this.o_RL3_C = 0; this.o_RL4_C = 0; this.o_RL1_C = 0; this.o_RL2_C = 0;
		this.o_0_b3 = 0; this.o_0_b2 = 0; this.o_0_b1 = 0; this.o_0_b0 = 0;
		this.i_K1_FB = 0; this.i_K2_FB = 0; this.i_SAFETY_IN1 = 0; this.i_SAFETY_IN2 = 0;
		this.i_SAFETY_IN3 = 0; this.i_SAFETY_IN4 = 0; this.i_SAFETY_IN6 = 0; this.i_SAFETY_IN7 = 0;
	}
	pack() {
		let packedValue = BigInt(0);
		packedValue |= (BigInt(this.o_3_b7) & BigInt(0x1)) << BigInt(0);
		packedValue |= (BigInt(this.o_3_b6) & BigInt(0x1)) << BigInt(1);
		packedValue |= (BigInt(this.o_3_b5) & BigInt(0x1)) << BigInt(2);
		packedValue |= (BigInt(this.o_3_b4) & BigInt(0x1)) << BigInt(3);
		packedValue |= (BigInt(this.o_3_b3) & BigInt(0x1)) << BigInt(4);
		packedValue |= (BigInt(this.o_3_b2) & BigInt(0x1)) << BigInt(5);
		packedValue |= (BigInt(this.o_3_b1) & BigInt(0x1)) << BigInt(6);
		packedValue |= (BigInt(this.o_3_b0) & BigInt(0x1)) << BigInt(7);
		packedValue |= (BigInt(this.i_3_b7) & BigInt(0x1)) << BigInt(8);
		packedValue |= (BigInt(this.i_3_b6) & BigInt(0x1)) << BigInt(9);
		packedValue |= (BigInt(this.i_3_b5) & BigInt(0x1)) << BigInt(10);
		packedValue |= (BigInt(this.i_3_b4) & BigInt(0x1)) << BigInt(11);
		packedValue |= (BigInt(this.i_3_b3) & BigInt(0x1)) << BigInt(12);
		packedValue |= (BigInt(this.i_3_b2) & BigInt(0x1)) << BigInt(13);
		packedValue |= (BigInt(this.i_3_b1) & BigInt(0x1)) << BigInt(14);
		packedValue |= (BigInt(this.i_3_b0) & BigInt(0x1)) << BigInt(15);
		packedValue |= (BigInt(this.o_RL5_C) & BigInt(0x1)) << BigInt(16);
		packedValue |= (BigInt(this.o_RL6_C) & BigInt(0x1)) << BigInt(17);
		packedValue |= (BigInt(this.o_OUT1) & BigInt(0x1)) << BigInt(18);
		packedValue |= (BigInt(this.o_OUT2) & BigInt(0x1)) << BigInt(19);
		packedValue |= (BigInt(this.o_OUT3) & BigInt(0x1)) << BigInt(20);
		packedValue |= (BigInt(this.o_OUT4) & BigInt(0x1)) << BigInt(21);
		packedValue |= (BigInt(this.o_2_b1) & BigInt(0x1)) << BigInt(22);
		packedValue |= (BigInt(this.o_2_b0) & BigInt(0x1)) << BigInt(23);
		packedValue |= (BigInt(this.i_2_b7) & BigInt(0x1)) << BigInt(24);
		packedValue |= (BigInt(this.i_2_b6) & BigInt(0x1)) << BigInt(25);
		packedValue |= (BigInt(this.i_2_b5) & BigInt(0x1)) << BigInt(26);
		packedValue |= (BigInt(this.i_2_b4) & BigInt(0x1)) << BigInt(27);
		packedValue |= (BigInt(this.i_2_b3) & BigInt(0x1)) << BigInt(28);
		packedValue |= (BigInt(this.i_2_b2) & BigInt(0x1)) << BigInt(29);
		packedValue |= (BigInt(this.i_2_b1) & BigInt(0x1)) << BigInt(30);
		packedValue |= (BigInt(this.i_2_b0) & BigInt(0x1)) << BigInt(31);
		packedValue |= (BigInt(this.o_1_b7) & BigInt(0x1)) << BigInt(32);
		packedValue |= (BigInt(this.o_1_b6) & BigInt(0x1)) << BigInt(33);
		packedValue |= (BigInt(this.o_1_b5) & BigInt(0x1)) << BigInt(34);
		packedValue |= (BigInt(this.o_1_b4) & BigInt(0x1)) << BigInt(35);
		packedValue |= (BigInt(this.o_1_b3) & BigInt(0x1)) << BigInt(36);
		packedValue |= (BigInt(this.o_1_b2) & BigInt(0x1)) << BigInt(37);
		packedValue |= (BigInt(this.o_1_b1) & BigInt(0x1)) << BigInt(38);
		packedValue |= (BigInt(this.o_1_b0) & BigInt(0x1)) << BigInt(39);
		packedValue |= (BigInt(this.i_SAFETY_IN8) & BigInt(0x1)) << BigInt(40);
		packedValue |= (BigInt(this.i_SAFETY_IN9) & BigInt(0x1)) << BigInt(41);
		packedValue |= (BigInt(this.i_SAFETY_IN10) & BigInt(0x1)) << BigInt(42);
		packedValue |= (BigInt(this.i_SAFETY_IN11) & BigInt(0x1)) << BigInt(43);
		packedValue |= (BigInt(this.i_SAFETY_PDS) & BigInt(0x1)) << BigInt(44);
		packedValue |= (BigInt(this.i_DOORCLOSED) & BigInt(0x1)) << BigInt(45);
		packedValue |= (BigInt(this.i_SAFETY_OK) & BigInt(0x1)) << BigInt(46);
		packedValue |= (BigInt(this.i_K3_FB) & BigInt(0x1)) << BigInt(47);
		packedValue |= (BigInt(this.o_RL3_C) & BigInt(0x1)) << BigInt(48);
		packedValue |= (BigInt(this.o_RL4_C) & BigInt(0x1)) << BigInt(49);
		packedValue |= (BigInt(this.o_RL1_C) & BigInt(0x1)) << BigInt(50);
		packedValue |= (BigInt(this.o_RL2_C) & BigInt(0x1)) << BigInt(51);
		packedValue |= (BigInt(this.o_0_b3) & BigInt(0x1)) << BigInt(52);
		packedValue |= (BigInt(this.o_0_b2) & BigInt(0x1)) << BigInt(53);
		packedValue |= (BigInt(this.o_0_b1) & BigInt(0x1)) << BigInt(54);
		packedValue |= (BigInt(this.o_0_b0) & BigInt(0x1)) << BigInt(55);
		packedValue |= (BigInt(this.i_K1_FB) & BigInt(0x1)) << BigInt(56);
		packedValue |= (BigInt(this.i_K2_FB) & BigInt(0x1)) << BigInt(57);
		packedValue |= (BigInt(this.i_SAFETY_IN1) & BigInt(0x1)) << BigInt(58);
		packedValue |= (BigInt(this.i_SAFETY_IN2) & BigInt(0x1)) << BigInt(59);
		packedValue |= (BigInt(this.i_SAFETY_IN3) & BigInt(0x1)) << BigInt(60);
		packedValue |= (BigInt(this.i_SAFETY_IN4) & BigInt(0x1)) << BigInt(61);
		packedValue |= (BigInt(this.i_SAFETY_IN6) & BigInt(0x1)) << BigInt(62);
		packedValue |= (BigInt(this.i_SAFETY_IN7) & BigInt(0x1)) << BigInt(63);
    	return packedValue;
	}
}


class Io5{
	constructor() {
		this.blockHeader = new BlockHeader(eBlocktypes.IO, 5, 72);
		this.io = new INPUT_IO_49_5();
	}
}


class Block {
	constructor(blockType, blockFormat, blockLength, data) {
		//Create blockHeader
		this.blockHeader = new BlockHeader(blockType, blockFormat, blockLength);

		//Create data buffer as byte array
		this.data = new Uint8Array(blockLength - 4);
		if (data != undefined) {
			var uint8Array = new Uint8Array(data);
			for (let i = 0; i < this.blockHeader.length - 4; i++) {
				this.data[i] = uint8Array[i + 5];
			}
		}

		//Initial eventual known variables of block
		this.init();
	}

	send() {
		//Create sending buffer with 1 as first byte (1 means web bluetooth or something, if it doesn't get it it will disconnect)
		let sendingValue = new Uint8Array(this.blockHeader.length + 1); //Create buffer
		sendingValue.set([1], 0); //Set first byte to 1
		sendingValue.set([this.blockHeader.type], 1);
		sendingValue.set([this.blockHeader.format], 2);
		sendingValue.set([(this.blockHeader.length & 0xFF)], 3);
		sendingValue.set([((this.blockHeader.length & 0xFF00) >> 8)], 4);
		for (let i = 0; i < this.blockHeader.length - 4; i++) {
			sendingValue[5 + i] = this.data[i];
		}

		this.log()

		let response = _writeCharacteristic.writeValueWithResponse(sendingValue).then(r => console.log('Response: ' + r));

	}

	//Add and initialize members of block type
	init() {
		this.updateTime = 0;
		if (this.blockHeader.type == eBlocktypes.ACCESS) { //ACCESS
			if(this.blockHeader.format == 1){
				this.callType = eCallType_44_1.e44_1_CALLTYPE_NONE;
				this.landing = 0;
				this.flags = new Flags_44_1();
				this.landingBitMaskUp = 0n;
				this.landingBitMaskDown = 0n;
				this.checksum = 0n;
			}else if(this.blockHeader.format == 7){
				this.current = new Current_44_7();
				this.target = new Target_44_7();
				this.landingData = new LandingData_44_7();
			}else if(this.blockHeader.format == 99){
				this.input = new INPUT_DIGITAL_IN_44_99();
				this.output = new OUTPUT_44_99();
			}
		} else if (this.blockHeader.type == eBlocktypes.MOMENTARY_DATA) { //Momentary data
			this.eventType = eEventType_60_7.e60_7_EVENTTYPE_HEARTBEAT;
			this.trip = new Trip_60_7();
			this.status = new Status_60_7();
		}else if(this.blockHeader.type == eBlocktypes.TRACELOG){
			this.type = eG_Type_229_2.NONE;
			this.grade = eG_Grade_229_2.NONE;
			this.row = 0;
			this.variable = eG_Variable_229_2.OK;
			this.message = " ; ";
		}else if(this.blockHeader.type == eBlocktypes.GLOBAL_STATE_MACHINES){
			this.display1 = new Display_64_2();
			this.display2 = new Display_64_2();
			this.io = new IO_64_2();
		}
		else if(this.blockHeader.type == eBlocktypes.IO){
			this.io = new INPUT_IO_49_5();
		}
	}

	//Pack block variables into data buffer so we can send it
	pack() {
		const buffer = new ArrayBuffer(this.blockHeader.length);
		const view = new DataView(buffer);

		if (this.blockHeader.type == eBlocktypes.ACCESS) { //ACCESS
			if(this.blockHeader.format == 1){

				// Pack the data into the buffer
				view.setUint8(0, this.callType);
				view.setUint8(1, this.landing);
				const flagsValue = this.flags.pack();
				view.setUint16(2, flagsValue, true);

			}else if(this.blockHeader.format == 99){

				// Pack the data into the buffer
				const flagsValue = this.input.pack();
				view.setUint16(0, flagsValue, true);
				
			}
		}
		else if(this.blockHeader.type == 49){
			this.input.pack();
			view.setUint16(0, flagsValue, true);
		}

		// Create a Uint8Array from the packed buffer
		const bytearray = new Uint8Array(buffer);

		//Copy buffer to data storage
		for (let i = 0; i < this.blockHeader.length - 4; i++) {
			this.data[i] = bytearray[i];
		}
	}

	unpack() {
		this.updateTime = program.time_1s; //Store time variables was last updated (Needed for extrapolation of position)

		if (this.blockHeader.type == eBlocktypes.ACCESS) { //ACCESS1
			if(this.blockHeader.format == 1){
				const view = new DataView(this.data.buffer);
	
				this.callType = view.getUint8(0);
				this.landing = view.getUint8(1);
				this.flags.clearError = (((view.getUint16(2, true)) >> 11) & 0x01);
			}else if(this.blockHeader.format == 7){ //status
				const view = new DataView(this.data.buffer);
				
				this.current.landing = view.getUint8(0);
				
				this.current.type.material = (((view.getUint8(1)) >> 2) & 0x01);
				this.current.type.type2 = (((view.getUint8(1)) >> 3) & 0x01);
				this.current.type.emergency = (((view.getUint8(1)) >> 4) & 0x01);
				this.current.type.down = (((view.getUint8(1)) >> 5) & 0x01);
				this.current.type.up = (((view.getUint8(1)) >> 6) & 0x01);
				this.current.type.destination = (((view.getUint8(1)) >> 7) & 0x01);

				this.current.status.unlockedDoors = (((view.getUint32(4, true)) >> 28) & 0x01);
				this.current.status.closedDoors = (((view.getUint32(4, true)) >> 29) & 0x01);
				this.current.status.moving = (((view.getUint32(4, true)) >> 30) & 0x01);
				this.current.status.busy = (((view.getUint32(4, true)) >> 31) & 0x01);
			}else if(this.blockHeader.format == 99){ 
				const view = new DataView(this.data.buffer);

				this.output.encoder = view.getInt32(4, true);

				this.output.digital.sysChk     = (((view.getUint16(8, true)) >>  0) & 0x01);
				this.output.digital.v8         = (((view.getUint16(8, true)) >>  1) & 0x01);
				this.output.digital.v4         = (((view.getUint16(8, true)) >>  2) & 0x01);
				this.output.digital.v2         = (((view.getUint16(8, true)) >>  3) & 0x01);
				this.output.digital.v1         = (((view.getUint16(8, true)) >>  4) & 0x01);
				this.output.digital.g8         = (((view.getUint16(8, true)) >>  5) & 0x01);
				this.output.digital.g4         = (((view.getUint16(8, true)) >>  6) & 0x01);
				this.output.digital.g2         = (((view.getUint16(8, true)) >>  7) & 0x01);
				this.output.digital.g1         = (((view.getUint16(8, true)) >>  8) & 0x01);
				this.output.digital.speed2     = (((view.getUint16(8, true)) >>  9) & 0x01);
				this.output.digital.speed1     = (((view.getUint16(8, true)) >> 10) & 0x01);
				this.output.digital.sNLOrALARM = (((view.getUint16(8, true)) >> 11) & 0x01);
				this.output.digital.dOWN       = (((view.getUint16(8, true)) >> 12) & 0x01);
				this.output.digital.uP         = (((view.getUint16(8, true)) >> 13) & 0x01);
				this.output.digital.door2      = (((view.getUint16(8, true)) >> 14) & 0x01);
				this.output.digital.door1      = (((view.getUint16(8, true)) >> 15) & 0x01);
			}
		} else if (this.blockHeader.type == eBlocktypes.IO) { //IO 5
			const view = new DataView(this.data.buffer);
			this.io.i_SAFETY_IN7 = (((view.getUint8(4, true)) >>  0) & 0x01);
			this.io.i_SAFETY_IN6 =  (((view.getUint8(4, true)) >>  1) & 0x01);
			this.io.i_SAFETY_IN4 = (((view.getUint8(4, true)) >>  2) & 0x01); 
			this.io.i_SAFETY_IN3 = (((view.getUint8(4, true)) >>  3) & 0x01);
			this.io.i_SAFETY_IN2 = (((view.getUint8(4, true)) >>  4) & 0x01); 
			this.io.i_SAFETY_IN1 = (((view.getUint8(4, true)) >>  5) & 0x01); 
			this.io.i_K2_FB = (((view.getUint8(4, true)) >>  6) & 0x01); 
			this.io.i_K1_FB = (((view.getUint8(4, true)) >>  7) & 0x01);
			this.io.o_0_b0 = (((view.getUint8(5, true)) >>  0) & 0x01);
			this.io.o_0_b1 = (((view.getUint8(5, true)) >>  1) & 0x01);
			this.io.o_0_b2 = (((view.getUint8(5, true)) >>  2) & 0x01);
			this.io.o_0_b3 = (((view.getUint8(5, true)) >>  3) & 0x01);
			this.io.o_RL2_C = (((view.getUint8(5, true)) >>  4) & 0x01);
			this.io.o_RL1_C = (((view.getUint8(5, true)) >>  5) & 0x01);
			this.io.o_RL4_C = (((view.getUint8(5, true)) >>  6) & 0x01);
			this.io.o_RL3_C = (((view.getUint8(5, true)) >>  7) & 0x01);
			this.io.i_K3_FB = (((view.getUint8(6, true)) >>  0) & 0x01);
			this.io.i_SAFETY_OK = (((view.getUint8(6, true)) >>  1) & 0x01);
			this.io.i_DOORCLOSED = (((view.getUint8(6, true)) >>  2) & 0x01);
			this.io.i_SAFETY_PDS = (((view.getUint8(6, true)) >>  3) & 0x01);
			this.io.i_SAFETY_IN11 = (((view.getUint8(6, true)) >>  4) & 0x01);
			this.io.i_SAFETY_IN10 = (((view.getUint8(6, true)) >>  5) & 0x01);
			this.io.i_SAFETY_IN9 = (((view.getUint8(6, true)) >>  6) & 0x01);
			this.io.i_SAFETY_IN8 = (((view.getUint8(6, true)) >>  7) & 0x01);
			this.io.o_OUT4 = (((view.getUint8(9, true)) >>  2) & 0x01);
			this.io.o_OUT3 = (((view.getUint8(9, true)) >>  3) & 0x01);
			this.io.o_OUT2 = (((view.getUint8(9, true)) >>  4) & 0x01);
			this.io.o_OUT1 = (((view.getUint8(9, true)) >>  5) & 0x01);
			this.io.o_RL6_C = (((view.getUint8(9, true)) >>  6) & 0x01);
			this.io.o_RL5_C = (((view.getUint8(9, true)) >>  7) & 0x01);
		} else if (this.blockHeader.type == eBlocktypes.MOMENTARY_DATA) { //Momentary data
			const view = new DataView(this.data.buffer);

			this.eventType = view.getUint8(0);
			this.trip.type = view.getUint8(1);
			this.trip.targetLanding = view.getUint8(2);
			this.trip.currentLanding = view.getUint8(3);
			this.trip.pastLanding = view.getUint8(4);
			this.status.timeSinceStart = view.getUint32(8, true);
			this.status.distanceTraveled = view.getUint32(12, true);
			this.status.position = view.getInt32(16, true);
			this.status.currentSpeed = view.getInt16(20, true);
			this.status.targetSpeed = view.getInt16(22, true);
			this.status.voltageDC = view.getUint16(24, true);
			this.status.battery = view.getUint16(26, true);
			this.status.batteryChargingVoltage = view.getUint16(28, true);
			this.status.internalTemperature = view.getInt16(30, true);
			this.status.loadcell1 = view.getInt16(32, true);
			this.status.loadcell2 = view.getInt16(34, true);

			this.status.flags.emgInBase       = (((view.getUint32(36, true)) >> 19) & 0x01);
			this.status.flags.cageOnly        = (((view.getUint32(36, true)) >> 20) & 0x01);
			this.status.flags.overload        = (((view.getUint32(36, true)) >> 21) & 0x01);
			this.status.flags.fullLoad        = (((view.getUint32(36, true)) >> 22) & 0x01);
			this.status.flags.gas             = (((view.getUint32(36, true)) >> 23) & 0x01);
			this.status.flags.flood           = (((view.getUint32(36, true)) >> 24) & 0x01);
			this.status.flags.highWind        = (((view.getUint32(36, true)) >> 25) & 0x01);
			this.status.flags.blockedLift     = (((view.getUint32(36, true)) >> 26) & 0x01);
			this.status.flags.moving          = (((view.getUint32(36, true)) >> 27) & 0x01);
			this.status.flags.doorOpen        = (((view.getUint32(36, true)) >> 28) & 0x01);
			this.status.flags.calibrationMode = (((view.getUint32(36, true)) >> 29) & 0x01);
			this.status.flags.programmingMode = (((view.getUint32(36, true)) >> 30) & 0x01);
			this.status.flags.inspectionMode  = (((view.getUint32(36, true)) >> 31) & 0x01);

			this.status.alarm.encoderError     = (((view.getUint32(40, true)) >> 20) & 0x01);
			this.status.alarm.temperatureFault = (((view.getUint32(40, true)) >> 21) & 0x01);
			this.status.alarm.calibrationFault = (((view.getUint32(40, true)) >> 22) & 0x01);
			this.status.alarm.configError      = (((view.getUint32(40, true)) >> 23) & 0x01);
			this.status.alarm.ctrlCircuit      = (((view.getUint32(40, true)) >> 24) & 0x01);
			this.status.alarm.speedFault       = (((view.getUint32(40, true)) >> 25) & 0x01);
			this.status.alarm.lockFault        = (((view.getUint32(40, true)) >> 26) & 0x01);
			this.status.alarm.eNLockError      = (((view.getUint32(40, true)) >> 27) & 0x01);
			this.status.alarm.doorError        = (((view.getUint32(40, true)) >> 28) & 0x01);
			this.status.alarm.motorError       = (((view.getUint32(40, true)) >> 29) & 0x01);
			this.status.alarm.safetyCircuit    = (((view.getUint32(40, true)) >> 30) & 0x01);
			this.status.alarm.adaptiveError    = (((view.getUint32(40, true)) >> 31) & 0x01);

		}else if(this.blockHeader.type == eBlocktypes.TRACELOG){
			const view = new DataView(this.data.buffer);

			this.type = view.getUint8(0);
			this.grade = view.getUint8(1);
			this.row = view.getUint16(2, true);
			this.variable = view.getUint8(4);

			// Unpack the string starting at byte 5
			const stringBytes = new Uint8Array(this.data.buffer.slice(5));
			const decoder = new TextDecoder();
			this.message = decoder.decode(stringBytes);
		}else if(this.blockHeader.type == eBlocktypes.GLOBAL_STATE_MACHINES){
			const view = new DataView(this.data.buffer);

			this.display1.control.direction = view.getUint8(4);
			this.display1.control.picture = view.getUint8(5);
			this.display2.control.direction = view.getUint8(10);
			this.display2.control.picture = view.getUint8(11);

			display1.setALC2Pic(this.display1.control.picture, this.display1.control.direction);
			display2.setALC2Pic(this.display2.control.picture, this.display2.control.direction);
		}
	}

	toString() {


		function formatValue(value, indentationLevel) {
			const indentation = "\t".repeat(indentationLevel);
			if (typeof value === "object") {
				let result = "";
				for (const [key, val] of Object.entries(value)) {
					result += `${indentation}${key}:${formatValue(val, indentationLevel + 1)}`;
				}
				return result;
			} else {
				return `${value}\n`;
			}
		}

		const objectName = this.constructor.name;
		let result = `${objectName}:\n`;
		for (const [key, value] of Object.entries(this)) {
			if (key !== "constructor") {
				result += `\t${key}: \n${formatValue(value, 2)}\n`;
			}
		}

		log(result);
	}

	callback(){ //Function that should be called when this block is received or sent
		if (this.blockHeader.type == eBlocktypes.ACCESS) { //ACCESS1
			if(this.blockHeader.format == 7){
				if(access7.current.status.unlockedDoors){
					var svgEle = svgDoc.getElementById("door_unlocked");
					svgEle.setAttribute('style', 'opacity:1');			

					if(access7.current.type.up){
						var id = "lnd" + access7.current.landing + "_up_light";
						var svgEle = svgDoc.getElementById(id);
						svgEle.setAttribute('style', 'opacity:0');
					}
					if(access7.current.type.down){
						var id = "lnd" + access7.current.landing + "_dwn_light";
						var svgEle = svgDoc.getElementById(id);
						svgEle.setAttribute('style', 'opacity:0');
					}
				}else{
					var svgEle = svgDoc.getElementById("door_unlocked");
					svgEle.setAttribute('style', 'opacity:0');
				}
			}  else if(this.blockHeader.format == 99){

				if(document.getElementById("simIn_contControl_auto").checked){
					if(access99.output.digital.uP || access99.output.digital.dOWN){
						if(access99.input.controlOfContactors != 0){
							access99.input.controlOfContactors = 0;
							document.getElementById("simIn_contControl").checked = 0;
							access99.pack();
							access99.send();
						}
					}else{
						if(access99.input.controlOfContactors != 1){
							access99.input.controlOfContactors = 1;
							document.getElementById("simIn_contControl").checked = 1;
							access99.pack();
							access99.send();
						}
					}
				}

				if(document.getElementById("simIn_doorsLocked_auto").checked){
					if(access99.input.doorsClosed == 1){
						if((access99.output.digital.door1 || access99.output.digital.door2) ){
							if(access99.input.doorsLocked != 0){
								access99.input.doorsLocked = 0;
								document.getElementById("simIn_doorsLocked").checked = 0;
								access99.pack();
								access99.send();
							}
						}else{
							if(access99.input.doorsLocked != 1){
								access99.input.doorsLocked = 1;
								document.getElementById("simIn_doorsLocked").checked = 1;
								access99.pack();
								access99.send();
							}
						}
					}
				}
				
				if(document.getElementById("simIn_retardDown_auto").checked){
					if(access99.output.encoder > document.getElementById("simIn_retardDown_position").value * 60){
						if(access99.input.retardDown != 1){
							access99.input.retardDown = 1;
							document.getElementById("simIn_retardDown").checked = 1;
							access99.pack();
							access99.send();
						}
					}else{
						if(access99.input.retardDown != 0){
							document.getElementById("simIn_retardDown").checked = 0;
							access99.input.retardDown = 0;
							access99.pack();
							access99.send();
						}
					}
				}

				if(document.getElementById("simIn_retardUp_auto").checked){
					if(access99.output.encoder < document.getElementById("simIn_retardUp_position").value * 60){
						if(access99.input.retardUp != 1){
							access99.input.retardUp = 1;
							document.getElementById("simIn_retardUp").checked = 1;
							access99.pack();
							access99.send();
						}
					}else{
						if(access99.input.retardUp != 0){
							access99.input.retardUp = 0;
							document.getElementById("simIn_retardUp").checked = 0;
							access99.pack();
							access99.send();
						}
					}
				}




				drawALCIIIO();
				// document.getElementById("simIn_doorsLocked").checked = !(this.output.allDoorsClosed);
				// simInput(2);
			}
		}else if(this.blockHeader.type == eBlocktypes.MOMENTARY_DATA){
			// //Update numbers
			// document.getElementById("status_posistion").value              = this.status.position;
			// document.getElementById("status_currentSpeed").value           = this.status.currentSpeed;
			// document.getElementById("status_targetSpeed").value            = this.status.targetSpeed;
			// document.getElementById("status_loadcell1").value              = this.status.loadcell1;
			// document.getElementById("status_loadcell2").value              = this.status.loadcell2;
			// document.getElementById("status_voltageDC").value              = this.status.voltageDC;
			// document.getElementById("status_battery").value                = this.status.battery;
			// document.getElementById("status_batteryChargingVoltage").value = this.status.batteryChargingVoltage;
			// document.getElementById("status_internalTemperature").value    = this.status.internalTemperature;
			// //update Flags
			// document.getElementById("status_overload").checked = this.status.flags.overload;
			// document.getElementById("status_fullLoad").checked = this.status.flags.fullLoad;
			// document.getElementById("status_cageOnly").checked = this.status.flags.cageOnly;
			// document.getElementById("status_moving").checked = this.status.flags.moving;
			// document.getElementById("status_doorOpen").checked = this.status.flags.doorOpen;
			// document.getElementById("status_calibrationMode").checked = this.status.flags.calibrationMode;
			// document.getElementById("status_programmingMode").checked = this.status.flags.programmingMode;
			// document.getElementById("status_inspectionMode").checked = this.status.flags.inspectionMode;
			// document.getElementById("status_gas").checked = this.status.flags.gas;
			// document.getElementById("status_flood").checked = this.status.flags.flood;
			// document.getElementById("status_highWind").checked = this.status.flags.highWind;
			// document.getElementById("status_blockedLift").checked = this.status.flags.blockedLift;
			// //Update Alarms
			// document.getElementById("status_encoderError").checked  = this.status.alarm.encoderError;
			// document.getElementById("status_tempFault").checked     = this.status.alarm.temperatureFault;
			// document.getElementById("status_calibFault").checked    = this.status.alarm.calibrationFault;
			// document.getElementById("status_configError").checked   = this.status.alarm.configError;
			// document.getElementById("status_ctrlCircuit").checked   = this.status.alarm.ctrlCircuit;
			// document.getElementById("status_speedFault").checked    = this.status.alarm.speedFault;
			// document.getElementById("status_lockFault").checked     = this.status.alarm.lockFault;
			// document.getElementById("status_enLockError").checked   = this.status.alarm.eNLockError;
			// document.getElementById("status_doorError").checked     = this.status.alarm.doorError;
			// document.getElementById("status_motorError").checked    = this.status.alarm.motorError;
			// document.getElementById("status_safetyCircuit").checked = this.status.alarm.safetyCircuit;
			// document.getElementById("status_adaptiveError").checked = this.status.alarm.adaptiveError;
		}
		else if(this.blockHeader.type == eBlocktypes.IO){
			drawAEC();
		}
	}

	log() {
		// Convert elements to hexadecimal representation
		const hexArray = Array.from(this.data).map(element => element.toString(16).padStart(2, '0'));
		switch(this.blockHeader.type){
			case eBlocktypes.ACCESS:
				var color = '#20c997';
				break;
			case eBlocktypes.MOMENTARY_DATA:
				var color = '#17a2b8';
				break;
			case eBlocktypes.GLOBAL_STATE_MACHINES:
				var color = '#ffc107';
				break;
			case eBlocktypes.TRACELOG:
				var color = '#fd7e14';
				break;
		}
		log("<b>Type " + this.blockHeader.type + " (" + getEnumNameByValue(eBlocktypes, this.blockHeader.type) + ")," + " Format " + this.blockHeader.format + ", Length " + this.blockHeader.length + "</b> \n\t" + hexArray, color);
	}
}

var access1 = new Block(44, 1, 32);

var access7 = new Block(44, 7, 48);

var access99 = new Block(44, 99, 16);

var io5 = new Block(49,5,72);

var momentary7 = new Block(60, 7, 48);

var tracelog = new Block(229, 2, 210);

var globalStateMachine2 = new Block(64, 2, 20);


function handleBluetoothCharFind(event) {
	navigator.bluetooth.requestDevice({
		filters: [{ services: [AGCSS_SERVICE_UUID] }],
		optionalServices: [AGCSS_SERVICE_UUID]
	})
		.then(device => {
			console.log(device);
			log("Device: " + device.id + " " + device.name);
			return device.gatt.connect();
		})
		.then(server => {
			console.log(server);
			return server.getPrimaryServices();
		})
		.then(services => {
			console.log(services);
			let queue = Promise.resolve();
			services.forEach(service => {
				console.log(service);
				log("Service: " + service.uuid + " isPrimary:" + service.isPrimary);
				queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
					console.log(characteristics);
					characteristics.forEach(characteristic => {
						console.log('>> Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
						log('>> Characteristic: ' + characteristic.uuid + ' ' + getSupportedProperties(characteristic));
						characteristic.getDescriptors().then(x => {
							console.log('>>> Descriptors: ', x);
							log('>>> Descriptors: ' + x);
						}).catch(error => {
							console.error(characteristic, error);
						});;
					});
				}).catch(error => {
					console.error(error);
					log(error);

				}));
			});
			return queue;
		})
		.catch(error => {
			console.error(error);
			log(error, '#FF0000');
			//buttonDisconnect.disabled = true;
			//button.disabled = false;
		});
}

function handleBluetoothFind(event) {
	navigator.bluetooth.requestDevice({
		filters: [{ services: [AGCSS_SERVICE_UUID] }],
		optionalServices: [AGCSS_SERVICE_UUID]
	})
		.then(device => {
			console.log(device);
			log("Device: " + device.id + " " + device.name);
			bluetoothDevice = device; // New
			bluetoothDevice.addEventListener('gattserverdisconnected', onDisconnected); // New
			return device.gatt.connect();
		})
		.then(server => {
			console.log(server);
			return server.getPrimaryService(AGCSS_SERVICE_UUID);
		})
		.then(service => {
			console.log(service);
			log("Service: " + service.uuid + " isPrimary:" + service.isPrimary);
			service.getCharacteristic(AGCSS_WRITE_CHAR_UUID)
				.then(wc => _writeCharacteristic = wc);
			return service.getCharacteristic(AGCSS_NOTIFY_CHAR_UUID);
		})
		.then(characteristic => {
			console.log(characteristic);
			log("Characteristic: " + characteristic.uuid);
			characteristic.getDescriptors().then((d) => {
				console.log(d);
				log(d);
				_writeDescriptor = d[0];
			});
			// characteristic = characteristic;
			buttonDisconnect.disabled = false;
			button.disabled = true;
			timeout_start();
			return characteristic.startNotifications();
		})
		.then(characteristic => {
			characteristic.addEventListener('characteristicvaluechanged', handleNotifications);
		})
		.catch(error => {
			console.error(error);
			log(error, '#FF0000');
			timeout_clear();
			buttonDisconnect.disabled = true;
			button.disabled = false;
		});
}

function handleBluetoothDisconnect(event) {
	// Disconnecting process

	if (!bluetoothDevice) {
		return;
	}
	log('Disconnecting from Bluetooth Device...');
	if (bluetoothDevice.gatt.connected) {
		bluetoothDevice.gatt.disconnect();
		timeout_clear();
		buttonDisconnect.disabled = true;
		button.disabled = false;
	} else {
		log('> Bluetooth Device is already disconnected');
	}
}

var reconnectTimeout = 1000; //This will double for each failed attempt, reseting to 1000 when successful
function reconnect() {
	log('Trying to reconnect');
	bluetoothDevice.gatt.connect()
		.then(server => {
			console.log(server);
			return server.getPrimaryService(AGCSS_SERVICE_UUID);
		})
		.then(service => {
			console.log(service);
			log("Service: " + service.uuid + " isPrimary:" + service.isPrimary);
			service.getCharacteristic(AGCSS_WRITE_CHAR_UUID)
				.then(wc => _writeCharacteristic = wc);
			return service.getCharacteristic(AGCSS_NOTIFY_CHAR_UUID);
		})
		.then(characteristic => {
			console.log(characteristic);
			log("Characteristic: " + characteristic.uuid);
			characteristic.getDescriptors().then((d) => {
				console.log(d);
				log(d);
				_writeDescriptor = d[0];
			});
			// characteristic = characteristic;
			buttonDisconnect.disabled = false;
			button.disabled = true;
			timeout_start();
			return characteristic.startNotifications();
		})
		.then(characteristic => {
			characteristic.addEventListener('characteristicvaluechanged', handleNotifications);
			reconnectTimeout = 1000;
			log('Reconnected!');
		})
		.catch(error => {
			console.error(error);
			log(error, '#FF0000');
			timeout_clear();
			buttonDisconnect.disabled = true;
			button.disabled = false;
			reconnectTimeout *= 2;
			setTimeout(reconnect, reconnectTimeout);
		});
}

function onDisconnected(event) {
	// Object event.target is Bluetooth Device getting disconnected.
	log('> Bluetooth Device disconnected');
	reconnect()
}

function sendValueWithCharacteristic() {
	let value = new TextEncoder("utf-8").encode(document.getElementById('textInput').value);
	let sendingValue = new Uint8Array(value.byteLength + 1);
	sendingValue.set([1], 0);
	sendingValue.set(value, 1);
	console.log('Sending value: ' + sendingValue + ' with characteristic: ', _writeCharacteristic);
	log('Sending value: ' + sendingValue + ' with characteristic: ' + _writeCharacteristic.uuid);
	let response = _writeCharacteristic.writeValueWithResponse(sendingValue).then(r => console.log('Response: ' + r));
}


function getSupportedProperties(characteristic) {
	let supportedProperties = [];
	for (const p in characteristic.properties) {
		if (characteristic.properties[p] === true) {
			supportedProperties.push(p.toUpperCase());
		}
	}
	return '[' + supportedProperties.join(', ') + ']';
}



function handleNotifications(event) {
	let value = event.target.value;


	let block = new Block(value.getUint8(1), value.getUint8(2), value.getUint16(3, true), value.buffer);

	block.log('#feff9f');


	switch (block.blockHeader.type) {
		case eBlocktypes.REGISTRATION: //Registration
			//Send back registration block to accept registration
			block.send();
			break;
		case eBlocktypes.MOMENTARY_DATA: //Momentary data
			momentary7.data.set(block.data); //Copy received data
			momentary7.unpack(); //Unpack raw data to object member variables
			momentary7.callback();
			break;
		case eBlocktypes.ACCESS: //Access
			if(block.blockHeader.format == 7){ //Access status only
				access7.data.set(block.data);
				access7.unpack();
				access7.callback();
			}else if(block.blockHeader.format == 99){
				access99.data.set(block.data);
				access99.unpack();
				access99.callback();
			}
			break;
		case eBlocktypes.GLOBAL_STATE_MACHINES: //Access
			globalStateMachine2.data.set(block.data);
			globalStateMachine2.unpack(); //Unpack raw data to object member variables

			break;
		case eBlocktypes.TRACELOG: //Access
			tracelog.data.set(block.data); //Copy received data 
			tracelog.unpack(); //Unpack raw data to object member variables
			printTracelog(tracelog);
			break;
		case eBlocktypes.IO:
			if(block.blockHeader.format == 5){ // IO block for AEC
				io5.data.set(block.data);
				io5.unpack();
				io5.callback();
			}
			
			break;
		default: //Other block types

			break;
	}


	timeout_refill();
}

function printTracelog(traceBlock){
	let ul = document.getElementById('tracelog');
	var li = document.createElement('li');

	// Create a <pre> element to preserve whitespace and newlines
	var pre = document.createElement('pre');
	pre.style.margin = '0';
	pre.style.whiteSpace = 'pre-wrap';
	pre.style.wordWrap = 'break-word';

	var color = '#e8e8e8';
	switch(traceBlock.type){
		case eG_Type_229_2.WARNING:
			color = '#feff9f';
			break;
		case eG_Type_229_2.ALARM:
			color = '#f47026';
			break;
		case eG_Type_229_2.ERROR:
			color = '#f42c26';
			break;
		default:
			break;
	}
	

	if (color === undefined) {
		// Set background color based on log message count
		var count = ul.getElementsByTagName('li').length;
		if (count % 2 === 0) {
			li.style.backgroundColor = 'lightgray';
		} else {
			li.style.backgroundColor = 'whitesmoke';
		}
	} else {
		li.style.backgroundColor = color;
		// Set background color based on log message count
		var count = ul.getElementsByTagName('li').length;
		if (count % 2 === 0) {
			li.style.backgroundColor = color;
		} else {
			li.style.backgroundColor = colorBrighten(color, 1.1);
		}
	}

	const message = traceBlock.message.split(";");
	const functionName = message[0].trim();
	const traceMsg = message[1].trim();
	const time = new Date();
	const hour = time.getHours().toString().padStart(2, '0');
	const min = time.getMinutes().toString().padStart(2, '0');
	const sec = time.getSeconds().toString().padStart(2, '0');	
	// Assign the text to the <pre> element
	pre.innerHTML = `${hour}:${min}:${sec} \t<b>Type: </b> ${getEnumNameByValue(eG_Type_229_2, traceBlock.type)} \t<b>Grade: </b>${getEnumNameByValue(eG_Grade_229_2, traceBlock.grade)} \t<b>Func: </b> ${functionName} \t <b>Row: </b>${traceBlock.row} \t<b>Var: </b>${getEnumNameByValue(eG_Variable_229_2, traceBlock.variable)} \t<b>Msg: </b> ${traceMsg}`;

	// Append the <pre> element to the <li> element
	li.appendChild(pre);

	// Check if there are existing log messages
	if (ul.firstChild) {
		ul.insertBefore(li, ul.firstChild); // Insert the new log message before the first child
	} else {
		ul.appendChild(li); // If no existing messages, simply append the new log message
	}
}


const MAX_LOG_LENGTH = 10000; // Set the maximum length for the log

function log(text, color) {
	let ul = document.getElementById('log');
	var li = document.createElement('li');

	// Create a <pre> element to preserve whitespace and newlines
	var pre = document.createElement('pre');
	pre.style.margin = '0';
	pre.style.whiteSpace = 'pre-wrap';
	pre.style.wordWrap = 'break-word';

	if (color === undefined) {
		// Set background color based on log message count
		var count = ul.getElementsByTagName('li').length;
		if (count % 2 === 0) {
			li.style.backgroundColor = '#e8e8e8';
		} else {
			li.style.backgroundColor = colorBrighten('#e8e8e8', 1.1);
		}
	} else {
		li.style.backgroundColor = color;
		// Set background color based on log message count
		var count = ul.getElementsByTagName('li').length;
		if (count % 2 === 0) {
			li.style.backgroundColor = color;
		} else {
			li.style.backgroundColor = colorBrighten(color, 1.1);
		}
	}

	const time = new Date();
	const hour = time.getHours().toString().padStart(2, '0');
	const min = time.getMinutes().toString().padStart(2, '0');
	const sec = time.getSeconds().toString().padStart(2, '0');	

	// Assign the text to the <pre> element
	pre.innerHTML = `${hour}:${min}:${sec} \t` + text;

	// Append the <pre> element to the <li> element
	li.appendChild(pre);

	// Check if there are existing log messages
	if (ul.firstChild) {
		ul.insertBefore(li, ul.firstChild); // Insert the new log message before the first child
	} else {
		ul.appendChild(li); // If no existing messages, simply append the new log message
	}

	// Check if the log has reached the maximum length, if so remove 100 entries
	if (ul.children.length >= MAX_LOG_LENGTH) {
		console.log("Log Max length reached (1000): removing 1000 entries.");
		for (let i = 0; i < 100; i++){
			ul.removeChild(ul.lastChild);
		}
	}
}

function settings_visibility_change(event) {
	if (event.target.checked) {
		document.getElementById(event.target.name).removeAttribute("hidden");
		//alert('checked');
	} else {
		document.getElementById(event.target.name).setAttribute("hidden", "");
		//alert('not checked');
	}
}

function destinationCall(value) {

	access1.landing = value;
	access1.callType = eCallType_44_1.e44_1_CALLTYPE_DESTINATION;
	access1.flags.clearError = 1;
	access1.pack();
	access1.send();

}


//const svgElement_AEC = document.getElementById('svg_AEC');
var svgDoc_AEC = null;

//AEC IO
function drawAEC(){
	svgDoc_AEC.getElementById('i_X2_2').style.fillOpacity         = io5.io.i_SAFETY_PDS;
	svgDoc_AEC.getElementById('o_X3_2').style.fillOpacity         = io5.io.o_RL1_C;
	svgDoc_AEC.getElementById('i_X3-3').style.fillOpacity         = io5.io.i_DOORCLOSED;
	svgDoc_AEC.getElementById('i_X3-5').style.fillOpacity         = io5.io.i_SAFETY_OK;
	svgDoc_AEC.getElementById('o_X4-1').style.fillOpacity         = io5.io.o_RL2_C;
	svgDoc_AEC.getElementById('i_X4-3').style.fillOpacity         = io5.io.i_K3_FB;
	svgDoc_AEC.getElementById('o_X5-1').style.fillOpacity         = io5.io.o_RL3_C;
	svgDoc_AEC.getElementById('i_X5-3').style.fillOpacity         = io5.io.i_K1_FB;
	svgDoc_AEC.getElementById('o_X6-1').style.fillOpacity         = io5.io.o_RL4_C;
	svgDoc_AEC.getElementById('i_X6-3').style.fillOpacity         = io5.io.i_K2_FB;
	svgDoc_AEC.getElementById('o_X7-1').style.fillOpacity         = io5.io.o_RL5_C;
	svgDoc_AEC.getElementById('o_X7-3').style.fillOpacity         = io5.io.o_RL6_C;
	svgDoc_AEC.getElementById('o_X8-2').style.fillOpacity         = io5.io.o_OUT1;
	svgDoc_AEC.getElementById('o_X8-3').style.fillOpacity         = io5.io.o_OUT2;
	svgDoc_AEC.getElementById('o_X8-4').style.fillOpacity         = io5.io.o_OUT3;
	svgDoc_AEC.getElementById('o_X8-5').style.fillOpacity         = io5.io.o_OUT4;
	svgDoc_AEC.getElementById('i_X11-2').style.fillOpacity         = io5.io.i_SAFETY_IN1;
	svgDoc_AEC.getElementById('i_X11-2').style.fillOpacity         = io5.io.i_SAFETY_IN1;
	svgDoc_AEC.getElementById('i_X12-2').style.fillOpacity         = io5.io.i_SAFETY_IN2;
	svgDoc_AEC.getElementById('i_X13-2').style.fillOpacity         = io5.io.i_SAFETY_IN3;
	svgDoc_AEC.getElementById('i_X14-2').style.fillOpacity         = io5.io.i_SAFETY_IN4;
	svgDoc_AEC.getElementById('i_X15-2').style.fillOpacity         = io5.io.i_SAFETY_IN6;
	svgDoc_AEC.getElementById('i_X16-2').style.fillOpacity         = io5.io.i_SAFETY_IN7;
	svgDoc_AEC.getElementById('i_X17-2').style.fillOpacity         = io5.io.i_SAFETY_IN8;
	svgDoc_AEC.getElementById('i_X18-2').style.fillOpacity         = io5.io.i_SAFETY_IN9;
	svgDoc_AEC.getElementById('i_X19-2').style.fillOpacity         = io5.io.i_SAFETY_IN10;
	svgDoc_AEC.getElementById('i_X20-2').style.fillOpacity         = io5.io.i_SAFETY_IN11;
	svgDoc_AEC.getElementById('i_X21-2').style.fillOpacity         = io5.io.i_2_b7;
	svgDoc_AEC.getElementById('i_X21-3').style.fillOpacity         = io5.io.i_2_b6;
	svgDoc_AEC.getElementById('i_X21-4').style.fillOpacity         = io5.io.i_2_b5;
	svgDoc_AEC.getElementById('i_X21-5').style.fillOpacity         = io5.io.i_2_b4;
	svgDoc_AEC.getElementById('i_X21-6').style.fillOpacity         = io5.io.i_2_b3;
	svgDoc_AEC.getElementById('i_X21-7').style.fillOpacity         = io5.io.i_2_b2;
	svgDoc_AEC.getElementById('i_X22-2').style.fillOpacity         = io5.io.i_3_b7;
	svgDoc_AEC.getElementById('i_X22-3').style.fillOpacity         = io5.io.i_3_b6;
	svgDoc_AEC.getElementById('i_X22-4').style.fillOpacity         = io5.io.i_3_b5;
	svgDoc_AEC.getElementById('LED_GREEN').style.fillOpacity         = 0;
	svgDoc_AEC.getElementById('LED_RED').style.fillOpacity         = 0;
	svgDoc_AEC.getElementById('LED_NET').style.fillOpacity         = 0;
	svgDoc_AEC.getElementById('LED_VCC').style.fillOpacity         = 0;
	svgDoc_AEC.getElementById('LED_5V_EXT').style.fillOpacity         = 0;
	svgDoc_AEC.getElementById('LED_24V_PCB').style.fillOpacity         = 0;
	svgDoc_AEC.getElementById('LED_24V_IO').style.fillOpacity         = 0;
	svgDoc_AEC.getElementById('LED_24V_SAFETY').style.fillOpacity         = io5.io.i_SAFETY_IN1;
	svgDoc_AEC.getElementById('ETH1_LED_G').style.fillOpacity         = 0;
	svgDoc_AEC.getElementById('ETH1_LED_Y').style.fillOpacity         = 0;
}



document.addEventListener('DOMContentLoaded', (event) => {
    const svgElement_AEC = document.getElementById('svg_AEC');
    svgElement_AEC.addEventListener('load', function () {
		console.log('SVG loaded');
		console.log('svgElement_AEC.contentDocument:', svgElement_AEC.getSVGDocument())
        svgDoc_AEC = svgElement_AEC.contentDocument;  // removed var here
        //Draw initial state of ALCIIIO
        drawAEC();
    });
});


function simInput(index){
	
	switch(index){
		case 1:
			access99.input.safetyCircuit =  (!(document.getElementById("simIn_safetyCircuit").checked) ? 1 : 0);   
			break;
		case 2:
			access99.input.doorsClosed =  (!(document.getElementById("simIn_doorsClosed").checked) ? 1 : 0);   
			break;		
		case 3:
			access99.input.doorsLocked =  (!(document.getElementById("simIn_doorsLocked").checked) ? 1 : 0);   
			break;		
		case 4:
			access99.input.overload =  (!(document.getElementById("simIn_overLoad").checked) ? 1 : 0);   
			break;		
		case 5:
			access99.input.fullLoad =  (!(document.getElementById("simIn_fullLoad").checked) ? 1 : 0);   
			break;
		case 6:
			access99.input.retardUp =  (!(document.getElementById("simIn_retardUp").checked) ? 1 : 0);   
			break;
		case 7:
			access99.input.retardDown =  (!(document.getElementById("simIn_retardDown").checked) ? 1 : 0);   
			break;
		case 8:
			access99.input.inspection =  (!(document.getElementById("simIn_inspection").checked) ? 1 : 0);   
			break;
		case 9:
			access99.input.inpsUp =  (!(document.getElementById("simIn_inspUp").checked) ? 1 : 0);   
			break;
		case 10:
			access99.input.inspDown =  (!(document.getElementById("simIn_inspDown").checked) ? 1 : 0);   
			break;
		case 11:
			access99.input.controlOfContactors =  (!(document.getElementById("simIn_contControl").checked) ? 1 : 0);   
			break;
		case 12:
			access99.input.btnUP = 1; 
			break;
		case 13:
			access99.input.btnUP = 0; 
			break;
		case 14:
			access99.input.btnDOWN = 1; 
			break;
		case 15:
			access99.input.btnDOWN = 0; 
			break;
		case 16:
			access99.input.btnSNL = 1; 
			break;
		case 17:
			access99.input.btnSNL = 0; 
			break;
		case 18:
			access99.input.btnPROG = 1; 
			break;
		case 19:
			access99.input.btnPROG = 0; 
			break;
	}

	if(document.getElementById("simIn_doorsClosed_auto").checked){
		if(access99.input.safetyCircuit == 0){
			document.getElementById("simIn_doorsClosed").checked = 0;
			access99.input.doorsClosed = 0;
		}
	}
	if(document.getElementById("simIn_doorsLocked_auto").checked){
		if(access99.input.doorsClosed == 0){
			document.getElementById("simIn_doorsLocked").checked = 0;
			access99.input.doorsLocked = 0;
		}
	}



	access99.pack();
	access99.send();
	drawALCIIIO();
}



class Program {
	constructor() {
		this.time_10ms = 0; //Time since start in ms
		this.time_1s = 0; //Time since start in s
		this.dTime = 0; //delta time between last two frames in seconds
		this.previousPos = 0;
		this.lastFrameTime = 0;
		this.renderInit = false;
	}

	updateTick10ms() {
		this.time_10ms += 1; 
		this.time_1s = this.time_10ms / 100;

	}

	render() {
		if(this.renderInit == false){
			this.renderInit = true;
			this.svgElements_elevator = svgDoc.getElementById('elevator');
			this.svgElements_retDown = svgDoc.getElementById('RETARD_DOWN');
			this.svgElements_retUp = svgDoc.getElementById('RETARD_UP');
			this.elementRetDown = document.getElementById("simIn_retardDown_position");
			this.elementRetUp = document.getElementById("simIn_retardUp_position");
		}else{
			
					//Calculate delta time between last two frames
					this.dTime = this.time_1s - this.lastFrameTime;
					this.lastFrameTime = this.time_1s;
			
			
					// Get the SVG document
					// var svgDoc = document.getElementById('svg_elevator').contentDocument;
			

					// element.style.fillOpacity = 1;
			
					const startX = 37.041667;
					const startY = 134.9375;
			
					// Extrapolate position
					const extraPos = momentary7.status.position; // + momentary7.status.currentSpeed * (program.time_1s - momentary7.updateTime);
			
					// Apply the cubic-bezier easing function to modify the interpolation factor
					const easingFactor = cubicBezier(easing, this.dTime);
			
					// Calculate the interpolated position
					const interpolatedPos = this.previousPos + (extraPos - this.previousPos) * easingFactor;
			
					if(this.previousPos != interpolatedPos){
						// Update the previousPos for the next frame
						this.previousPos = interpolatedPos;
				
						// Calculate the new translation values
						const newTranslateX = startX;
						const newTranslateY = startY - (interpolatedPos / 60 );
				
						// Create the new transform attribute value
						const newTransform = `translate(${newTranslateX},${newTranslateY})`;
				
						// Set the new transform attribute value on the SVG element
						this.svgElements_elevator.setAttribute('transform', newTransform);
					}
					
					//Set reference switches
					this.svgElements_retDown.transform.baseVal[0].matrix.f = 83 - this.elementRetDown.value / 60;
			

					this.svgElements_retUp.transform.baseVal[0].matrix.f = 83 - this.elementRetUp.value / 60;
			
			


		}

		requestAnimationFrame(this.render.bind(this));
	}

}

// Define the cubic-bezier control points for the S-curve
const easing = [0.42, 0, 0.58, 1];
// Function to calculate cubic-bezier interpolation
function cubicBezier(points, t) {
	const [x0, y0, x1, y1] = points;

	// Use cubic-bezier formula to calculate the easing factor
	const t2 = t * t;
	const t3 = t2 * t;
	const mt = 1 - t;
	const mt2 = mt * mt;
	const mt3 = mt2 * mt;

	const p0 = mt3;
	const p1 = 3 * mt2 * t;
	const p2 = 3 * mt * t2;
	const p3 = t3;

	const x = x0 * p0 + x1 * p1 + x1 * p2 + x1 * p3;
	const y = y0 * p0 + y1 * p1 + y1 * p2 + y1 * p3;

	return y;
}

var program = new Program();

//Create webworker that calls the updateTick function from a seperate process (This is needed if we want the program time to update while the webpage is minimized)
var worker = new Worker('js/worker.js');
worker.onmessage = program.updateTick10ms.bind(program);


const eCallType = {
	DESTINATION: 1,
	UP: 2,
	DOWN: 3,
	EMERGENCY: 5,
	TYPE2: 6,
	MATERIAL: 7
};


function callLanding(callType, landing) {
	if(callType == eCallType.UP){
		var id = "lnd" + landing + "_up_light";
		var svgEle = svgDoc.getElementById(id);
		svgEle.setAttribute('style', 'display:inline');
	}else if(callType == eCallType.DOWN){
		var id = "lnd" + landing + "_dwn_light";
		var svgEle = svgDoc.getElementById(id);
		svgEle.setAttribute('style', 'display:inline');
	}


	access1.callType = callType;
	access1.landing = landing;
	access1.flags.clearError = 1;
	access1.pack();
	access1.send();

}







var resp = new Response()
function testHttp(){
	log("Test http");
	const byteArray = new Uint8Array([0x01,0x00,0x18,0x05,0x02,0x01,0x1C,0x00,0x03,0x01,0x14,0x00,0x46,0x25,0x00,0x40,0x00,0x00,0x00,0x00,0x10,0x20,0xFC,0xEF,0xA8,0x00,0x09,0x70]); // Replace with your actual binary data
	// Configure the fetch request
	fetch('http://css.alimakgroup.com:80/oneway/', {
		method: 'POST',
		headers: new Headers({'content-type': 'application/octet-stream'}),
		// mode: 'no-cors',
		body: byteArray
	})
		.then(response => {
			if (response.type === 'opaque' || response.ok) {
				return response.arrayBuffer();
			} else {
				throw new Error('Network response was not ok');
			}
		})
		.then(data => {
			resp = data;
			console.log('Success:', data);
		})
		.catch(error => {
			console.error('Error:', error);
		});
}