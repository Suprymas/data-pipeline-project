import { OPCUAClient, AttributeIds, TimestampsToReturn } from "node-opcua";
import mqtt from "mqtt";


const OPCUA_ENDPOINT = process.env.OPCUA || "opc.tcp://localhost:4334/UA/fhvopcserver";
const MQTT_ENDPOINT = process.env.MQTT || "mqtt://localhost:1883";
// OPC-UA connection
const client = OPCUAClient.create({ endpointMustExist: false });

// MQTT connection
const mqttClient = mqtt.connect(MQTT_ENDPOINT);
const baseTopic = "DortmundBeverageCenter/JuiceFillingLine3/FluidFillExpress2";

async function startAgent() {
  await client.connect(OPCUA_ENDPOINT);
  console.log("Connected to OPC-UA server");

  const session = await client.createSession();
  console.log("OPC-UA session created");

  const subscription = await session.createSubscription2({
    requestedPublishingInterval: 1000,
    requestedLifetimeCount: 100,
    requestedMaxKeepAliveCount: 10,
    maxNotificationsPerPublish: 10,
    publishingEnabled: true,
    priority: 10
  });

  console.log("Subscription started");


  // Helper to subscribe a variable and publish to MQTT
  async function subscribeAndPublish(nodeId, topicSuffix) {
    const itemToMonitor = { nodeId, attributeId: AttributeIds.Value };
    const monitoredItem = await subscription.monitor(itemToMonitor, {
      samplingInterval: 1000,
      discardOldest: true,
      queueSize: 10
    }, TimestampsToReturn.Both);

    monitoredItem.on("changed", (dataValue) => {
      const value = dataValue.value.value;
      const topic = `${baseTopic}/${topicSuffix}`;
      mqttClient.publish(topic, JSON.stringify({ value, timestamp: new Date().toISOString() }));
    });
  }

  // Send all parameters to mqtt
  await subscribeAndPublish("ns=1;i=1024", "ProcessParameters/Actuals/CO2Pressure");
  await subscribeAndPublish("ns=1;i=1025", "ProcessParameters/Actuals/CapTorque");
  await subscribeAndPublish("ns=1;i=1026", "ProcessParameters/Actuals/CycleTime");
  await subscribeAndPublish("ns=1;i=1027", "ProcessParameters/Actuals/FillAccuracyDeviation");
  await subscribeAndPublish("ns=1;i=1021", "ProcessParameters/Actuals/FillVolume");
  await subscribeAndPublish("ns=1;i=1022", "ProcessParameters/Actuals/LineSpeed");
  await subscribeAndPublish("ns=1;i=1028", "ProcessParameters/Actuals/ProductLineTank");
  await subscribeAndPublish("ns=1;i=1023", "ProcessParameters/Actuals/ProductTemperature");
  await subscribeAndPublish("ns=1;i=1017", "ProcessParameters/Targets/TargetCO2Pressure");
  await subscribeAndPublish("ns=1;i=1018", "ProcessParameters/Targets/TargetCapTorque");
  await subscribeAndPublish("ns=1;i=1019", "ProcessParameters/Targets/TargetCycleTime");
  await subscribeAndPublish("ns=1;i=1014", "ProcessParameters/Targets/TargetFillVolume");
  await subscribeAndPublish("ns=1;i=1015", "ProcessParameters/Targets/TargetLineSpeed");
  await subscribeAndPublish("ns=1;i=1016", "ProcessParameters/Targets/TargetProductTemperature");
  await subscribeAndPublish("ns=1;i=1041", "ProductionCounters/Total/BadBottlesCap");
  await subscribeAndPublish("ns=1;i=1042", "ProductionCounters/Total/BadBottlesOther");
  await subscribeAndPublish("ns=1;i=1039", "ProductionCounters/Total/BadBottlesVolume");
  await subscribeAndPublish("ns=1;i=1038", "ProductionCounters/Total/GoodBottles");
  await subscribeAndPublish("ns=1;i=1043", "ProductionCounters/Total/BadBottles");
  await subscribeAndPublish("ns=1;i=1044", "ProductionCounters/Total/Bottles");
  await subscribeAndPublish("ns=1;i=1035", "QualityControl/LevelCheck");
  await subscribeAndPublish("ns=1;i=1034", "QualityControl/WeightCheck");
  await subscribeAndPublish("ns=1;i=1031", "Status/CleaningCycleStatus");
  await subscribeAndPublish("ns=1;i=1032", "Status/CurrentStation");
  await subscribeAndPublish("ns=1;i=1030", "Status/MachineStatus");
  await subscribeAndPublish("ns=1;i=1001", "MachineInformation/MachineName");
  await subscribeAndPublish("ns=1;i=1004", "MachineInformation/Plant");
  await subscribeAndPublish("ns=1;i=1006", "MachineInformation/ProductionLine");
  await subscribeAndPublish("ns=1;i=1005", "MachineInformation/ProductionSegment");
  await subscribeAndPublish("ns=1;i=1003", "MachineInformation/SerialNumber");
  await subscribeAndPublish("ns=1;i=1009", "ProductionOrder/Article");
  await subscribeAndPublish("ns=1;i=1008", "ProductionOrder/OrderNumber");
  await subscribeAndPublish("ns=1;i=1053", "Alarms/Alarmstatus");
}

startAgent();
