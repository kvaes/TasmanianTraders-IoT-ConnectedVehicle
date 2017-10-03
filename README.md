# IoT Connected Vehicle Simulator

## Azure Container Instances

To create a single sim inside Azure Container Instances (preview), use the [Azure CLI 2.0](https://docs.microsoft.com/en-us/cli/azure/overview?view=azure-cli-latest).

```bash
az container create \
--resource-group RESOURCE_GROUP \
--name NAME \
--image kvaes/tasmaniantraders-iot-connectedvehicle \
--cpu 1 \
--memory 0.6 \
--location westeurope \
-e iothubconnectionstring='IOTHUB_CONNECTION_STRING' \
offlineMin=0 \
offlineMax=1 \
interval=15
```

You can check the status of the container using:
* `az container show --resource-group RESOURCE_GROUP --name NAME`
* `az container logs --resource-group RESOURCE_GROUP --name NAME`
