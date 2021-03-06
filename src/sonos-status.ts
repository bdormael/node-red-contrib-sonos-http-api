import  SonosHelper  from "./SonosHelper";
import SonosClient from "./SonosClient";
import { ConfigNode } from './SonosClient';

module.exports = function status(RED) {
	'use strict';
	var helper = new SonosHelper();
	function Node(n) {

		RED.nodes.createNode(this, n);
		var node = this;
		var configNode = RED.nodes.getNode(n.confignode);
		node.player = n.player;
		var isValid = helper.validateConfigNode(node, configNode);
		if (!isValid)
			return;
	
		node.status({});	
			
		node.on('input', function (msg) {
			helper.preprocessInputMsg(node, configNode, msg, function(device) {
				getSonosCurrentState(node, msg, device.player, configNode);
			});
		});
	}

	function getSonosCurrentState(node, msg, player, configNode:ConfigNode) 
	{
		if (msg.player !== null && msg.player !== undefined && msg.player)
            player = msg.player;
		
		var client = new SonosClient(player, configNode);
		if (client === null || client === undefined) {
			node.status({fill:"red", shape:"dot", text:"sonos client is null"});
			return;
		}

		client.getCurrentState(function (err, state) {
			if (err) {
				node.error(JSON.stringify(err));
				node.status({fill:"red", shape:"dot", text:"failed to retrieve current state"});
				return;
			}
			if (state === null || state === undefined) {
				node.status({fill:"red", shape:"dot", text:"invalid current state retrieved"});
				return;	
			}
			
			msg.payload = state;	
			node.send(msg);	
		});
	}
	
	RED.nodes.registerType('sonos-http-api-status', Node);
}