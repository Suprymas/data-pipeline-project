import { OPCUAServer, Variant, DataType, StatusCodes } from 'node-opcua';

const server = new OPCUAServer({
  port: 4334,
  resourcePath: "/UA/fhvopcserver",
  buildInfo: {
    productName: "FluidFill Express Server",
    buildNumber: "7658",
    buildDate: new Date(2025, 8, 24)
  }
});

await server.initialize();
console.log("initialized");

const addressSpace = server.engine.addressSpace;
const namespace = addressSpace.getOwnNamespace();

let machineData = {
  machineName: "FluidFill Express #2",
  serialNumber: "FFE2000-2023-002",
  plant: "Dortmund Beverage Center",
  productionSegment: "Non-Alcoholic Beverages",
  productionLine: "Juice Filling Line 3",

  productionOrder: "PO-2024-JUICE-5567",
  article: "ART-JUICE-APPLE-1L",
  quantity: 25000,

  targetFillVolume: 1000.0,
  targetLineSpeed: 450,
  targetProductTemp: 6.5,
  targetCO2Pressure: 3.8,
  targetCapTorque: 22.0,
  targetCycleTime: 2.67,

  actualFillVolume: 999.2,
  actualLineSpeed: 448,
  actualProductTemp: 6.3,
  actualCO2Pressure: 3.75,
  actualCapTorque: 21.8,
  actualCycleTime: 2.68,

  fillAccuracyDeviation: -0.8,
  productLevelTank: 67.3,

  cleaningCycleStatus: "Normal Production",
  qualityCheckWeight: "Pass",
  qualityCheckLevel: "Pass",
  machineStatus: "Starting",
  currentStation: "Station 12",

  goodBottles: 1247589,
  badBottlesVolume: 2847,
  badBottlesWeight: 1923,
  badBottlesCap: 1156,
  badBottlesOther: 734,
  totalBadBottles: 6600,
  totalBottles: 1254249,

  goodBottlesOrder: 12847,
  badBottlesOrder: 153,
  totalBottlesOrder: 13000,
  productionOrderProgress: 52.0,

  currentLotNumber: "LOT-2024-APPLE-0456",
  expirationDate: "2026-09-23"
};

let alarmHistory = {
  fillVolume: [],
  lineSpeed: [],
  productTemp: [],
  co2Pressure: [],
  capTorque: [],
  cycleTime: []
};

let activeAlarms = [];

const device = namespace.addObject({
  organizedBy: addressSpace.rootFolder.objects,
  browseName: "FluidFillExpress2"
});

const machineInfo = namespace.addObject({
  organizedBy: device,
  browseName: "MachineInformation"
});

namespace.addVariable({
  componentOf: machineInfo,
  browseName: "MachineName",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.machineName }) }
});

namespace.addVariable({
  componentOf: machineInfo,
  browseName: "SerialNumber",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.serialNumber }) }
});

namespace.addVariable({
  componentOf: machineInfo,
  browseName: "Plant",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.plant }) }
});

namespace.addVariable({
  componentOf: machineInfo,
  browseName: "ProductionSegment",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.productionSegment }) }
});

namespace.addVariable({
  componentOf: machineInfo,
  browseName: "ProductionLine",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.productionLine }) }
});

const productionOrder = namespace.addObject({
  organizedBy: device,
  browseName: "ProductionOrder"
});

namespace.addVariable({
  componentOf: productionOrder,
  browseName: "OrderNumber",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.productionOrder }) }
});

namespace.addVariable({
  componentOf: productionOrder,
  browseName: "Article",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.article }) }
});

namespace.addVariable({
  componentOf: productionOrder,
  browseName: "Quantity",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.quantity }) }
});

namespace.addVariable({
  componentOf: productionOrder,
  browseName: "Progress",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.productionOrderProgress }) }
});

const processParams = namespace.addObject({
  organizedBy: device,
  browseName: "ProcessParameters"
});

const targets = namespace.addObject({
  organizedBy: processParams,
  browseName: "Targets"
});

namespace.addVariable({
  componentOf: targets,
  browseName: "FillVolume",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.targetFillVolume }) }
});

namespace.addVariable({
  componentOf: targets,
  browseName: "LineSpeed",
  dataType: "UInt16",
  value: { get: () => new Variant({ dataType: DataType.UInt16, value: machineData.targetLineSpeed }) }
});

namespace.addVariable({
  componentOf: targets,
  browseName: "ProductTemperature",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.targetProductTemp }) }
});

namespace.addVariable({
  componentOf: targets,
  browseName: "CO2Pressure",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.targetCO2Pressure }) }
});

namespace.addVariable({
  componentOf: targets,
  browseName: "CapTorque",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.targetCapTorque }) }
});

namespace.addVariable({
  componentOf: targets,
  browseName: "CycleTime",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.targetCycleTime }) }
});

const actuals = namespace.addObject({
  organizedBy: processParams,
  browseName: "Actuals"
});

namespace.addVariable({
  componentOf: actuals,
  browseName: "FillVolume",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.actualFillVolume }) }
});

namespace.addVariable({
  componentOf: actuals,
  browseName: "LineSpeed",
  dataType: "UInt16",
  value: { get: () => new Variant({ dataType: DataType.UInt16, value: machineData.actualLineSpeed }) }
});

namespace.addVariable({
  componentOf: actuals,
  browseName: "ProductTemperature",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.actualProductTemp }) }
});

namespace.addVariable({
  componentOf: actuals,
  browseName: "CO2Pressure",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.actualCO2Pressure }) }
});

namespace.addVariable({
  componentOf: actuals,
  browseName: "CapTorque",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.actualCapTorque }) }
});

namespace.addVariable({
  componentOf: actuals,
  browseName: "CycleTime",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.actualCycleTime }) }
});

namespace.addVariable({
  componentOf: actuals,
  browseName: "FillAccuracyDeviation",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.fillAccuracyDeviation }) }
});

namespace.addVariable({
  componentOf: actuals,
  browseName: "ProductLevelTank",
  dataType: "Double",
  value: { get: () => new Variant({ dataType: DataType.Double, value: machineData.productLevelTank }) }
});

const status = namespace.addObject({
  organizedBy: device,
  browseName: "Status"
});

namespace.addVariable({
  componentOf: status,
  browseName: "MachineStatus",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.machineStatus }) }
});

namespace.addVariable({
  componentOf: status,
  browseName: "CleaningCycleStatus",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.cleaningCycleStatus }) }
});

namespace.addVariable({
  componentOf: status,
  browseName: "CurrentStation",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.currentStation }) }
});

const qualityControl = namespace.addObject({
  organizedBy: device,
  browseName: "QualityControl"
});

namespace.addVariable({
  componentOf: qualityControl,
  browseName: "WeightCheck",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.qualityCheckWeight }) }
});

namespace.addVariable({
  componentOf: qualityControl,
  browseName: "LevelCheck",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.qualityCheckLevel }) }
});

const counters = namespace.addObject({
  organizedBy: device,
  browseName: "ProductionCounters"
});

const totalCounters = namespace.addObject({
  organizedBy: counters,
  browseName: "Total"
});

namespace.addVariable({
  componentOf: totalCounters,
  browseName: "GoodBottles",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.goodBottles }) }
});

namespace.addVariable({
  componentOf: totalCounters,
  browseName: "BadBottlesVolume",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.badBottlesVolume }) }
});

namespace.addVariable({
  componentOf: totalCounters,
  browseName: "BadBottlesWeight",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.badBottlesWeight }) }
});

namespace.addVariable({
  componentOf: totalCounters,
  browseName: "BadBottlesCap",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.badBottlesCap }) }
});

namespace.addVariable({
  componentOf: totalCounters,
  browseName: "BadBottlesOther",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.badBottlesOther }) }
});

namespace.addVariable({
  componentOf: totalCounters,
  browseName: "TotalBadBottles",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.totalBadBottles }) }
});

namespace.addVariable({
  componentOf: totalCounters,
  browseName: "TotalBottles",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.totalBottles }) }
});

const orderCounters = namespace.addObject({
  organizedBy: counters,
  browseName: "Order"
});

namespace.addVariable({
  componentOf: orderCounters,
  browseName: "GoodBottles",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.goodBottlesOrder }) }
});

namespace.addVariable({
  componentOf: orderCounters,
  browseName: "BadBottles",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.badBottlesOrder }) }
});

namespace.addVariable({
  componentOf: orderCounters,
  browseName: "TotalBottles",
  dataType: "UInt32",
  value: { get: () => new Variant({ dataType: DataType.UInt32, value: machineData.totalBottlesOrder }) }
});

// Traceability folder
const traceability = namespace.addObject({
  organizedBy: device,
  browseName: "Traceability"
});

namespace.addVariable({
  componentOf: traceability,
  browseName: "LotNumber",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.currentLotNumber }) }
});

namespace.addVariable({
  componentOf: traceability,
  browseName: "ExpirationDate",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: machineData.expirationDate }) }
});

// Alarms folder
const alarms = namespace.addObject({
  organizedBy: device,
  browseName: "Alarms"
});

const activeAlarmsVar = namespace.addVariable({
  componentOf: alarms,
  browseName: "ActiveAlarms",
  dataType: "String",
  value: { get: () => new Variant({ dataType: DataType.String, value: JSON.stringify(activeAlarms) }) }
});

// Methods folder
const methods = namespace.addObject({
  organizedBy: device,
  browseName: "Methods"
});

// Start Machine method
// Fixed method definitions - replace your existing method definitions with these:

// Start Machine method
const startMachineMethod = namespace.addMethod(methods, {
  browseName: "StartMachine",
  inputArguments: [],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

startMachineMethod.bindMethod((inputArguments, context, callback) => {
  try {
    if (machineData.machineStatus === "Stopped") {
      machineData.machineStatus = "Starting";
      setTimeout(() => {
        machineData.machineStatus = "Running";
      }, 3000);

      const callMethodResult = {
        statusCode: StatusCodes.Good,
        outputArguments: [{
          dataType: DataType.String,
          value: "Machine starting"
        }]
      };
      callback(null, callMethodResult);
    } else {
      const callMethodResult = {
        statusCode: StatusCodes.BadInvalidState
      };
      callback(null, callMethodResult);
    }
  } catch (error) {
    callback(error);
  }
})

// Stop Machine method
const stopMachineMethod = namespace.addMethod(methods, {
  browseName: "StopMachine",
  inputArguments: [],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

stopMachineMethod.bindMethod((inputArguments, context, callback) => {
  try {
    if (["Running", "Error", "Maintenance", "Cleaning"].includes(machineData.machineStatus)) {
      machineData.machineStatus = "Stopping";
      setTimeout(() => {
        machineData.machineStatus = "Stopped";
      }, 3000);

      const callMethodResult = {
        statusCode: StatusCodes.Good,
        outputArguments: [{
          dataType: DataType.String,
          value: "Machine stopping"
        }]
      };
      callback(null, callMethodResult);
    } else {
      const callMethodResult = {
        statusCode: StatusCodes.BadInvalidState
      };
      callback(null, callMethodResult);
    }
  } catch (error) {
    callback(error);
  }
})


// Load Production Order method
const loadOrderMethod = namespace.addMethod(methods, {
  browseName: "LoadProductionOrder",
  inputArguments: [
    { name: "orderNumber", dataType: DataType.String, description: "Production order number" },
    { name: "article", dataType: DataType.String, description: "Article number" },
    { name: "quantity", dataType: DataType.UInt32, description: "Target quantity" },
    { name: "targetFillVolume", dataType: DataType.Double, description: "Target fill volume (ml)" },
    { name: "targetLineSpeed", dataType: DataType.UInt16, description: "Target line speed (bottles/min)" },
    { name: "targetProductTemp", dataType: DataType.Double, description: "Target product temperature (°C)" },
    { name: "targetCO2Pressure", dataType: DataType.Double, description: "Target CO2 pressure (bar)" },
    { name: "targetCapTorque", dataType: DataType.Double, description: "Target cap torque (Nm)" },
    { name: "targetCycleTime", dataType: DataType.Double, description: "Target cycle time (s)" }
  ],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

loadOrderMethod.bindMethod((inputArguments, context, callback) => {
  try {
    machineData.productionOrder = inputArguments[0].value;
    machineData.article = inputArguments[1].value;
    machineData.quantity = inputArguments[2].value;
    machineData.targetFillVolume = inputArguments[3].value;
    machineData.targetLineSpeed = inputArguments[4].value;
    machineData.targetProductTemp = inputArguments[5].value;
    machineData.targetCO2Pressure = inputArguments[6].value;
    machineData.targetCapTorque = inputArguments[7].value;
    machineData.targetCycleTime = inputArguments[8].value;

    // Reset order counters
    machineData.goodBottlesOrder = 0;
    machineData.badBottlesOrder = 0;
    machineData.totalBottlesOrder = 0;
    machineData.productionOrderProgress = 0;

    const callMethodResult = {
      statusCode: StatusCodes.Good,
      outputArguments: [{
        dataType: DataType.String,
        value: `Production order ${machineData.productionOrder} loaded successfully`
      }]
    };
    callback(null, callMethodResult);
  } catch (error) {
    callback(error);
  }
})

// Enter Maintenance Mode method
const enterMaintenanceMethod = namespace.addMethod(methods, {
  browseName: "EnterMaintenanceMode",
  inputArguments: [],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

enterMaintenanceMethod.bindMethod((inputArguments, context, callback) => {
  try {
    machineData.machineStatus = "Maintenance";

    const callMethodResult = {
      statusCode: StatusCodes.Good,
      outputArguments: [{
        dataType: DataType.String,
        value: "Entered maintenance mode"
      }]
    };
    callback(null, callMethodResult);
  } catch (error) {
    callback(error);
  }
})


// Start CIP Cycle method
const CIPCycleMethod = namespace.addMethod(methods, {
  browseName: "StartCIPCycle",
  inputArguments: [],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

CIPCycleMethod.bindMethod((inputArguments, context, callback) => {
  try {
    machineData.cleaningCycleStatus = "CIP Active";
    machineData.machineStatus = "Cleaning";

    const callMethodResult = {
      statusCode: StatusCodes.Good,
      outputArguments: [{
        dataType: DataType.String,
        value: "CIP cycle started"
      }]
    };
    callback(null, callMethodResult);
  } catch (error) {
    callback(error);
  }
})

// Start SIP Cycle method
const SIPCycleMethod = namespace.addMethod(methods, {
  browseName: "StartSIPCycle",
  inputArguments: [],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

SIPCycleMethod.bindMethod((inputArguments, context, callback) => {
  try {
    machineData.cleaningCycleStatus = "SIP Active";
    machineData.machineStatus = "Cleaning";

    const callMethodResult = {
      statusCode: StatusCodes.Good,
      outputArguments: [{
        dataType: DataType.String,
        value: "SIP cycle started"
      }]
    };
    callback(null, callMethodResult);
  } catch (error) {
    callback(error);
  }
})

// Reset Counters method
const resetCountersMethod = namespace.addMethod(methods, {
  browseName: "ResetCounters",
  inputArguments: [],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

resetCountersMethod.bindMethod((inputArguments, context, callback) => {
  try {
    machineData.goodBottles = 0;
    machineData.badBottlesVolume = 0;
    machineData.badBottlesWeight = 0;
    machineData.badBottlesCap = 0;
    machineData.badBottlesOther = 0;
    machineData.totalBadBottles = 0;
    machineData.totalBottles = 0;

    const callMethodResult = {
      statusCode: StatusCodes.Good,
      outputArguments: [{
        dataType: DataType.String,
        value: "All counters reset successfully"
      }]
    };
    callback(null, callMethodResult);
  } catch (error) {
    callback(error);
  }
})

// Change Product method
const changeProductMethod = namespace.addMethod(methods, {
  browseName: "ChangeProduct",
  inputArguments: [
    { name: "newArticle", dataType: DataType.String, description: "New article number" }
  ],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

changeProductMethod.bindMethod((inputArguments, context, callback) => {
  try {
    const oldArticle = machineData.article;
    machineData.article = inputArguments[0].value;
    machineData.machineStatus = "Stopping";

    setTimeout(() => {
      machineData.machineStatus = "Running";
    }, 5000);

    const callMethodResult = {
      statusCode: StatusCodes.Good,
      outputArguments: [{
        dataType: DataType.String,
        value: `Product changeover from ${oldArticle} to ${machineData.article} initiated`
      }]
    };
    callback(null, callMethodResult);
  } catch (error) {
    callback(error);
  }
})

// Adjust Fill Volume method
const adjustFillVolumeMethod = namespace.addMethod(methods, {
  browseName: "AdjustFillVolume",
  inputArguments: [
    { name: "newVolume", dataType: DataType.Double, description: "New target fill volume (ml)" }
  ],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

adjustFillVolumeMethod.bindMethod((inputArguments, context, callback) => {
  try {
    const oldVolume = machineData.targetFillVolume;
    machineData.targetFillVolume = inputArguments[0].value;

    const callMethodResult = {
      statusCode: StatusCodes.Good,
      outputArguments: [{
        dataType: DataType.String,
        value: `Fill volume adjusted from ${oldVolume}ml to ${machineData.targetFillVolume}ml`
      }]
    };
    callback(null, callMethodResult);
  } catch (error) {
    callback(error);
  }
})

// Generate Lot Number method
const generateLotNumberMethod = namespace.addMethod(methods, {
  browseName: "GenerateLotNumber",
  inputArguments: [],
  outputArguments: [{
    name: "lotNumber",
    dataType: DataType.String,
    description: "Generated lot number"
  }]
});

generateLotNumberMethod.bindMethod((inputArguments, context, callback) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const product = machineData.article.split('-')[2] || "PROD";
    const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    machineData.currentLotNumber = `LOT-${year}-${product}-${sequence}`;

    // Calculate expiration date (2 years from now)
    const expDate = new Date(now);
    expDate.setFullYear(expDate.getFullYear() + 2);
    machineData.expirationDate = expDate.toISOString().split('T')[0];

    const callMethodResult = {
      statusCode: StatusCodes.Good,
      outputArguments: [{
        dataType: DataType.String,
        value: machineData.currentLotNumber
      }]
    };
    callback(null, callMethodResult);
  } catch (error) {
    callback(error);
  }
})

// Emergency Stop method
const emergencyStopMethod = namespace.addMethod(methods, {
  browseName: "EmergencyStop",
  inputArguments: [],
  outputArguments: [{
    name: "result",
    dataType: DataType.String,
    description: "Operation result"
  }]
});

emergencyStopMethod.bindMethod((inputArguments, context, callback) => {
  try {
    machineData.machineStatus = "Stopped";
    machineData.actualLineSpeed = 0;

    const callMethodResult = {
      statusCode: StatusCodes.Good,
      outputArguments: [{
        dataType: DataType.String,
        value: "EMERGENCY STOP ACTIVATED"
      }]
    };
    callback(null, callMethodResult);
  } catch (error) {
    callback(error);
  }
})
// We are going to count how many bottles in a row were failed
// Allow 3 bottles in a row to be bad
let bottleFailureCount = 0

function checkAlarms() {
  if (machineData.machineStatus !== "Running") return;

  activeAlarms = [];

  // Check fill volume deviation
  const fillDeviation = Math.abs(machineData.actualFillVolume - machineData.targetFillVolume);
  const fillDeviationPercent = (fillDeviation / machineData.targetFillVolume) * 100;
  if (fillDeviationPercent > 1) {
    activeAlarms.push({
      parameter: "Fill Volume",
      deviation: `${fillDeviationPercent.toFixed(2)}%`,
      actual: machineData.actualFillVolume,
      target: machineData.targetFillVolume
    });
  }

  // Check product temperature
  const tempDeviation = Math.abs(machineData.actualProductTemp - machineData.targetProductTemp);
  if (tempDeviation > 2) {
    activeAlarms.push({
      parameter: "Product Temperature",
      deviation: `${tempDeviation.toFixed(2)}°C`,
      actual: machineData.actualProductTemp,
      target: machineData.targetProductTemp
    });
  }

  // Check CO2 pressure
  const co2Deviation = Math.abs(machineData.actualCO2Pressure - machineData.targetCO2Pressure);
  if (co2Deviation > 0.2) {
    activeAlarms.push({
      parameter: "CO2 Pressure",
      deviation: `${co2Deviation.toFixed(2)} bar`,
      actual: machineData.actualCO2Pressure,
      target: machineData.targetCO2Pressure
    });
  }

  // Check product level
  if (machineData.productLevelTank < 15) {
    activeAlarms.push({
      parameter: "Product Level Tank",
      message: "Low product level",
      actual: `${machineData.productLevelTank.toFixed(1)}%`
    });
  }

  // Check cap torque
  const capTorqueDeviation = Math.abs(machineData.actualCapTorque - machineData.targetCapTorque);
  const capTorqueDeviationPercent = (capTorqueDeviation / machineData.targetCapTorque) * 100;
  if (capTorqueDeviationPercent > 10) {
    activeAlarms.push({
      parameter: "Cap Torque",
      deviation: `${capTorqueDeviationPercent.toFixed(2)}%`,
      actual: machineData.actualCapTorque,
      target: machineData.targetCapTorque
    });
  }

  // Check quality control
  if (machineData.totalBottlesOrder > 0) {
    // Check how many bottlles have failed upon this point
    if (bottleFailureCount === 3) {
      activeAlarms.push({
        parameter: "Quality Control",
        message: "3 bottles in a row have a defect"
      });
    }
  }

  if (activeAlarms.length > 0) {
    machineData.machineStatus = "Error";
  }
}

setInterval(() => {
  if (machineData.machineStatus === "Running") {
    // Simulate bottle production
    const isGoodBottle = Math.random() > 0.005;

    if (isGoodBottle) {
      machineData.goodBottles++;
      machineData.goodBottlesOrder++;
      bottleFailureCount = 0;
    } else {
      bottleFailureCount++; //Bottle failed we track it
      const rejectType = Math.random();
      if (rejectType < 0.4) {
        machineData.badBottlesVolume++;
      } else if (rejectType < 0.7) {
        machineData.badBottlesWeight++;
      } else if (rejectType < 0.9) {
        machineData.badBottlesCap++;
      } else {
        machineData.badBottlesOther++;
      }
      machineData.badBottlesOrder++;
    }

    machineData.totalBottles++;
    machineData.totalBottlesOrder++;
    machineData.totalBadBottles = machineData.badBottlesVolume + machineData.badBottlesWeight +
      machineData.badBottlesCap + machineData.badBottlesOther;

    machineData.productionOrderProgress = (machineData.totalBottlesOrder / machineData.quantity) * 100;

    machineData.actualFillVolume = machineData.targetFillVolume + (Math.random() - 0.5) * 2;
    machineData.actualLineSpeed = Math.round(machineData.targetLineSpeed + (Math.random() - 0.5) * 10);
    machineData.actualProductTemp = machineData.targetProductTemp + (Math.random() - 0.5) * 0.3;
    machineData.actualCO2Pressure = machineData.targetCO2Pressure + (Math.random() - 0.5) * 0.1;
    machineData.actualCapTorque = machineData.targetCapTorque + (Math.random() - 0.5) * 0.3;
    machineData.actualCycleTime = machineData.targetCycleTime + (Math.random() - 0.5) * 0.1;
    machineData.fillAccuracyDeviation = machineData.actualFillVolume - machineData.targetFillVolume;

    machineData.productLevelTank -= 0.001;
    if (machineData.productLevelTank < 10) {
      machineData.productLevelTank = 95; // Refill
    }

    const stationNum = (parseInt(machineData.currentStation.split(' ')[1]) % 16) + 1;
    machineData.currentStation = `Station ${stationNum}`;

    checkAlarms();
    checkParameterDeviation("Fill Volume", machineData.actualFillVolume, machineData.targetFillVolume, alarmHistory.fillVolume);
    checkParameterDeviation("Line Speed", machineData.actualLineSpeed, machineData.targetLineSpeed, alarmHistory.lineSpeed);
    checkParameterDeviation("Product Temperature", machineData.actualProductTemp, machineData.targetProductTemp, alarmHistory.productTemp);
    checkParameterDeviation("CO2 Pressure", machineData.actualCO2Pressure, machineData.targetCO2Pressure, alarmHistory.co2Pressure);
    checkParameterDeviation("Cap Torque", machineData.actualCapTorque, machineData.targetCapTorque, alarmHistory.capTorque);
    checkParameterDeviation("Cycle Time", machineData.actualCycleTime, machineData.targetCycleTime, alarmHistory.cycleTime);
  }
}, 2000);

function checkParameterDeviation(paramName, actual, target, history) {
  const deviation = Math.abs(actual - target);
  const deviationPercent = (deviation / target) * 100;

  history.push(actual);
  if (history.length > 3) history.shift();

  if (deviationPercent > 8) {
    activeAlarms.push({
      parameter: paramName,
      type: "Critical Deviation",
      deviation: `${deviationPercent.toFixed(2)}%`,
      lastThreeCycles: history.slice(-3),
      actual: actual,
      target: target
    });
    machineData.machineStatus = "Error";
    return true;
  }

  if (history.length >= 3 && history.every(d =>{
    const diff = Math.abs(d - target);
    const percent = Math.round((diff / target) * 100);
    return percent > 3
  })) {
    activeAlarms.push({
      parameter: paramName,
      type: "Persistent Deviation",
      deviation: `${deviationPercent.toFixed(2)}%`,
      lastThreeCycles: history,
      actual: actual,
      target: target
    });

    machineData.machineStatus = "Error";
    return true;
  }

  return false;
}



server.start(function() {
  console.log("Server is now listening");
  console.log("port ", server.endpoints[0].port);

  setTimeout(() => {
    machineData.machineStatus = "Running";
  }, 5000);
});