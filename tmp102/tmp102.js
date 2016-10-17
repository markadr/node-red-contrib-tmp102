/**
 *  Copyright 2016 Mark de Reeper
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
module.exports = function (RED) {
    "use strict";
    var i2c = require('i2c');

    function TMP102Node(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        this.name = config.name;
        this.tmp102 = new i2c(parseInt(config.i2caddress), {device: config.i2cdevice});

        this.on('input', function (msg) {
            this.status({fill: "green", shape: "dot", text: "connected"});

            this.tmp102.read(2, function (err, res) {
                if (!err) {
                    // http://www.raspberrypi.org/phpBB3/viewtopic.php?f=81&t=31272
                    // http://bildr.org/2011/01/tmp102-arduino/

                    // result contains a buffer of 2 bytes
                    var MSB = res[0] < 0 ? 256 + res[0] : res[0];
                    var LSB = res[1] < 0 ? 256 + res[1] : res[1];

                    var reading = ((MSB << 8) | LSB) >> 4;

                    // Convert to Celsius
                    reading = reading * 0.0625;

                    var tempMsg = {};
                    tempMsg.temperature = reading;
                    tempMsg.name = node.name;
                    node.send(tempMsg);
                } else {
                    node.warn("TMP102 reading error: " + err);
                }
            });

            this.status({});
        });
    }

    RED.nodes.registerType("i2c-tmp102", TMP102Node);
};
