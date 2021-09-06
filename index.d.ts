/** standard object definitions
 * Used by code editors & typescript to validate data.
 */

/// <reference types="node" />
/// <reference types="node-red" />
/// <reference types="node-red__editor-client" />

import { Node } from 'node-red';

declare global {
    var RED:any;
}

/**
 * @typedef {object} myNode Local copy of the node instance config + other info
 * @property {String} id Unique identifier for this instance
 * @property {String} type What type of node is this an instance of? (uibuilder)
 * --- Node's config properties
 * @property {String} name Descriptive name, only used by Editor
 * @property {String} topic msg.topic overrides incoming msg.topic
 * --- Node functions
 * @property {Function} send Send a Node-RED msg to an output port
 * @property {Function=} done Dummy done function for pre-Node-RED 1.0 servers
 * @property {Function=} on Event handler
 * @property {Function=} removeListener Event handling
 * z, wires
 */
export interface myNode extends Node {}


