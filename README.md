# node-red-contrib-jktesting

An EXPERIMENTAL Node-RED testing/learning set of nodes.

Designed as an *experimental* learning and testing tool for trying out different things when designing Node-RED nodes.

You can also use it as a template for writing your own nodes.

This node has several purposes:
1. Learn the order of execution and events for learning how to program you own nodes.
2. Show some best practices and standards for code when developing your own nodes.
3. Act as a template I or you can use for your own nodes.

## Design

### Physical file/folder location summary

Folders and files for resources on the device running Node-RED are:

-

## Known Issues

-

## To Do

-

## Changes (See [Change Log](CHANGELOG) for details)

### 0.1.1 - Minor tweaks

### 0.0.0 - not a release

## Pre-requisites

See the package.json file for details.

Requires at least Node.JS v6 and Node-RED v0.16

## Install

Run the following command in your Node-RED user directory (typically `~/.node-red`):

```
npm install node-red-contrib-jktesting
```

Run Node-RED and add an instance of the test node.

## Nodes

### JK Simple Test (jktest)

#### Node Instance Settings

Each instance of the test node has the following settings available.

<dl>
    <dt>Name</dt>
    <dd>A short description shown in the admin interface</dd>
    <dt>Topic</dt>
    <dd>A topic name to use if the incoming msg does not contain one.</dd>
</dl>

#### Inputs
<dl>
    <dt>payload `string | buffer`</dt>
    <dd>The payload of the message to publish.</dd>
    <dt>topic (optional) `string`</dt>
    <dd>The MQTT topic to publish to.</dd>
</dl>

#### Outputs
- Standard output

  <dl class="message-properties">
    <dt>_msgcounter <span class="property-type">integer</span></dt>
    <dd>The number of messages recieved by the node instance since either the last reset of Node-RED or the last deployment of the node instance.</dd>
    <dt>payload <span class="property-type">string | buffer</span></dt>
    <dd>A copy of any inbound payload.</dd>
    <dt>topic <span class="property-type">string</span></dt>
    <dd>A copy of any inbound topic if present. Otherwise, the topic from the node's settings.</dd>
  </dl>

## Discussions and suggestions

Use the [Node-RED google group](https://groups.google.com/forum/#!forum/node-red) for general discussion about this node. Or use the
[GitHub issues log](https://github.com/TotallyInformation/node-red-contrib-jktesting/issues) for raising issues or contributing suggestions and enhancements.

## Contributing

If you would like to contribute to this node, you can contact Totally Information via GitHub or raise a request in the GitHub issues log.

## Developers/Contributors

- [Julian Knight](https://github.com/TotallyInformation)
